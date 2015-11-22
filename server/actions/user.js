var _ = require('lodash');

exports.userCreate = {
  name: 'user:create',
  description: 'user:create',
  outputExample: {},
  middleware: [],

  inputs: {
    email: {required: true},
    password: {required: true},
    firstName: {required: true},
    lastName: {required: true},
    isAdmin: {default: false}
  },

  run: function (api, data, next) {
    var user = api.models.user.build(data.params, this.inputs);
    user.isAdmin = !!(data.session && data.session.user.isAdmin && data.params.isAdmin);
    user.lastLoginAt = null;
    user.imported = false;
    user.updatePassword(data.params.password, function (error) {
      if (error) {
        return next(error);
      }

      user.save()
        .then(function (userObj) {
          data.response.data = userObj.apiData(api);
          next();
        })
        .catch(function (error) {
          console.error('userCreate error:', error);
          next(error && error.error && Array.isArray(error.error) && error.error[0].message || error);
        });
    });
  }
};

exports.userLost = {
  name: 'user:lost',
  description: 'user:lost',
  inputs: {
    email: {required: true}
  },
  run: function (api, data, next) {
    api.models.user.findOne({where: {email: data.params.email}}).then(function (user) {
        if (!user) {
          data.connection.rawConnection.responseHttpCode = 404;
          return next(new Error('user not found'));
        }

        user.genPasswordToken(function (error, passwordToken) {
          if (error) return next(error);

          api.tasks.enqueue("mail:send", {
            mail: {to: user.email, subject: "Password recovery"},
            template: "lost_password",
            locals: {passwordToken: passwordToken}
          }, 'default', function(error, toRun) {
            if(error) return next(error);
            console.log('toRun: ', toRun);

            data.response.data = {success: toRun};
            next();
          });
        });
      })
      .catch(next)
    ;
  }
};

exports.userView = {
  name: 'user:view',
  description: 'user:view',
  outputExample: {},
  middleware: ['auth', 'owner'],

  inputs: {
    id: {required: true}
  },

  run: function (api, data, next) {
    api.models.user.findOne({where: {id: data.params.id}}).then(function (user) {
        if (!user) {
          data.connection.rawConnection.responseHttpCode = 404;
          return next(new Error('user not found'));
        }

        data.response.data = user.apiData(api);
        next();
      })
      .catch(next)
    ;
  }
};

exports.userEdit = {
  name: 'user:edit',
  description: 'user:edit',
  outputExample: {},
  middleware: ['auth', 'owner'],

  inputs: {
    id: {required: true},
    email: {required: false},
    password: {required: false},
    firstName: {required: false},
    lastName: {required: false},
    isAdmin: {required: false}
  },

  run: function (api, data, next) {
    api.models.user.findOne({where: {id: data.params.id}}).then(function (user) {
        if (!user) {
          data.connection.rawConnection.responseHttpCode = 404;
          return next(new Error('user not found'));
        }
        //if (data.params.password) {
        //  user.updatePassword(data.params.password, function (error) {
        //    if (error) {
        //      return callback(error);
        //    }
        //    user.save().then(function () {
        //      next();
        //    }).catch(next);
        //  });
        //}
        user.apiUpdate(data.params);
        if (data.session.user.isAdmin && 'isAdmin' in data.params)
          user.isAdmin = data.params.isAdmin;
        user.save().then(function () {
          data.response.data = user.apiData(api);
          next();
        }).catch(next);
      })
      .catch(next)
    ;
  }
};

exports.userList = {
  name: "user:list",
  description: "List users. Requires admin role",
  outputExample: {
    data: [{id: 1, email: 'user@example.com', firstName: 'John', lastName: 'Doe', isAdmin: false}],
    count: 123
  },
  middleware: ['admin'],

  inputs: {
    limit: {required: false, default: 20},
    offset: {required: false, default: 0}
  },

  run: function (api, data, next) {
    var limit = Math.min(1000, data.params.limit || 20);
    var offset = data.params.offset || 0;

    api.models.user.findAndCountAll({
      limit: limit,
      offset: offset
    }).then(function (result) {
      data.response.count = result.count;
      data.response.data = result.rows.map(function (user) {
        return user.apiData(api);
      });
      if (result.count > limit + offset)
        data.connection.rawConnection.responseHttpCode = 206;
      next();
    }).catch(next);
  }
};
