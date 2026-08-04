const { boolEnv, intEnv } = require('../helpers/envParse')

exports.default = {
  statsd: function (api) {
    return {
      // Off by default: emission is opt-in per deployment. Infra flips this on
      // and points STATSD_HOST at the Telegraf sidecar.
      enabled: boolEnv('STATSD_ENABLED', false),

      // DogStatsD/Telegraf endpoint. App default is localhost; infra sets this
      // to the Telegraf service name (e.g. `telegraf`).
      host: process.env.STATSD_HOST || 'localhost',

      // UDP port Telegraf's statsd input listens on (DogStatsD default 8125).
      port: intEnv('STATSD_PORT', 8125, { min: 1, max: 65535 })
    }
  }
}
