import React from 'react';
import { renderToString } from 'react-dom/server';
import ServerHTML from './server-html';
import universalRender from '../shared/UniversalRender';
import models from 'db/models';
import secureRandom from 'secure-random'
import { SELECT_TAGS_KEY } from 'config/client_config';

const DB_RECONNECT_TIMEOUT = process.env.NODE_ENV === 'development' ? 1000 * 60 * 60 : 1000 * 60 * 10;

async function appRender(ctx) {
    const store = {};
    try {
        let login_challenge = ctx.session.login_challenge;
        if (!login_challenge) {
            login_challenge = secureRandom.randomBuffer(16).toString('hex');
            ctx.session.login_challenge = login_challenge;
        }
        let select_tags = JSON.parse( decodeURIComponent( ctx.cookies.get( SELECT_TAGS_KEY ) || '[]' ) || '[]');
        const offchain = {
            csrf: ctx.csrf,
            flash: ctx.flash,
            new_visit: ctx.session.new_visit,
            account: ctx.session.a,
            select_tags: select_tags,
            config: $STM_Config,
            login_challenge
        };
        const user_id = ctx.session.user;
        if (user_id) {
            let user = null;
            if (appRender.dbStatus.ok || (new Date() - appRender.dbStatus.lastAttempt) > DB_RECONNECT_TIMEOUT) {
                try {
                    user = await models.User.findOne({
                        attributes: ['name', 'email', 'picture_small'],
                        where: {id: user_id},
                        include: [{model: models.Account, attributes: ['name', 'ignored']}],
                        logging: false
                    });
                    appRender.dbStatus = {ok: true};
                } catch (e) {
                    appRender.dbStatus = {ok: false, lastAttempt: new Date()};
                    console.error('WARNING! mysql query failed: ', e.toString());
                    offchain.serverBusy = true;
                }
            } else {
                offchain.serverBusy = true;
            }
            if (user) {
                let account = null;
                for (const a of user.Accounts) {
                    if (!a.ignored) {
                        account = a.name;
                        break;
                    }
                }
                offchain.user = {
                    id: user_id,
                    name: user.name,
                    email: user.email,
                    picture: user.picture_small,
                    prv: ctx.session.prv,
                    account
                }
            }
        }
        if (ctx.session.arec) {
            const account_recovery_record = await models.AccountRecoveryRequest.findOne({
                attributes: ['id', 'account_name', 'status', 'provider'],
                where: {id: ctx.session.arec, status: 'confirmed'}
            });
            if (account_recovery_record) {
                offchain.recover_account = account_recovery_record.account_name;
            }
        }
        const { body, title, statusCode, meta } = await universalRender({location: ctx.request.url, store, offchain});

        // Assets name are found in `webpack-stats` file
        const assets_filename = process.env.NODE_ENV === 'production' ? 'tmp/webpack-stats-prod.json' : 'tmp/webpack-stats-dev.json';
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
