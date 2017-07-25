import koa_router from "koa-router";
import koa_body from "koa-body";
import React from "react";
import { renderToString } from "react-dom/server";
import models from "db/models";
import ServerHTML from "server/server-html";
import SignupProgressBar from "app/components/elements/SignupProgressBar";
import CountryCode from "app/components/elements/CountryCode";
import { getRemoteIp, checkCSRF } from "server/utils/misc";
import MiniHeader from "app/components/modules/MiniHeader";
import secureRandom from "secure-random";
import config from "config";
import Mixpanel from "mixpanel";
import tt from 'counterpart';
import {metrics} from 'server/metrics';
import {hash} from 'golos-js/lib/auth/ecc';

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

assets.script.push("/enter_mobile/helpers.js");

function* confirmMobileHandler() {
    if (! this.request.body) return;

    const accountSid = this.request.body && this.request.body.AccountSid
      ? this.request.body.AccountSid
      : ''
    ;
    if (accountSid.localeCompare(config.get('twilio.account_sid')) != 0) return;

    const phone = this.request.body && this.request.body.From
      ? this.request.body.From.substr(1)
      : ''
    ;
    if (!phone || digits(phone).length === 0) return;

    const confirmation_code = this.request.body.Body
      ? this.request.body.Body.substr(0,4)
      : ''
    ;
    if (!confirmation_code || digits(confirmation_code).length !== 4) return;

    const phoneHash = hash.sha256(phone, 'hex');

    console.log(
        "-- /confirm_provider -->",
        phone,
        confirmation_code
    );

    let mid = yield models.Identity.findOne({
        attributes: ["id", "user_id", "verified", "updated_at", "phone"],
        where: {
            phone: phoneHash,
            confirmation_code,
            provider: "phone"
        },
        order: "id DESC"
    });
    if (!mid) {
        if (metrics) metrics.increment('_mobile_provier_fail');
        this.status = 401;
        this.body = "Wrong confirmation code";
        return;
    }
    if (mid.verified) {
        if (metrics) metrics.increment('_mobile_provier_verified');
        this.status = 401;
        this.body = "Phone number has already been verified";
        return;
    }

    const hours_ago = (Date.now() - mid.updated_at) / 1000.0 / 3600.0;
    if (hours_ago > 24.0) {
        this.status = 401;
        this.body = "Confirmation code has been expired";
        return;
    }
    yield mid.update({ verified: true });
    this.body = "Thank you for validate your phone number";
    if (metrics) metrics.increment('_mobile_provier_ok');
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
            if (metrics) metrics.increment('_signup_step_3');
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
                    steps={[
                        "email",
                        tt('g.phone'),
                        tt('g.APP_NAME_account', {APP_NAME: tt('g.APP_NAME')}).toLowerCase()
                    ]}
                    current={2}
                />
                <br />
                <div className="row" style={{ maxWidth: "32rem" }}>
                    <form
                        className="column"
                        action="/submit_mobile"
                        method="POST"
                    >
                        <h4>{tt('createaccount_jsx.please_provide_your_phone_number_to_continue')}</h4>
                        <div className="secondary">
                            {tt('createaccount_jsx.please_provide_your_phone_number_to_continue', {APP_NAME: tt('g.APP_NAME')})}
                        </div>
                        <br />
                        <input type="hidden" name="csrf" value={this.csrf} />
                        <label>
                            <span style={{color: 'red'}}>*</span> {tt('createaccount_jsx.country_code')}
                            <CountryCode name="country" value={country} />
                        </label>
                        <label>
                            <span style={{color: 'red'}}>*</span> {tt('createaccount_jsx.phone_number')} <span style={{color: 'red'}}>{tt('createaccount_jsx.without_country_code')}</span>
                            <input type="tel" name="phone" value={phone} />
                        </label>
                        <div className="secondary">
                            {tt('createaccount_jsx.examples')}
                        </div>
                        <br />
                        <div className="secondary">
                            {tt('createaccount_jsx.land_lines_cannot_receive_sms_messages')}
                        </div>
                        <br />
                        <div className="error">{this.flash.error}</div>
                        <input
                            type="submit"
                            className="button"
                            value={tt('g.continue').toUpperCase()}
                        />
                    </form>
                </div>
            </div>
        );
        const props = { body, title: "Phone Number", assets, meta: [] };
        this.body = "<!DOCTYPE html>" +
            renderToString(<ServerHTML {...props} />);
        if (metrics) metrics.increment('_signup_step_2');
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
        const check = this.request.body.check;
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
        const phoneHash = hash.sha256(phone, 'hex')

        const blocked_prefixes = yield models.List.findAll({
            attributes: ["id", "value"],
            where: { kk: "block-phone-prefix" }
        });
        for (const bp of blocked_prefixes) {
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
            where: { phone: phoneHash, provider: "phone", verified: true },
            order: "id DESC"
        });
        if (existing_phone && existing_phone.user_id != user_id) {
            console.log(
                "-- /submit_email existing_phone -->",
                user_id,
                this.session.uid,
                phoneHash,
                existing_phone.user_id
            );
            this.flash = { error: tt('createaccount_jsx.this_phone_number_has_already_been_used') };
            this.redirect(enterMobileUrl);
            return;
        }

        let confirmation_code = parseInt(
            secureRandom.randomBuffer(8).toString("hex"),
            16
        )
            .toString(10)
            .substring(0, 4); // 4 digit code
        let mid = yield models.Identity.findOne({
            attributes: ["id", "phone", "verified", "updated_at", "confirmation_code"],
            where: { user_id, provider: "phone" },
            order: "id DESC"
        });
        if (mid) {
            if (mid.verified) {
                if (mid.phone === phoneHash) {
                    this.flash = { success: tt('createaccount_jsx.phone_number_has_been_verified') };
                    if (metrics) metrics.increment('_signup_step_3');
                    if (mixpanel)
                        mixpanel.track("SignupStep3", {
                            distinct_id: this.session.uid
                        });
                    this.redirect("/create_account");
                    return;
                }
                yield mid.update({ verified: false, phone: phoneHash});
            }
            const seconds_ago = (Date.now() - mid.updated_at) / 1000.0;
            const timeAgo = process.env.NODE_ENV === "production" ? 300 : 10;
            if (check) {
                confirmation_code = mid.confirmation_code
            }
            else {
                if (seconds_ago < timeAgo) {
                    this.flash = {
                        error: "Confirmation was attempted a moment ago. You can try again only in 5 minutes."
                    };
                    this.redirect(enterMobileUrl);
                    return;
                }
                yield mid.update({ confirmation_code, phone: phoneHash });
            }
        } else {
            mid = yield models.Identity.create({
                provider: "phone",
                user_id,
                uid: this.session.uid,
                phone: phoneHash,
                verified: false,
                confirmation_code
            });
        }
        console.log(
            '-- /submit_mobile -->',
            this.session.uid,
            this.session.user,
            phoneHash,
            mid.id
        );
        const ip = getRemoteIp(this.req);

        const body = renderToString(
            <div className="App">
                <MiniHeader />
                <SignupProgressBar
                    steps={[
                        "email",
                        tt('g.phone'),
                        tt('g.APP_NAME_account', {APP_NAME: tt('g.APP_NAME')}).toLowerCase()
                    ]}
                    current={2}
                />
                <br />
                <div className="row" style={{ maxWidth: "32rem" }}>
                    <div className="column">
                        {tt('createaccount_jsx.thank_you_for_providing_your_phone_number', {phone})}
                        <br />
                        {tt('createaccount_jsx.to_continue_please_send_sms_code', {code: confirmation_code, phone_number: config.get('twilio.sender_id')})}
                    </div>
                </div>
                <br />
                <div className="row" style={{ maxWidth: "32rem" }}>
                    <div className="column">
                        <p id="Spoiler" style={{ display: "none" }}>
                          {tt('createaccount_jsx.mobile_description.one', {APP_NAME: tt('g.APP_NAME')})}<br/>
                          {tt('createaccount_jsx.mobile_description.second')}<br/>
                          {tt('createaccount_jsx.mobile_description.third', {APP_NAME: tt('g.APP_NAME')})}<br/>
                          {tt('createaccount_jsx.mobile_description.fourth')}
                        </p>
                        <button id="SpoilerButton" className="button hollow tiny">
                          <span>{tt('createaccount_jsx.why_send_sms')}</span>
                        </button>
                  </div>
                </div>
                <div className="row" style={{ maxWidth: "32rem" }}>
                    <form
                        className="column"
                        action="/submit_mobile"
                        method="POST"
                    >
                        <input type="hidden" name="csrf" value={this.csrf} />
                        <input type="hidden" name="country" value={country} />
                        <input type="hidden" name="phone" value={localPhone} />
                        <input type="hidden" name="check" value={true} />
                        <div className="secondary">
                            {tt('createaccount_jsx.APP_NAME_wants_you_to_know', {APP_NAME: tt('g.APP_NAME')})}
                        </div>
                        <br />
                        <div className="secondary">
                            {tt('createaccount_jsx.you_can_change_your_number')}{" "}
                            <a href={enterMobileUrl}>{tt('g.edit')}</a>
                        </div>
                        <br />
                        <div className="error">{check && 'Confirmation was attempted a moment ago. You can try again in 5 minutes later.'}</div>
                        <input
                            type="submit"
                            className="button"
                            value={tt('settings_jsx.update').toUpperCase()}
                        />
                    </form>
                </div>
            </div>
        );
        const props = { body, title: "Phone Confirmation", assets, meta: [] };
        this.body = "<!DOCTYPE html>" +
            renderToString(<ServerHTML {...props} />);
    });

    router.post("/confirm_mobile", koaBody, confirmMobileHandler);
    router.get("/enter_mobile/helpers.js", function*() {
        this.type = 'application/javascript';
        this.body = "document.getElementById('SpoilerButton').onclick=function(){document.getElementById('Spoiler').style.display= document.getElementById('Spoiler').style.display==='none'?'block':'none'}";
    });
}

function digits(text) {
    const digitArray = text.match(/\d+/g);
    return digitArray ? digitArray.join("") : "";
}
