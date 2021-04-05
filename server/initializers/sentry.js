const { Initializer, api } = require('actionhero')
const Sentry = require('@sentry/node')

module.exports = class SentryInit extends Initializer {
  constructor () {
    super()
    this.name = 'sentry'
    this.loadPriority = 500
  }

  async initialize () {
    if (api.config.sentry.dsn) {
      Sentry.init({ dsn: api.config.sentry.dsn })

      api.log('Sentry initialized with', 'info', api.config.sentry)

      // create a custom error reporter that sends error to sentry
      const sentryErrorReporter = function (err, type, name, objects, severity) {
        Sentry.captureException(err)
      }

      // add custom reporter
      api.exceptionHandlers.reporters.push(sentryErrorReporter)
    } else {
      api.log('Sentry is not enabled. Set SENTRY_DSN env to enable')
    }
  }
}
