import 'whatwg-fetch';
import config from '../config';

export default function sendMobile({mobile, confirmation_code, ip}) {
    const {customer_id, rest_api_key} = config.telesign

    // https://developer.telesign.com/v2.0/docs/rest_api-verify-sms
    return fetch({
        method: 'POST',
        path: 'https://rest.telesign.com/v1/verify/sms',
        mode: 'no-cors',
        credentials: 'same-origin',
        headers: {
            Accept: 'application/json',
            'Content-type': 'application/json'
        },
        body: JSON.stringify({
            phone_number: mobile,
            ucid,
            originating_ip: ip,
            language: 'en-US',
            verify_code: confirmation_code,
            template: 'Your code is $$CODE$$',
        })
    })
    .then(response => {
        console.log(`sms sent to ${mobile} code ${confirmation_code} req ip ${ip}`, response);
    })
    .catch(error => {
        console.error(`sms failed to ${mobile} code ${confirmation_code} req ip ${ip}`, error);
    });
}
