'use strict'

const uuid = require('uuid')

/**
 * Generates a unique request ID for all requests. It will also set the `X-Request-Id` header.
 *
 * @example
 *   ctx.headers
 *   // { `x-request-id`: '72243aca-e4bb-4a3a-a2e7-ed380c256826' }
 * @returns {Promise}
 */
module.exports = function xRequestId () {
  return function * (next) {
    this.set('X-Request-Id', uuid.v4())
    yield next
  }
}
