import koa_router from 'koa-router';
import koa_body from 'koa-body';
import models from 'db/models';
import config from 'config';
import {esc, escAttrs} from 'db/models';
import {getRemoteIp, rateLimitReq, checkCSRF} from '../utils';
import destinationBtcAddress from 'shared/icoAddress'
import coRequest from 'co-request'
import {getLogger} from '../../app/utils/Logger'
import Apis from 'shared/api_client/ApiInstances';

const cypherToken = config.blockcypher_token
const print = getLogger('API - ico').print

export default function useIcoApi(app) {
  const router = koa_router();
  app.use(router.routes());
  const koaBody = koa_body();

  router.get('/api/v1/get_golos_current_supply', function * () {
    try {
      const data = yield Apis.instance().db_api.exec( 'get_dynamic_global_properties', []);
      this.body = data.current_supply.split(' ')[0];
    } catch (error) {
        console.error('Error in /api/v1/get_current_supply', error);
        this.body = JSON.stringify({
            error: error.message
        });
        this.status = 500;
    }
  })

  router.get('/api/v1/get_gbg_current_supply', function * () {
    try {
      const data = yield Apis.instance().db_api.exec( 'get_dynamic_global_properties', []);
      this.body = data.current_sbd_supply.split(' ')[0];
    } catch (error) {
        console.error('Error in /api/v1/get_gbg_current_supply', error);
        this.body = JSON.stringify({
            error: error.message
        });
        this.status = 500;
    }
  })

  router.get('/api/v1/get_raised_amounts', function * () {
    let responce = this;
    try {
      const data = yield models.List.findAll({kk: {$like:"icoBalance_Nov"}});
      this.body = JSON.stringify({status: 'ok', data: data});
    } catch (error) {
        console.error('Error in /get_raised_amounts api call', this.session.uid, error.toString());
        this.body = JSON.stringify({
            error: error.message
        });
        this.status = 500;
    }

  });


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
