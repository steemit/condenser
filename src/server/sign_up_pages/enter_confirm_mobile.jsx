import koa_router from 'koa-router';
import koa_body from 'koa-body';
import React from 'react';
import { renderToString } from 'react-dom/server';
import models from 'db/models';
import { PARAM_VIEW_MODE, VIEW_MODE_WHISTLE } from 'shared/constants';
import { addToParams, makeParams } from 'app/utils/Links';
import ServerHTML from 'server/server-html';
// import twilioVerify from "server/utils/twilio";
import teleSignVerify from 'server/utils/teleSign';
import CountryCode from 'app/components/elements/CountryCode';
import { getRemoteIp, checkCSRF } from 'server/utils/misc';
import MiniHeader from 'app/components/modules/MiniHeader';
import secureRandom from 'secure-random';
import config from 'config';
import Mixpanel from 'mixpanel';

const path = require('path');
const ROOT = path.join(__dirname, '../../..');

// FIXME copy paste code, refactor mixpanel out
var mixpanel = null;
if (config.has('mixpanel') && config.get('mixpanel')) {
    mixpanel = Mixpanel.init(config.get('mixpanel'));
}

var assets_file = ROOT + '/tmp/webpack-stats-dev.json';
if (process.env.NODE_ENV === 'production') {
    assets_file = ROOT + '/tmp/webpack-stats-prod.json';
}

const assets = Object.assign({}, require(assets_file), { script: [] });

// function mousePosition(e) {
//     // log x/y cords
//     console.log("hereI am man", e);
//     if(e.type === 'mouseenter') {
//         console.log(e.screenX, e.screenY);
//     }
// }

function* confirmMobileHandler(e) {
    if (!checkCSRF(this, this.request.body.csrf)) return;
    const params = addToParams({}, this.request.query, PARAM_VIEW_MODE, [
        VIEW_MODE_WHISTLE,
    ]);
    const enterMobileUrl = `/enter_mobile` + makeParams(params);

    const confirmation_code =
        this.params && this.params.code
            ? this.params.code
            : this.request.body.code;
    console.log(
        '-- /confirm_mobile -->',
        this.session.uid,
        this.session.user,
        confirmation_code
    );

    const user = yield models.User.findOne({
        attributes: ['id', 'account_status'],
        where: { id: this.session.user },
    });
    if (!user) {
        this.flash = {
            error:
                'User session not found, please make sure you have cookies enabled in your browser for this website',
        };
        this.redirect(enterMobileUrl);
        return;
    }
    const mid = yield models.Identity.findOne({
        where: { user_id: user.id, provider: 'phone', confirmation_code },
    });

    if (!mid) {
        this.flash = { error: 'Wrong confirmation code' };
        this.redirect(enterMobileUrl);
        return;
    }

    const hours_ago = (Date.now() - mid.updated_at) / 1000.0 / 3600.0;
    if (hours_ago > 24.0) {
        this.status = 401;
        this.flash = { error: 'Confirmation code has been expired' };
        this.redirect(enterMobileUrl);
        return;
    }

    const number_of_created_accounts = yield models.sequelize.query(
        `select count(*) as result from identities i join accounts a on a.user_id=i.user_id where i.provider='phone' and i.phone=:phone and a.created=1 and a.ignored<>1`,
        {
            replacements: { phone: mid.phone },
            type: models.sequelize.QueryTypes.SELECT,
        }
    );
    if (
        number_of_created_accounts &&
        number_of_created_accounts[0].result > 0
    ) {
        console.log(
            '-- /confirm_mobile there are created accounts -->',
            user.id,
            mid.phone
        );
        this.flash = { error: 'This phone number has already been used' };
        this.redirect(enterMobileUrl);
        return;
    }

    // successful new verified phone number
    yield mid.update({ provider: 'phone', verified: true });
    if (user.account_status === 'onhold')
        yield user.update({ account_status: 'waiting' });
    if (mixpanel)
        mixpanel.track('SignupStepPhone', { distinct_id: this.session.uid });

    console.log('--/Success phone redirecting user', this.session.user);
    this.redirect('/approval' + makeParams(params));
}

export default function useEnterAndConfirmMobilePages(app) {
    const router = koa_router();
    app.use(router.routes());
    const koaBody = koa_body();

    router.get('/enter_mobile', function*() {
        console.log(
            '-- /enter_mobile -->',
            this.session.uid,
            this.session.user
        );
        const params = addToParams({}, this.request.query, PARAM_VIEW_MODE, [
            VIEW_MODE_WHISTLE,
        ]);
        const viewMode = params[PARAM_VIEW_MODE] ? params[PARAM_VIEW_MODE] : '';

        const phone = this.query.phone;
        const country = this.query.country;

        const body = renderToString(
            <div className="App CreateAccount">
                {viewMode !== VIEW_MODE_WHISTLE ? <MiniHeader /> : null}
                <br />
                <div
                    className="row CreateAccount__step"
                    style={{ maxWidth: '32rem' }}
                >
                    <div className="column">
                        <div className="progress">
                            <div style={{ width: '90%' }} />
                        </div>
                        <form
                            className="column"
                            action={'/submit_mobile' + makeParams(params)}
                            method="POST"
                        >
                            <h4 className="CreateAccount__title">
                                Almost there!
                            </h4>

                            <p>We need to send you a quick text. </p>

                            <p>
                                With each Steemit account comes a free initial
                                grant of Steem Power! Phone verification helps
                                cut down on spam accounts.
                            </p>

                            <p>
                                <em>
                                    Your phone number will not be used for any
                                    other purpose other than account
                                    verification and (potentially) account
                                    recovery should your account ever be
                                    compromised.
                                </em>
                            </p>

                            <input
                                type="hidden"
                                name="csrf"
                                value={this.csrf}
                            />
                            <label>
                                Country Code
                                <CountryCode name="country" value={country} />
                            </label>
                            <label>
                                Phone number
                                <input type="tel" name="phone" value={phone} />
                            </label>
                            <div className="secondary">
                                Examples: 541-754-3010 | 89-636-48018
                            </div>
                            <br />
                            <div className="secondary">
                                * Land lines cannot receive SMS messages
                            </div>
                            <div className="secondary">
                                * Message and data rates may apply
                            </div>
                            <br />
                            <div className="error">{this.flash.error}</div>
                            <input
                                type="submit"
                                className="button"
                                value="Continue"
                            />
                        </form>
                    </div>
                </div>
            </div>
        );
        const props = { body, title: 'Phone Number', assets, meta: [] };
        this.body =
            '<!DOCTYPE html>' + renderToString(<ServerHTML {...props} />);
        if (mixpanel)
            mixpanel.track('SignupStep2', { distinct_id: this.session.uid });
    });

    router.post('/submit_mobile', koaBody, function*() {
        if (!checkCSRF(this, this.request.body.csrf)) return;
        const user_id = this.session.user;
        const country = this.request.body.country;
        const localPhone = this.request.body.phone;
        const params = addToParams({}, this.request.query, PARAM_VIEW_MODE, [
            VIEW_MODE_WHISTLE,
        ]);
        const viewMode = params[PARAM_VIEW_MODE] ? params[PARAM_VIEW_MODE] : '';

        if (!user_id) {
            this.flash = {
                error: 'Your session has been interrupted, please start over',
            };
            this.redirect('/pick_account' + makeParams(params));
            return;
        }
        params.country = country;
        params.phone = localPhone;

        const enterMobileUrl = `/enter_mobile` + makeParams(params);

        if (!country || country === '') {
            this.flash = { error: 'Please select a country code' };
            this.redirect(enterMobileUrl);
            return;
        }

        if (!localPhone || digits(localPhone).length === 0) {
            this.flash = { error: 'Please provide a phone number' };
            this.redirect(enterMobileUrl);
            return;
        }

        let phone = digits(parseInt(country) + localPhone);

        // const blocked_prefixes = yield models.List.findAll({
        //     attributes: ["id", "value"],
        //     where: { kk: "block-phone-prefix" }
        // });
        // for (const bp of blocked_prefixes) {
        //     if (phone.match(new RegExp("^" + bp.value))) {
        //         this.flash = {
        //             error: "Unfortunately, we don't yet have support to send SMS to your carrier, please try again later."
        //         };
        //         this.redirect("/enter_mobile");
        //         return;
        //     }
        // }

        const confirmation_code = parseInt(
            secureRandom.randomBuffer(8).toString('hex'),
            16
        )
            .toString(10)
            .substring(0, 5); // 4 digit code

        let mid = yield models.Identity.findOne({
            where: { user_id, provider: 'phone' },
        });

        if (mid) {
            if (mid.verified) {
                if (mid.phone === phone) {
                    this.flash = { success: 'Phone number has been verified' };
                    if (mixpanel)
                        mixpanel.track('SignupStep3', {
                            distinct_id: this.session.uid,
                        });
                    this.redirect('/approval' + makeParams(params));
                    return;
                }
                yield mid.update({ verified: false, phone });
            }
            const seconds_ago = (Date.now() - mid.updated_at) / 1000.0;
            if (seconds_ago < 60) {
                this.flash = {
                    error:
                        'Confirmation was attempted a moment ago. You can attempt verification again in one minute.',
                };
                this.redirect(enterMobileUrl);
                return;
            }
        }

        // const twilioResult = yield twilioVerify(phone);
        // console.log('-- /submit_mobile twilioResult -->', twilioResult);
        //
        // if (twilioResult === 'block') {
        //     mid.update({score: 111111});
        //     this.flash = { error: 'Unable to verify your phone number. Please try a different phone number.' };
        //     this.redirect(enterMobileUrl);
        //     return;
        // }

        const verifyResult = yield teleSignVerify({
            mobile: phone,
            confirmation_code,
            ip: getRemoteIp(this.req),
            ignore_score: true, //twilioResult === 'pass'
        });

        if (verifyResult.error) {
            this.flash = { error: verifyResult.error };
            this.redirect(enterMobileUrl);
            return;
        }

        phone = verifyResult.phone;

        if (mid) {
            yield mid.update({
                confirmation_code,
                phone,
                score: verifyResult.score,
            });
        } else {
            mid = yield models.Identity.create({
                provider: 'phone',
                user_id,
                uid: this.session.uid,
                phone,
                verified: false,
                confirmation_code,
                score: verifyResult.score,
            });
        }

        console.log(
            '-- /submit_mobile -->',
            this.session.uid,
            this.session.user,
            phone,
            mid.id
        );

        const body = renderToString(
            <div className="App CreateAccount">
                {viewMode !== VIEW_MODE_WHISTLE ? <MiniHeader /> : null}
                <br />
                <div className="row" style={{ maxWidth: '32rem' }}>
                    <div className="column">
                        <progress max="100" value="90">
                            <div className="progress">
                                <div style={{ width: '90%' }} />
                            </div>
                        </progress>
                        Thank you for providing your phone number (
                        {phone}
                        ).
                        <br />
                        To continue please enter the SMS code we've sent you.
                    </div>
                </div>
                <br />
                <div className="row" style={{ maxWidth: '32rem' }}>
                    <form
                        className="column"
                        action={'/confirm_mobile' + makeParams(params)}
                        method="POST"
                    >
                        <input type="hidden" name="csrf" value={this.csrf} />
                        <label>
                            Confirmation code
                            <input type="text" name="code" />
                        </label>
                        <br />
                        <div className="secondary">
                            Didn't receive the verification code?{' '}
                            <a href={enterMobileUrl}>Re-send</a>
                        </div>
                        <br />
                        <input
                            type="submit"
                            className="button"
                            value="Continue"
                        />
                    </form>
                </div>
            </div>
        );
        const props = { body, title: 'Phone Confirmation', assets, meta: [] };
        this.body =
            '<!DOCTYPE html>' + renderToString(<ServerHTML {...props} />);
    });

    router.get('/confirm_mobile/:code', confirmMobileHandler);
    router.post('/confirm_mobile', koaBody, confirmMobileHandler);
}

function digits(text) {
    const digitArray = text.match(/\d+/g);
    return digitArray ? digitArray.join('') : '';
}
