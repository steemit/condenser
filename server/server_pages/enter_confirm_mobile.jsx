import koa_router from "koa-router";
import koa_body from "koa-body";
import React from "react";
import { renderToString } from "react-dom/server";
import models from "db/models";
import ServerHTML from "server/server-html";
import teleSignVerify from "server/utils/teleSign";
import SignupProgressBar from "app/components/elements/SignupProgressBar";
import CountryCode from "app/components/elements/CountryCode";
import { getRemoteIp, checkCSRF } from "server/utils/misc";
import MiniHeader from "app/components/modules/MiniHeader";
import secureRandom from "secure-random";
import config from "config";
import Mixpanel from "mixpanel";

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

function* confirmMobileHandler() {
    if (!checkCSRF(this, this.request.body.csrf)) return;
    const confirmation_code = this.params && this.params.code
        ? this.params.code
        : this.request.body.code;
    console.log(
        "-- /confirm_mobile -->",
        this.session.uid,
        this.session.user,
        confirmation_code
    );

    let mid = yield models.Identity.findOne({
        attributes: ["id", "user_id", "verified", "updated_at", "phone"],
        where: {
            user_id: this.session.user,
            confirmation_code,
            provider: "phone"
        },
        order: "id DESC"
    });
    if (!mid) {
        mid = yield models.Identity.findOne({
            attributes: ["id"],
            where: { user_id: this.session.user, provider: "phone" },
            order: "id DESC"
        });
        if (mid) {
            yield mid.destroy({ force: true });
        }
        this.flash = { error: "Wrong confirmation code." };
        this.redirect("/enter_mobile");
        return;
    }
    if (mid.verified) {
        this.flash = { success: "Phone number has already been verified" };
        this.redirect("/create_account");
        return;
    }

    // const used_phone = yield models.sequelize.query(`SELECT a.id FROM
    // accounts a JOIN identities i ON i.user_id=a.user_id WHERE
    // i.phone='${mid.phone}'`, { type: models.Sequelize.QueryTypes.SELECT})
    const used_phone = yield models.Identity.findOne({
        attributes: ["id", "user_id"],
        where: {
            phone: mid.phone,
            provider: "phone",
            verified: true
        },
        order: "id DESC"
    });
    if (used_phone) {
        if (used_phone.user_id === this.session.user) {
            this.flash = {
                success: "Phone number has already been verified"
            };
            this.redirect("/create_account");
        } else {
            this.flash = {
                error: "This phone number has already been used"
            };
            this.redirect("/enter_mobile");
        }
        return;
    }

    const hours_ago = (Date.now() - mid.updated_at) / 1000.0 / 3600.0;
    if (hours_ago > 24.0) {
        this.status = 401;
        this.flash = { error: "Confirmation code has been expired" };
        this.redirect("/enter_mobile");
        return;
    }
    yield mid.update({ verified: true });
    if (mixpanel)
        mixpanel.track("SignupStep3", { distinct_id: this.session.uid });
    this.redirect("/create_account");
}

export default function useEnterAndConfirmMobilePages(app) {
    const router = koa_router();
    app.use(router.routes());
    const koaBody = koa_body();

    router.get("/enter_mobile", function*() {
        console.log(
            "-- /enter_mobile -->",
            this.session.uid,
            this.session.user
        );
        const user_id = this.session.user;
        if (!user_id) {
            this.body = "user not found";
            return;
        }
        const mid = yield models.Identity.findOne({
            attributes: ["phone"],
            where: { user_id, provider: "phone" },
            order: "id DESC"
        });
        if (mid && mid.verified) {
            this.flash = { success: "Phone number has already been verified" };
            if (mixpanel)
                mixpanel.track("SignupStep3", {
                    distinct_id: this.session.uid
                });
            this.redirect("/create_account");
            return;
        }
        const phone = this.query.phone;
        const country = this.query.country;

        const body = renderToString(
            <div className="App">
                <MiniHeader />
                <SignupProgressBar
                    steps={["email", "phone", "steem account"]}
                    current={2}
                />
                <br />
                <div className="row" style={{ maxWidth: "32rem" }}>
                    <form
                        className="column"
                        action="/submit_mobile"
                        method="POST"
                    >
                        <h4>
                            Please provide your phone number to continue the registration process
                        </h4>
                        <div className="secondary">
                            Phone verification helps with preventing spam and allows Steemit to assist with Account Recovery in case your account is ever compromised.


                            Your phone number will not be used for any other purpose other than phone verification and account recovery.
                        </div>
                        <br />
                        <input type="hidden" name="csrf" value={this.csrf} />
                        <label>
                            Country Code
                            <CountryCode name="country" value={country} />
                        </label>
                        <label>
                            Phone number
                            <input type="tel" name="phone" value={phone} />
                        </label>
                        <div className="secondary">
                            Examples: 541-754-3010 | 89-636-48018
                        </div>
                        <br />
                        <div className="secondary">
                            * Land lines cannot receive SMS messages
                        </div>
                        <div className="secondary">
                            * Message and data rates may apply
                        </div>
                        <br />
                        <div className="error">{this.flash.error}</div>
                        <input
                            type="submit"
                            className="button"
                            value="CONTINUE"
                        />
                    </form>
                </div>
            </div>
        );
        const props = { body, title: "Phone Number", assets, meta: [] };
        this.body = "<!DOCTYPE html>" +
            renderToString(<ServerHTML {...props} />);
        if (mixpanel)
            mixpanel.track("SignupStep2", { distinct_id: this.session.uid });
    });

    router.post("/submit_mobile", koaBody, function*() {
        if (!checkCSRF(this, this.request.body.csrf)) return;
        const user_id = this.session.user;
        if (!user_id) {
            this.body = "user not found";
            return;
        }

        const country = this.request.body.country;
        const localPhone = this.request.body.phone;
        const enterMobileUrl = `/enter_mobile?phone=${localPhone}&country=${country}`;

        if (!country || country === "") {
            this.flash = { error: "Please select a country code" };
            this.redirect(enterMobileUrl);
            return;
        }

        if (!localPhone || digits(localPhone).length === 0) {
            this.flash = { error: "Please provide a phone number" };
            this.redirect(enterMobileUrl);
            return;
        }

        const phone = digits(parseInt(country) + localPhone);

        const blocked_prefixes = yield models.List.findAll({
            attributes: ["id", "value"],
            where: { kk: "block-phone-prefix" }
        });
        for (let bp of blocked_prefixes) {
            if (phone.match(new RegExp("^" + bp.value))) {
                this.flash = {
                    error: "Unfortunately, we don't yet have support to send SMS to your carrier, please try again later."
                };
                this.redirect("/enter_mobile");
                return;
            }
        }

        const eid = yield models.Identity.findOne({
            attributes: ["id"],
            where: { user_id, provider: "email", verified: true },
            order: "id DESC"
        });
        if (!eid) {
            this.flash = { error: "Please confirm your email address first" };
            this.redirect("/enter_mobile");
            return;
        }

        const existing_phone = yield models.Identity.findOne({
            attributes: ["user_id"],
            where: { phone, provider: "phone", verified: true },
            order: "id DESC"
        });
        if (existing_phone && existing_phone.user_id != user_id) {
            console.log(
                "-- /submit_email existing_phone -->",
                user_id,
                this.session.uid,
                phone,
                existing_phone.user_id
            );
            this.flash = { error: "This phone number has already been used" };
            this.redirect(enterMobileUrl);
            return;
        }

        const confirmation_code = parseInt(
            secureRandom.randomBuffer(8).toString("hex"),
            16
        )
            .toString(10)
            .substring(0, 4); // 4 digit code
        let mid = yield models.Identity.findOne({
            attributes: ["id", "phone", "verified", "updated_at"],
            where: { user_id, provider: "phone" },
            order: "id DESC"
        });
        if (mid) {
            if (mid.verified) {
                if (mid.phone === phone) {
                    this.flash = { success: "Phone number has been verified" };
                    if (mixpanel)
                        mixpanel.track("SignupStep3", {
                            distinct_id: this.session.uid
                        });
                    this.redirect("/create_account");
                    return;
                }
                yield mid.update({ verified: false, phone });
            }
            const seconds_ago = (Date.now() - mid.updated_at) / 1000.0;
            if (seconds_ago < 120) {
                this.flash = {
                    error: "Confirmation was attempted a moment ago. You can try again only in 2 minutes."
                };
                this.redirect(enterMobileUrl);
                return;
            }
            yield mid.update({ confirmation_code, phone });
        } else {
            mid = yield models.Identity.create({
                provider: "phone",
                user_id,
                uid: this.session.uid,
                phone,
                verified: false,
                confirmation_code
            });
        }
        console.log(
            "-- /submit_mobile -->",
            this.session.uid,
            this.session.user,
            phone,
            mid.id
        );
        const ip = getRemoteIp(this.req);

        const verifyResult = yield teleSignVerify({
            mobile: phone,
            confirmation_code,
            ip
        });
        if (verifyResult && verifyResult.score)
            mid.update({ score: verifyResult.score });
        if (verifyResult && verifyResult.error) {
            this.flash = { error: verifyResult.error };
            this.redirect(enterMobileUrl);
            return;
        }

        const body = renderToString(
            <div className="App">
                <MiniHeader />
                <SignupProgressBar
                    steps={["email", "phone", "steem account"]}
                    current={2}
                />
                <br />
                <div className="row" style={{ maxWidth: "32rem" }}>
                    <div className="column">
                        Thank you for providing your phone number (
                        {phone}
                        ).
                        <br />

                        To continue please enter the SMS code we've sent you.
                    </div>
                </div>
                <br />
                <div className="row" style={{ maxWidth: "32rem" }}>
                    <form
                        className="column"
                        action="/confirm_mobile"
                        method="POST"
                    >
                        <input type="hidden" name="csrf" value={this.csrf} />
                        <label>
                            Confirmation code
                            <input type="text" name="code" />
                        </label>
                        <br />
                        <div className="secondary">
                            Didn't receive the verification code?{" "}
                            <a href={enterMobileUrl}>Re-send</a>
                        </div>
                        <br />
                        <input
                            type="submit"
                            className="button"
                            value="CONTINUE"
                        />
                    </form>
                </div>
            </div>
        );
        const props = { body, title: "Phone Confirmation", assets, meta: [] };
        this.body = "<!DOCTYPE html>" +
            renderToString(<ServerHTML {...props} />);
    });

    router.get("/confirm_mobile/:code", confirmMobileHandler);
    router.post("/confirm_mobile", koaBody, confirmMobileHandler);
}

function digits(text) {
    const digitArray = text.match(/\d+/g);
    return digitArray ? digitArray.join("") : "";
}
