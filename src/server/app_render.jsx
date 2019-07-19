import React from 'react';
import config from 'config';
import { renderToString } from 'react-dom/server';
import { VIEW_MODE_WHISTLE, PARAM_VIEW_MODE } from '../shared/constants';
import ServerHTML from './server-html';
import { serverRender } from '../shared/UniversalRender';
import secureRandom from 'secure-random';
import ErrorPage from 'server/server-error';
import { determineViewMode } from '../app/utils/Links';
import { getSupportedLocales } from './utils/misc';

const path = require('path');
const ROOT = path.join(__dirname, '../..');
const DB_RECONNECT_TIMEOUT =
    process.env.NODE_ENV === 'development' ? 1000 * 60 * 60 : 1000 * 60 * 10;

const supportedLocales = getSupportedLocales();

async function appRender(ctx, locales = false, resolvedAssets = false) {
    ctx.state.requestTimer.startTimer('appRender_ms');
    const store = {};
    // This is the part of SSR where we make session-specific changes:
    try {
        let userPreferences = {};
        if (ctx.session.user_prefs) {
            try {
                userPreferences = JSON.parse(ctx.session.user_prefs);
            } catch (err) {
                console.error(
                    'cannot parse user preferences:',
                    ctx.session.uid,
                    err
                );
            }
        }
        if (!userPreferences.locale) {
            let locale = ctx.getLocaleFromHeader();
            if (locale) locale = locale.substring(0, 2);
            const supportedLocales = locales ? locales : getSupportedLocales();
            const localeIsSupported = supportedLocales.find(l => l === locale);
            if (!localeIsSupported) locale = 'en';
            userPreferences.locale = locale;
        }
        let login_challenge = ctx.session.login_challenge;
        if (!login_challenge) {
            login_challenge = secureRandom.randomBuffer(16).toString('hex');
            ctx.session.login_challenge = login_challenge;
        }
        const offchain = {
            csrf: ctx.csrf,
            new_visit: ctx.session.new_visit,
            config: $STM_Config,
            special_posts: await ctx.app.specialPostsPromise,
            login_challenge,
        };

        const googleAds = {
            enabled: !!config.google_ad_enabled,
            test: !!config.google_ad_test,
            client: config.google_ad_client,
            adSlots: config.google_ad_slots,
            gptEnabled: !!config.gpt_enabled,
            gptBidding: config.gpt_bidding,
            gptBasicSlots: config.gpt_basic_slots,
            gptCategorySlots: config.gpt_category_slots,
            gptBiddingSlots: config.gpt_bidding_slots,
        };
        const cookieConsent = {
            enabled: !!config.cookie_consent_enabled,
            api_key: config.cookie_consent_api_key,
        };
        // ... and that's the end of user-session-related SSR
        const initial_state = {
            app: {
                viewMode: determineViewMode(ctx.request.search),
                googleAds: googleAds,
                env: process.env.NODE_ENV,
                walletUrl: config.wallet_url,
                steemMarket: ctx.steemMarketData,
            },
        };

        const { body, title, statusCode, meta } = await serverRender(
            ctx.request.url,
            initial_state,
            ErrorPage,
            userPreferences,
            offchain,
            ctx.state.requestTimer
        );

        let assets;
        // If resolvedAssets argument parameter is falsey we infer that we are in
        // development mode and therefore resolve the assets on each render.
        if (!resolvedAssets) {
            // Assets name are found in `webpack-stats` file
            const assets_filename = ROOT + '/tmp/webpack-stats-dev.json';
            assets = require(assets_filename);
            delete require.cache[require.resolve(assets_filename)];
        } else {
            assets = resolvedAssets;
        }
        const props = {
            body,
            assets,
            title,
            meta,
            shouldSeeAds: googleAds.enabled,
            gptEnabled: googleAds.gptEnabled,
            adClient: googleAds.client,
            gptBidding: googleAds.gptBidding,
            shouldSeeCookieConsent: cookieConsent.enabled,
            cookieConsentApiKey: cookieConsent.api_key,
        };
        ctx.status = statusCode;
        ctx.body =
            '<!DOCTYPE html>' + renderToString(<ServerHTML {...props} />);
    } catch (err) {
        // Render 500 error page from server
        const { error, redirect } = err;
        if (error) throw error;

        // Handle component `onEnter` transition
        if (redirect) {
            const { pathname, search } = redirect;
            ctx.redirect(pathname + search);
        }

        throw err;
    }

    ctx.state.requestTimer.stopTimer('appRender_ms');
}

appRender.dbStatus = { ok: true };
module.exports = appRender;
