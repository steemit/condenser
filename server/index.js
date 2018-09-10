import config from 'config';
import * as golos from 'golos-js';

delete process.env.BROWSER;

const path = require('path');
const ROOT = path.join(__dirname, '..');

// Tell `require` calls to look into `/app` also
// it will avoid `../../../../../` require strings
process.env.NODE_PATH = path.resolve(__dirname, '..');
require('module').Module._initPaths();

global.$STM_Config = {
    fb_app: config.get('grant.facebook.key'),
    ws_connection_client: config.get('ws_connection_client'),
    img_proxy_prefix: config.get('img_proxy_prefix'),
    ipfs_prefix: config.get('ipfs_prefix'),
    disable_signups: config.get('disable_signups'),
    read_only_mode: config.get('read_only_mode'),
    registrar_fee: config.get('registrar.fee'),
    upload_image: config.get('upload_image'),
    site_domain: config.get('site_domain'),
    facebook_app_id: config.get('facebook_app_id'),
    google_analytics_id: config.get('google_analytics_id'),
    chain_id: config.get('chain_id'),
    lang_server : config.get('lang_server'),
    /* isTestnet: config.get('is_testnet'), */
    is_sandbox: config.get('is_sandbox') === 'false' ? false : true,
    push_server_url: config.get('wss_push_service_url'),
    gate_service_url: config.get('gate_service_url'),
};

const WebpackIsomorphicTools = require('webpack-isomorphic-tools');
global.webpackIsomorphicTools = new WebpackIsomorphicTools(require('../webpack/webpack-isotools-config'));

global.webpackIsomorphicTools.server(ROOT, () => {
    golos.config.set('websocket', config.get('ws_connection_server'))

    try {
        require('./server');
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
});
