import { ecc_config, hash } from "../ecc"

ecc_config.address_prefix = "STM";

let chain_id = ""
for(let i = 0; i < 32; i++) chain_id += "00"
// let chain_id = "d8cbe510924d8ab4b13e1a0269836cf37fdf91ad814b3574f353c7be5a625050"

module.exports = {
    address_prefix: "STM",
    expire_in_secs: 15,
    chain_id
}
