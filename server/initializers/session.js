var crypto = require('crypto')
const { upgradeInitializer, upgradeMiddleware } = require('../utils/upgrade')

module.exports = upgradeInitializer('ah17', {
  name: 'session',
  initialize: function (api, next) {
    const redis = api.redis.clients.client

    api.session = {
      prefix: 'session2:',
      ttl: 60 * 60 * 24, // 1 day

      load: function (connection, callback) {
        var key = api.session.prefix + connection.fingerprint
        redis.get(key, function (error, data) {
          if (error) {
            return callback(error)
          } else if (data) {
            return callback(null, JSON.parse(data))
          } else {
            return callback(null, false)
          }
        })
      },

      create: function (connection, user, callback) {
        var key = api.session.prefix + connection.fingerprint

        crypto.randomBytes(64, function (ex, buf) {
          var csrfToken = buf.toString('hex')

          var sessionData = {
            userId: user.id,
            csrfToken: csrfToken,
            sesionCreatedAt: new Date().getTime(),
            user: user
          }

          user.update({ lastLoginAt: new Date() }).then(function () {
            redis.set(key, JSON.stringify(sessionData), function (error, data) {
              if (error) {
                return callback(error)
              }
              redis.expire(key, api.session.ttl, function (error) {
                callback(error, sessionData)
              })
            })
          }).catch(callback)
        })
      },

      destroy: function (connection, callback) {
        var key = api.session.prefix + connection.fingerprint
        redis.del(key, callback)
      },

      middleware: {
        session: {
          name: 'session',
          global: true,
          priority: 20,
          preProcessor: function (data, next) {
            api.session.load(data.connection, function (error, sessionData) {
              // if we have a session load check it and store it
              if (!error && sessionData) {
                var csrfToken = data.connection.rawConnection.req
                  ? data.connection.rawConnection.req.headers['x-sb-csrf-token'] || data.params.csrfToken
                  : data.params.csrfToken

                if (!csrfToken || csrfToken !== sessionData.csrfToken) {
                  data.csrfError = true
                  return next()
                }

                data.session = sessionData
                var key = api.session.prefix + data.connection.fingerprint
                redis.expire(key, api.session.ttl, function (error) {
                  if (error) { api.log('redis error', 'error', error) }
                  next(error)
                })
              } else {
                if (error) { api.log('redis error', 'error', error) }
                // no session - moving on
                return next()
              }
            })
          }
        },
        auth: {
          name: 'auth',
          global: false,
          priority: 2000,
          preProcessor: function (data, next) {
            if (!data.session) {
              data.connection.rawConnection.responseHttpCode = 401
              return next(new Error('Please log in to continue'))
            }
            next()
          }
        },
        admin: {
          name: 'admin',
          global: false,
          priority: 3000,
          preProcessor: function (data, next) {
            if (!data.session) {
              data.connection.rawConnection.responseHttpCode = 401
              return next(new Error('Please log in to continue'))
            }
            if (!data.session.user.isAdmin) {
              data.connection.rawConnection.responseHttpCode = 403
              return next(new Error('Admin required'))
            }

            return next()
          }
        },
        owner: {
          name: 'owner',
          global: false,
          priority: 3000,
          preProcessor: function (data, next) {
            if (!data.session) {
              data.connection.rawConnection.responseHttpCode = 401
              return next(new Error('Please log in to continue'))
            }
            if (!data.session.user.isAdmin) {
              if (data.params.id === 'me' || parseInt(data.params.id) === data.session.userId) {
                data.params.id = data.session.userId
                next()
              } else {
                data.connection.rawConnection.responseHttpCode = 403
                return next(new Error('Admin required'))
              }
            } else {
              return next()
            }
          }
        }
      }
    }

    api.actions.addMiddleware(upgradeMiddleware('ah17', api.session.middleware.session))
    api.actions.addMiddleware(upgradeMiddleware('ah17', api.session.middleware.auth))
    api.actions.addMiddleware(upgradeMiddleware('ah17', api.session.middleware.admin))
    api.actions.addMiddleware(upgradeMiddleware('ah17', api.session.middleware.owner))

    api.params.globalSafeParams.push('csrfToken')

    next()
  },

  start: function (api, next) {
    next()
  },

  stop: function (api, next) {
    next()
  }
})
