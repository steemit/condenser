import koa_router from 'koa-router';
import koa_body from 'koa-body';
import React from 'react';
import {renderToString} from 'react-dom/server';
import models from 'db/models';
import ServerHTML from 'server/server-html';
// import {verify} from 'server/teleSign';
import twilioVerify from "server/utils/twilio";
import SignupProgressBar from 'app/components/elements/SignupProgressBar';
import CountryCode from 'app/components/elements/CountryCode';
import {getRemoteIp, checkCSRF} from 'server/utils';
import MiniHeader from 'app/components/modules/MiniHeader';
import secureRandom from 'secure-random';
import config from '../../config';
import { translate } from 'app/Translator';
import {metrics} from 'server/metrics';
import {hash} from 'shared/ecc';

const assets_file = process.env.NODE_ENV === 'production' ? 'tmp/webpack-stats-prod.json' : 'tmp/webpack-stats-dev.json';
const assets = Object.assign({}, require(assets_file), {script: []});

function *confirmMobileHandler() {
    const confirmation_code = this.params && this.params.code ? this.params.code : this.request.body.code;
    console.log('-- /confirm_mobile -->', this.session.uid, this.session.user, confirmation_code);

    const mid = yield models.Identity.findOne(
        {attributes: ['id', 'user_id', 'verified', 'updated_at', 'phone'], where: {user_id: this.session.user, confirmation_code, provider: 'phone'}, order: 'id DESC'}
    );
    if (!mid) {
        this.flash = {error: 'Wrong confirmation code.'};
        this.redirect('/enter_mobile');
        return;
    }
    if (mid.verified) {
        this.flash = {success: 'Phone number has already been verified'};
        this.redirect('/create_account');
        return;
    }

    const used_phone = yield models.sequelize.query(`SELECT a.id FROM accounts a JOIN identities i ON i.user_id=a.user_id WHERE i.phone='${mid.phone}'`, { type: models.Sequelize.QueryTypes.SELECT})
    if (used_phone && used_phone.length > 0) {
        this.flash = {error: 'This phone number has already been used'};
        this.redirect('/enter_mobile');
        return;
    }

    const hours_ago = (Date.now() - mid.updated_at) / 1000.0 / 3600.0;
    if (hours_ago > 24.0) {
        this.status = 401;
        this.flash = {error: 'Confirmation code has been expired'};
        this.redirect('/enter_mobile');
        return;
    }
    yield mid.update({verified: true});
    if (metrics) metrics.increment('_signup_step_3');
    this.redirect('/create_account');
}
export default function useEnterAndConfirmMobilePages(app) {

    const router = koa_router();
    app.use(router.routes());
    const koaBody = koa_body();

    router.get('/enter_mobile', function *() {
        console.log('-- /enter_mobile -->', this.session.uid, this.session.user);
        const user_id = this.session.user;
        if (!user_id) { this.body = 'user not found'; return; }
        const mid = yield models.Identity.findOne(
            {attributes: ['phone'], where: {user_id, provider: 'phone'}, order: 'id DESC'}
        );
        if (mid && mid.verified) {
            this.flash = {success: 'Phone number has already been verified'};
            if (metrics) metrics.increment('_signup_step_3');
            this.redirect('/create_account');
            return;
        }
        const phone = this.query.phone
        const country = this.query.country

        const body = renderToString(<div className="App">
            <MiniHeader />
            <SignupProgressBar steps={[translate('email'), translate('phone'), translate('golos_account')]} current={2} />
            <br />
            <div className="row" style={{maxWidth: '32rem'}}>
                <form className="column" action="/submit_mobile" method="POST">
                    <h4>{translate('please_provide_your_phone_number_to_continue')}</h4>
                    <div className="secondary">{translate('phone_verification_helps_with_preventing_spam')}</div>
                    <br />
                    <input type="hidden" name="csrf" value={this.csrf} />
                    <label>
                        {translate('country_code')}
                        <CountryCode name="country" value={country} />
                    </label>
                    <label>
                        {translate('phone_number')}
                        <input type="tel" name="phone" value={phone} />
                    </label>
                    <div className="secondary">{translate('examples')}</div>
                    <br />
                    <div className="secondary">{translate('land_lines_cannot_receive_sms_messages')}</div>
                    <div className="secondary">{translate('message_and_data_rates_may_apply')}</div>
                    <br />
                    <div className="error">{this.flash.error}</div>
                    <input type="submit" className="button" value={translate('continue')} />
                </form>
            </div>
        </div>);
        const props = { body, title: translate('phone_number'), assets, meta: [] };
        this.body = '<!DOCTYPE html>' + renderToString(<ServerHTML { ...props } />);
        if (metrics) metrics.increment('_signup_step_2');
    });

    router.post('/submit_mobile', koaBody, function *() {
        if (!checkCSRF(this, this.request.body.csrf)) return;
        const user_id = this.session.user;
        if (!user_id) { this.body = 'user not found'; return; }

        const country = this.request.body.country;
        const localPhone = this.request.body.phone;
        const enterMobileUrl = `/enter_mobile?phone=${localPhone}&country=${country}`

        if (!country || country === '') {
            this.flash = {error: 'Please select a country code'};
            this.redirect(enterMobileUrl);
            return;
        }

        if (!localPhone || digits(localPhone).length === 0) {
            this.flash = {error: 'Please provide a phone number'};
            this.redirect(enterMobileUrl);
            return;
        }

        const phone = digits(parseInt(country) + localPhone)
        const phoneHash = hash.sha256(phone, 'hex')

        const eid = yield models.Identity.findOne(
            {attributes: ['id'], where: {user_id, provider: 'email', verified: true}, order: 'id DESC'}
        );
        if (!eid) {
            this.flash = {error: 'Please confirm your email address first'};
            this.redirect('/enter_mobile');
            return;
        }

        const existing_phone = yield models.Identity.findOne(
            {attributes: ['user_id'], where: {phone: phoneHash, provider: 'phone', verified: true}, order: 'id DESC'}
        );
        if (existing_phone && existing_phone.user_id != user_id) {
            console.log('-- /submit_email existing_phone -->', user_id, this.session.uid, phoneHash, existing_phone.user_id);
            this.flash = {error: 'This phone number has already been used'};
            this.redirect(enterMobileUrl);
            return;
        }

        const confirmation_code = parseInt(secureRandom.randomBuffer(8).toString('hex'), 16).toString(10).substring(0, 4); // 4 digit code
        let mid = yield models.Identity.findOne(
            {attributes: ['id', 'phone', 'verified', 'updated_at'], where: {user_id, provider: 'phone'}, order: 'id DESC'}
        );
        if (mid) {
            if (mid.verified) {
                if(mid.phone === phone) {
                    this.flash = {success: 'Phone number has been verified'};
                    if (metrics) metrics.increment('_signup_step_3');
                    this.redirect('/create_account');
                    return;
                }
                yield mid.update({verified: false, phoneHash});
            }
            const seconds_ago = (Date.now() - mid.updated_at) / 1000.0;
            if (seconds_ago < 120) {
                this.flash = {error: 'Confirmation was attempted a moment ago. You can try again only in 2 minutes.'};
                this.redirect(enterMobileUrl);
                return;
            }
            yield mid.update({confirmation_code, phoneHash});
        } else {
            mid = yield models.Identity.create({
                provider: 'phone',
                user_id,
                uid: this.session.uid,
                phone: phoneHash,
                verified: false,
                confirmation_code
            });
        }
        console.log('-- /submit_mobile -->', this.session.uid, this.session.user, phoneHash, mid.id);
        const ip = getRemoteIp(this.req)

        // const verifyResult = yield verify({mobile: phone, confirmation_code, ip});
        // if (verifyResult && verifyResult.score) mid.update({score: verifyResult.score});
        const verifyResult = yield twilioVerify('+' + phone, confirmation_code);
        if (verifyResult && verifyResult.error) {
            this.flash = {error: verifyResult.error};
            this.redirect(enterMobileUrl);
            return;
        }

        const body = renderToString(<div className="App">
            <MiniHeader />
            <SignupProgressBar steps={[translate('email'), translate('phone'), translate('golos_account')]} current={2} />
            <br />
            <div className="row" style={{maxWidth: '32rem'}}>
                <div className="column">
                    {translate('thank_you_for_providing_your_phone_number')}<br />
                    {translate('to_continue_please_enter_the_sms_code_weve_sent_you')}
                </div>
            </div>
            <br />
            <div className="row" style={{maxWidth: '32rem'}}>
                <form className="column" action="/confirm_mobile" method="POST">
                    <label>
                        {translate('confirmation_code')}
                        <input type="text" name="code" />
                    </label>
                    <br />
                    <div className="secondary">
                      {translate('didnt_receive_the_verification_code')}{" "}
                      <a href={enterMobileUrl}>{translate('re_send')}</a></div>
                    <br />
                    <input type="submit" className="button" value={translate('continue')} />
                </form>
            </div>
        </div>);
        const props = { body, title: translate('phone_confirmation'), assets, meta: [] };
        this.body = '<!DOCTYPE html>' + renderToString(<ServerHTML { ...props } />);
    });

    router.get('/confirm_mobile/:code', confirmMobileHandler);
    router.post('/confirm_mobile', koaBody, confirmMobileHandler);
}

function digits(text) {
    const digitArray = text.match(/\d+/g)
    return digitArray ? digitArray.join('') : ''
}
