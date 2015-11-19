var crypto = require('crypto');

module.exports = {
  initialize: function (api, next) {

    api.session = {
      prefix: 'session:',
      ttl: 60 * 60 * 24, // 1 day

      load: function (connection, callback) {
        var key = api.session.prefix + connection.fingerprint;
        api.redis.client.get(key, function (error, data) {
          if (error) {
            return callback(error);
          }
          else if (data) {
            return callback(null, JSON.parse(data));
          }
          else {
            return callback(null, false);
          }
        });
      },

      create: function (connection, user, callback) {
        var key = api.session.prefix + connection.fingerprint;

        crypto.randomBytes(64, function (ex, buf) {
          var csrfToken = buf.toString('hex');

          var sessionData = {
            userId: user.id,
            csrfToken: csrfToken,
            sesionCreatedAt: new Date().getTime(),
            user: user
          };

          user.update({lastLoginAt: new Date()}).then(function () {
            api.redis.client.set(key, JSON.stringify(sessionData), function (error, data) {
              if (error) {
                return callback(error);
              }
              api.redis.client.expire(key, api.session.ttl, function (error) {
                callback(error, sessionData);
              });
            });
          }).catch(callback);
        });
      },

      destroy: function (connection, callback) {
        var key = api.session.prefix + connection.fingerprint;
        api.redis.client.del(key, callback);
      },

      middleware: {
        session: {
          name: 'session',
          global: true,
          priority: 1000,
          preProcessor: function (data, next) {
            api.session.load(data.connection, function (error, sessionData) {
              // if we have a session load check it and store it
              if (!error && sessionData) {
                var csrfToken = data.connection.rawConnection.req && data.connection.rawConnection.req.headers['x-sb-csrf-token'] || data.params.csrfToken;

                if (!csrfToken || csrfToken != sessionData.csrfToken) {
                  data.csrfError = true;
                  return next();
                }

                data.session = sessionData;
                var key = api.session.prefix + data.connection.fingerprint;
                api.redis.client.expire(key, api.session.ttl, function (error) {
                  if (error)
                    console.error('redis error', error);
                  next(error);
                });
              } else {
                // no session - moving on
                return next();
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
              return next(new Error('Please log in to continue'));
            }
            next();
          }
        },
        admin: {
          name: 'admin',
          global: false,
          priority: 3000,
          preProcessor: function (data, next) {
            if (!data.session) {
              return next(new Error('Please log in to continue'));
            }
            if (!data.session.user.isAdmin) {
              return next(new Error('Admin required'));
            }

            return next();
          }
        },
        owner: {
          name: 'owner',
          global: false,
          priority: 3000,
          preProcessor: function (data, next) {
            if (!data.session) {
              return next(new Error('Please log in to continue'));
            }
            if (!data.session.user.isAdmin) {
              if (data.params.id === 'me' || data.params.id == data.session.userId) {
                data.params.id = data.session.userId;
                next();
              } else {
                return next(new Error('Admin required'));
              }
            } else {
              return next();
            }
          }
        }
      }
    };

    api.actions.addMiddleware(api.session.middleware.session);
    api.actions.addMiddleware(api.session.middleware.auth);
    api.actions.addMiddleware(api.session.middleware.admin);
    api.actions.addMiddleware(api.session.middleware.owner);

    api.params.globalSafeParams.push('csrfToken');

    next();
  },

  start: function (api, next) {
    next();
  },

  stop: function (api, next) {
    next();
  }
};
