import koa_router from 'koa-router';
import koa_body from 'koa-body';
import request from 'co-request';
import React from 'react';
import {renderToString} from 'react-dom/server';
import models from 'db/models';
import ServerHTML from 'server/server-html';
import Icon from 'app/components/elements/Icon.jsx';
import {verify} from 'server/teleSign';
import SignupProgressBar from 'app/components/elements/SignupProgressBar';
import {getRemoteIp, checkCSRF} from 'server/utils';
import MiniHeader from 'app/components/modules/MiniHeader';

const assets_file = process.env.NODE_ENV === 'production' ? 'tmp/webpack-stats-prod.json' : 'tmp/webpack-stats-dev.json';
const assets = Object.assign({}, require(assets_file), {script: []});
// assets.script.push('https://www.google.com/recaptcha/api.js');

function *confirmMobileHandler() {
    const confirmation_code = this.params && this.params.code ? this.params.code : this.request.body.code;
    console.log('-- /confirm_mobile -->', this.session.uid, this.session.user, confirmation_code);
    const mid = yield models.Identity.findOne(
        {attributes: ['id', 'user_id', 'verified', 'updated_at'], where: {user_id: this.session.user, confirmation_code}, order: 'id DESC'}
    );
    if (!mid) {
        this.status = 401;
        this.body = 'Wrong confirmation code';
        return;
    }
    if (mid.verified) {
        this.flash = {success: 'Phone number has already been verified'};
        this.redirect('/create_account');
        return;
    }
    this.session.user = mid.user_id;
    const hours_ago = (Date.now() - mid.updated_at) / 1000.0 / 3600.0;
    if (hours_ago > 24.0) {
        this.status = 401;
        this.body = 'Confirmation code has been expired';
        return;
    }
    yield mid.update({verified: true});
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
            this.redirect('/create_account');
            return;
        }
        const body = renderToString(<div className="App">
            <MiniHeader />
            <SignupProgressBar steps={[this.session.prv || 'identity', 'email', 'phone', 'steem account']} current={3} />
            <br />
            <div className="row" style={{maxWidth: '32rem'}}>
                <form className="column" action="/submit_mobile" method="POST">
                    <h4>Please provide your phone number to continue the registration process</h4>
                    <div className="secondary">Phone verification helps with preventing spam and allows Steemit to assist with Account Recovery in case your account is ever compromised.
                        Your phone number will not be used for any other purpose other than phone verification and account recovery.</div>
                    <br />
                    <input type="hidden" name="csrf" value={this.csrf} />
                    <label>
                        Phone number
                        <input type="tel" name="mobile" defaultValue={mid ? mid.phone : ''} />
                    </label>
                    <div className="secondary">Examples: 1-541-754-3010 | +1-541-754-3010 | +49-89-636-48018</div>
                    <br />
                    <div className="secondary">* fixed line phones cannot receive SMS messages</div>
                    <div className="secondary">* message and data rates may apply</div>
                    <br />
                    {/*<div className="g-recaptcha" data-sitekey={config.recaptcha.site_key}></div>*/}
                    <div className="error">{this.flash.error}</div>
                    <input type="submit" className="button" value="CONTINUE" />
                </form>
            </div>
        </div>);
        const props = { body, title: 'Phone Number', assets, meta: [] };
        this.body = '<!DOCTYPE html>' + renderToString(<ServerHTML { ...props } />);
    });

    router.post('/submit_mobile', koaBody, function *() {
        if (!checkCSRF(this, this.request.body.csrf)) return;
        const user_id = this.session.user;
        if (!user_id) { this.body = 'user not found'; return; }
        let mobile = this.request.body.mobile;
        if (!mobile) {
            this.flash = {error: 'Please provide a mobile number'};
            this.redirect('/enter_mobile');
            return;
        }

        mobile = mobile.match(/\d+/g).join('')
        if(mobile.length < "9998887777".length) {
            this.flash = {error: 'Please provide an area code'};
            this.redirect('/enter_mobile');
            return;
        }

        if(mobile.length === "9998887777".length) {
            mobile = `1${mobile}`
        }

        const eid = yield models.Identity.findOne(
            {attributes: ['id'], where: {user_id, provider: 'email', verified: true}, order: 'id DESC'}
        );
        if (!eid) {
            this.flash = {error: 'Please confirm your email address first'};
            this.redirect('/enter_mobile');
            return;
        }

        // const recaptcha = this.request.body['g-recaptcha-response'];
        // const verificationUrl = 'https://www.google.com/recaptcha/api/siteverify?secret=' + config.recaptcha.secret_key + '&response=' + recaptcha + '&remoteip=' + this.req.connection.remoteAddress;
        // let captcha_failed;
        // try {
        //     const recaptcha_res = yield request(verificationUrl);
        //     const body = JSON.parse(recaptcha_res.body);
        //     captcha_failed = !body.success;
        // } catch (e) {
        //     captcha_failed = true;
        //     console.error('-- /submit_mobile recaptcha request failed -->', verificationUrl, e);
        // }
        // if (captcha_failed) {
        //     console.log('-- /submit_mobile captcha verification failed -->', user_id, this.session.uid, mobile, this.req.connection.remoteAddress);
        //     this.flash = {error: 'Failed captcha verification, please try again.'};
        //     this.redirect('/enter_mobile');
        //     return;
        // }

        const existing_phone = yield models.Identity.findOne(
            {attributes: ['user_id'], where: {phone: mobile, provider: 'phone', verified: true}, order: 'id'}
        );
        if (existing_phone && existing_phone.user_id != user_id) {
            console.log('-- /submit_email existing_phone -->', user_id, this.session.uid, mobile, existing_phone.user_id);
            this.flash = {error: 'This phone number has already been used'};
            this.redirect('/enter_mobile');
            return;
        }

        const confirmation_code = Math.random().toString().substring(2, 6);
        let mid = yield models.Identity.findOne(
            {attributes: ['id', 'phone', 'verified', 'updated_at'], where: {user_id, provider: 'phone'}, order: 'id'}
        );
        if (mid) {
            if (mid.verified) {
                this.flash = {success: 'Phone number has been verified'};
                this.redirect('/create_account'); return;
            } else {
                const seconds_ago = (Date.now() - mid.updated_at) / 1000.0;
                if (seconds_ago < 120) {
                    this.flash = {error: 'Confirmation was sent a moment ago. You can try again only in 2 minutes.'};
                    this.redirect('/enter_mobile');
                    return;
                }
                yield mid.update({confirmation_code, phone: mobile});
            }
        } else {
            mid = yield models.Identity.create({
                provider: 'phone',
                user_id,
                uid: this.session.uid,
                phone: mobile,
                verified: false,
                confirmation_code
            });
        }
        console.log('-- /submit_mobile -->', this.session.uid, this.session.user, mobile, mid.id);
        const ip = getRemoteIp(this.req)

        const verifyResult = yield verify({mobile, confirmation_code, ip});
        if (verifyResult && verifyResult.score) eid.update({score: verifyResult.score});
        if(verifyResult && verifyResult.error) {
            this.flash = {error: verifyResult.error};
            this.redirect('/enter_mobile');
            return;
        }

        const body = renderToString(<div className="App">
            <MiniHeader />
            <SignupProgressBar steps={[this.session.prv || 'identity', 'email', 'phone', 'steem account']} current={3} />
            <br />
            <div className="row" style={{maxWidth: '32rem'}}>
                <div className="column">
                    Thank you for providing your mobile number ({mobile}).<br />
                    To continue please enter the SMS code we've sent you.
                </div>
            </div>
            <br />
            <div className="row" style={{maxWidth: '32rem'}}>
                <form className="column" action="/confirm_mobile" method="POST">
                    <label>
                        Confirmation code
                        <input type="text" name="code" />
                    </label>
                    <br />
                    <div className="secondary">Didn't receive the verification code? <a href="/enter_mobile">Re-send</a></div>
                    <br />
                    <input type="submit" className="button" value="CONTINUE" />
                </form>
            </div>
        </div>);
        const props = { body, title: 'Mobile Confirmation', assets, meta: [] };
        this.body = '<!DOCTYPE html>' + renderToString(<ServerHTML { ...props } />);
    });

    router.get('/confirm_mobile/:code', confirmMobileHandler);
    router.post('/confirm_mobile', koaBody, confirmMobileHandler);
}
