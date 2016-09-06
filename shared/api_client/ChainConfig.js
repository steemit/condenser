import { ecc_config, hash } from "../ecc"

ecc_config.address_prefix = "TST";

//let chain_id = ""
//for(let i = 0; i < 32; i++) chain_id += "00"
let chain_id = "8f5ec76c58e23352a90785f8fa4674aed80bc1d318e19956c5d263e7fba53186"

module.exports = {
    address_prefix: "TST",
    expire_in_secs: 15,
    chain_id
}
