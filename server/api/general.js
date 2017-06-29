import koa_router from 'koa-router';
import koa_body from 'koa-body';
import models from 'db/models';
import findUser from 'db/utils/find_user';
import config from 'config';
import recordWebEvent from 'server/record_web_event';
import {esc, escAttrs} from 'db/models';
import {emailRegex, getRemoteIp, rateLimitReq, checkCSRF} from 'server/utils';
import coBody from 'co-body';
import secureRandom from 'secure-random'
import {PublicKey, Signature, hash} from 'shared/ecc'
import Tarantool from 'db/tarantool';
import {metrics} from 'server/metrics';


export default function useGeneralApi(app) {
    const router = koa_router({prefix: '/api/v1'});
    app.use(router.routes());
    const koaBody = koa_body();

    router.post('/accounts', koaBody, function *() {
        if (rateLimitReq(this, this.req)) return;
        const params = this.request.body;
        const account = typeof(params) === 'string' ? JSON.parse(params) : params;
        if (!checkCSRF(this, account.csrf)) return;
        console.log('-- /accounts -->', this.session.uid, this.session.user, account);

        if ($STM_Config.disable_signups) {
            this.body = JSON.stringify({error: 'New signups are temporary disabled.'});
            this.status = 401;
            return;
        }

        const remote_ip = getRemoteIp(this.req);

        const user_id = this.session.user;
        if (!user_id) { // require user to sign in with identity provider
            this.body = JSON.stringify({error: 'Unauthorized'});
            this.status = 401;
            return;
        }

        try {
            const lock_entity_res = yield Tarantool.instance().call('lock_entity', user_id+'');
            if (!lock_entity_res[0][0]) {
                console.log('-- /accounts lock_entity -->', user_id, lock_entity_res[0][0]);
                this.body = JSON.stringify({error: 'Conflict'});
                this.status = 409;
                return;
            }
        } catch (e) {
            console.error('-- /accounts tarantool is not available, fallback to another method', e)
            const rnd_wait_time = Math.random() * 10000;
            console.log('-- /accounts rnd_wait_time -->', rnd_wait_time);
            yield new Promise((resolve) =>
                setTimeout(() => resolve(), rnd_wait_time)
            )
        }

        try {
            const user = yield models.User.findOne(
                {attributes: ['verified', 'waiting_list'], where: {id: user_id}}
            );
            if (!user) {
                this.body = JSON.stringify({error: 'Unauthorized'});
                this.status = 401;
                return;
            }

            // check if user's ip is associated with any bot
            const same_ip_bot = yield models.User.findOne({
                attributes: ['id', 'created_at'],
                where: {remote_ip, bot: true}
            });
            if (same_ip_bot) {
                console.log('-- /accounts same_ip_bot -->', user_id, this.session.uid, remote_ip, user.email);
                this.body = JSON.stringify({error: 'We are sorry, we cannot sign you up at this time because your IP address is associated with bots activity. Please contact support@steemit.com for more information.'});
                this.status = 401;
                return;
            }

            const existing_account = yield models.Account.findOne({
                attributes: ['id', 'created_at'],
                where: {user_id, ignored: false},
                order: 'id DESC'
            });
            if (existing_account) {
                throw new Error("Only one Golos account per user is allowed in order to prevent abuse");
            }

            const same_ip_account = yield models.Account.findOne(
                {attributes: ['created_at'], where: {remote_ip: esc(remote_ip)}, order: 'id DESC'}
            );
            if (same_ip_account) {
                const minutes = (Date.now() - same_ip_account.created_at) / 60000;
                if (minutes < 120) {
                    console.log(`api /accounts: IP rate limit for user ${this.session.uid} #${user_id}, IP ${remote_ip}`);
                    throw new Error('Only one Golos account allowed per IP address every 10 minutes');
                }
            }
            if (user.waiting_list) {
                console.log(`api /accounts: waiting_list user ${this.session.uid} #${user_id}`);
                throw new Error('You are on the waiting list. We will get back to you at the earliest possible opportunity.');
            }

            // check email
            const eid = yield models.Identity.findOne(
                {attributes: ['id'], where: {user_id, provider: 'email', verified: true}, order: 'id DESC'}
            );
            if (!eid) {
                console.log(`api /accounts: not confirmed email for user ${this.session.uid} #${user_id}`);
                throw new Error('Email address is not confirmed');
            }

            // check phone
            const mid = yield models.Identity.findOne(
                {attributes: ['id'], where: {user_id, provider: 'phone', verified: true}, order: 'id DESC'}
            );
            if (!mid) {
                console.log(`api /accounts: not confirmed sms for user ${this.session.uid} #${user_id}`);
                throw new Error('Phone number is not confirmed');
            }

            const accountInstance = yield models.Account.create(escAttrs({
                user_id,
                name: account.name,
                owner_key: account.owner_key,
                active_key: account.active_key,
                posting_key: account.posting_key,
                memo_key: account.memo_key,
                remote_ip,
                referrer: this.session.r
            })).catch(error => {
                console.error('!!! Can\'t create account model in /accounts api', this.session.uid, error);
                throw new Error('Cannot create Golos account');
            });

            if (accountInstance) {
              yield createAccount({
                  signingKey: config.registrar.signing_key,
                  fee: config.registrar.fee,
                  creator: config.registrar.account,
                  new_account_name: account.name,
                  owner: account.owner_key,
                  active: account.active_key,
                  posting: account.posting_key,
                  memo: account.memo_key,
                  broadcast: true
              });
              console.log('-- create_account_with_keys created -->', this.session.uid, account.name, user.id, account.owner_key);

              this.body = JSON.stringify({status: 'ok'});
            }
        } catch (error) {
            console.error('Error in /accounts api call', this.session.uid, error.toString());
            this.body = JSON.stringify({error: error.message});
            this.status = 500;
        } finally {
            // console.log('-- /accounts unlock_entity -->', user_id);
            try { yield Tarantool.instance().call('unlock_entity', user_id + ''); } catch(e) {/* ram lock */}
        }
        recordWebEvent(this, 'api/accounts', account ? account.name : 'n/a');
    });

    router.post('/update_email', koaBody, function *() {
        if (rateLimitReq(this, this.req)) return;
        const params = this.request.body;
        const {csrf, email} = typeof(params) === 'string' ? JSON.parse(params) : params;
        if (!checkCSRF(this, csrf)) return;
        console.log('-- /update_email -->', this.session.uid, email);
        try {
            if (!emailRegex.test(email.toLowerCase())) throw new Error('not valid email: ' + email);
            // TODO: limit by 1/min/ip
            let user = yield findUser({user_id: this.session.user, email: esc(email), uid: this.session.uid});
            if (user) {
                user = yield models.User.update({email: esc(email), waiting_list: true}, {where: {id: user.id}});
            } else {
                user = yield models.User.create({email: esc(email), waiting_list: true});
            }
            this.session.user = user.id;
            this.body = JSON.stringify({status: 'ok'});
        } catch (error) {
            console.error('Error in /update_email api call', this.session.uid, error);
            this.body = JSON.stringify({error: error.message});
            this.status = 500;
        }
        recordWebEvent(this, 'api/update_email', email);
    });

    router.post('/login_account', koaBody, function *() {
        if (rateLimitReq(this, this.req)) return;
        const params = this.request.body;
        const {csrf, account, signatures} = typeof(params) === 'string' ? JSON.parse(params) : params;
        if (!checkCSRF(this, csrf)) return;
        console.log('-- /login_account -->', this.session.uid, account);
        try {
            const db_account = yield models.Account.findOne(
                {attributes: ['user_id'], where: {name: esc(account)}, logging: false}
            );
            if (db_account) this.session.user = db_account.user_id;

            if(signatures) {
                if(!this.session.login_challenge) {
                    console.error('/login_account missing this.session.login_challenge');
                } else {
                    const [chainAccount] = yield Apis.db_api('get_accounts', [account])
                    if(!chainAccount) {
                        console.error('/login_account missing blockchain account', account);
                    } else {
                        const auth = {posting: false}
                        const bufSha = hash.sha256(JSON.stringify({token: this.session.login_challenge}, null, 0))
                        const verify = (type, sigHex, pubkey, weight, weight_threshold) => {
                            if(!sigHex) return
                            if(weight !== 1 || weight_threshold !== 1) {
                                console.error(`/login_account login_challenge unsupported ${type} auth configuration: ${account}`);
                            } else {
                                const sig = parseSig(sigHex)
                                const public_key = PublicKey.fromString(pubkey)
                                const verified = sig.verifyHash(bufSha, public_key)
                                if (!verified) {
                                    console.error('/login_account verification failed', this.session.uid, account, pubkey)
                                }
                                auth[type] = verified
                            }
                        }
                        const {posting: {key_auths: [[posting_pubkey, weight]], weight_threshold}} = chainAccount
                        verify('posting', signatures.posting, posting_pubkey, weight, weight_threshold)
                        if (auth.posting) this.session.a = account;
                    }
                }
            }

            this.body = JSON.stringify({status: 'ok'});
        } catch (error) {
            console.error('Error in /login_account api call', this.session.uid, error.message);
            this.body = JSON.stringify({error: error.message});
            this.status = 500;
        }
        recordWebEvent(this, 'api/login_account', account);
    });

    router.post('/logout_account', koaBody, function *() {
        // if (rateLimitReq(this, this.req)) return; - logout maybe immediately followed with login_attempt event
        const params = this.request.body;
        const {csrf} = typeof(params) === 'string' ? JSON.parse(params) : params;
        if (!checkCSRF(this, csrf)) return;
        console.log('-- /logout_account -->', this.session.uid);
        try {
            this.session.a = null;
            this.body = JSON.stringify({status: 'ok'});
        } catch (error) {
            console.error('Error in /logout_account api call', this.session.uid, error);
            this.body = JSON.stringify({error: error.message});
            this.status = 500;
        }
    });

    router.post('/record_event', koaBody, function *() {
        if (rateLimitReq(this, this.req)) return;
        try {
            const params = this.request.body;
            const {csrf, type, value} = typeof(params) === 'string' ? JSON.parse(params) : params;
            if (!checkCSRF(this, csrf)) return;
            console.log('-- /record_event -->', this.session.uid, type, value);
            const str_value = typeof value === 'string' ? value : JSON.stringify(value);
            recordWebEvent(this, type, str_value);
            this.body = JSON.stringify({status: 'ok'});
        } catch (error) {
            console.error('Error in /record_event api call', error.message);
            this.body = JSON.stringify({error: error.message});
            this.status = 500;
        }
    });

    router.post('/csp_violation', function *() {
        if (rateLimitReq(this, this.req)) return;
        const params = yield coBody.json(this);
        console.log('-- /csp_violation -->', this.req.headers['user-agent'], params);
        this.body = '';
    });

    router.post('/page_view', koaBody, function *() {
        const params = this.request.body;
        const {csrf, page, ref} = typeof(params) === 'string' ? JSON.parse(params) : params;
        if (!checkCSRF(this, csrf)) return;
        if (page.match(/\/feed$/)) {
            this.body = JSON.stringify({views: 0});
            return;
        }
        console.log('-- /page_view -->', this.session.uid, page);
        const remote_ip = getRemoteIp(this.req);
        try {
            let views = 1, unique = true;
            if (config.tarantool) {
                const res = yield Tarantool.instance().call('page_view', page, remote_ip, this.session.uid, ref);
                unique = res[0][0];
            }
            const page_model = yield models.Page.findOne(
                {attributes: ['id', 'views'], where: {permlink: esc(page)}, logging: false}
            );
            if (unique) {
                if (page_model) {
                    views = page_model.views + 1;
                    yield yield models.Page.update({views}, {where: {id: page_model.id}, logging: false});
                } else {
                    yield models.Page.create(escAttrs({permlink: page, views}), {logging: false});
                }
            } else {
                if (page_model) views = page_model.views;
            }
            this.body = JSON.stringify({views});
        } catch (error) {
            console.error('Error in /page_view api call', this.session.uid, error.message);
            this.body = JSON.stringify({error: error.message});
            this.status = 500;
        }
    });
}

import {Apis} from 'shared/api_client';
import {createTransaction, signTransaction} from 'shared/chain/transactions';
import {ops} from 'shared/serializer';

const {signed_transaction} = ops;
/**
 @arg signingKey {string|PrivateKey} - WIF or PrivateKey object
 */
function* createAccount({
    signingKey, fee, creator, new_account_name, json_metadata = '',
    owner, active, posting, memo, broadcast = false,
}) {
    const operations = [['account_create', {
        fee, creator, new_account_name, json_metadata,
        owner: {weight_threshold: 1, account_auths: [], key_auths: [[owner, 1]]},
        active: {weight_threshold: 1, account_auths: [], key_auths: [[active, 1]]},
        posting: {weight_threshold: 1, account_auths: [], key_auths: [[posting, 1]]},
        memo_key: memo,
    }]]
    const tx = yield createTransaction(operations)
    const sx = signTransaction(tx, signingKey)
    if (!broadcast) return signed_transaction.toObject(sx)
    return yield new Promise((resolve, reject) =>
        Apis.broadcastTransaction(sx, () => {
          if (metrics) metrics.increment('_createaccount_success');
          resolve()
        }).catch(e => {
          if (metrics) metrics.increment('_createaccount_error');
          console.log('-- createAccount.broadcastTransaction.error [', new_account_name, ']', e)
          reject(e)
        })
    )
}

const parseSig = hexSig => {try {return Signature.fromHex(hexSig)} catch(e) {return null}}
