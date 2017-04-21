import { ecc_config, hash } from "../ecc"

ecc_config.address_prefix = "GLS";

let chain_id = ""
for(let i = 0; i < 32; i++) chain_id += "00"

module.exports = {
    address_prefix: "GLS",
    expire_in_secs: 15,
    chain_id
}
