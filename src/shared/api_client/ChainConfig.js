import * as steem from '@steemit/steem-js';

steem.config.set('address_prefix', 'KWR');

let chain_id =
    '3ea6e60873c8ad342564b9f4b24def337be8c44509ce81a70d49c9169075dfcf';
// for (let i = 0; i < 32; i++) chain_id += '00';

module.exports = {
    address_prefix: 'KWR',
    expire_in_secs: 15,
    chain_id,
};
