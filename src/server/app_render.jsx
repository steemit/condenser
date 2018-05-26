import React from 'react';
import { renderToString } from 'react-dom/server';
import { VIEW_MODE_WHISTLE, PARAM_VIEW_MODE } from '../shared/constants';
import ServerHTML from './server-html';
import { serverRender } from '../shared/UniversalRender';
import models from 'db/models';
import secureRandom from 'secure-random';
import ErrorPage from 'server/server-error';
import fs from 'fs';
import { determineViewMode } from '../app/utils/Links';

const path = require('path');
const ROOT = path.join(__dirname, '../..');
const DB_RECONNECT_TIMEOUT =
    process.env.NODE_ENV === 'development' ? 1000 * 60 * 60 : 1000 * 60 * 10;

function getSupportedLocales() {
    const locales = [];
    const files = fs.readdirSync(path.join(ROOT, 'src/app/locales'));
    for (const filename of files) {
        const match_res = filename.match(/(\w+)\.json?$/);
        if (match_res) locales.push(match_res[1]);
    }
    return locales;
}

const supportedLocales = getSupportedLocales();

async function appRender(ctx) {
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
            login_challenge,
        };
        if (ctx.session.arec) {
            const account_recovery_record = await models.AccountRecoveryRequest.findOne(
                {
                    attributes: ['id', 'account_name', 'status', 'provider'],
                    where: { id: ctx.session.arec, status: 'confirmed' },
                }
            );
            if (account_recovery_record) {
                offchain.recover_account = account_recovery_record.account_name;
            }
        }
        // ... and that's the end of user-session-related SSR

        const initial_state = {
            app: {
                viewMode: determineViewMode(ctx.request.search),
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

        // Assets name are found in `webpack-stats` file
        const assets_filename =
            ROOT +
            (process.env.NODE_ENV === 'production'
                ? '/tmp/webpack-stats-prod.json'
                : '/tmp/webpack-stats-dev.json');
        const assets = require(assets_filename);

        // Don't cache assets name on dev
        if (process.env.NODE_ENV === 'development') {
            delete require.cache[require.resolve(assets_filename)];
        }

        const props = { body, assets, title, meta };
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
