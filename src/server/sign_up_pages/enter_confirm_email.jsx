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
import {api} from 'steem';

const path = require('path');
const ROOT = path.join(__dirname, '../../..');

// FIXME copy paste code, refactor mixpanel out
let mixpanel = null;
if (config.has("mixpanel") && config.get("mixpanel")) {
    mixpanel = Mixpanel.init(config.get("mixpanel"));
}

let assets_file = ROOT + "/tmp/webpack-stats-dev.json";
if (process.env.NODE_ENV === "production") {
    assets_file = ROOT + "/tmp/webpack-stats-prod.json";
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
    yield models.User.update({ account_status: 'waiting'}, {
        where: { id: eid.user_id, account_status: 'onhold' }
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
        const eid = yield models.Identity.findOne({ attributes: ["id", "user_id", "verified"], where: { provider: "email", confirmation_code: code }});
        const user = eid ? yield models.User.findOne({
            attributes: ["id", "account_status"],
            where: { id: eid.user_id },
            include: [{model: models.Account, attributes: ['id', 'name', 'ignored', 'created']}],
        }) : null;
        // validate there is email identity and user record
        if (eid && user) {
            // set session based on confirmation code(user from diff device, etc)
            this.session.user = user.id;
            if (user.uid) this.session.uid = user.uid;
            console.log('-- checking incoming start request -->', this.session.uid, this.session.user);
            if (!eid.verified) {
                yield eid.update({ verified: true });
            }
            if (user.account_status === "approved") {
                console.log("-- approved account for -->", this.session.uid, this.session.user);
                this.redirect("/create_account");
            } else if (user.account_status === "created") {
                // check if account is really created onchain
                let there_is_created_account = false;
                for (const a of user.Accounts) {
                    const check_account_res = yield api.getAccountsAsync([a.name]);
                    const account_created = check_account_res && check_account_res.length > 0;
                    if (account_created && !a.ignored) there_is_created_account = true;
                    if (!account_created && a.created) {
                        console.log("-- found ghost account -->", this.session.uid, this.session.user, a.name);
                        a.update({created: false});
                    }
                }
                if (there_is_created_account) {
                    // user clicked expired link - already created account
                    this.flash = {alert: "Your account has already been created."};
                    this.redirect("/login.html");
                } else {
                    user.update({account_status: 'approved'});
                    console.log("-- approved account (ghost) for -->", this.session.uid, this.session.user);
                    this.redirect("/create_account");
                }
            } else if (user.account_status === "waiting") {
                this.flash = { error: "Your account has not been approved yet." };
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
        console.log("-- /enter_email -->", this.session.uid, this.session.user, this.request.query.account);
        const picked_account_name = this.session.picked_account_name = this.request.query.account;
        if (!picked_account_name) {
            this.flash = { error: "Please select your account name" };
            this.redirect('/pick_account');
            return;
        }
        // check for existing account
        const check_account_res = yield api.getAccountsAsync([picked_account_name]);
        if (check_account_res && check_account_res.length > 0) {
            this.flash = { error: `${picked_account_name} is already taken, please try another name` };
            this.redirect('/pick_account');
            return;
        }
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
                                Please provide your email address to continue
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
                            <input
                                type="hidden"
                                name="account"
                                value={picked_account_name}
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

        let {email, account} = this.request.body;
        console.log('-- /submit_email -->', this.session.uid, email, account);
        if (!email) {
            this.flash = { error: "Please provide an email address" };
            this.redirect(`/enter_email?account=${account}`);
            return;
        }
        email = email.toLowerCase();
        account = account.toLowerCase();

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
                this.redirect(`/enter_email?email=${email}&account=${account}`);
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
            this.redirect(`/enter_email?email=${email}&account=${account}`);
            return;
        }

        try {
            const number_of_created_accounts = yield models.sequelize.query(`select count(*) as result from identities i join accounts a on a.user_id=i.user_id where i.provider='email' and i.email='${email}' and a.created=1 and a.ignored<>1`);
            if (number_of_created_accounts && number_of_created_accounts[0][0].result > 0) {
                console.log(
                    "-- /submit_email there are created accounts -->",
                    this.session.uid,
                    email
                );
                this.flash = {error: 'This email has already been used'};
                this.redirect(`/enter_email?email=${email}&account=${account}`);
                return;
            }

            let user = yield models.User.findOne({ attributes: ['id'], where: { id: this.session.user }});
            if (user) {
                const data = user.sign_up_meta ? JSON.parse(user.sign_up_meta) : {};
                data.last_step = 2;
                yield user.update({
                    sign_up_meta: JSON.stringify(data)
                });
            } else {
                // create user
                console.log("-- /Creating User -->");
                user = yield models.User.create({
                    uid: this.session.uid,
                    remote_ip: getRemoteIp(this.request.req),
                    sign_up_meta: JSON.stringify({last_step: 2}),
                    account_status: 'waiting'
                });
                this.session.user = user.id;
            }
            // create referer attribute
            let user_att = yield models.UserAttribute.findOne({ attributes: ['user_id', 'type_of'], where: { user_id: user.id, type_of: 'referer' }});
            if (!user_att && this.session.r) {
                yield models.UserAttribute.create({
                    user_id: user.id,
                    value: this.session.r,
                    type_of: 'referer'
                });
            }

            let confirmation_code = secureRandom.randomBuffer(13).toString("hex");
            // create identity
            yield models.Identity.create({
                user_id: user.id,
                provider: 'email',
                verified: false,
                email,
                confirmation_code
            });

            console.log(
                "-- /submit_email ->",
                this.session.uid,
                this.session.user,
                email,
                confirmation_code
            );

            sendEmail("confirm_email", email, { confirmation_code });

            if (account) {
                const existing_account = yield models.Account.findOne({
                    attributes: ['id'],
                    where: {user_id: user.id, name: account},
                    order: 'id DESC'
                });
                if (!existing_account) {
                    yield models.Account.create({
                        user_id: user.id,
                        name: account,
                        remote_ip: getRemoteIp(this.request.req)
                    });
                }
            }
        } catch (error) {
            this.flash = {error: 'Internal Server Error'};
            this.redirect(`/enter_email?email=${email}&account=${account}`);
            console.error('Error in /submit_email :', this.session.uid, error.toString());
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
