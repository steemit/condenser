import koa_router from 'koa-router';
import koa_body from 'koa-body';
import models from 'db/models';
import config from 'config';
import {esc, escAttrs} from 'db/models';
import {getRemoteIp, rateLimitReq, checkCSRF} from '../utils';
import destinationBtcAddress from 'shared/icoAddress'
import coRequest from 'co-request'
import {getLogger} from '../../app/utils/Logger'
const cypherToken = config.blockcypher_token
const print = getLogger('API - ico').print

export default function useIcoApi(app) {
  const router = koa_router();
  app.use(router.routes());
  const koaBody = koa_body();

  router.get('/api/v1/get_raised_amounts', function * () {
    console.log("HERE");
    this.body = JSON.stringify({status: 'ok', 'Nov_09': 1, 'Nov_10': 2, 'Nov_11': 3});
  })

  router.post('/api/v1/generate_ico_address', koaBody, function * () {
    console.log(destinationBtcAddress);
    if (rateLimitReq(this, this.req))
      return;

    const params = this.request.body;
    const {csrf} = typeof(params) === 'string'
    ? JSON.parse(params)
    : params;
    if (!checkCSRF(this, csrf))
      return;
    const cypher = yield coRequest(`https://api.blockcypher.com/v1/btc/main/payments?token=${cypherToken}`, {
      method: 'post',
      headers: {
        Accept: 'application/json',
        'Content-type': 'application/json'
      },
      body: JSON.stringify({"destination": destinationBtcAddress})
    });
    try {
      let cypherParsed = JSON.parse(cypher.body);
      print('blockcypher generated payment forwarding address', cypherParsed);
      const icoAddress = cypherParsed.input_address;
      this.body = JSON.stringify({status: 'ok', icoAddress: icoAddress});
    } catch (error) {
      console.error(error);
      this.body = JSON.stringify({status: "error", error: error.message});
      this.status = 500;
    }
  });
}
