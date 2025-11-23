'use strict';

var _steemJs = require('@steemit/steem-js');

var steem = _interopRequireWildcard(_steemJs);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

steem.config.set('address_prefix', 'STM');

var chain_id = '';
for (var i = 0; i < 32; i++) {
    chain_id += '00';
}module.exports = {
    address_prefix: 'STM',
    expire_in_secs: 15,
    chain_id: chain_id
};