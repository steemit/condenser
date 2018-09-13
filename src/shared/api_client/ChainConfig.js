import * as steem from '@steemit/steem-js';
import config from 'config';

steem.config.set('address_prefix', config.get('chain_prefix'));

let chain_id = '';
if (config.has('chain_id') && config.get('chain_id').length)
    chain_id = config.get('chain_id');
else for (let i = 0; i < 32; i++) chain_id += '00';

module.exports = {
    address_prefix: config.get('chain_prefix'),
    expire_in_secs: 15,
    chain_id,
};
