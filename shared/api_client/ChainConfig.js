import { ecc_config, hash } from "../ecc"
import config from '../../app/config/public'
ecc_config.address_prefix = "GLS";

// let chain_id = ""
// for(let i = 0; i < 32; i++) chain_id += "00"
let chain_id = config.CHAIN_ID || "5876894a41e6361bde2e73278f07340f2eb8b41c2facd29099de9deef6cdb679"
console.log (chain_id, "CHAIN_ID")

module.exports = {
    address_prefix: "GLS",
    expire_in_secs: 15,
    chain_id
}
