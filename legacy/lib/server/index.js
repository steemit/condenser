'use strict';

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _config = require('config');

var _config2 = _interopRequireDefault(_config);

var _steemJs = require('@steemit/steem-js');

var steem = _interopRequireWildcard(_steemJs);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var path = require('path');
var ROOT = path.join(__dirname, '../..');

// Tell `require` calls to look into `/app` also
// it will avoid `../../../../../` require strings

// use Object.assign to bypass transform-inline-environment-variables-babel-plugin (process.env.NODE_PATH= will not work)
(0, _assign2.default)(process.env, { NODE_PATH: path.resolve(__dirname, '..') });

require('module').Module._initPaths();

// Load Intl polyfill
// require('utils/intl-polyfill')(require('./config/init').locales);

global.$STM_Config = {
    fb_app: _config2.default.get('facebook_app_id'),
    steemd_connection_client: _config2.default.get('steemd_connection_client'),
    steemd_connection_server: _config2.default.get('steemd_connection_server'),
    steemd_rpc_list: _config2.default.get('rpc_list'),
    steemd_use_appbase: _config2.default.get('steemd_use_appbase'),
    chain_id: _config2.default.get('chain_id'),
    address_prefix: _config2.default.get('address_prefix'),
    img_proxy_prefix: _config2.default.get('img_proxy_prefix'),
    ipfs_prefix: _config2.default.get('ipfs_prefix'),
    read_only_mode: _config2.default.get('read_only_mode'),
    upload_image: _config2.default.get('upload_image'),
    site_domain: _config2.default.get('site_domain'),
    google_analytics_id: _config2.default.get('google_analytics_id'),
    wallet_url: _config2.default.get('wallet_url'),
    tron_host: _config2.default.get('tron_create_node')
};

var WebpackIsomorphicTools = require('webpack-isomorphic-tools');
var WebpackIsomorphicToolsConfig = require('../../webpack/webpack-isotools-config');

global.webpackIsomorphicTools = new WebpackIsomorphicTools(WebpackIsomorphicToolsConfig);

global.webpackIsomorphicTools.server(ROOT, function () {
    steem.api.setOptions({
        url: _config2.default.steemd_connection_server,
        retry: {
            retries: 10,
            factor: 5,
            minTimeout: 50, // start at 50ms
            maxTimeout: 60 * 1000,
            randomize: true
        },
        useAppbaseApi: !!_config2.default.steemd_use_appbase
    });
    steem.config.set('address_prefix', _config2.default.get('address_prefix'));
    steem.config.set('chain_id', _config2.default.get('chain_id'));

    // const CliWalletClient = require('shared/api_client/CliWalletClient').default;
    // if (process.env.NODE_ENV === 'production') connect_promises.push(CliWalletClient.instance().connect_promise());
    try {
        require('./server');
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
});