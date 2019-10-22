/**
 * Created by groupsky on 23.03.16.
 */
const { upgradeInitializer } = require('../utils/upgrade')

module.exports = upgradeInitializer('ah17', {
  loadPriority: 500,
  initialize: function (api, next) {
    var raven = require('raven')
    api.raven = new raven.Client(api.config.raven.dsn, api.config.raven.options)
    if (api.config.raven.dsn) {
      api.log('Raven initialized with', 'info', api.config.raven)
      api.raven.patchGlobal()

      this.initLogging(api)
      this.initMiddleware(api)
    } else {
      api.log('Raven is not enabled. Set SENTRY_DSN env to enable')
    }

    next()
  },
  initLogging: function (api) {
    api.raven.on('logged', function () {
      api.log('Raven logged', 'debug')
    })
    api.raven.on('error', function (e) {
      api.log('Raven error', 'error', e)
    })
  },
  initMiddleware: function (api) {
    var ravenParsers = require('raven/lib/parsers')

    api.raven.middleware = {
      action: {
        name: 'raven:middleware:action',
        global: true,
        priority: 1,
        preProcessor: function (data, next) {
          try {
            next()
          } catch (err) {
            api.log('Exception during ' + data.action, 'crit', err)

            try {
              api.raven.captureException(err, ravenParsers.parseRequest(data.connection.rawConnection.req, {
                extra: {
                  action: data.action,
                  params: data.params,
                  missingParams: data.missingParams,
                  validatorErrors: data.validatorErrors
                }
              }), function () {
                next(err)
              })
            } catch (e) {
              api.raven.captureException(e)
            }
          }
        }
      }
    }

    api.actions.addMiddleware(api.raven.middleware.action)
  }
})
