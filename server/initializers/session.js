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
            sesionCreatedAt: new Date().getTime()
          };

          user.updateAttributes({lastLoginAt: new Date()}).then(function () {
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
        'logged-in-session': {
          name: 'logged-in-session',
          global: false,
          priority: 1000,
          preProcessor: function (data, callback) {
            api.session.load(data.connection, function (error, sessionData) {
              if (error) {
                return callback(error);
              }

              if (!sessionData) {
                return callback(new Error('Please log in to continue'));
              }

              var csrfToken = data.connection.rawConnection.req.headers['x-sb-csrf-token'] || data.params.csrfToken;

              if (!csrfToken || csrfToken != sessionData.csrfToken) {
                return callback(new Error('CSRF error'));
              }

              data.session = sessionData;
              var key = api.session.prefix + data.connection.fingerprint;
              api.redis.client.expire(key, api.session.ttl, callback);
            });
          }
        }
      }
    };

    api.actions.addMiddleware(api.session.middleware['logged-in-session']);

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
