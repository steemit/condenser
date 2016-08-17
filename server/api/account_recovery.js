import koa_router from 'koa-router';
import koa_body from 'koa-body';
import models from 'db/models';
import config from 'config';
import {esc, escAttrs} from 'db/models';
import {getRemoteIp, rateLimitReq, checkCSRF} from '../utils';

export default function useAccountRecoveryApi(app) {
    const router = koa_router();
    app.use(router.routes());
    const koaBody = koa_body();

    router.post('/initiate_account_recovery', koaBody, function *() {
        if (rateLimitReq(this, this.req)) return;
        let params = this.request.body;
        params = typeof(params) === 'string' ? JSON.parse(params) : params;
        if (!checkCSRF(this, params.csrf)) return;
        console.log('-- /initiate_account_recovery -->', this.session.uid, params);
        this.session.recover_account = null;
        if (!params.account_name) {
            this.status = 500;
            this.body = 'please provide account name';
            return;
        }
        const attrs = {uid: this.session.uid, status: 'open', ...params};
        attrs.remote_ip = getRemoteIp(this.req);
        const request = yield models.AccountRecoveryRequest.create(escAttrs(attrs));
        console.log('-- /initiate_account_recovery request id -->', this.session.uid, request.id);
        this.session.arec = request.id;
        this.redirect('/connect/' + params.provider);
    });

    router.get('/account_recovery_confirmation/:code', function *() {
        if (rateLimitReq(this, this.req)) return;
        const code = this.params.code;
        if (!code) return this.throw('no confirmation code', 404);
        const arec = yield models.AccountRecoveryRequest.findOne({
            attributes: ['id', 'account_name', 'owner_key'],
            where: {validation_code: esc(code)},
            order: 'id desc'
        });
        if (arec) {
            this.session.arec = arec.id;
            console.log('-- /account_recovery_confirmation -->', this.session.uid, arec.id, arec.account_name, arec.owner_key);
            this.redirect('/recover_account_step_2');
        } else {
            console.log('-- /account_recovery_confirmation code not found -->', this.session.uid, code);
            this.throw('wrong confirmation code', 404);
            this.session.arec = null;
        }
        this.body = code;
    });

    router.post('/api/v1/request_account_recovery', koaBody, function *() {
        if (rateLimitReq(this, this.req)) return;
        let params = this.request.body;
        params = typeof(params) === 'string' ? JSON.parse(params) : params;
        if (!checkCSRF(this, params.csrf)) return;
        try {
            if (!this.session.arec) {
                console.log('-- /request_account_recovery --> this.session.arec is empty', this.session.uid);
                this.body = JSON.stringify({error: 'Unauthorized'});
                this.status = 401;
                return;
            }

            const account_recovery_record = yield models.AccountRecoveryRequest.findOne({
                attributes: ['id', 'account_name', 'provider', 'status'],
                where: {id: this.session.arec}
            });

            if (!account_recovery_record || account_recovery_record.account_name !== params.name) {
                console.log('-- /request_account_recovery --> no arec found or wrong name', this.session.uid, params.name);
                this.body = JSON.stringify({error: 'Unauthorized'});
                this.status = 401;
                return;
            }

            if (account_recovery_record.status !== 'confirmed') {
                console.log('-- /request_account_recovery --> no arec found or wrong name', this.session.uid, params.name);
                this.body = JSON.stringify({error: 'Unauthorized'});
                this.status = 401;
                return;
            }

            const {signing_key, recovery_account} = config.requestAccountRecovery;
            const {new_owner_authority, old_owner_key, new_owner_key} = params;

            yield requestAccountRecovery({
                signing_key,
                account_to_recover: params.name,
                recovery_account,
                new_owner_authority,
                broadcast: true
            });
            console.log('-- /request_account_recovery completed -->', this.session.uid, this.session.user, params.name, old_owner_key, new_owner_key);

            const attrs = {
                old_owner_key: esc(old_owner_key),
                new_owner_key: esc(new_owner_key),
                request_submitted_at: new Date()
            };
            account_recovery_record.update(attrs);

            this.body = JSON.stringify({status: 'ok'});
        } catch (error) {
            console.error('Error in /request_account_recovery api call', this.session.uid, this.session.user, error.toString(), error.stack);
            this.body = JSON.stringify({error: error.message});
            this.status = 500;
        }
    });

    router.post('/api/v1/account_identity_providers', koaBody, function *() {
        if (rateLimitReq(this, this.req)) return;
        try {
            const params = this.request.body;
            const {csrf, name, owner_key} = typeof(params) === 'string' ? JSON.parse(params) : params;
            if (!checkCSRF(this, csrf)) return;
            console.log('-- /account_identity_providers -->', this.session.uid, name, owner_key);
            const existing_account = yield models.Account.findOne({
                attributes: ['id', 'user_id', 'owner_key'],
                where: {name: esc(name)},
                order: 'id DESC'
            });
            if (existing_account) {
                if (existing_account.owner_key === owner_key) {
                    const identity = yield models.Identity.findOne({
                        attributes: ['provider'],
                        where: {user_id: existing_account.user_id},
                        order: 'id DESC'
                    });
                    this.body = JSON.stringify({status: 'found', provider: identity ? identity.provider : null});
                } else {
                    this.body = JSON.stringify({status: 'found', provider: 'both'});
                }
            } else {
                this.body = JSON.stringify({status: 'not found found', provider: 'email'});
            }
        } catch (error) {
            console.error('Error in /account_identity_providers api call', this.session.uid, error);
            this.body = JSON.stringify({error: error.message});
            this.status = 500;
        }
    });

    router.post('/api/v1/initiate_account_recovery_with_email', koaBody, function *() {
        const params = this.request.body;
        const {csrf, contact_email, account_name, owner_key} = typeof(params) === 'string' ? JSON.parse(params) : params;
        if (!checkCSRF(this, csrf)) return;
        console.log('-- /initiate_account_recovery_with_email -->', this.session.uid, contact_email, account_name, owner_key);
        if (!account_name || !contact_email || !owner_key) {
            this.body = JSON.stringify({status: 'error'});
            return;
        }
        const arec = yield models.AccountRecoveryRequest.findOne({
            attributes: ['id'],
            where: escAttrs({account_name, contact_email})
        });
        if (arec) {
            this.body = JSON.stringify({status: 'duplicate'});
            return;
        }
        const attrs = {uid: this.session.uid, status: 'open', contact_email, account_name, owner_key, provider: 'email'};
        attrs.remote_ip = getRemoteIp(this.req);
        const request = yield models.AccountRecoveryRequest.create(escAttrs(attrs));
        console.log('-- initiate_account_recovery_with_email  -->', this.session.uid, request.id, account_name, owner_key);
        this.body = JSON.stringify({status: 'ok'});
    });
}

import {Apis} from 'shared/api_client';
import {createTransaction, signTransaction} from 'shared/chain/transactions';
import {ops} from 'shared/serializer';

const {signed_transaction} = ops;

function* requestAccountRecovery({
    recovery_account, account_to_recover, new_owner_authority,
    signing_key, broadcast = false,
}) {
    const operations = [['request_account_recovery', {
        recovery_account, account_to_recover, new_owner_authority,
    }]]
    const tx = yield createTransaction(operations)
    const sx = signTransaction(tx, signing_key)
    if (!broadcast) return signed_transaction.toObject(sx)
    return yield new Promise((resolve, reject) =>
        Apis.broadcastTransaction(sx, () => {resolve()}).catch(e => {reject(e)})
    )
}
