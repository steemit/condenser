/*global $STM_Config */
import koa_router from 'koa-router';
import koa_body from 'koa-body';
import crypto from 'crypto';
import models from 'db/models';
import findUser from 'db/utils/find_user';
import config from 'config';
import { esc, escAttrs } from 'db/models';
import {
    emailRegex,
    getRemoteIp,
    rateLimitReq,
    checkCSRF,
} from 'server/utils/misc';
import coBody from 'co-body';
import Mixpanel from 'mixpanel';
import { PublicKey, Signature, hash } from '@steemit/steem-js/lib/auth/ecc';
import { api, broadcast } from '@steemit/steem-js';

const mixpanel = config.get('mixpanel')
    ? Mixpanel.init(config.get('mixpanel'))
    : null;

const _stringval = v => (typeof v === 'string' ? v : JSON.stringify(v));
function logRequest(path, ctx, extra) {
    let d = { ip: getRemoteIp(ctx.req) };
    if (ctx.session) {
        if (ctx.session.user) {
            d.user = ctx.session.user;
        }
        if (ctx.session.uid) {
            d.uid = ctx.session.uid;
        }
        if (ctx.session.a) {
            d.account = ctx.session.a;
        }
    }
    if (extra) {
        Object.keys(extra).forEach(k => {
            const nk = d[k] ? '_' + k : k;
            d[nk] = extra[k];
        });
    }
    const info = Object.keys(d)
        .map(k => `${k}=${_stringval(d[k])}`)
        .join(' ');
    console.log(`-- /${path} --> ${info}`);
}

export default function useGeneralApi(app) {
    const router = koa_router({ prefix: '/api/v1' });
    app.use(router.routes());
    const koaBody = koa_body();

    router.post('/accounts_wait', koaBody, function*() {
        if (rateLimitReq(this, this.req)) return;
        const params = this.request.body;
        const account =
            typeof params === 'string' ? JSON.parse(params) : params;
        const remote_ip = getRemoteIp(this.req);
        if (!checkCSRF(this, account.csrf)) return;
        logRequest('accounts_wait', this, { account });
        const user_id = this.session.user;
        try {
            models.Account.create(
                escAttrs({
                    user_id,
                    name: account.name,
                    owner_key: account.owner_key,
                    active_key: account.active_key,
                    posting_key: account.posting_key,
                    memo_key: account.memo_key,
                    remote_ip,
                    referrer: this.session.r,
                    created: false,
                })
            ).catch(error => {
                console.error(
                    "!!! Can't create account wait model in /accounts api",
                    this.session.uid,
                    error
                );
            });
            if (mixpanel) {
                mixpanel.track('Signup WaitList', {
                    distinct_id: this.session.uid,
                    ip: remote_ip,
                });
                mixpanel.people.set(this.session.uid, { ip: remote_ip });
            }
        } catch (error) {
            console.error('Error in /accounts_wait', error);
        }
        this.body = JSON.stringify({ status: 'ok' });
    });

    router.post('/accounts', koaBody, function*() {
        if (rateLimitReq(this, this.req)) return;
        const params = this.request.body;
        const account =
            typeof params === 'string' ? JSON.parse(params) : params;
        if (!checkCSRF(this, account.csrf)) return;
        logRequest('accounts', this, { account });
        if ($STM_Config.disable_signups) {
            this.body = JSON.stringify({
                error: 'New signups are temporary disabled.',
            });
            this.status = 401;
            return;
        }

        const user_id = this.session.user;
        if (!user_id) {
            // require user to sign in with identity provider
            this.body = JSON.stringify({ error: 'Unauthorized' });
            this.status = 401;
            return;
        }

        try {
            const user = yield models.User.findOne({
                attributes: ['id', 'creation_hash'],
                where: { id: user_id, account_status: 'approved' },
            });
            if (!user) {
                throw new Error(
                    "We can't find your sign up request. You either haven't started your sign up application or weren't approved yet."
                );
            }

            // Is an account creation already happening for this user, maybe on another request?
            // If so, throw an error.
            if (user.creation_hash !== null) {
                throw new Error('An account creation is in progress');
            }
            // If not, set this user's creation_hash.
            // We'll check this later on, just before we create the account on chain.
            const creationHash = hash
                .sha256(crypto.randomBytes(32))
                .toString('hex');
            yield user.update({ creation_hash: creationHash });

            // disable session/multi account for now

            // const existing_created_account = yield models.Account.findOne({
            //     attributes: ['id'],
            //     where: {user_id, ignored: false, created: true},
            //     order: 'id DESC'
            // });
            // if (existing_created_account) {
            //     throw new Error("Only one Steem account per user is allowed in order to prevent abuse");
            // }

            const remote_ip = getRemoteIp(this.req);
            // rate limit account creation to one per IP every 10 minutes
            const same_ip_account = yield models.Account.findOne({
                attributes: ['created_at'],
                where: { remote_ip: esc(remote_ip), created: true },
                order: 'id DESC',
            });
            if (same_ip_account) {
                const minutes =
                    (Date.now() - same_ip_account.created_at) / 60000;
                if (minutes < 10) {
                    console.log(
                        `api /accounts: IP rate limit for user ${
                            this.session.uid
                        } #${user_id}, IP ${remote_ip}`
                    );
                    throw new Error(
                        'Only one Steem account allowed per IP address every 10 minutes'
                    );
                }
            }

            // Ensure another registration is not in progress.
            // Raw query with SQL_NO_CACHE avoids the MySQL query cache.
            const newCreationHash = yield models.sequelize.query(
                'SELECT SQL_NO_CACHE creation_hash FROM users WHERE id = ?',
                {
                    replacements: [user.id],
                    type: models.sequelize.QueryTypes.SELECT,
                }
            );

            if (newCreationHash[0].creation_hash !== creationHash) {
                console.log({ newCreationHash, creationHash });
                throw new Error('Creation hash mismatch');
            }

            try {
                yield createAccount({
                    signingKey: config.get('registrar.signing_key'),
                    fee: config.get('registrar.fee'),
                    creator: config.get('registrar.account'),
                    new_account_name: account.name,
                    delegation: config.get('registrar.delegation'),
                    owner: account.owner_key,
                    active: account.active_key,
                    posting: account.posting_key,
                    memo: account.memo_key,
                });
            } catch (e) {
                yield user.update({ creation_hash: null });
                throw new Error('Account creation error, try again.');
            }

            console.log(
                '-- create_account_with_keys created -->',
                this.session.uid,
                account.name,
                user.id,
                account.owner_key
            );

            this.body = JSON.stringify({ status: 'ok' });

            // update user account status
            yield user.update({ account_status: 'created' });

            // update or create account record
            const account_attrs = escAttrs({
                user_id,
                name: account.name,
                owner_key: account.owner_key,
                active_key: account.active_key,
                posting_key: account.posting_key,
                memo_key: account.memo_key,
                remote_ip,
                referrer: this.session.r,
                created: true,
            });

            const existing_account = yield models.Account.findOne({
                attributes: ['id'],
                where: { user_id, name: account.name },
                order: 'id DESC',
            });
            if (existing_account) {
                yield existing_account.update(account_attrs);
            } else {
                yield models.Account.create(account_attrs);
            }
            if (mixpanel) {
                mixpanel.track('Signup', {
                    distinct_id: this.session.uid,
                    ip: remote_ip,
                });
                mixpanel.people.set(this.session.uid, { ip: remote_ip });
            }
        } catch (error) {
            console.error(
                'Error in /accounts api call',
                this.session.uid,
                error.toString()
            );
            this.body = JSON.stringify({ error: error.message });
            this.status = 500;
        }
    });

    /**
     * Provides an endpoint to create user, account, and identity records.
     * Used by faucet.
     *
     * HTTP params:
     *   name
     *   email
     *   owner_key
     *   secret
     */
    router.post('/create_user', koaBody, function*() {
        const { name, email, owner_key, secret } =
            typeof this.request.body === 'string'
                ? JSON.parse(this.request.body)
                : this.request.body;

        if (secret !== process.env.CREATE_USER_SECRET)
            throw new Error('invalid secret');

        logRequest('create_user', this, { name, email, owner_key });

        try {
            if (!emailRegex.test(email.toLowerCase()))
                throw new Error('not valid email: ' + email);
            let user = yield models.User.create({
                name: esc(name),
                email: esc(email),
            });
            const account = yield models.Account.create({
                user_id: user.id,
                name: esc(name),
                owner_key: esc(owner_key),
            });
            const identity = yield models.Identity.create({
                user_id: user.id,
                name: esc(name),
                provider: 'email',
                verified: true,
                email: user.email,
                owner_key: esc(owner_key),
            });
            this.body = JSON.stringify({
                success: true,
                user,
                account,
                identity,
            });
        } catch (error) {
            console.error('Error in /create_user api call', error);
            this.body = JSON.stringify({ error: error.message });
            this.status = 500;
        }
    });

    router.post('/update_email', koaBody, function*() {
        if (rateLimitReq(this, this.req)) return;
        const params = this.request.body;
        const { csrf, email } =
            typeof params === 'string' ? JSON.parse(params) : params;
        if (!checkCSRF(this, csrf)) return;
        logRequest('update_email', this, { email });
        try {
            if (!emailRegex.test(email.toLowerCase()))
                throw new Error('not valid email: ' + email);
            // TODO: limit by 1/min/ip
            let user = yield findUser({
                user_id: this.session.user,
                email: esc(email),
                uid: this.session.uid,
            });
            if (user) {
                user = yield models.User.update(
                    { email: esc(email), waiting_list: true },
                    { where: { id: user.id } }
                );
            } else {
                user = yield models.User.create({
                    email: esc(email),
                    waiting_list: true,
                });
            }
            this.session.user = user.id;
            this.body = JSON.stringify({ status: 'ok' });
        } catch (error) {
            console.error(
                'Error in /update_email api call',
                this.session.uid,
                error
            );
            this.body = JSON.stringify({ error: error.message });
            this.status = 500;
        }
    });

    router.post('/login_account', koaBody, function*() {
        // if (rateLimitReq(this, this.req)) return;
        const params = this.request.body;
        const { csrf, account, signatures } =
            typeof params === 'string' ? JSON.parse(params) : params;
        if (!checkCSRF(this, csrf)) return;
        logRequest('login_account', this, { account });
        try {
            const db_account = yield models.Account.findOne({
                attributes: ['user_id'],
                where: { name: esc(account) },
                logging: false,
            });
            if (db_account) this.session.user = db_account.user_id;

            if (signatures) {
                if (!this.session.login_challenge) {
                    console.error(
                        '/login_account missing this.session.login_challenge'
                    );
                } else {
                    const [chainAccount] = yield api.getAccountsAsync([
                        account,
                    ]);
                    if (!chainAccount) {
                        console.error(
                            '/login_account missing blockchain account',
                            account
                        );
                    } else {
                        const auth = { posting: false };
                        const bufSha = hash.sha256(
                            JSON.stringify(
                                { token: this.session.login_challenge },
                                null,
                                0
                            )
                        );
                        const verify = (
                            type,
                            sigHex,
                            pubkey,
                            weight,
                            weight_threshold
                        ) => {
                            if (!sigHex) return;
                            if (weight !== 1 || weight_threshold !== 1) {
                                console.error(
                                    `/login_account login_challenge unsupported ${
                                        type
                                    } auth configuration: ${account}`
                                );
                            } else {
                                const sig = parseSig(sigHex);
                                const public_key = PublicKey.fromString(pubkey);
                                const verified = sig.verifyHash(
                                    bufSha,
                                    public_key
                                );
                                if (!verified) {
                                    console.error(
                                        '/login_account verification failed',
                                        this.session.uid,
                                        account,
                                        pubkey
                                    );
                                }
                                auth[type] = verified;
                            }
                        };
                        const {
                            posting: {
                                key_auths: [[posting_pubkey, weight]],
                                weight_threshold,
                            },
                        } = chainAccount;
                        verify(
                            'posting',
                            signatures.posting,
                            posting_pubkey,
                            weight,
                            weight_threshold
                        );
                        if (auth.posting) this.session.a = account;
                    }
                }
            }

            this.body = JSON.stringify({ status: 'ok' });
            const remote_ip = getRemoteIp(this.req);
            if (mixpanel) {
                mixpanel.people.set(this.session.uid, {
                    ip: remote_ip,
                    $ip: remote_ip,
                });
                mixpanel.people.increment(this.session.uid, 'Logins', 1);
            }
        } catch (error) {
            console.error(
                'Error in /login_account api call',
                this.session.uid,
                error.message
            );
            this.body = JSON.stringify({ error: error.message });
            this.status = 500;
        }
    });

    router.post('/logout_account', koaBody, function*() {
        // if (rateLimitReq(this, this.req)) return; - logout maybe immediately followed with login_attempt event
        const params = this.request.body;
        const { csrf } =
            typeof params === 'string' ? JSON.parse(params) : params;
        if (!checkCSRF(this, csrf)) return;
        logRequest('logout_account', this);
        try {
            this.session.a = null;
            this.body = JSON.stringify({ status: 'ok' });
        } catch (error) {
            console.error(
                'Error in /logout_account api call',
                this.session.uid,
                error
            );
            this.body = JSON.stringify({ error: error.message });
            this.status = 500;
        }
    });

    router.post('/csp_violation', function*() {
        if (rateLimitReq(this, this.req)) return;
        let params;
        try {
            params = yield coBody(this);
        } catch (error) {
            console.log('-- /csp_violation error -->', error);
        }
        if (params && params['csp-report']) {
            const csp_report = params['csp-report'];
            const value = `${csp_report['document-uri']} : ${
                csp_report['blocked-uri']
            }`;
            console.log(
                '-- /csp_violation -->',
                value,
                '--',
                this.req.headers['user-agent']
            );
        } else {
            console.log(
                '-- /csp_violation [no csp-report] -->',
                params,
                '--',
                this.req.headers['user-agent']
            );
        }
        this.body = '';
    });

    router.post('/save_cords', koaBody, function*() {
        const params = this.request.body;
        const { csrf, x, y } =
            typeof params === 'string' ? JSON.parse(params) : params;
        if (!checkCSRF(this, csrf)) return;
        const user = yield models.User.findOne({
            where: { id: this.session.user },
        });
        if (user) {
            let data = user.sign_up_meta ? JSON.parse(user.sign_up_meta) : {};
            data['button_screen_x'] = x;
            data['button_screen_y'] = y;
            data['last_step'] = 3;
            try {
                user.update({
                    sign_up_meta: JSON.stringify(data),
                });
            } catch (error) {
                console.error(
                    'Error in /save_cords api call',
                    this.session.uid,
                    error.message
                );
                this.body = JSON.stringify({ error: error.message });
                this.status = 500;
            }
        }
        this.body = JSON.stringify({ status: 'ok' });
    });

    router.post('/setUserPreferences', koaBody, function*() {
        const params = this.request.body;
        const { csrf, payload } =
            typeof params === 'string' ? JSON.parse(params) : params;
        if (!checkCSRF(this, csrf)) return;
        console.log(
            '-- /setUserPreferences -->',
            this.session.user,
            this.session.uid,
            payload
        );
        if (!this.session.a) {
            this.body = 'missing logged in account';
            this.status = 500;
            return;
        }
        try {
            const json = JSON.stringify(payload);
            if (json.length > 1024) throw new Error('the data is too long');
            this.session.user_prefs = json;
            this.body = JSON.stringify({ status: 'ok' });
        } catch (error) {
            console.error(
                'Error in /setUserPreferences api call',
                this.session.uid,
                error
            );
            this.body = JSON.stringify({ error: error.message });
            this.status = 500;
        }
    });
}

/**
 @arg signingKey {string|PrivateKey} - WIF or PrivateKey object
 */
function* createAccount({
    signingKey,
    fee,
    creator,
    new_account_name,
    json_metadata = '',
    delegation,
    owner,
    active,
    posting,
    memo,
}) {
    const operations = [
        [
            'account_create_with_delegation',
            {
                fee,
                creator,
                new_account_name,
                json_metadata,
                delegation,
                owner: {
                    weight_threshold: 1,
                    account_auths: [],
                    key_auths: [[owner, 1]],
                },
                active: {
                    weight_threshold: 1,
                    account_auths: [],
                    key_auths: [[active, 1]],
                },
                posting: {
                    weight_threshold: 1,
                    account_auths: [],
                    key_auths: [[posting, 1]],
                },
                memo_key: memo,
            },
        ],
    ];
    yield broadcast.sendAsync(
        {
            extensions: [],
            operations,
        },
        [signingKey]
    );
}

const parseSig = hexSig => {
    try {
        return Signature.fromHex(hexSig);
    } catch (e) {
        return null;
    }
};
