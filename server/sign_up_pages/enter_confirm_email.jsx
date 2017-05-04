import koa_router from "koa-router";
import koa_body from "koa-body";
import request from "co-request";
import React from "react";
import { renderToString } from "react-dom/server";
import models from "db/models";
import ServerHTML from "../server-html";
import sendEmail from "../sendEmail";
import { getRemoteIp, checkCSRF } from "server/utils/misc";
import config from "config";
import MiniHeader from "app/components/modules/MiniHeader";
import secureRandom from "secure-random";
import Mixpanel from "mixpanel";
import Progress from "react-foundation-components/lib/global/progress-bar";
// import {createAccount} from "server/api/general"
import fetch from 'node-fetch';

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
assets.script.push("/enter_email/submit_form.js");

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
        where: { confirmation_code: confirmation_code, provider: "email"}
    });
    if (!eid) {
        this.status = 401;
        this.body = "confirmation code not found";
        return;
    }
    if (eid.email_verified) {
        this.session.user = eid.user_id; // session recovery (user changed browsers)
        this.flash = { success: "Email has already been verified" };
        this.redirect("/approval?confirm=true");
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
    yield eid.update({
        verified: true
    });
    yield models.User.update({ email: eid.email, waiting_list: true}, {
        where: { id: eid.user_id }
    });

    if (mixpanel)
        mixpanel.track("SignupStepConfirmEmail", { distinct_id: this.session.uid });

    const eid_phone = yield models.Identity.findOne({
        where: { user_id: eid.user_id, provider: "phone", verified: true}
    });

    if (eid_phone) {
        this.flash = { success: "Thanks for confirming your email!" };
        this.redirect("/approval?confirm=true");
    } else {
        this.flash = { success: "Thanks for confirming your email. Your phone needs to be confirmed before proceeding." };
        this.redirect("/enter_mobile");
    }

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
}

export default function useEnterAndConfirmEmailPages(app) {
    const router = koa_router();
    app.use(router.routes());
    const koaBody = koa_body();
    const rc_site_key = config.get("recaptcha.site_key");

    router.get("/start/:code", function*() {
        const code = this.params.code;
        const eid = yield models.Identity.findOne({ where: { provider: "email", confirmation_code: code }});
        const user = yield models.User.findOne({ where: { id: eid.user_id }});
        // validate account should be created
        if (eid && user) {
            // set session based on cofirmation code(user from diff device, etc)
            this.session.user = user.id;
            this.session.uid = user.uid;
            console.log('-- checking incoming start request -->', this.session.uid, this.session.user);
            const account = yield models.Account.findOne({
                attributes: ["id"],
                where: {user_id: user.id},
                order: "id DESC"
            });
            // set session based on confirmation code(user from diff device, etc)
            console.log('-- account found processing start request -->', account.created, user.account_status);
            if ((account.created === null || account.created === false || account.created === 0) && user.account_status === "approved") {
                // approved account not yet created. create and log in
                const name = account.name;
                console.log("--creating account for -->", this.session.uid, this.session.user);
                const fields = JSON.stringify({
                                name,
                                confirmation_code: code,
                                owner_key: account.owner_key,
                                active_key: account.active_key,
                                posting_key: account.posting_key,
                                memo_key: account.memo_key
                            });
                return fetch("https://" + this.request.header.host + '/api/v1/accounts', {
                    method: 'post',
                    body: fields,
                    headers: {
                        Accept: 'application/json',
                        'Content-type': 'application/json'
                    }
                }).then(r => r.json()).then(res => {
                    if (res.error || res.status !== 'ok') {
                        console.error('CreateAccount server error', res.error);
                        if (res.error === 'Unauthorized') {
                            this.redirect("/");
                            return;
                        }
                        // this.setState({server_error: res.error || 'Unknown', loading: false});
                    } else {
                        this.redirect("/");
                        return;
                    }
                }).catch(error => {
                    console.error('Caught CreateAccount server error', error);
                    // this.setState({server_error: (error.message ? error.message : error), loading: false});
                });
                this.flash = { error: "Your account is now ready. Please log-in with your password." };
                this.redirect("/welcome");
                return;
            } else if (user.account_status === "created") {
                // user clicked expired link already create account
                this.flash = { error: "Your account has already been created." };
                this.redirect("/");
                return;
            } else if (user.account_status === "waiting") {
                this.flash = { error: "Your account has not been approved." };
                this.redirect("/");
                return;
            } else {
                this.flash = { error: "Issue locating account." };
                this.redirect("/");
                return;
            }
        } else {
            // no matching identity found redirect
            this.flash = { error: "This is not a valid account code. Please click the link in your welcome email." };
            this.redirect("/");
            return;
        }
        // handle success
    });

    router.get("/enter_email", function*() {
        console.log("-- /enter_email -->", this.session.uid, this.session.user, this.session);
        // update requested account name for later
        let user = yield models.User.findOne({ where: { uid: this.session.uid }});
        if (!user) {
            // create user and identity
            console.log("-- /Creating User & Identity -->");
            const data = {};
            data['last_step'] = 1;
            user = yield models.User.create({
                uid: this.session.uid,
                name: this.request.query.account,
                remote_ip: getRemoteIp(this.request.req),
                sign_up_meta: JSON.stringify(data),
                account_status: 'waiting'
            });
            this.session.user = user.id;
            yield models.Identity.create({
                user_id: user.id,
                uid: user.uid,
                verified: false,
                provider: 'email'
            });
        } else {
            const eid = yield models.Identity.findOne({ where: { user_id: user.id, provider: "email" }});
            if (!eid) {
                yield models.Identity.create({
                    user_id: user.id,
                    uid: user.uid,
                    verified: false,
                    provider: 'email'
                });
            } else {
                const data = user.sign_up_meta ? JSON.parse(user.sign_up_meta) : {};
                data['last_step'] = 1;
                yield user.update({
                    name: this.request.query.account,
                    sign_up_meta: JSON.stringify(data)
                });
            }
        }
        // this.session.user = null;
        let default_email = "";
        if (this.request.query && this.request.query.email)
            default_email = this.request.query.email;
        const body = renderToString(
            <div className="App">
                <MiniHeader />
                <br />
                <div className="row" style={{ maxWidth: "32rem" }}>
                    <div className="column">
                        <Progress tabIndex="0" value={50} max={100} />
                        <form id="submit_email" action="/submit_email" method="POST">
                            <h4 style={{ color: "#4078c0" }}>
                                Please provide your email address to continue.
                            </h4>
                            <p className="secondary">
                                Email verification helps with preventing spam and allows Steemit to assist with Account Recovery in case your account is ever compromised.
                            </p>
                            <p className="secondary"> Your email must be confirmed to be allowed on the wait list. Make sure to enter a <strong>valid</strong> email.</p>
                            <input
                                type="hidden"
                                name="csrf"
                                value={this.csrf}
                            />
                            <label>
                                Email


                                <input
                                    type="email"
                                    name="email"
                                    defaultValue={default_email}
                                />
                            </label>
                            <br />
                            {/*<div*/}
                            {/*className="g-recaptcha"*/}
                            {/*data-sitekey={rc_site_key}*/}
                            {/*/>*/}
                            {/*<br />*/}
                            <div className="error">
                                {this.flash.error}
                            </div>
                            {rc_site_key ? <button
                                className="button g-recaptcha"
                                data-sitekey={rc_site_key}
                                data-callback="submit_email_form">
                                CONTINUE
                            </button> :
                                <input
                                    type="submit"
                                    className="button"
                                    value="CONTINUE" />
                            }
                        </form>
                    </div>
                </div>
            </div>
        );
        const props = { body, title: "Email Address", assets, meta: [] };
        this.body = "<!DOCTYPE html>" +
            renderToString(<ServerHTML {...props} />);
        if (mixpanel)
            mixpanel.track("SignupStepEmail", { distinct_id: this.session.uid });
    });

    router.post("/submit_email", koaBody, function*() {
        if (!checkCSRF(this, this.request.body.csrf)) return;

        const email = this.request.body.email;
        if (!email) {
            this.flash = { error: "Please provide an email address" };
            this.redirect("/enter_email");
            return;
        }

        //recaptcha
        if (config.get('recaptcha.site_key')) {
            if (!(yield checkRecaptcha(this))) {
                console.log(
                    "-- /submit_email captcha verification failed -->",
                    this.session.uid,
                    email,
                    this.req.connection.remoteAddress
                );
                this.flash = {
                    error: "Failed captcha verification, please try again"
                };
                this.redirect("/enter_email?email=" + email);
                return;
            }
        }

        const parsed_email = email.match(/^.+\@.*?([\w\d-]+\.\w+)$/);

        if (!parsed_email || parsed_email.length < 2) {
            console.log(
                "-- /submit_email not valid email -->",
                this.session.uid,
                email
            );
            this.flash = { error: "Not valid email address" };
            this.redirect("/enter_email?email=" + email);
            return;
        }
        const email_provider = parsed_email[1];
        const blocked_email = yield models.List.findOne({
            attributes: ["id"],
            where: { kk: "block-email-provider", value: email_provider }
        });
        if (blocked_email) {
            console.log(
                "-- /submit_email blocked_email -->",
                this.session.uid,
                email
            );
            this.flash = {
                error: (
                    "Not a supported email address: " +
                    email +
                    ". Please make sure your you don't use any temporary email providers, contact support@steemit.com for more information."
                )
            };
            this.redirect("/enter_email?email=" + email);
            return;
        }

        const existing_email = yield models.Identity.findOne({
            where: { email: email, provider: "email" }
        });

        const confirmation_code = secureRandom.randomBuffer(13).toString("hex");
        let user_id = this.session.user;
        let user;
        let eid;
        user = yield models.User.findOne({
            where: { uid: this.session.uid }
        });
        eid = yield models.Identity.findOne({
            where: { user_id: user.id, provider: "email"}
        });
        if (existing_email) {
            console.log(
                "-- /submit_email existing_email -->",
                user_id,
                this.session.uid,
                email,
                existing_email.user_id
            );
            const act = yield models.Account.findOne({
                attributes: ["id"],
                where: { user_id: existing_email.user_id, ignored: false },
                order: "id DESC"
            });
            if (act) {
                this.flash = { error: "This email has already been taken." };
                this.redirect("/enter_email?email=" + email);
                return;
            }
            // We must resend the email to get the session going again if the user gets interrupted (clears cookies or changes browser) after email verify.
            const { id } = existing_email;

            yield eid.update({confirmation_code: confirmation_code});
            console.log(
                "-- /submit_email ->",
                this.session.uid,
                this.session.user,
                email,
                eid.id,
                confirmation_code
            );

            sendEmail("confirm_email", email, { confirmation_code });
        } else {
            yield eid.update({
                email: this.request.body.email,
                confirmation_code: confirmation_code
            });
            let data = user.sign_up_meta ? JSON.parse(user.sign_up_meta) : {};
            data["last_step"] = 2;
            yield user.update({
                sign_up_meta: JSON.stringify(data)
            });
            console.log(
                "-- /submit_email -->",
                this.session.uid,
                this.session.user,
                email,
                eid.id,
                confirmation_code
            );

            sendEmail("confirm_email", email, { confirmation_code });
            // redirect to phone verification
            this.redirect("/enter_mobile");
            return;
        }
        const body = renderToString(
            <div className="App">
                <MiniHeader />
                <br />
                <div className="row" style={{ maxWidth: "32rem" }}>
                    <div className="column">
                        Thank you for providing your email address (
                        {email}
                        ).
                        <br />

                        To continue please click on the link in the email we've sent you.

                        <br />
                        <span className="secondary">
                            Didn't recieve email?{" "}
                            <a href={`/enter_email?email=${email}`}>Re-send</a>
                        </span>
                    </div>
                </div>
            </div>
        );
        const props = { body, title: "Email Confirmation", assets, meta: [] };
        this.body = "<!DOCTYPE html>" +
            renderToString(<ServerHTML {...props} />);
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
