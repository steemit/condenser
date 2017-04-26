import koa_router from "koa-router";
import koa_body from "koa-body";
import request from "co-request";
import React from "react";
import { renderToString } from "react-dom/server";
import models from "db/models";
import ServerHTML from "../server-html";
import sendEmail from "../sendEmail";
import { checkCSRF, getRemoteIp } from "server/utils/misc";
import config from "config";
import SignupProgressBar from "app/components/elements/SignupProgressBar";
import MiniHeader from "app/components/modules/MiniHeader";
import secureRandom from "secure-random";
import Mixpanel from "mixpanel";
import tt from 'counterpart';

// FIXME copy paste code, refactor mixpanel out
var mixpanel = null;
if (config.has("mixpanel") && config.get("mixpanel")) {
    mixpanel = Mixpanel.init(config.get("mixpanel"));
}

var assets_file = "tmp/webpack-stats-dev.json";
if (process.env.NODE_ENV === "production") {
    assets_file = "tmp/webpack-stats-prod.json";
}

const assets = Object.assign({}, require(assets_file), { script: [] });

assets.script.push("https://www.google.com/recaptcha/api.js");
// assets.script.push("/enter_email/submit_form.js");

function* confirmEmailHandler() {
    const confirmation_code = this.params && this.params.code
        ? this.params.code
        : this.request.body.code;
    console.log(
        "-- /confirm_email -->",
        this.session.uid,
        this.session.user,
        confirmation_code
    );
    const eid = yield models.Identity.findOne({
        attributes: ["id", "user_id", "email", "updated_at", "verified"],
        where: { confirmation_code, provider: "email" },
        order: "id DESC"
    });
    if (!eid) {
        this.status = 401;
        this.body = "confirmation code not found";
        return;
    }
    if (eid.verified) {
        this.session.user = eid.user_id; // session recovery (user changed browsers)
        this.flash = { success: "Email has already been verified" };
        // this.redirect("/enter_mobile");
        this.redirect('/create_account');
        return;
    }
    const hours_ago = (Date.now() - eid.updated_at) / 1000.0 / 3600.0;
    if (hours_ago > 24.0 * 10) {
        eid.destroy();
        this.status = 401;
        this.body = '<!DOCTYPE html>Confirmation code expired.  Please <a href="/enter_email">re-submit</a> your email for verification.';
        return;
    }
    this.session.user = eid.user_id;
    yield eid.update({ verified: true });
    yield models.User.update({ email: eid.email, waiting_list: false }, {
        where: { id: eid.user_id }
    });

    // check if the phone is confirmed then redirect to create account - this is useful when we invite users and send them the link
    // const mid = yield models.Identity.findOne({
    //     attributes: ["verified"],
    //     where: { user_id: eid.user_id, provider: "phone" },
    //     order: "id DESC"
    // });
    // if (mid && mid.verified) {
    //     this.redirect("/create_account");
    // } else {
    //     this.redirect("/enter_mobile");
    // }
    this.redirect('/create_account');
}

export default function useEnterAndConfirmEmailPages(app) {
    const router = koa_router();
    app.use(router.routes());
    const koaBody = koa_body();
    const rc_site_key = config.get('recaptcha.site_key');

// <<<<<<< HEAD
//     router.get("/enter_email", function*() {
//         console.log("-- /enter_email -->", this.session.uid, this.session.user);
//         this.session.user = null;
//         let default_email = "";
//         if (this.request.query && this.request.query.email)
//             default_email = this.request.query.email;
//         const body = renderToString(
//             <div className="App">
//                 <MiniHeader />
//                 <SignupProgressBar
//                     steps={["email", "phone", "steem account"]}
//                     current={1}
//                 />
//                 <br />
//                 <div className="row" style={{ maxWidth: "32rem" }}>
//                     <div className="column">
//                         <form id="submit_email" action="/submit_email" method="POST">
//                             <h4>
//                                 Please provide your email address to continue the registration process
//                             </h4>
//                             <p className="secondary">
//                                 Email verification helps with preventing spam and allows Steemit to assist with Account Recovery in case your account is ever compromised.
//                             </p>
//                             <input
//                                 type="hidden"
//                                 name="csrf"
//                                 value={this.csrf}
//                             />
//                             <label>
//                                 Email
//                                 <input
//                                     type="email"
//                                     name="email"
//                                     defaultValue={default_email}
//                                 />
//                             </label>
//                             <br />
//                             <div className="error">
//                                 {this.flash.error}
//                             </div>
//                             {rc_site_key ? <button
//                                     className="button g-recaptcha"
//                                     data-sitekey={rc_site_key}
//                                     data-callback="submit_email_form">
//                                     CONTINUE
//                                 </button> :
//                                 <input
//                                     type="submit"
//                                     className="button"
//                                     value="CONTINUE" />
//                             }
//                         </form>
//                     </div>
//                 </div>
//             </div>
//         );
//         const props = { body, title: 'Email Address', assets, meta: [] };
//         this.body = '<!DOCTYPE html>' +
//             renderToString(<ServerHTML {...props} />);
//         if (mixpanel)
//             mixpanel.track('SignupStep1', { distinct_id: this.session.uid });
// =======
    router.get('/enter_email', function *() {
        console.log('-- /enter_email -->', this.session.uid, this.session.user);
        const user_id = this.session.user;
        if (!user_id) { this.body = tt('enter_confirm_email_jsx.user_not_found'); return; }
        const eid = yield models.Identity.findOne(
            {attributes: ['email'], where: {user_id, provider: 'email'}, order: 'id DESC'}
        );
        const body = renderToString(
            <div className="App">
                <MiniHeader />
                <br />
                <div className="row">
                    <form className="column small-4" action="/submit_email" method="POST">
                        <p>
                            {tt('enter_confirm_email_jsx.please_provide_your_email_address_to_continue_the_registration_process')}.<br />
                            <span className="secondary">{tt('enter_confirm_email_jsx.this_information_allows_steemit_to_assist_with_account_recovery_in_case_your_account_is_ever_compormised')}.</span>
                        </p>
                        <input type="hidden" name="csrf" value={this.csrf} />
                        <label>
                            {tt('g.email')}
                            <input type="email" name="email" defaultValue={eid ? eid.email : ''} readOnly={eid && eid.email} />
                        </label>
                        {eid && eid.email && <div className="secondary"><i>{tt('enter_confirm_email_jsx.email_address_cannot_be_changed_at_this_moment_sorry_for_inconvenience')}.</i></div>}
                        <br />
                        <div className="g-recaptcha" data-sitekey={config.recaptcha.site_key}></div>
                        <br />
                        <div className="error">{this.flash.error}</div>
                        <input type="submit" className="button" style={{textTransform: 'uppercase'}} value={tt("g.continue")} />
                    </form>
                </div>
            </div>
        );
        const props = { body, title: tt('enter_confirm_email_jsx.email_address'), assets, meta: [] };
        this.body = '<!DOCTYPE html>' + renderToString(<ServerHTML { ...props } />);
// >>>>>>> master
    });

    router.post("/submit_email", koaBody, function*() {
        if (!checkCSRF(this, this.request.body.csrf)) return;
        const user_id = this.session.user;
        if (!user_id) { this.body = tt('enter_confirm_email_jsx.user_not_found'); return; }
        const email = this.request.body.email;
        if (!email) {
// <<<<<<< HEAD
//             this.flash = { error: "Please provide an email address" };
//             this.redirect("/enter_email");
//             return;
//         }

//         if (config.get('recaptcha.site_key')) {
//             if (!(yield checkRecaptcha(this))) {
//                 console.log(
//                   "-- /submit_email captcha verification failed -->",
//                   user_id,
//                   this.session.uid,
//                   email,
//                   this.req.connection.remoteAddress
//                 );
//                 this.flash = {
//                     error: "Failed captcha verification, please try again"
//                 };
//                 this.redirect("/enter_email?email=" + email);
//                 return;
//             }
//         }

//         const parsed_email = email.match(/^.+\@.*?([\w\d-]+\.\w+)$/);
//         if (!parsed_email || parsed_email.length < 2) {
//             console.log(
//                 "-- /submit_email not valid email -->",
//                 user_id,
//                 this.session.uid,
//                 email
//             );
//             this.flash = { error: "Not valid email address" };
//             this.redirect("/enter_email?email=" + email);
//             return;
//         }
//         const email_provider = parsed_email[1];
//         const blocked_email = yield models.List.findOne({
//             attributes: ["id"],
//             where: { kk: "block-email-provider", value: email_provider }
//         });
//         if (blocked_email) {
//             console.log(
//                 "-- /submit_email blocked_email -->",
//                 this.session.uid,
//                 email
//             );
//             this.flash = {
//                 error: (
//                     "Not supported email address: " +
//                         email +
//                         ". Please make sure your you don't use any temporary email providers, contact support@steemit.com for more information."
//                 )
//             };
//             this.redirect("/enter_email?email=" + email);
//             return;
//         }

//         const existing_email = yield models.Identity.findOne({
//             attributes: ["id", "user_id", "confirmation_code"],
//             where: { email, provider: "email" },
//             order: "id DESC"
//         });
//         let user_id = this.session.user;
//         if (existing_email) {
//             console.log(
//                 "-- /submit_email existing_email -->",
//                 user_id,
//                 this.session.uid,
//                 email,
//                 existing_email.user_id
//             );
//             const act = yield models.Account.findOne({
//                 attributes: ["id"],
//                 where: { user_id: existing_email.user_id, ignored: false },
//                 order: "id DESC"
//             });
//             if (act) {
//                 this.flash = { error: "This email has already been taken." };
//                 this.redirect("/enter_email?email=" + email);
//                 return;
//             }
//             // We must resend the email to get the session going again if the user gets interrupted (clears cookies or changes browser) after email verify.
//             const { confirmation_code, id } = existing_email;
//             console.log(
//                 "-- /submit_email resend -->",
//                 email,
//                 id,
//                 confirmation_code
//             );
//             sendEmail("confirm_email", email, { confirmation_code });
//         } else {
//             let user;
//             if (user_id) {
//                 user = yield models.User.findOne({
//                     attributes: ["id"],
//                     where: { id: user_id }
//                 });
//             }
//             if (!user) {
//                 user = yield models.User.create({
//                     uid: this.session.uid,
//                     remote_ip: getRemoteIp(this.request.req)
//                 });
//                 this.session.user = user_id = user.id;
//             }

//             const confirmation_code = secureRandom
//                 .randomBuffer(13)
//                 .toString("hex");
//             let eid = yield models.Identity.findOne({
//                 attributes: ["id", "email"],
//                 where: { user_id, provider: "email" },
//                 order: "id DESC"
//             });
//             if (eid) {
//                 yield eid.update({ confirmation_code, email });
//             } else {
//                 eid = yield models.Identity.create({
//                     provider: "email",
//                     user_id,
//                     uid: this.session.uid,
//                     email,
//                     verified: false,
//                     confirmation_code
//                 });
//             }
//             console.log(
//                 "-- /submit_email -->",
//                 this.session.uid,
//                 this.session.user,
//                 email,
//                 eid.id
//             );
//             sendEmail("confirm_email", email, { confirmation_code });
//         }
//         const body = renderToString(
//             <div className="App">
//                 <MiniHeader />
//                 <SignupProgressBar
//                     steps={["email", "phone", "steem account"]}
//                     current={1}
//                 />
//                 <br />
//                 <div className="row" style={{ maxWidth: "32rem" }}>
//                     <div className="column">
//                         Thank you for providing your email address (
//                         {email}
//                         ).
//                         <br />

//                         To continue please click on the link in the email we've sent you.

//                         <br />
//                         <span className="secondary">
//                             Didn't recieve email?{" "}
//                             <a href={`/enter_email?email=${email}`}>Re-send</a>
//                         </span>
//                     </div>
//                 </div>
//             </div>
//         );
//         const props = { body, title: "Email Confirmation", assets, meta: [] };
//         this.body = "<!DOCTYPE html>" +
//             renderToString(<ServerHTML {...props} />);
// =======
            this.flash = {error: tt('enter_confirm_email_jsx.please_prove_an_email_address')};
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
            this.flash = {error: tt('enter_confirm_email_jsx.failed_captcha_verification_please_try_again') + '.'};
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
            <MiniHeader />
            <br />
            <div className="row">
                <div className="column">
                    {tt('enter_confirm_email_jsx.thank_you_for_providing_your_email_address') + ' (' + email + ')'}.<br />
                    {tt('enter_confirm_email_jsx.to_continue_please_click_on_the_link_in_the_email_weve_sent_you')}.
                </div>
            </div>
            <br />
            <div className="row">
                <div className="column">
                    <a href="/enter_email">{tt('enter_confirm_email_jsx.re_send_email')}</a>
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
        const props = { body, title: tt('enter_confirm_email_jsx.email_confirmation'), assets, meta: [] };
        this.body = '<!DOCTYPE html>' + renderToString(<ServerHTML { ...props } />);
// >>>>>>> master
    });

    router.get("/confirm_email/:code", confirmEmailHandler);
    router.post("/confirm_email", koaBody, confirmEmailHandler);
    router.get("/enter_email/submit_form.js", function*() {
        this.type = 'application/javascript';
        this.body = "function submit_email_form(){document.getElementById('submit_email').submit()}";
    });
}

function* checkRecaptcha(ctx) {
    if (process.env.NODE_ENV !== "production") return true;

    const recaptcha = ctx.request.body["g-recaptcha-response"];
    const verificationUrl = "https://www.google.com/recaptcha/api/siteverify?secret=" +
        config.get("recaptcha.secret_key") +
        "&response=" +
        recaptcha +
        "&remoteip=" +
        ctx.req.connection.remoteAddress;
    let captcha_failed;
    try {
        const recaptcha_res = yield request(verificationUrl);
        const body = JSON.parse(recaptcha_res.body);
        captcha_failed = !body.success;
    } catch (e) {
        captcha_failed = true;
        console.error(
            "-- /submit_email recaptcha request failed -->",
            verificationUrl,
            e
        );
    }
    return !captcha_failed;
}
