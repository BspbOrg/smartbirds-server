const { upgradeMiddleware } = require('../utils/upgrade')
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

      this.initMiddleware()
    } else {
      api.log('Sentry is not enabled. Set SENTRY_DSN env to enable')
    }
  }

  initMiddleware () {
    api.actions.addMiddleware(upgradeMiddleware('ah17', {
      name: 'sentry:middleware:action',
      global: true,
      priority: 1,
      preProcessor: function (data, next) {
        try {
          next()
        } catch (err) {
          api.log('Exception during ' + data.action, 'crit', err)
          Sentry.captureException(err)
        }
      }
    }))
  }
}
