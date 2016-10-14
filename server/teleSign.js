import fetch from 'node-fetch';
import config from '../config';
import crypto from 'crypto'
import secureRandom from 'secure-random'

const {customer_id} = config.telesign
const api_key = new Buffer(config.telesign.rest_api_key, 'base64')
const use_case_code = 'BACS' // Use Case: avoid bulk attack and spammers

// Testing, always blocked: 1-310-555-0100

/** @return {object} - {reference_id} or {error} */
export function* verify({mobile, confirmation_code, ip}) {
    try {
        const result = yield getScore(mobile)
        const {recommendation, score} = result.risk
        if(recommendation !== 'allow') {
            console.log(`TeleSign did not allow phone ${mobile} ip ${ip}. TeleSign responded: ${recommendation}`);
            return {error: 'Unable to verify your phone number. Please try a different phone number.', score}
        }
        const {reference_id} = yield verifySms({mobile, confirmation_code, ip})
        return {reference_id, score}
    } catch(error) {
        console.log('-- verify score error -->', error);
        return {error: 'Unable to verify phone, please try again later.'}
    }
}

function getScore(mobile) {
    const fields = urlencode({
        ucid: use_case_code,
    })
    const resource = '/v1/phoneid/score/' + mobile.match(/\d+/g).join('')
    const method = 'GET'
    return fetch(
        `https://rest.telesign.com${resource}?${fields}`, {
            method,
            headers: authHeaders({resource, method})
        }
    )
    .then(r => r.json())
    .catch(error => {
        console.error(`ERROR: Phone ${mobile} score exception`, JSON.stringify(error, null, 0));
        return Promise.reject(error)
    })
    .then(response => {
        const {status} = response
        if(status.code === 300) {
            // Transaction successfully completed
            console.log(`Phone ${mobile} score`, JSON.stringify(response, null, 0))
            return Promise.resolve(response)
        }
        console.error(`ERROR: Phone ${mobile} score`, JSON.stringify(response, null, 0))
        return Promise.reject(response)
    })
}


function verifySms({mobile, confirmation_code, ip}) {
    // https://developer.telesign.com/v2.0/docs/rest_api-verify-sms
    const f = {
        phone_number: mobile,
        language: 'en-US',
        ucid: use_case_code,
        verify_code: confirmation_code,
        template: '$$CODE$$ is your Steemit confirmation code',
    }
    if(ip) f.originating_ip = ip
    const fields = urlencode(f)
    // console.log('fields', fields) // logspam

    const resource = '/v1/verify/sms'
    const method = 'POST'
    return fetch(
        'https://rest.telesign.com' + resource, {
            method,
            body: fields,
            headers: authHeaders({resource, method, fields})
        }
    )
    .then(r => r.json())
    .catch(error => {
        console.error(`ERROR: SMS failed to ${mobile} code ${confirmation_code} req ip ${ip} exception`, JSON.stringify(error, null, 0));
        return Promise.reject(error)
    })
    .then(response => {
        const {status} = response
        if(status.code === 290) {
            // Message in progress
            console.log(`Sent SMS to ${mobile} code ${confirmation_code}`, JSON.stringify(response, null, 0))
            return Promise.resolve(response)
        }
        console.error(`ERROR: SMS failed to ${mobile} code ${confirmation_code}:`, JSON.stringify(response, null, 0))
        return Promise.reject(response)
    })
}

/**
    @arg {string} resource `/v1/verify/AEBC93B5898342F790E4E19FED41A7DA`
    @arg {string} method [GET|POST|PUT]
    @arg {string} fields url query string
*/
function authHeaders({
    resource,
    fields,
    method = 'GET',
}) {
    const auth_method = 'HMAC-SHA256'
    const currDate = new Date().toUTCString()
    const nonce = parseInt(secureRandom.randomBuffer(8).toString('hex'), 16).toString(36)

    let content_type = ''
    if(/POST|PUT/.test(method))
        content_type = 'application/x-www-form-urlencoded'

    let strToSign = `${method}\n${content_type}\n\nx-ts-auth-method:${auth_method}\nx-ts-date:${currDate}\nx-ts-nonce:${nonce}`

    if(fields) {
        strToSign += '\n' + fields
    }
    strToSign += '\n' + resource

    // console.log('strToSign', strToSign) // logspam
    const sig = crypto.createHmac('sha256', api_key).update(strToSign, 'utf8').digest('base64')

    const headers = {
        Authorization: `TSA ${customer_id}:${sig}`,
        'Content-Type': content_type,
        'x-ts-date': currDate,
        'x-ts-auth-method': auth_method,
        'x-ts-nonce': nonce
    }
    return headers
}

const urlencode = json =>
    Object.keys(json).map(
        key => encodeURI(key) + '=' + encodeURI(json[key])
    ).join('&')
