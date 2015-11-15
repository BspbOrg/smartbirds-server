exports.userCreate = {
  name: 'user:create',
  description: 'user:create',
  outputExample: {},
  middleware: [],

  inputs: {
    email: {required: true},
    password: {required: true},
    firstName: {required: true},
    lastName: {required: true}
  },

  run: function (api, data, next) {
    var user = api.models.user.build(data.params);
    user.updatePassword(data.params.password, function (error) {
      if (error) {
        return next(error);
      }

      user.save()
        .then(function (userObj) {
          data.response.data = userObj.apiData(api);
          next(error);
        })
        .catch(function (errors) {
          next(errors.errors[0].message);
        });
    });
  }
};

exports.userView = {
  name: 'user:view',
  description: 'user:view',
  outputExample: {},
  middleware: ['logged-in-session', 'admin-or-me'],

  inputs: {
    id: {required: true}
  },

  run: function (api, data, next) {
    api.models.user.findOne({where: {id: data.params.id}}).then(function (user) {
        if (!user) {
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
  middleware: ['logged-in-session', 'admin-or-me'],

  inputs: {
    id: {required: true},
    email: {required: false},
    password: {required: false},
    firstName: {required: false},
    lastName: {required: false},
  },

  run: function (api, data, next) {
    api.models.user.findOne({where: {id: data.params.id}}).then(function (user) {
        if (!user) {
          return next(new Error('user not found'));
        }
        user.update(data.params).then(function () {
          data.response.user = user.apiData(api);
          if (data.params.password) {
            user.updatePassword(data.params.password, function (error) {
              if (error) {
                return callback(error);
              }
              user.save().then(function () {
                next();
              }).catch(next);
            });
          } else {
            next();
          }
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
    data: [{id: 1, email: 'user@example.com', firstName: 'John', lastName: 'Doe', roles: ['user']}],
    count: 123
  },
  middleware: ['logged-in-session', 'admin-role'],

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
      next();
    }).catch(next);
  }
};
