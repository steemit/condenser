'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.formatCoins = formatCoins;

var _client_config = require('app/client_config');

// TODO add comments and explanations
// TODO change name to formatCoinTypes?
// TODO make use of DEBT_TICKER etc defined in config/clietn_config
function formatCoins(string) {
    // return null or undefined if string is not provided
    if (!string) return string;
    // TODO use .to:owerCase() ? for string normalisation
    string = string.replace('SBD', _client_config.DEBT_TOKEN_SHORT).replace('SD', _client_config.DEBT_TOKEN_SHORT).replace('Steem Power', _client_config.VESTING_TOKEN).replace('STEEM POWER', _client_config.VESTING_TOKEN).replace('Steem', _client_config.LIQUID_TOKEN).replace('STEEM', _client_config.LIQUID_TOKEN_UPPERCASE).replace('$', _client_config.CURRENCY_SIGN);
    return string;
}