/**
 * New Relic agent configuration.
 *
 * See lib/config.defaults.js in the agent distribution for a more complete
 * description of configuration variables and their potential values.
 */

var config = require('./config.js');

if(config.core.newrelic.key) exports.config = {
  /**
   * Array of application names.
   */
  app_name : config.core.newrelic.name || "Scrollback local",
  /**
   * Your New Relic license key.
   */
  license_key : config.core.newrelic.key,
  logging : {
    /**
     * Level at which to log. 'trace' is most useful to New Relic when diagnosing
     * issues with the agent, 'info' and higher will impose the least overhead on
     * production applications.
     */
    level : 'trace'
  }
};
