import * as golos from 'golos-js';

golos.config.set('address_prefix','GLS');

let chain_id = "5876894a41e6361bde2e73278f07340f2eb8b41c2facd29099de9deef6cdb679"
// for(let i = 0; i < 32; i++) chain_id += "00"

module.exports = {
    address_prefix: "GLS",
    expire_in_secs: 15,
    chain_id
}
