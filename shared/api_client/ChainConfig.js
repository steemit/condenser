import { ecc_config, hash } from "../ecc"

ecc_config.address_prefix = "STM";

//let chain_id = ""
//for(let i = 0; i < 32; i++) chain_id += "00"
let chain_id = "d2288f3209a6eb4b4cacf81917dd8e09b77e747a123ecb04905a16ebbb676395"

module.exports = {
    address_prefix: "STM",
    expire_in_secs: 15,
    chain_id
}
