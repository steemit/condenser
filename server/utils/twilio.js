import Twilio from 'twilio';
import config from 'config';

const accountSid = config.twilio.account_sid;
const authToken = config.twilio.auth_token;
const senderId = config.twilio.sender_id;
let client;

function checkEligibility(phone) {
    // US, Canada +1
    // France +33
    // Spain +34
    // Italy +39
    // UK +44
    // Sweden +46
    // Germany +49
    // Mexico +52
    // Australia +61
    // Phillipines +63
    // Singapore +65
    // Turkey +90
    // Hong Kong +852
    // Israel +972

    for(const prefix of ['1', '33', '34', '39', '44', '46', '49', '52', '61', '63', '65', '90', '852', '972']) {
        if (phone.startsWith(prefix)) return true;
    }
    return false;
}

export default function sendVerifySMS(phone, confirmation_code) {
  if (process.env.NODE_ENV !== 'production') {
    console.log(`send sms message to: <${phone}> <${confirmation_code}> (not sent due to not production env)`);
    return new Promise(resolve => {resolve()});
  }
  if (!client) client = new Twilio(accountSid, authToken);
  return new Promise(resolve => {
    client.messages.create({
      from: senderId,
      to: phone,
      body: 'GOLOS confirmation code: ' + confirmation_code
    }, function(error, result) {
      if (error) {
        console.error('Twilio error', JSON.stringify(error, null, 2));
        resolve('error');
      }
      else {
        console.log('Twilio send message to', phone, 'with confirmation_code', confirmation_code, 'result.sid', result.sid);
        resolve(result.sid);
      }
    });
  });
}
