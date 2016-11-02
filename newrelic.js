'use strict'
import config from './config'
const newrelic = config.newrelic || {};

/**
 * New Relic agent configuration.
 *
 * See lib/config.defaults.js in the agent distribution for a more complete
 * description of configuration variables and their potential values.
 */
exports.config = {
  /**
   * Array of application names.
   */
  app_name: newrelic.app_name || ['Golos.io'],
  /**
   * Your New Relic license key.
   */
  license_key: newrelic.license_key,
  logging: {
    /**
     * Level at which to log. 'trace' is most useful to New Relic when diagnosing
     * issues with the agent, 'info' and higher will impose the least overhead on
     * production applications.
     */
    level: newrelic.log_level || 'info'
  }
}
