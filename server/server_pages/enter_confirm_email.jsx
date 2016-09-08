import koa_router from 'koa-router';
import koa_body from 'koa-body';
import request from 'co-request';
import React from 'react';
import { renderToString } from 'react-dom/server';
import models from 'db/models';
import {esc, escAttrs} from 'db/models';
import ServerHTML from '../server-html';
import Icon from 'app/components/elements/Icon.jsx';
import sendEmail from '../sendEmail';
import {checkCSRF} from '../utils';
import config from '../../config';

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

function *confirmEmailHandler() {
    const confirmation_code = this.params && this.params.code ? this.params.code : this.request.body.code;
    console.log('-- /confirm_email -->', this.session.uid, this.session.user, confirmation_code);
    const eid = yield models.Identity.findOne(
        {attributes: ['id', 'user_id', 'email', 'verified', 'updated_at'], where: {confirmation_code}, order: 'id DESC'}
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
        yield models.User.update({email: eid.email, waiting_list: false}, {where: {id: eid.user_id}});
    }
    this.redirect('/create_account');
}

export default function useEnterAndConfirmEmailPages(app) {
    const router = koa_router();
    app.use(router.routes());
    const koaBody = koa_body();

    router.get('/enter_email', function *() {
        console.log('-- /enter_email -->', this.session.uid, this.session.user);
        const user_id = this.session.user;
        if (!user_id) { this.body = 'user not found'; return; }
        const eid = yield models.Identity.findOne(
            {attributes: ['email'], where: {user_id, provider: 'email'}, order: 'id DESC'}
        );
        const body = renderToString(<div className="App">
            {header}
            <br />
            <div className="row">
                <form className="column small-4" action="/submit_email" method="POST">
                    <p>
                        Please provide your email address to continue the registration process.<br />
                        <span className="secondary">This information allows Steemit to assist with Account Recovery in case your account is ever compromised.</span>
                    </p>
                    <input type="hidden" name="csrf" value={this.csrf} />
                    <label>
                        Email
                        <input type="email" name="email" defaultValue={eid ? eid.email : ''} readOnly={eid && eid.email} />
                    </label>
                    {eid && eid.email && <div className="secondary"><i>Email address cannot be changed at this moment, sorry for the inconvenience.</i></div>}
                    <br />
                    <div className="g-recaptcha" data-sitekey={config.recaptcha.site_key}></div>
                    <br />
                    <div className="error">{this.flash.error}</div>
                    <input type="submit" className="button" value="CONTINUE" />
                </form>
            </div>
        </div>);
        const props = { body, title: 'Email Address', assets, meta: [] };
        this.body = '<!DOCTYPE html>' + renderToString(<ServerHTML { ...props } />);
    });

    router.post('/submit_email', koaBody, function *() {
        if (!checkCSRF(this, this.request.body.csrf)) return;
        const user_id = this.session.user;
        if (!user_id) { this.body = 'user not found'; return; }
        const email = this.request.body.email;
        if (!email) {
            this.flash = {error: 'Please provide an email address'};
            this.redirect('/enter_email');
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
            console.error('-- /submit_email recaptcha request failed -->', verificationUrl, e);
        }
        if (captcha_failed) {
            console.log('-- /submit_email captcha verification failed -->', user_id, this.session.uid, email, this.req.connection.remoteAddress);
            this.flash = {error: 'Failed captcha verification, please try again.'};
            this.redirect('/enter_email');
            return;
        }

        const confirmation_code = Math.random().toString(36).slice(2);
        let eid = yield models.Identity.findOne(
            {attributes: ['id', 'email'], where: {user_id, provider: 'email'}, order: 'id'}
        );
        if (eid) {
            yield eid.update({confirmation_code});
        } else {
            eid = yield models.Identity.create({
                provider: 'email',
                user_id,
                uid: this.session.uid,
                email,
                verified: false,
                confirmation_code
            });
        }
        console.log('-- /submit_email -->', this.session.uid, this.session.user, email, eid.id);
        sendEmail('confirm_email', email, {confirmation_code});

        const body = renderToString(<div className="App">
            {header}
            <br />
            <div className="row">
                <div className="column">
                    Thank you for providing your email address ({email}).<br />
                    To continue please click on the link in the email we've sent you.
                </div>
            </div>
            <br />
            <div className="row">
                <div className="column">
                    <a href="/enter_email">Re-send email</a>
                </div>
            </div>
            {/*<div className="row">
                <form className="column small-4" action="/confirm_email" method="POST">
                    <label>
                        Confirmation code
                        <input type="text" name="code" />
                    </label>
                    <br />
                    <input type="submit" className="button" value="CONTINUE" />
                </form>
            </div>*/}
        </div>);
        const props = { body, title: 'Email Confirmation', assets, meta: [] };
        this.body = '<!DOCTYPE html>' + renderToString(<ServerHTML { ...props } />);
    });

    router.get('/confirm_email/:code', confirmEmailHandler);
    router.post('/confirm_email', koaBody, confirmEmailHandler);
}
