import { ecc_config, hash } from "../ecc"
import config from 'config';

ecc_config.address_prefix = "GLS";

let chain_id = "";
if (config.has('chain.id') && config.get('chain.id').length)
  chain_id = config.get('chain.id');
else
  for (let i = 0; i < 32; i++) chain_id += "00"

module.exports = {
    address_prefix: "GLS",
    expire_in_secs: 15,
    chain_id
}
