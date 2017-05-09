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
        where: { confirmation_code, provider: "email"}
    });
    if (!eid) {
        this.status = 401;
        this.body = "confirmation code not found";
        return;
    }
    if (eid.email_verified) {
        this.session.user = eid.user_id; // session recovery (user changed browsers)
        this.flash = { success: "Email has already been verified" };
        this.redirect("/approval?confirm_email=true");
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
    yield models.User.update({ email: eid.email}, {
        where: { id: eid.user_id }
    });

    if (mixpanel)
        mixpanel.track("SignupStepConfirmEmail", { distinct_id: this.session.uid });

    const eid_phone = yield models.Identity.findOne({
        where: { user_id: eid.user_id, provider: "phone", verified: true}
    });

    if (eid_phone) {
        // this.flash = { success: "Thanks for confirming your email!" };
        this.redirect("/approval?confirm_email=true");
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
        const eid = yield models.Identity.findOne({ attributes: ["id", "user_id"], where: { provider: "email", confirmation_code: code }});
        const user = eid ? yield models.User.findOne({ attributes: ["id", "account_status"], where: { id: eid.user_id }}) : null;
        // validate there is email identity and user record
        if (eid && user) {
            // set session based on confirmation code(user from diff device, etc)
            this.session.user = user.id;
            if (user.uid) this.session.uid = user.uid;
            console.log('-- checking incoming start request -->', this.session.uid, this.session.user);
            if (user.account_status === "approved") {
                console.log("-- approved account for -->", this.session.uid, this.session.user);
                this.redirect("/create_account");
            } else if (user.account_status === "created") {
                // user clicked expired link already create account
                this.flash = { alert: "Your account has already been created." };
                this.redirect("/login.html");
            } else if (user.account_status === "waiting") {
                this.flash = { error: "Your account has not been approved." };
                this.redirect("/");
            } else {
                this.flash = { error: "Issue with your sign up status." };
                this.redirect("/");
            }
        } else {
            // no matching identity found redirect
            this.flash = { error: "This is not a valid sign up code. Please click the link in your welcome email." };
            this.redirect("/");
        }
    });

    router.get("/enter_email", function*() {
        console.log("-- /enter_email -->", this.session.uid, this.session.user, this.session, this.request.query.account);
        this.session.picked_account_name = this.request.query.account;
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
                                We need your email address to ensure that we can contact you to verify account ownership in the event that your account is ever compromised.
                            </p>
                            <p className="secondary">Please make sure that you enter a <strong>valid</strong> email so that you receive the confirmation link.</p>
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

        // const email_provider = parsed_email[1];
        // const blocked_email = yield models.List.findOne({
        //     attributes: ["id"],
        //     where: { kk: "block-email-provider", value: email_provider }
        // });
        // if (blocked_email) {
        //     console.log(
        //         "-- /submit_email blocked_email -->",
        //         this.session.uid,
        //         email
        //     );
        //     this.flash = {
        //         error: (
        //             "Not a supported email address: " +
        //             email +
        //             ". Please make sure your you don't use any temporary email providers, contact support@steemit.com for more information."
        //         )
        //     };
        //     // update identity with blocked email address
        //     const block_eid = yield models.Identity.findOne({
        //         attributes: ["id"],
        //         where: { user_id: this.session.user, provider: "email" },
        //         order: "id DESC"
        //     });
        //     if (block_eid) yield block_eid.update({email});
        //     this.redirect("/enter_email?email=" + email);
        //     return;
        // }

        const existing_email = yield models.Identity.findOne({
            where: { email, provider: "email" }
        });
        if (existing_email) {
            console.log(
                "-- /submit_email existing_email -->",
                this.session.uid,
                email,
                existing_email.user_id
            );
            const act = yield models.Account.findOne({
                attributes: ["id"],
                where: {user_id: existing_email.user_id, ignored: false},
                order: "id DESC"
            });
            if (act) {
                this.flash = {error: "This email has already been taken."};
                this.redirect("/enter_email?email=" + email);
                return;
            }
        }

        let user = yield models.User.findOne({ where: { uid: this.session.uid }});
        if (user) {
            const data = user.sign_up_meta ? JSON.parse(user.sign_up_meta) : {};
            data.last_step = 2;
            yield user.update({
                sign_up_meta: JSON.stringify(data)
            });
        } else {
            // create user and identity
            console.log("-- /Creating User -->");
            user = yield models.User.create({
                uid: this.session.uid,
                remote_ip: getRemoteIp(this.request.req),
                sign_up_meta: JSON.stringify({last_step: 2}),
                account_status: 'waiting'
            });
        }
        this.session.user = user.id;

        const confirmation_code = secureRandom.randomBuffer(13).toString("hex");
        let eid = yield models.Identity.findOne({
            where: { user_id: user.id, provider: "email" }
        });
        if (eid) {
            yield eid.update({
                verified: false,
                email,
                confirmation_code
            });
        } else {
            eid = yield models.Identity.create({
                user_id: user.id,
                provider: 'email',
                verified: false,
                email,
                confirmation_code
            });
        }
        console.log(
            "-- /submit_email ->",
            this.session.uid,
            this.session.user,
            email,
            eid.id,
            confirmation_code
        );
        sendEmail("confirm_email", email, { confirmation_code });

        if (this.session.picked_account_name) {
            const account = yield models.Account.findOne({
                attributes: ['id'],
                where: {user_id: user.id, ignored: false},
                order: 'id DESC'
            });
            if (!account) {
                models.Account.create({
                    user_id: user.id,
                    name: this.session.picked_account_name,
                    remote_ip: getRemoteIp(this.request.req)
                });
            }
        }
        // redirect to phone verification
        this.redirect("/enter_mobile");
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
