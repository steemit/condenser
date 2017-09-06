var http = require('http');

var exports = module.exports = {};

/**
 * Gets currency rates information as an object or array of objects in one request.
 *
 * @function
 * @static
 * @param {string | string[]} symbols - A string or array of strings
 * of the pairs to get information on.
 * @param {getCallback} cb - The calback that will be executed when
 * the request is processed.
 * @example
 * rates.getRates('USDEUR', function(err, result) {
 *    { id: 'USDEUR',
 *      Name: 'USD to EUR',
 *      Rate: '0.891',
 *      Date: '2/27/2015',
 *      Time: '10:56am',
 *      Ask: '0.891',
 *      Bid: '0.8909' }
 * });
 * @example
 * rates.getRates(['USDEUR'], function(err, result) {
 *    // Output
 *    [ { id: 'USDEUR',
 *       Name: 'USD to EUR',
 *       Rate: '0.8935',
 *       Date: '2/27/2015',
 *       Time: '12:07pm',
 *       Ask: '0.8935',
 *       Bid: '0.8935' } ]
 * });
 */
 var getRates = exports.getRates = function(symbols, cb) {
  if (!(Array.isArray(symbols) || typeof symbols === 'string')) {
    return cb(new TypeError('Invalid parameter types supplied.'), null);
  }
  if ((Array.isArray(symbols) && symbols.length < 1) || (typeof symbols === 'string' && symbols.length != 6)) {
    return cb(new Error('Invalid parameter lengths'), null);
  }
  if (Array.isArray(symbols)) {
    for (var i = 0; i < symbols.length; i++) {
      if (typeof symbols[i] !== 'string' || symbols[i].length != 6) {
        return cb(new Error('Invalid symbol type or length in symbol array'), null);
      }
    }
  }
  if (typeof symbols === 'string'){
    var query = symbols;
  } else if (Array.isArray(symbols)) {
    var query = symbols.join('%2C');
  }
  var options = {
    host: 'query.yahooapis.com',
    path: '/v1/public/yql?q=select%20*%20from%20yahoo.finance.xchange%20where%20pair%3D%22'
        + query +'%22&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys',
    method: 'GET'
  };
  http.get(options, function(res) {
    res.setEncoding('utf-8');
    res.on('data', function(stuff) {
      var parsed = {};
      try {
        parsed = JSON.parse(stuff);
      } catch(e) {
        return cb(new Error('The result is broken. Unexpected some token in JSON'), null);
      }
      if (parsed.error) {
        return cb(new Error('The result is undefined. Make sure that you are using correct currency symbols'), null);
      }
      var vals = parsed.query.results.rate;
      if (typeof vals == 'object' && vals.Name == 'N/A') {
        return cb(new Error('The result is undefined. Make sure that you are using correct currency symbols'), null);
      } else if (Array.isArray(vals)) {
        for (var i = 0; i < vals.length; i++) {
          if (vals[i].Name == 'N/A') {
            cb(new Error('The result is undefined. Make sure that you are using correct currency symbols'), null);
          }
        }
      }
      return cb(null, parsed.query.results.rate);
    });
  }).on('error', function(err){
    return cb(err, null);
  });
};
