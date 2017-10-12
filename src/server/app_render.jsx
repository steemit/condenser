import React from 'react';
import { renderToString } from 'react-dom/server';
import Tarantool from 'db/tarantool';
import ServerHTML from './server-html';
import universalRender from '../shared/UniversalRender';
import models from 'db/models';
import secureRandom from 'secure-random';
import ErrorPage from 'server/server-error';

const path = require('path');
const ROOT = path.join(__dirname, '../..');

const DB_RECONNECT_TIMEOUT = process.env.NODE_ENV === 'development' ? 1000 * 60 * 60 : 1000 * 60 * 10;

async function appRender(ctx) {
    const store = {};
    try {
        let login_challenge = ctx.session.login_challenge;
        if (!login_challenge) {
            login_challenge = secureRandom.randomBuffer(16).toString('hex');
            ctx.session.login_challenge = login_challenge;
        }
        const offchain = {
            csrf: ctx.csrf,
            flash: ctx.flash,
            config: $STM_Config,
            uid: ctx.session.uid,
            login_challenge
        };

        const { body, title, statusCode, meta } = await universalRender({location: ctx.request.url, store, offchain, ErrorPage, tarantool: Tarantool.instance()});

        // Assets name are found in `webpack-stats` file
        const assets_filename = ROOT + (process.env.NODE_ENV === 'production' ? '/tmp/webpack-stats-prod.json' : '/tmp/webpack-stats-dev.json');
        const assets = require(assets_filename);

        // Don't cache assets name on dev
        if (process.env.NODE_ENV === 'development') {
            delete require.cache[require.resolve(assets_filename)];
        }

        const props = {body, assets, title, meta};
        ctx.status = statusCode;
        ctx.body = '<!DOCTYPE html>' + renderToString(<ServerHTML { ...props } />);
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
}

appRender.dbStatus = {ok: true};
module.exports = appRender;
