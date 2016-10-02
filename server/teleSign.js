import fetch from 'node-fetch';
import config from '../config';
import crypto from 'crypto'

const {customer_id} = config.telesign
const api_key = new Buffer(config.telesign.rest_api_key, 'base64')

export function verifySms({mobile, confirmation_code, ip}) {
    // https://developer.telesign.com/v2.0/docs/rest_api-verify-sms
    const f = {
        phone_number: mobile,
        language: 'en-US',
        verify_code: confirmation_code,
        template: 'Your code is $$CODE$$',
    }
    if(ip) f.originating_ip = ip
    const fields = urlencode(f)

    const resource = '/v1/verify/sms'
    const method = 'POST'
    return fetch(
        'https://rest.telesign.com' +
        resource, {
            method,
            body: fields,
            headers: authHeaders({resource, method, fields})
        }
    )
    .then(r => r.json())
    .then(response => {
        const {status} = response
        if(status.code === 290) {
            // Message in progress
            console.log(`Sent SMS to ${mobile} code ${confirmation_code}`)
            return Promise.resolve()
        }
        console.error(`ERROR: SMS to ${mobile} code ${confirmation_code}:`, response)
        return Promise.reject(response)
    })
    .catch(error => {
        console.error(`SMS failed to ${mobile} code ${confirmation_code} req ip ${ip}`, error);
        return Promise.reject(error)
    });
}

/**
    @arg {string} resource `/v1/verify/AEBC93B5898342F790E4E19FED41A7DA`
    @arg {string} method [GET|POST|PUT]
    @arg {string} fields url query string
*/
function authHeaders({
    resource,
    method = 'GET',
    fields = {}
}) {
    const auth_method = 'HMAC-SHA256'
    const currDate = new Date().toUTCString()
    const nonce = Math.random().toString(36).slice(15)

    let content_type = ''
    if(/POST|PUT/.test(method))
        content_type = 'application/x-www-form-urlencoded'

    let strToSign = `${method}\n${content_type}\n\nx-ts-auth-method:${auth_method}\nx-ts-date:${currDate}\nx-ts-nonce:${nonce}`

    if(fields) {
        strToSign += '\n' + fields
    }
    strToSign += '\n' + resource

    const sig = crypto.createHmac('sha256', api_key).update(strToSign, 'utf8').digest('base64')

    const headers = {
        Authorization: `TSA ${customer_id}:${sig}`,
        'Content-Type': content_type,
        'x-ts-date': currDate,
        'x-ts-auth-method': auth_method,
        'x-ts-nonce': nonce
    }
    // console.log('headers', headers)
    return headers
}

const urlencode = json =>
    Object.keys(json).map(
        key => encodeURI(key) + '=' + encodeURI(json[key])
    ).join('&')
