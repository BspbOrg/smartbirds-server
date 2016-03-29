exports.sessionCreate = {
  name: 'session:create',
  description: 'session:create',
  outputExample: {},
  middleware: [],

  inputs: {
    email: {required: true},
    password: {required: true}
  },

  run: function (api, data, next) {
    data.response.success = false;
    console.log('searching user');
    api.models.user.findOne({where: {email: data.params.email}}).then(function (user) {
        if (!user) {
          return next(new Error('user not found'));
        }
        console.log('checking password');
        user.checkPassword(data.params.password, function (error, match) {
          if (error) {
            return next(error);
          }
          else if (!match) {
            return next(new Error('password does not match'));
          }
          else {
            api.session.create(data.connection, user, function (error, sessionData) {
              if (error) {
                return next(error);
              }
              data.response.user = user.apiData(api);
              data.response.success = true;
              data.response.csrfToken = sessionData.csrfToken;
              next();
            });
          }
        });
      })
      .catch(function (error) {
        console.error('sequelize error: ', error);
        next(error);
      });
  }
};

exports.sessionDestroy = {
  name: 'session:destroy',
  description: 'session:destroy',
  outputExample: {},

  inputs: {},

  run: function (api, data, next) {
    data.response.success = true;
    api.session.destroy(data.connection, next);
  }
};

exports.sessionCheck = {
  name: 'session:check',
  description: 'session:check',
  outputExample: {},

  inputs: {},

  run: function (api, data, next) {
    data.response.req = {
      headers: data.connection.rawConnection.req.headers,
      params: data.params,
      cookies: data.connection.rawConnection.cookies
    };
    api.session.load(data.connection, function (error, sessionData) {
      if (error) {
        return next(error);
      }
      else if (!sessionData) {
        data.connection.rawConnection.responseHttpCode = 401;
        return next(new Error('Please log in to continue'));
      } else {
        api.models.user.findOne({where: {id: sessionData.userId}}).then(function (user) {
          if (!user) {
            data.connection.rawConnection.responseHttpCode = 404;
            return next(new Error('user not found'));
          }
          data.response.user = user.apiData(api);
          data.response.csrfToken = sessionData.csrfToken;
          data.response.success = true;
          next();
        }).catch(next);
      }
    });
  }
};

exports.sessionWSAuthenticate = {
  name: 'session:wsAuthenticate',
  description: 'session:wsAuthenticate',
  outputExample: {},
  blockedConnectionTypes: ['web'],

  inputs: {},

  run: function (api, data, next) {
    api.session.load(data.connection, function (error, sessionData) {
      if (error) {
        return next(error);
      }
      else if (!sessionData) {
        return next(new Error('Please log in to continue'));
      } else {
        data.connection.authorized = true;
        data.response.authorized = true;
        next();
      }
    });
  }
};
