import koa_router from 'koa-router';
import koa_body from 'koa-body';
import http from 'http';
import config from 'config';
import {CURRENCIES} from 'app/client_config';

let oxrates = {};

function ratesRoutes(app) {
  const router = koa_router({prefix: '/api/v1/rates'});
  app.use(router.routes());

  router.get('/', function* () {
    this.body = oxrates;
    checkRates();
  });
}

/*
{
  "disclaimer": "Usage subject to terms: https://openexchangerates.org/terms",
  "license": "https://openexchangerates.org/license",
  "timestamp": 1509620399,
  "base": "USD",
  "rates": {
    "BYN": 1.975378,
    "CNY": 6.610256,
    "EUR": 0.858534,
    "GEL": 2.552029,
    "KZT": 334.96,
    "RUB": 58.2256,
    "UAH": 26.888392,
    "USD": 1
  }
}
*/
function checkRates() {
  const now = new Date().getTime() / 1000;
  if (
    typeof oxrates === 'object' &&
    typeof oxrates.rates === 'object' &&
    typeof oxrates.rates.XAU === 'number' &&
    typeof oxrates.timestamp === 'number' &&
    Math.round((now - oxrates.timestamp) / 60) < 240
  ) {
    return;
  }
  http.get({
    host: 'openexchangerates.org',
    path: '/api/latest.json?symbols=XAU,'
      + CURRENCIES.join(',')
      + '&app_id='
      + config.get('openexchangerates_app_id'),
    method: 'GET'
  }, function(res) {
    res.setEncoding('utf-8');
    res.on('data', function(stuff) {
      var parsed = {};
      try {
        oxrates = JSON.parse(stuff);
      } catch(e) {
        new Error('The result is broken. Unexpected some token in JSON');
      }
    });
  }).on('error', function(err){
    new Error('fetchRates an error', err);
  });
};

module.exports = {
  ratesRoutes
};
