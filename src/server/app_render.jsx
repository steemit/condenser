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
        let user_preferences = null;
        if (!login_challenge) {
            login_challenge = secureRandom.randomBuffer(16).toString('hex');
            ctx.session.login_challenge = login_challenge;
        }
        const offchain = {
            csrf: ctx.csrf,
            flash: ctx.flash,
            new_visit: ctx.session.new_visit,
            account: ctx.session.a,
            config: $STM_Config,
            uid: ctx.session.uid,
            login_challenge
        };
        const user_id = ctx.session.user;
        if (user_id) {
            let user = null;
            if (appRender.dbStatus.ok || (new Date() - appRender.dbStatus.lastAttempt) > DB_RECONNECT_TIMEOUT) {
                try {
                    user = await models.User.findOne({
                        attributes: ['name', 'email', 'picture_small', 'account_status'],
                        where: {id: user_id},
                        include: [{model: models.Account, attributes: ['name', 'ignored', 'created', 'owner_key']}],
                        order: 'Accounts.id desc',
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
                let account_has_keys = null;
                for (const a of user.Accounts) {
                    if (!a.ignored) {
                        account = a.name;
                        if (a.owner_key && !a.created) {
                            account_has_keys = true;
                        }
                        break;
                    }
                }
                offchain.user = {
                    id: user_id,
                    name: user.name,
                    email: user.email,
                    picture: user.picture_small,
                    prv: ctx.session.prv,
                    account_status: user.account_status,
                    account,
                    account_has_keys
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
        if (ctx.session.a) {
            const user_preferences_record = await models.UserPreferences.findOne({
                attributes: ['json'],
                where: {account: ctx.session.a},
                logging: false
            });
            if (user_preferences_record) {
                user_preferences = JSON.parse(user_preferences_record.json);
            }
        }

        const { body, title, statusCode, meta } = await universalRender({location: ctx.request.url, store, offchain, ErrorPage, tarantool: Tarantool.instance(), user_preferences});

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
