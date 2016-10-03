// https://www.airpair.com/docker/posts/the-painful-journey-of-painless-deployments
// reference (see constants.js in the-painful-journey-of-painless-deployments)

const config = require('./defaults.json');
const INFO = false

function envOverride(c, base = 'STEEMIT_') {
    if(!c) return
    for(const key of Object.keys(c)) {
        const ENV_KEY = key.toUpperCase()
        const v = process.env[base + ENV_KEY]
        const hasEnv = v != null

        if(INFO) {
            const ck = c[key]
            const value = hasEnv ? v : ck
            const strValue =
                /number|boolean/.test(typeof value) ? value :
                /string/.test(typeof value) && value.indexOf("'") === -1 ? `'${value}'` :
                /string/.test(typeof value) ? `"${value}"` :
                `'${JSON.stringify(value, null, 0)}'`

            console.log(`export ${base}${ENV_KEY}=${strValue}`)
        }

        if(hasEnv) {
            if(/STEEMIT_HELMET_DIRECTIVES_/.test(base + ENV_KEY)) {
                // avoid difficult escaping in the config file
                c[key] = v.split(/, */)
            } else {
                try {
                    c[key] = JSON.parse(v)
                } catch(error) {
                    c[key] = v
                }
            }
        } else {
            const value = c[key]
            if(typeof value === 'object' && !Array.isArray(value))
                envOverride(value, base + ENV_KEY + '_')
        }
    }
}

envOverride(config)

if(INFO) {
    console.log('Configuration', JSON.stringify(config, null, 4))
}

export default config
