import config from 'config';
const newrelic = config.get('newrelic') ? require('newrelic') : undefined;

import * as steem from 'steem';

delete process.env.BROWSER;

const path = require('path');
const ROOT = path.join(__dirname, '..');

// Tell `require` calls to look into `/app` also
// it will avoid `../../../../../` require strings
process.env.NODE_PATH = path.resolve(__dirname, '..');
require('module').Module._initPaths();

// Load Intl polyfill
// require('utils/intl-polyfill')(require('./config/init').locales);

global.$STM_Config = {
    fb_app: config.get('grant.facebook.key'),
    ws_connection_client: config.get('ws_connection_client'),
    ws_connection_server: config.get('ws_connection_server'),
    img_proxy_prefix: config.get('img_proxy_prefix'),
    ipfs_prefix: config.get('ipfs_prefix'),
    disable_signups: config.get('disable_signups'),
    read_only_mode: config.get('read_only_mode'),
    registrar_fee: config.get('registrar.fee'),
    upload_image: config.get('upload_image'),
    site_domain: config.get('site_domain'),
    facebook_app_id: config.get('facebook_app_id'),
    google_analytics_id: config.get('google_analytics_id')
};

const WebpackIsomorphicTools = require('webpack-isomorphic-tools');
const WebpackIsomorphicToolsConfig = require(
    '../webpack/webpack-isotools-config'
);

global.webpackIsomorphicTools = new WebpackIsomorphicTools(
    WebpackIsomorphicToolsConfig
);

global.webpackIsomorphicTools.server(ROOT, () => {
        if(process.env.USE_JSONRPC)
            steem.api.setOptions({ transport: 'http', uri: config.get('ws_connection_server') });
        else
            steem.config.set('websocket', config.get('ws_connection_server'));

        if (newrelic) {
            steem.api.on('track-performance', (method, time_taken) => {
                newrelic.recordMetric(`WebTransaction/Performance/steem-js/${method}`, time_taken / 1000.0);
            });
        }
        // const CliWalletClient = require('shared/api_client/CliWalletClient').default;
        // if (process.env.NODE_ENV === 'production') connect_promises.push(CliWalletClient.instance().connect_promise());
        try {
            require('./server');
        } catch (error) {
            console.error(error);
            process.exit(1);
        }
});
