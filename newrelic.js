'use strict'

/**
 * New Relic agent configuration.
 *
 * See lib/config.default.js in the agent distribution for a more complete
 * description of configuration variables and their potential values.
 */

var license_key = require('config').get('newrelic');

exports.config = {
  /**
   * Array of application names.
   */
  app_name: ['condenser'],
  /**
   * Your New Relic license key.
   */
  license_key: license_key,
  logging: {
    /**
     * Level at which to log. 'trace' is most useful to New Relic when diagnosing
     * issues with the agent, 'info' and higher will impose the least overhead on
     * production applications.
     */
    level: 'info'
  }
}
