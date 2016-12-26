// 4567891123456789212345678931234567894123456789512345678961234567897123456789$

delete process.env.BROWSER;

const path = require('path');
const ROOT = path.join(__dirname, '..');

const log = require('../log');

// Tell `require` calls to look into `/app` also
// it will avoid `../../../../../` require strings
process.env.NODE_PATH = path.resolve(__dirname, '..');
require('module').Module._initPaths();

// Load Intl polyfill
// require('utils/intl-polyfill')(require('./config/init').locales);

import config from '../config';
global.$STM_Config = {
    fb_app: config.grant.facebook.key,
    ws_connection_client: config.ws_connection_client,
    ws_connection_server: config.ws_connection_server,
    img_proxy_prefix: config.img_proxy_prefix,
    ipfs_prefix: config.ipfs_prefix,
    disable_signups: config.disable_signups,
    read_only_mode: config.read_only_mode,
    registrar_fee: config.registrar.fee,
    uploadImage: config.uploadImage,
};

const WebpackIsomorphicTools = require('webpack-isomorphic-tools');
const WebpackIsomorphicToolsConfig = require('../webpack/webpack-isotools-config');

global.webpackIsomorphicTools = new WebpackIsomorphicTools(WebpackIsomorphicToolsConfig);

global.webpackIsomorphicTools
    .development(process.env.NODE_ENV === 'development')
    .server(ROOT, () => {
        const SteemClient = require('shared/api_client/ApiInstances').default;
        const connect_promises = [SteemClient.instance().connect_promise()];
        // const CliWalletClient = require('shared/api_client/CliWalletClient').default;
        // if (process.env.NODE_ENV === 'production') connect_promises.push(CliWalletClient.instance().connect_promise());
        Promise.all(connect_promises).then(() => {
            try {
                require('./server');
            } catch (error) {
                log.error(error);
                process.exit(1);
            }
        }).catch(error => {
            log.error('Web socket client init error', error);
            process.exit(1);
        });
    });
