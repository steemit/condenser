import koa_router from 'koa-router';
import koa_body from 'koa-body';
import request from 'co-request';
import React from 'react';
import { renderToString } from 'react-dom/server';
import models from 'db/models';
import ServerHTML from '../server-html';
import Icon from 'app/components/elements/Icon.jsx';
import sendMobile from '../sendMobile';
import {checkCSRF} from '../utils';
import config from '../../config';
import {getRemoteIp} from 'server/utils';

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
        {attributes: ['id', 'user_id', 'mobile', 'verified', 'updated_at'], where: {confirmation_code}, order: 'id DESC'}
    );
    if (!eid) {
        this.status = 401;
        this.body = 'confirmation code not found';
        return;
    }
    this.session.user = eid.user_id;
    const hours_ago = (Date.now() - eid.updated_at) / 1000.0 / 3600.0;
    if (hours_ago > 240.0) {
        this.status = 401;
        this.body = 'confirmation code not found or expired';
        return;
    }
    if (!eid.verified) {
        yield eid.update({verified: true});
        yield models.User.update({mobile: eid.mobile, waiting_list: false}, {where: {id: eid.user_id}});
    }
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
            {attributes: ['mobile'], where: {user_id, provider: 'mobile'}, order: 'id DESC'}
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
                        <input type="tel" name="mobile" defaultValue={eid ? eid.mobile : ''} readOnly={eid && eid.mobile} />
                    </label>
                    {eid && eid.mobile && <div className="secondary"><i>Mobile number cannot be changed at this moment, sorry for the inconvenience.</i></div>}
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
        const mobile = this.request.body.mobile;
        if (!mobile) {
            this.flash = {error: 'Please provide an mobile number'};
            this.redirect('/enter_mobile');
            return;
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
            {attributes: ['id', 'mobile'], where: {user_id, provider: 'mobile'}, order: 'id'}
        );
        if (eid) {
            yield eid.update({confirmation_code});
        } else {
            eid = yield models.Identity.create({
                provider: 'mobile',
                user_id,
                uid: this.session.uid,
                email: mobile,
                verified: false,
                confirmation_code
            });
        }
        console.log('-- /submit_mobile -->', this.session.uid, this.session.user, mobile, eid.id);
        const ip = getRemoteIp(this.req)
        yield sendMobile({mobile, confirmation_code, ip});

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
