/*global $STM_Config */
import koa_router from 'koa-router';
import koa_body from 'koa-body';
import config from 'config';
import { getRemoteIp, rateLimitReq, checkCSRF } from 'server/utils/misc';
import coBody from 'co-body';
import Mixpanel from 'mixpanel';
import { PublicKey, Signature, hash } from '@steemit/steem-js/lib/auth/ecc';
import { api, broadcast } from '@steemit/steem-js';

const ACCEPTED_TOS_TAG = 'accepted_tos_20180614';

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

    router.post('/login_account', koaBody, function*() {
        // if (rateLimitReq(this, this.req)) return;
        const params = this.request.body;
        const { csrf, account, signatures } =
            typeof params === 'string' ? JSON.parse(params) : params;
        if (!checkCSRF(this, csrf)) return;

        logRequest('login_account', this, { account });
        try {
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

            this.body = JSON.stringify({
                status: 'ok',
            });
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
            this.body = JSON.stringify({
                error: error.message,
            });
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

    router.post('/isTosAccepted', koaBody, function*() {
        const params = this.request.body;
        const { csrf } =
            typeof params === 'string' ? JSON.parse(params) : params;
        if (!checkCSRF(this, csrf)) return;

        this.body = '{}';
        this.status = 200;

        if (!this.session.a) {
            this.body = 'missing username';
            this.status = 500;
            return;
        }

        try {
            const res = yield api.signedCallAsync(
                'conveyor.get_tags_for_user',
                [this.session.a],
                config.get('conveyor_username'),
                config.get('conveyor_posting_wif')
            );

            this.body = JSON.stringify(res.includes(ACCEPTED_TOS_TAG));
        } catch (error) {
            console.error(
                'Error in /isTosAccepted api call',
                this.session.a,
                error
            );
            this.body = JSON.stringify({ error: error.message });
            this.status = 500;
        }
    });

    router.post('/acceptTos', koaBody, function*() {
        const params = this.request.body;
        const { csrf } =
            typeof params === 'string' ? JSON.parse(params) : params;
        if (!checkCSRF(this, csrf)) return;

        if (!this.session.a) {
            this.body = 'missing logged in account';
            this.status = 500;
            return;
        }
        try {
            yield api.signedCallAsync(
                'conveyor.assign_tag',
                {
                    uid: this.session.a,
                    tag: ACCEPTED_TOS_TAG,
                },
                config.get('conveyor_username'),
                config.get('conveyor_posting_wif')
            );
            this.body = JSON.stringify({ status: 'ok' });
        } catch (error) {
            console.error(
                'Error in /acceptTos api call',
                this.session.uid,
                error
            );
            this.body = JSON.stringify({ error: error.message });
            this.status = 500;
        }
    });
}

const parseSig = hexSig => {
    try {
        return Signature.fromHex(hexSig);
    } catch (e) {
        return null;
    }
};
