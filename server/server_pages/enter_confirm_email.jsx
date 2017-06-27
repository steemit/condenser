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
import secureRandom from 'secure-random';
import { translate } from 'app/Translator';
import {metrics} from 'server/metrics';

let assets;
if (process.env.NODE_ENV === 'production') {
    assets = Object.assign({}, require('tmp/webpack-stats-prod.json'), {script: ['https://www.google.com/recaptcha/api.js']});
} else {
    assets = Object.assign({}, require('tmp/webpack-stats-dev.json'));
    assets.script.push('https://www.google.com/recaptcha/api.js');
}

function *confirmEmailHandler() {
    const confirmation_code = this.params && this.params.code ? this.params.code : this.request.body.code;
    console.log('-- /confirm_email -->', this.session.uid, this.session.user, confirmation_code);
    const eid = yield models.Identity.findOne({
        attributes: ['id', 'user_id', 'email', 'updated_at', 'verified'],
        where: {confirmation_code, provider: 'email'}, order: 'id DESC'
    });
    if (!eid) {
        this.status = 401;
        this.body = 'confirmation code not found';
        return;
    }
    if (eid.verified) {
        this.session.user = eid.user_id; // session recovery (user changed browsers)
        this.flash = {success: 'Email has already been verified'};
        this.redirect('/enter_mobile');
        return;
    }
    const hours_ago = (Date.now() - eid.updated_at) / 1000.0 / 3600.0;
    if (hours_ago > 24.0 * 10) {
        eid.destroy()
        this.status = 401;
        this.body = '<!DOCTYPE html>Confirmation code expired.  Please <a href="/enter_email">re-submit</a> your email for verification.';
        return;
    }
    this.session.user = eid.user_id;
    yield eid.update({verified: true});
    yield models.User.update({email: eid.email, waiting_list: false}, {where: {id: eid.user_id}});

    // check if the phone is confirmed then redirect to create account - this is useful when we invite users and send them the link
    const mid = yield models.Identity.findOne(
        {attributes: ['verified'], where: {user_id: eid.user_id, provider: 'phone'}, order: 'id DESC'}
    );
    if (mid && mid.verified) {
        this.redirect('/create_account');
    } else {
        this.redirect('/enter_mobile');
    }
}

export default function useEnterAndConfirmEmailPages(app) {
    const router = koa_router();
    app.use(router.routes());
    const koaBody = koa_body();

    router.get('/enter_email', function *() {
        console.log('-- /enter_email -->', this.session.uid, this.session.user);
        this.session.user = null;
        let default_email = '';
        if (this.request.query && this.request.query.email) default_email = this.request.query.email;
        const body = renderToString(<div className="App">
            <MiniHeader />
            <SignupProgressBar steps={[translate('email'), translate('phone'), translate('golos_account')]} current={1} />
            <br />
            <div className="row" style={{maxWidth: '32rem'}}>
                <div className="column">
                    <form action="/submit_email" method="POST">
                        <h4>{translate('please_provide_your_email_address_to_continue_the_registration_process')}</h4>
                        <p className="secondary">
                            {translate('this_information_allows_steemit_to_assist_with_account_recovery_in_case_your_account_is_ever_compormised')}
                        </p>
                        <input type="hidden" name="csrf" value={this.csrf} />
                        <label>
                            {translate('email')}
                            <input type="email" name="email" defaultValue={default_email} />
                        </label>
                        <br />
                        <div className="g-recaptcha" data-sitekey={config.recaptcha.site_key}></div>
                        <br />
                        <div className="error">
                            {this.flash.error}
                        </div>
                        <input type="submit" className="button" value={translate("continue")} />
                    </form>
                </div>
            </div>
        </div>);
        const props = {body, title: translate('email_address'), assets, meta: []};
        this.body = '<!DOCTYPE html>' + renderToString(<ServerHTML { ...props } />);
        if (metrics) metrics.increment('_signup_step_1');
    });

    router.post('/submit_email', koaBody, function *() {
        if (!checkCSRF(this, this.request.body.csrf)) return;

        const email = this.request.body.email;
        if (!email) {
            this.flash = {error: translate('please_prove_an_email_address')};
            this.redirect('/enter_email');
            return;
        }

        if(!(yield checkRecaptcha(this))) {
            console.log('-- /submit_email captcha verification failed -->', user_id, this.session.uid, email, this.req.connection.remoteAddress);
            this.flash = {error: translate('failed_captcha_verification_please_try_again') + '.'};
            this.redirect('/enter_email?email=' + email);
            return
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
            this.flash = {error: translate('not_supported_email_address') + email + '. ' + translate('please_make_sure_you_dont_use_temporary_email_providers_contact_SUPPORT_URL')};
            this.redirect('/enter_email?email=' + email);
            return;
        }

        const existing_email = yield models.Identity.findOne(
            {attributes: ['id', 'user_id', 'confirmation_code'], where: {email, provider: 'email'}, order: 'id DESC'}
        );
        let user_id = this.session.user;
        if (existing_email) {
            console.log('-- /submit_email existing_email -->', user_id, this.session.uid, email, existing_email.user_id);
            const act = yield models.Account.findOne({
                attributes: ['id'],
                where: {user_id: existing_email.user_id, ignored: false},
                order: 'id DESC'
            })
            if (act) {
                this.flash = {error: 'This email has already been taken.'};
                this.redirect('/enter_email?email=' + email);
                return
            }
            // We must resend the email to get the session going again if the user gets interrupted (clears cookies or changes browser) after email verify.
            const {confirmation_code, id} = existing_email
            console.log('-- /submit_email resend -->', email, id, confirmation_code);
            sendEmail('confirm_email', email, {confirmation_code});
        } else {
            let user
            if(user_id) {
                user = yield models.User.findOne({attributes: ['id'], where: {id: user_id}});
            }
            if (!user) {
                user = yield models.User.create({
                    uid: this.session.uid,
                    remote_ip: getRemoteIp(this.request.req)
                });
                this.session.user = user_id = user.id;
            }

            const confirmation_code = secureRandom.randomBuffer(13).toString('hex');
            let eid = yield models.Identity.findOne(
                {attributes: ['id', 'email'], where: {user_id, provider: 'email'}, order: 'id DESC'}
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
        }
        const body = renderToString(<div className="App">
            <MiniHeader />
            <SignupProgressBar steps={[translate('email'), translate('phone'), translate('golos_account')]} current={1} />
            <br />
            <div className="row" style={{maxWidth: '32rem'}}>
                <div className="column">
                    {translate('thank_you_for_providing_your_email_address') +' (' + email + ')'}.<br />
                    {translate('to_continue_please_click_on_the_link_in_the_email_weve_sent_you')}.<br />
                    <span className="secondary">
                      {translate('didnt_recieve_email')}{" "}
                      <a href={`/enter_email?email=${email}`}>{translate('re_send_email')}</a>
                    </span>
                </div>
            </div>
        </div>);
        const props = {body, title: translate('email_confirmation'), assets, meta: []};
        this.body = '<!DOCTYPE html>' + renderToString(<ServerHTML { ...props } />);
    });

    router.get('/confirm_email/:code', confirmEmailHandler);
    router.post('/confirm_email', koaBody, confirmEmailHandler);
}

function* checkRecaptcha(ctx) {
    if(process.env.NODE_ENV !== 'production')
        return true

    const recaptcha = ctx.request.body['g-recaptcha-response'];
    const verificationUrl = 'https://www.google.com/recaptcha/api/siteverify?secret=' + config.recaptcha.secret_key + '&response=' + recaptcha + '&remoteip=' + ctx.req.connection.remoteAddress;
    let captcha_failed;
    try {
        const recaptcha_res = yield request(verificationUrl);
        const body = JSON.parse(recaptcha_res.body);
        captcha_failed = !body.success;
    } catch (e) {
        captcha_failed = true;
        console.error('-- /submit_email recaptcha request failed -->', verificationUrl, e);
    }
    return !captcha_failed
}
