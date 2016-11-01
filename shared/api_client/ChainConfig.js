import { ecc_config, hash } from "../ecc"

ecc_config.address_prefix = "GLS";

// let chain_id = ""
// for(let i = 0; i < 32; i++) chain_id += "00"
let chain_id = "8ec6e00cefb9b8b2d483215240d3eb40e477e3c1e38a1fe032673758c98db3fe"


module.exports = {
    address_prefix: "GLS",
    expire_in_secs: 15,
    chain_id
}
