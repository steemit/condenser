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
import {
    safeStartTimer,
    safeStopTimer,
    safeConsoleTime,
    safeConsoleTimeEnd,
} from './utils/TimingUtils';
import { specialPosts } from './utils/SpecialPosts';

const path = require('path');
const ROOT = path.join(__dirname, '../..');
const DB_RECONNECT_TIMEOUT =
    process.env.NODE_ENV === 'development' ? 1000 * 60 * 60 : 1000 * 60 * 10;

const supportedLocales = getSupportedLocales();

async function appRender(ctx, locales = false, resolvedAssets = false) {
    safeStartTimer(ctx.state.requestTimer, 'appRender_ms');
    const store = {};
    // This is the part of SSR where we make session-specific changes:
    try {
        // User preferences processing time
        safeStartTimer(ctx.state.requestTimer, 'userPreferences_ms');
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
        // remove this block code, if we need zh language package.
        if (userPreferences.locale == 'zh') {
            userPreferences.locale = undefined;
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
        safeStopTimer(ctx.state.requestTimer, 'userPreferences_ms');

        // Special posts loading time
        safeStartTimer(ctx.state.requestTimer, 'specialPosts_ms');
        const offchain = {
            csrf: ctx.csrf,
            new_visit: ctx.session.new_visit,
            config: $STM_Config,
            special_posts: await specialPosts(ctx.session.uid),
            login_challenge,
        };
        safeStopTimer(ctx.state.requestTimer, 'specialPosts_ms');

        // Initial state construction time
        safeStartTimer(ctx.state.requestTimer, 'initialState_ms');
        const adSwipe = {
            enabled: config.adswipe_enabled === 'true',
        };

        const tronAds = {
            enabled: config.tronads_enabled === 'true',
            env: config.tronads_env == 2 ? 2 : 1,
            is_mock: config.tronads_env == 2 ? 0 : 1,
            sidebar_ad_pid: config.tronads_sidebar_ad_pid,
            content_pc_ad_pid: config.tronads_content_pc_ad_pid,
            content_mobile_ad_pid: config.tronads_content_mobile_ad_pid,
        };

        const googleAds = {
            enabled: config.google_ad_enabled === 'true',
            test: !!config.google_ad_test,
            client: config.google_ad_client,
            adSlots: config.google_ad_slots,
            gptEnabled: !!config.gpt_enabled,
            gptBidding: config.gpt_bidding,
            gptBasicSlots: config.gpt_basic_slots,
            gptCategorySlots: config.gpt_category_slots,
            gptBiddingSlots: config.gpt_bidding_slots,
            gptBannedTags: config.gpt_banned_tags,
            videoAdsEnabled: !!config.video_ads_enabled,
        };
        const cookieConsent = {
            enabled: !!config.cookie_consent_enabled,
            api_key: config.cookie_consent_api_key,
        };
        // ... and that's the end of user-session-related SSR
        const initial_state = {
            app: {
                viewMode: determineViewMode(ctx.request.search),
                adSwipe,
                tronAds,
                googleAds,
                env: process.env.NODE_ENV,
                walletUrl: config.wallet_url,
                steemMarket: ctx.steemMarketData,
                trackingId: ctx.session.uid,
                vests_per_trx: null,
                frontend_has_rendered: false,
                activityTag:
                    config.activity_tag !== ''
                        ? config.activity_tag.split(',')
                        : [],
                image_host: config.get('img_proxy_prefix')
                    ? config.get('img_proxy_prefix')
                    : 'https://steemitimages.com/',
                site_domain: config.get('site_domain')
                    ? config.get('site_domain')
                    : 'steemit.com',
            },
        };
        safeStopTimer(ctx.state.requestTimer, 'initialState_ms');

        // serverRender call (includes API fetching and SSR rendering)
        const {
            body,
            title,
            statusCode,
            meta,
            redirectUrl,
        } = await serverRender(
            ctx.request.url,
            initial_state,
            ErrorPage,
            userPreferences,
            offchain,
            ctx.state.requestTimer,
            ctx.session.uid
        );

        if (redirectUrl) {
            console.log('Redirecting to', redirectUrl);
            ctx.status = 302;
            ctx.redirect(redirectUrl);
            return;
        }

        // Asset file processing time
        safeStartTimer(ctx.state.requestTimer, 'assets_ms');
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
        safeStopTimer(ctx.state.requestTimer, 'assets_ms');

        // Final rendering time
        safeStartTimer(ctx.state.requestTimer, 'finalRender_ms');
        const props = {
            body,
            assets,
            title,
            meta,
            google_analytics_id: config.google_analytics_id,
            csp_nonce: ctx.session.cspNonce,
        };
        ctx.status = statusCode;
        ctx.body =
            '<!DOCTYPE html>' + renderToString(<ServerHTML {...props} />);
        safeStopTimer(ctx.state.requestTimer, 'finalRender_ms');
    } catch (err) {
        // Render 500 error page from server
        console.error('AppRender error', err, redirect);
        const { error, redirect } = err;
        if (error) throw error;

        // Handle component `onEnter` transition
        if (redirect) {
            const { pathname, search } = redirect;
            ctx.redirect(pathname + search);
        }

        throw err;
    }

    safeStopTimer(ctx.state.requestTimer, 'appRender_ms');
}

appRender.dbStatus = { ok: true };
module.exports = appRender;
