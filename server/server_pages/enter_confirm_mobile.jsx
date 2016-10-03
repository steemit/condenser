import koa_router from 'koa-router';
import koa_body from 'koa-body';
import request from 'co-request';
import React from 'react';
import {renderToString} from 'react-dom/server';
import models from 'db/models';
import ServerHTML from 'server/server-html';
import Icon from 'app/components/elements/Icon.jsx';
import {verify} from 'server/teleSign';
import {getRemoteIp, checkCSRF} from 'server/utils';
import config from 'config';

let assets;
if (process.env.NODE_ENV === 'production') {
    assets = Object.assign({}, require('tmp/webpack-stats-prod.json'), {script: ['https://www.google.com/recaptcha/api.js']});
} else {
    assets = Object.assign({}, require('tmp/webpack-stats-dev.json'));
    assets.script.push('https://www.google.com/recaptcha/api.js');
}

const header = <header className="Header">
    <div className="Header__top header">
        <div className="expanded row">
            <div className="columns">
                <ul className="menu">
                    <li className="Header__top-logo">
                        <a href="/"><Icon name="steem" size="2x" /></a>
                    </li>
                    <li className="Header__top-steemit show-for-medium"><a href="/">steemit<span className="beta">beta</span></a></li>
                </ul>
            </div>
        </div>
    </div>
</header>;

function *confirmMobileHandler() {
    const confirmation_code = this.params && this.params.code ? this.params.code : this.request.body.code;
    console.log('-- /confirm_mobile -->', this.session.uid, this.session.user, confirmation_code);
    const eid = yield models.Identity.findOne(
        {attributes: ['id', 'user_id', 'phone', 'updated_at'], where: {user_id: this.session.user, confirmation_code, verified: false}, order: 'id DESC'}
    );
    if (!eid) {
        this.status = 401;
        this.body = 'Confirmation code not found';
        return;
    }
    this.session.user = eid.user_id;
    const hours_ago = (Date.now() - eid.updated_at) / 1000.0 / 3600.0;
    if (hours_ago > 240.0 * 30) {
        this.status = 401;
        this.body = 'Confirmation code expired';
        return;
    }
    yield eid.update({verified: true});
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
        const eid = yield models.Identity.findOne(
            {attributes: ['phone'], where: {user_id, provider: 'phone'}, order: 'id DESC'}
        );
        const body = renderToString(<div className="App">
            {header}
            <br />
            <div className="row">
                <form className="column small-4" action="/submit_mobile" method="POST">
                    <p>
                        Please provide your mobile number to continue the registration process.<br />
                        <span className="secondary">This information allows Steemit to assist with Account Recovery in case your account is ever compromised.</span>
                    </p>
                    <input type="hidden" name="csrf" value={this.csrf} />
                    <label>
                        Mobile
                        <input type="tel" name="mobile" defaultValue={eid ? eid.phone : ''} />
                    </label>
                    <small className="warning">Include country code if outside the US</small>
                    <br />
                    <div className="g-recaptcha" data-sitekey={config.recaptcha.site_key}></div>
                    <br />
                    <div className="error">{this.flash.error}</div>
                    <input type="submit" className="button" value="CONTINUE" />
                </form>
            </div>
        </div>);
        const props = { body, title: 'Mobile Address', assets, meta: [] };
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

        const recaptcha = this.request.body['g-recaptcha-response'];
        const verificationUrl = 'https://www.google.com/recaptcha/api/siteverify?secret=' + config.recaptcha.secret_key + '&response=' + recaptcha + '&remoteip=' + this.req.connection.remoteAddress;
        let captcha_failed;
        try {
            const recaptcha_res = yield request(verificationUrl);
            const body = JSON.parse(recaptcha_res.body);
            captcha_failed = !body.success;
        } catch (e) {
            captcha_failed = true;
            console.error('-- /submit_mobile recaptcha request failed -->', verificationUrl, e);
        }
        if (captcha_failed) {
            console.log('-- /submit_mobile captcha verification failed -->', user_id, this.session.uid, mobile, this.req.connection.remoteAddress);
            this.flash = {error: 'Failed captcha verification, please try again.'};
            this.redirect('/enter_mobile');
            return;
        }

        const confirmation_code = Math.random().toString().slice(14);
        let eid = yield models.Identity.findOne(
            {attributes: ['id', 'phone'], where: {user_id, provider: 'phone'}, order: 'id'}
        );
        if (eid) {
            yield eid.update({confirmation_code, phone: mobile});
        } else {
            eid = yield models.Identity.create({
                provider: 'phone',
                user_id,
                uid: this.session.uid,
                phone: mobile,
                verified: false,
                confirmation_code
            });
        }
        console.log('-- /submit_mobile -->', this.session.uid, this.session.user, mobile, eid.id);
        const ip = getRemoteIp(this.req)

        const verifyResult = yield verify({mobile, confirmation_code, ip});
        if(verifyResult && verifyResult.error) {
            this.flash = {error: verifyResult.error};
            this.redirect('/enter_mobile');
            return;
        }

        const body = renderToString(<div className="App">
            {header}
            <br />
            <div className="row">
                <div className="column">
                    Thank you for providing your mobile number ({mobile}).<br />
                    To continue please enter the SMS code we've sent you.
                </div>
            </div>
            <br />
            <div className="row">
                <div className="column">
                    <a href="/enter_mobile">Re-send SMS</a>
                </div>
            </div>
            <div className="row">
                <form className="column small-4" action="/confirm_mobile" method="POST">
                    <label>
                        Confirmation code
                        <input type="text" name="code" />
                    </label>
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
