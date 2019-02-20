import config from 'config';
import TeleSignSDK from 'telesignsdk';

const timeout = 10 * 1000;
const customerId = config.get('telesign.customer_id');
const rest_endpoint = 'https://rest-api.telesign.com'; // TODO: If enterprise account, change this!

let apiKey = '';
if (config.get('telesign.rest_api_key')) {
  apiKey = new Buffer(config.get('telesign.rest_api_key'), 'base64');
}

const client = new TeleSignSDK(
  customerId,
  apiKey,
  rest_endpoint,
  timeout // optional
);

const accountLifeCycleEvent = 'create';

function getScore(phoneNumber) {
  return new Promise((resolve, reject) => {
    client.score.score(
      (err, res) => {
        if (err) {
          console.log(err);
          reject(err);
        } else {
          console.log(res);
          resolve(res);
        }
      },
      phoneNumber,
      accountLifeCycleEvent
    );
  });
}

function verifySms(phoneNumber, confirmCode) {
  const message = `${confirmCode} is your Knowledgr confirmation code`;
  const messageType = 'ARN';

  console.log(message);

  return new Promise((resolve, reject) => {
    client.sms.message(
      (err, res) => {
        if (err) {
          console.log(err);
          reject(err);
        } else {
          console.log(res);
          resolve(res);
        }
      },
      phoneNumber,
      message,
      messageType
    );
  });
}

export default function* verify({
  mobile,
  confirmation_code,
  ip,
  ignore_score,
}) {
  try {
    const result = yield getScore(mobile);
    const { recommendation, score } = result.risk;
    let phoneNumber = mobile;

    if (!ignore_score && (!score || score > 600)) {
      console.log(
        `TeleSign did not allow phone ${mobile} ip ${ip}. TeleSign responded: ${
          recommendation
        }`
      );
      return {
        error:
          'Unable to verify your phone number. Please try a different phone number.',
        score,
      };
    }
    if (
      result.numbering &&
      result.numbering.cleansing &&
      result.numbering.cleansing.sms
    ) {
      const sms = result.numbering.cleansing.sms;
      phoneNumber = sms.country_code + sms.phone_number;
    }
    console.log('confirmaition code:', confirmation_code);
    const { reference_id } = yield verifySms(phoneNumber, confirmation_code);
    console.log(reference_id);
    return { reference_id, score, phone: phoneNumber };
  } catch (error) {
    console.log('-- verify score error -->', error);
    return { error: 'Unable to verify phone, please try again later.' };
  }
}
