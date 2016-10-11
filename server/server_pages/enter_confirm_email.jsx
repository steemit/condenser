import koa_router from 'koa-router';
import koa_body from 'koa-body';
import request from 'co-request';
import React from 'react';
import {renderToString} from 'react-dom/server';
import models from 'db/models';
import {esc, escAttrs} from 'db/models';
import ServerHTML from '../server-html';
import sendEmail from '../sendEmail';
import {checkCSRF, getRemoteIp} from '../utils';
import config from '../../config';
import SignupProgressBar from 'app/components/elements/SignupProgressBar';
import MiniHeader from 'app/components/modules/MiniHeader';

const assets_file = process.env.NODE_ENV === 'production' ? 'tmp/webpack-stats-prod.json' : 'tmp/webpack-stats-dev.json';
const assets = Object.assign({}, require(assets_file), {script: []});
assets.script.push('https://www.google.com/recaptcha/api.js');

function *confirmEmailHandler() {
    const confirmation_code = this.params && this.params.code ? this.params.code : this.request.body.code;
    console.log('-- /confirm_email -->', this.session.uid, this.session.user, confirmation_code);
    const eid = yield models.Identity.findOne(
        {attributes: ['id', 'user_id', 'email', 'updated_at', 'verified'], where: {confirmation_code}, order: 'id DESC'}
    );
    if (!eid) {
        this.status = 401;
        this.body = 'confirmation code not found';
        return;
    }
    if (eid.verified) {
        this.flash = {success: 'Email has already been verified'};
        this.redirect('/enter_mobile');
        return;
    }
    const hours_ago = (Date.now() - eid.updated_at) / 1000.0 / 3600.0;
    if (hours_ago > 24.0 * 10) {
        this.status = 401;
        this.body = 'confirmation code not found or expired';
        return;
    }
    this.session.user = eid.user_id;
    yield eid.update({verified: true});
    yield models.User.update({email: eid.email, waiting_list: false}, {where: {id: eid.user_id}});
    this.redirect('/enter_mobile');
}

export default function useEnterAndConfirmEmailPages(app) {
    const router = koa_router();
    app.use(router.routes());
    const koaBody = koa_body();

    router.get('/enter_email', function *() {
        console.log('-- /enter_email -->', this.session.uid, this.session.user);
        let eid = null;
        const user_id = this.session.user;
        if (user_id) {
            eid = yield models.Identity.findOne(
                {attributes: ['email', 'verified'], where: {user_id, provider: 'email'}, order: 'id DESC'}
            );
            if (eid && eid.verified) {
                this.flash = {success: 'Email has already been verified'};
                this.redirect('/enter_mobile');
                return;
            }
        }
        let default_email = '';
        if (this.request.query && this.request.query.email) default_email = this.request.query.email;
        const body = renderToString(<div className="App">
            <MiniHeader />
            <SignupProgressBar steps={['email', 'phone', 'steem account']} current={1} />
            <br />
            <div className="row" style={{maxWidth: '32rem'}}>
                <div className="column">
                    <form action="/submit_email" method="POST">
                        <h4>Please provide your email address to continue the registration process</h4>
                        <p className="secondary">
                            Email verification helps with preventing spam and allows Steemit to assist with Account Recovery in case your account is ever compromised.
                        </p>
                        <input type="hidden" name="csrf" value={this.csrf} />
                        <label>
                            Email
                            <input type="email" name="email" defaultValue={default_email} />
                        </label>
                        <br />
                        <div className="g-recaptcha" data-sitekey={config.recaptcha.site_key}></div>
                        <br />
                        <div className="error">{this.flash.error}</div>
                        <input type="submit" className="button" value="CONTINUE" />
                    </form>
                </div>
            </div>
        </div>);
        const props = {body, title: 'Email Address', assets, meta: []};
        this.body = '<!DOCTYPE html>' + renderToString(<ServerHTML { ...props } />);
    });

    router.post('/submit_email', koaBody, function *() {
        if (!checkCSRF(this, this.request.body.csrf)) return;

        const email = this.request.body.email;
        if (!email) {
            this.flash = {error: 'Please provide an email address'};
            this.redirect('/enter_email');
            return;
        }

        if (process.env.NODE_ENV === 'production') {
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
                this.flash = {error: 'Failed captcha verification, please try again'};
                this.redirect('/enter_email?email=' + email);
                return;
            }
        }

        const parsed_email = email.match(/^.+\@.*?([\w\d-]+\.\w+)$/);
        if (!parsed_email || parsed_email.length < 2) {
            console.log('-- /submit_email not valid email -->', user_id, this.session.uid, email);
            this.flash = {error: 'Not valid email address'};
            this.redirect('/enter_email?email=' + email);
            return;
        }
        const email_provider = parsed_email[1];
        const blocked_email = yield models.List.findOne({
            attributes: ['id'],
            where: {kk: 'block-email-provider', value: email_provider}
        });
        if (blocked_email) {
            console.log('-- /submit_email blocked_email -->', this.session.uid, email);
            this.flash = {error: 'Not supported email address: ' + email + '. Please make sure your you don\'t use any temporary email providers, contact support@steemit.com for more information.'};
            this.redirect('/enter_email?email=' + email);
            return;
        }

        const existing_email = yield models.Identity.findOne(
            {attributes: ['user_id'], where: {email, provider: 'email', verified: true}, order: 'id'}
        );
        if (existing_email && existing_email.user_id != user_id) {
            console.log('-- /submit_email existing_email -->', user_id, this.session.uid, email, existing_email.user_id);
            this.flash = {error: 'This email has already been taken'};
            this.redirect('/enter_email?email=' + email);
            return;
        }

        let user_id = this.session.user;
        if (user_id) {
            const user = yield models.User.findOne({attributes: ['id'], where: {id: user_id}});
            if (!user) user_id = null;
        }
        if (!user_id) {
            const user = yield models.User.create({
                uid: this.session.uid,
                remote_ip: getRemoteIp(this.request.req)
            });
            this.session.user = user_id = user.id;
        }

        const confirmation_code = Math.random().toString(36).slice(2);
        let eid = yield models.Identity.findOne(
            {attributes: ['id', 'email'], where: {user_id, provider: 'email'}, order: 'id'}
        );
        if (eid) {
            yield eid.update({confirmation_code, email});
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
            <MiniHeader />
            <SignupProgressBar steps={['email', 'phone', 'steem account']} current={1} />
            <br />
            <div className="row" style={{maxWidth: '32rem'}}>
                <div className="column">
                    Thank you for providing your email address ({email}).<br />
                    To continue please click on the link in the email we've sent you.<br />
                    <span className="secondary">Didn't recieve email? <a href={`/enter_email?email=${email}`}>Re-send</a></span>
                </div>
            </div>
        </div>);
        const props = {body, title: 'Email Confirmation', assets, meta: []};
        this.body = '<!DOCTYPE html>' + renderToString(<ServerHTML { ...props } />);
    });

    router.get('/confirm_email/:code', confirmEmailHandler);
    router.post('/confirm_email', koaBody, confirmEmailHandler);
}
