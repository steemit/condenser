import koa_router from 'koa-router';
import koa_body from 'koa-body';
import config from 'config';
import models from 'db/models';
import { checkCSRF, getRemoteIp, rateLimitReq } from 'server/utils/misc';
import { hash } from 'golos-js/lib/auth/ecc';
import crypto from 'crypto';

function digits(text) {
    const digitArray = text.match(/\d+/g);
    return digitArray ? digitArray.join('') : '';
}

/**
 * return status types:
 * session - new user without identity in DB
 * waiting - user verification phone in progress
 * done - user verification phone is successfuly done
 * already_used -
 * attempts_10 - Confirmation was attempted a moment ago. You can try again only in 10 seconds
 * attempts_300 - Confirmation was attempted a moment ago. You can try again only in 5 minutes
 * @param {*} app
 */
export default function useRegistrationApi(app) {
    const router = koa_router({ prefix: '/api/v1' });
    app.use(router.routes());
    const koaBody = koa_body();

    router.post('/verify_code', koaBody, function*() {
        if (!this.request.body) {
            this.status = 400;
            this.body = 'Bad Request';
            return;
        }

        const accountSid = this.request.body.AccountSid || ''

        if (accountSid.localeCompare(config.get('twilio.account_sid')) != 0) {
            this.status = 401;
            this.body = 'Unauthorized';
            return;
        }

        let phone;
        if (this.request.body.From) {
            phone = this.request.body.From.substr(1);
        } else if (this.request.body.phone) {
            phone = this.request.body.phone;
        }

        if (!phone || digits(phone).length === 0) {
            this.status = 401;
            this.body = 'Bad Request Data from';
            return;
        }

        let confirmation_code;
        if (this.request.body.Body) {
            confirmation_code = this.request.body.Body.substr(0, 4);
        } else if (this.request.body.mes) {
            confirmation_code = this.request.body.mes.substr(0, 4);
        }

        if (!confirmation_code || digits(confirmation_code).length !== 4) {
            this.status = 400;
            this.body = 'Bad Request Data body';
            return;
        }

        console.log(
            '-- /api/v1/confirm_provider -->',
            phone,
            confirmation_code
        );

        let mid = yield models.Identity.findOne({
            attributes: ['id', 'user_id', 'verified', 'updated_at', 'phone'],
            where: {
                phone: hash.sha256(phone, 'hex'),
                confirmation_code,
                provider: 'phone',
            },
            order: 'id DESC',
        });

        if (!mid) {
            this.status = 401;
            this.body = 'Wrong confirmation code';
            return;
        }

        if (mid.verified) {
            this.status = 401;
            this.body = 'Phone number has already been verified';
            return;
        }

        const hours_ago = (Date.now() - mid.updated_at) / 1000 / 3600;
        if (hours_ago > 24) {
            this.status = 401;
            this.body = 'Confirmation code has been expired';
            return;
        }

        yield mid.update({ verified: true });

        this.body =
            'GOLOS.io \nСпасибо за подтверждение вашего номера телефона';
    });

    router.post('/check_code', koaBody, function*() {
        if (rateLimitReq(this, this.req)) {
            return;
        }

        const body = this.request.body;
        let params = {};
        if (typeof body === 'string') {
            try {
                params = JSON.parse(body);
            } catch (e) {}
        } else {
            params = body;
        }

        if (!checkCSRF(this, params.csrf)) {
            return;
        }

        this.body = JSON.stringify({ status: 'session' });

        let user_id = this.session.user;
        if (!user_id) {
            return;
        }

        let mid = yield models.Identity.findOne({
            attributes: [
                'id',
                'phone',
                'verified',
                'updated_at',
                'confirmation_code',
            ],
            where: { user_id, provider: 'phone' },
            order: 'id DESC',
        });

        if (mid) {
            if (mid.verified) {
                this.body = JSON.stringify({ status: 'done' });
                return;
            }

            this.body = JSON.stringify({
                status: 'waiting',
                code: mid.confirmation_code,
            });

            const secondsAgo = (Date.now() - mid.updated_at) / 1000;
            const timeAgo = 10;

            if (secondsAgo < timeAgo) {
                this.body = JSON.stringify({ status: 'attempts_10' });
            }
        }
    });

    router.post('/send_code', koaBody, function*() {
        if (rateLimitReq(this, this.req)) {
            return;
        }

        const body = this.request.body;
        let params = {};

        if (typeof body === 'string') {
            try {
                params = JSON.parse(body);
            } catch (e) {}
        } else {
            params = body;
        }

        if (!checkCSRF(this, params.csrf)) {
            return;
        }

        const country = params.country || null;
        const localPhone = params.phone;
        const retry = params.retry;

        if (!country || country === '') {
            this.body = JSON.stringify({ status: 'select_country' });
            return;
        }

        if (!localPhone || digits(localPhone).length === 0) {
            this.body = JSON.stringify({ status: 'provide_phone' });
            return;
        }

        const phone = digits(parseInt(country) + localPhone);
        const phoneHash = hash.sha256(phone, 'hex');

        const existing_phone = yield models.Identity.findOne({
            attributes: ['user_id'],
            where: {
                phone: phoneHash,
                provider: 'phone',
                verified: true,
            },
            order: 'id DESC',
        });

        let user_id = this.session.user;
        if (existing_phone && existing_phone.user_id != user_id) {
            console.log(
                '-- /send_code existing_phone -->',
                user_id,
                this.session.uid,
                phoneHash,
                existing_phone.user_id
            );
            this.body = JSON.stringify({ status: 'already_used' });
            return;
        }

        let confirmation_code = generateCode();

        let mid = yield models.Identity.findOne({
            attributes: [
                'id',
                'phone',
                'verified',
                'updated_at',
                'confirmation_code',
            ],
            where: { user_id, provider: 'phone' },
            order: 'id DESC',
        });

        if (mid) {
            if (mid.verified) {
                if (mid.phone === phoneHash) {
                    this.body = JSON.stringify({ status: 'done' });
                    return;
                }
                yield mid.update({ verified: false, phone: phoneHash });
            }

            const secondsAgo = (Date.now() - mid.updated_at) / 1000;
            const timeAgo = process.env.NODE_ENV === 'production' ? 300 : 10;

            if (retry) {
                confirmation_code = mid.confirmation_code;
            } else {
                if (secondsAgo < timeAgo) {
                    this.body = JSON.stringify({ status: 'attempts_300' });
                    return;
                }
                yield mid.update({ confirmation_code, phone: phoneHash });
            }
        } else {
            let user;
            if (user_id) {
                user = yield models.User.findOne({
                    attributes: ['id'],
                    where: { id: user_id },
                });
            }

            if (!user) {
                user = yield models.User.create({
                    uid: this.session.uid,
                    remote_ip: getRemoteIp(this.request.req),
                });
                this.session.user = user_id = user.id;
            }

            yield models.Identity.create({
                provider: 'phone',
                user_id,
                uid: this.session.uid,
                phone: phoneHash,
                verified: false,
                confirmation_code,
            });
        }

        this.body = JSON.stringify({
            status: 'waiting',
            code: confirmation_code,
        });
    });
}

function generateCode() {
    const num = crypto.randomBytes(4).readUInt32LE();

    if (num < 1000) {
        return generateCode();
    }

    return num.toString().substr(0, 4);
}
