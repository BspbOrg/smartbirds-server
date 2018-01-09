var _ = require('lodash')
var Promise = require('bluebird')

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
    address: {required: false},
    birdsKnowledge: {required: false},
    city: {required: false},
    level: {required: false},
    mobile: {required: false},
    notes: {required: false},
    phone: {required: false},
    postcode: {required: false},
    profile: {required: false},
    language: {required: false},
    role: {default: 'user'},
    forms: {required: false}
  },

  run: function (api, data, next) {
    var user = api.models.user.build(data.params, this.inputs)
    if (data.session && data.session.user.isAdmin) {
      user.role = data.params.role
    } else {
      user.role = 'user'
    }
    user.lastLoginAt = null
    user.imported = false
    user.updatePassword(data.params.password, function (error) {
      if (error) {
        return next(error)
      }

      user.save()
        .then(function (userObj) {
          api.tasks.enqueue('mail:send', {
            mail: {to: userObj.email, subject: 'Успешна регистрация'},
            template: 'register',
            locals: {
              name: userObj.name()
            }
          }, 'default', function (error) {
            if (error) return next(error)
            data.response.data = userObj.apiData(api)
            next()
          })
        })
        .catch(function (error) {
          api.log('Error creating user', 'error', error)
          next(new Error('Вече съществува потребител с тази е-поща'))
        })
    })
  }
}

exports.userLost = {
  name: 'user:lost',
  description: 'user:lost',
  inputs: {
    email: {required: true}
  },
  run: function (api, data, next) {
    api.models.user.findOne({where: {email: data.params.email}}).then(function (user) {
      if (!user) {
        data.connection.rawConnection.responseHttpCode = 404
        return next(new Error('Няма такъв потребител'))
      }

      user.genPasswordToken(function (error, passwordToken) {
        if (error) return next(error)

        user.save().then(function (userObj) {
          api.tasks.enqueue('mail:send', {
            mail: {to: userObj.email, subject: 'Възстановяване на парола'},
            template: 'lost_password',
            locals: {
              passwordToken: passwordToken,
              email: userObj.email
            }
          }, 'default', function (error, toRun) {
            if (error) return next(error)

            data.response.data = {success: toRun}
            next()
          })
        }).catch(next)
      })
    })
      .catch(next)
  }
}

exports.userReset = {
  name: 'user:reset',
  description: 'user:reset',
  inputs: {
    email: {required: true},
    token: {required: true},
    password: {required: true}
  },
  run: function (api, data, next) {
    api.models.user.findOne({where: {email: data.params.email}}).then(function (user) {
      if (!user) {
        data.connection.rawConnection.responseHttpCode = 404
        return next(new Error('Няма такъв потребител'))
      }

      if (!user.forgotPasswordTimestamp || Date.now() - user.forgotPasswordTimestamp.getTime() > 1000 * 60 * 60) {
        data.connection.rawConnection.responseHttpCode = 400
        return next(new Error('Невалиден код'))
      }

      return user.checkPasswordToken(data.params.token, function (error, matched) {
        if (error) return next(error)
        if (!matched) {
          data.connection.rawConnection.responseHttpCode = 400
          return next(new Error('Невалиден код'))
        }

        return user.updatePassword(data.params.password, function (error) {
          if (error) return next(error)

          return user.save()
            .then(function (userObj) {
              data.response.data = userObj.apiData(api)
              next()
            })
            .catch(next)
        })
      })
    })
      .catch(next)
  }
}

exports.userView = {
  name: 'user:view',
  description: 'user:view',
  outputExample: {},
  middleware: ['auth'],

  inputs: {
    id: {required: true}
  },

  run: function (api, data, next) {
    if (!data.session.user.isAdmin && !data.session.user.isModerator) {
      if (data.params.id === 'me' || parseInt(data.params.id) === data.session.userId) {
        data.params.id = data.session.userId
      } else {
        data.connection.rawConnection.responseHttpCode = 403
        return next(new Error('Admin required'))
      }
    }
    api.models.user.findOne({where: {id: data.params.id}}).then(function (user) {
      if (!user) {
        data.connection.rawConnection.responseHttpCode = 404
        return next(new Error('Няма такъв потребител'))
      }

      data.response.data = user.apiData(api)
      next()
    })
      .catch(next)
  }
}

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
    role: {required: false},
    forms: {required: false},

    address: {required: false},
    birdsKnowledge: {required: false},
    city: {required: false},
    level: {required: false},
    mobile: {required: false},
    notes: {required: false},
    phone: {required: false},
    postcode: {required: false},
    profile: {required: false},
    language: {required: false}
  },

  run: function (api, data, next) {
    api.models.user.findOne({where: {id: data.params.id}}).then(function (user) {
      if (!user) {
        data.connection.rawConnection.responseHttpCode = 404
        return next(new Error('Няма такъв потребител'))
      }
      // if (data.params.password) {
      //  user.updatePassword(data.params.password, function (error) {
      //    if (error) {
      //      return callback(error);
      //    }
      //    user.save().then(function () {
      //      next();
      //    }).catch(next);
      //  });
      // }
      user.apiUpdate(data.params)
      if (data.session.user.isAdmin && 'role' in data.params) {
        user.role = data.params.role
      }
      user.save().then(function () {
        data.response.data = user.apiData(api)
        next()
      }).catch(next)
    })
      .catch(next)
  }
}

exports.userList = {
  name: 'user:list',
  description: 'List users. Requires admin role',
  outputExample: {
    data: [{id: 1, email: 'user@example.com', firstName: 'John', lastName: 'Doe', role: 'user'}],
    count: 123
  },
  middleware: ['auth'],

  inputs: {
    limit: {required: false, default: 20},
    offset: {required: false, default: 0},
    q: {required: false}
  },

  run: function (api, data, next) {
    var limit = Math.min(1000, data.params.limit || 20)
    var offset = data.params.offset || 0

    var q = {
      offset: offset
    }

    if (!data.session.user.isAdmin && !data.session.user.isModerator) {
      q.where = {
        id: data.session.userId
      }
    }

    if (limit !== -1) {
      q.limit = limit
    }

    if (data.params.q) {
      var vals = ('' + data.params.q).split(' ')
      switch (vals.length) {
        case 0:
          break
        case 1:
          q.where = _.extend(q.where || {}, {
            $or: [].concat(
              vals.map(function (val) {
                return {
                  firstName: {$ilike: val + '%'}
                }
              }),
              vals.map(function (val) {
                return {
                  lastName: {$ilike: val + '%'}
                }
              })
            )
          })
          break
        default:
          q.where = _.extend(q.where || {}, {
            $or: vals.map(function (val, idx, array) {
              return {
                $and: [
                  {firstName: {$ilike: array.slice(0, idx).join(' ') + '%'}},
                  {lastName: {$ilike: array.slice(idx).join(' ') + '%'}}
                ]
              }
            }).concat([
              {firstName: {$ilike: data.params.q + '%'}},
              {lastName: {$ilike: data.params.q + '%'}}
            ])
          })
          break
      }
    }

    api.models.user.findAndCountAll(q).then(function (result) {
      data.response.count = result.count
      data.response.data = result.rows.map(function (user) {
        return user.apiData(api)
      })
      if (result.count > limit + offset) {
        data.connection.rawConnection.responseHttpCode = 206
      }
      next()
    }).catch(next)
  }
}

exports.userChangePassword = {
  name: 'user:changepw',
  description: 'Change password of user',
  middleware: ['auth', 'owner'],
  inputs: {
    id: {required: true},
    oldPassword: {required: true},
    newPassword: {required: true}
  },

  run: function (api, data, next) {
    Promise.resolve(data)
      .then(function (data) {
        return api.models.user.findOne({where: {id: data.params.id}})
      })
      .then(function (user) {
        if (!user) {
          data.connection.rawConnection.responseHttpCode = 404
          return Promise.reject(new Error('Няма такъв потребител'))
        }
        return Promise.fromCallback(function (callback) {
          return user.checkPassword(data.params.oldPassword, callback)
        })
          .then(function (match) {
            if (!match) return Promise.reject(new Error('Грешна парола'))
            return user
          })
      })
      .then(function (user) {
        return Promise.fromCallback(function (callback) {
          return user.updatePassword(data.params.newPassword, callback)
        })
      })
      .then(function (user) {
        return user.save()
      })
      .then(function (user) {
        return true
      })
      .then(function (res) {
        data.response.data = res
        return res
      })
      .then(function () {
        next()
      })
      .catch(function (error) {
        api.logger.error(error)
        next(error)
      })
  }
}
