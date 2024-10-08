const _ = require('lodash')
const Promise = require('bluebird')
const { upgradeAction } = require('../utils/upgrade')

exports.userCreate = upgradeAction('ah17', {
  name: 'user:create',
  description: 'user:create',
  outputExample: {},
  middleware: ['session'],

  inputs: {
    email: { required: true },
    password: { required: true },
    firstName: { required: true },
    lastName: { required: true },
    notes: { required: false },
    language: { required: false },
    role: { default: 'user' },
    forms: { required: false },
    privacy: { required: false },
    gdprConsent: { required: false, default: false },
    organization: { required: true }
  },

  run: function (api, data, next) {
    const user = api.models.user.build(data.params, this.inputs)
    if (data.session && data.session.user.isAdmin) {
      user.role = data.params.role
      user.gdprConsent = null
    } else if (!user.gdprConsent) {
      data.response.require = 'gdpr-consent'
      return next(new Error(api.config.errors.missingGDPRconsent(data.connection)))
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
          api.tasks.enqueue('mailchimp:create', { userId: userObj.id }, 'default')
          api.tasks.enqueue('mail:send', {
            mail: { to: userObj.email, subject: 'Успешна регистрация' },
            template: 'register',
            locals: {
              name: userObj.name()
            }
          }, 'default').then(function () {
            data.response.data = userObj.apiData(api)
            next()
          }, next)
        })
        .catch(function (error) {
          api.log('Error creating user', 'error', error)
          next(new Error('Вече съществува потребител с тази е-поща'))
        })
    })
  }
})

exports.userLost = upgradeAction('ah17', {
  name: 'user:lost',
  description: 'user:lost',
  inputs: {
    email: { required: true }
  },
  run: function (api, data, next) {
    api.models.user.findOne({ where: { email: data.params.email } }).then(function (user) {
      if (!user) {
        data.connection.rawConnection.responseHttpCode = 404
        return next(new Error('Няма такъв потребител'))
      }

      user.genPasswordToken(function (error, passwordToken) {
        if (error) return next(error)

        user.save().then(function (userObj) {
          api.tasks.enqueue('mail:send', {
            mail: { to: userObj.email, subject: 'Възстановяване на парола' },
            template: 'lost_password',
            locals: {
              passwordToken,
              email: encodeURIComponent(userObj.email)
            }
          }, 'default').then(function (toRun) {
            data.response.data = { success: toRun }
            next()
          }, next)
        }).catch(next)
      })
    })
      .catch(next)
  }
})

exports.userReset = upgradeAction('ah17', {
  name: 'user:reset',
  description: 'user:reset',
  inputs: {
    email: { required: true },
    token: { required: true },
    password: { required: true }
  },
  run: function (api, data, next) {
    api.models.user.findOne({ where: { email: data.params.email } }).then(function (user) {
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
})

exports.userView = upgradeAction('ah17', {
  name: 'user:view',
  description: 'user:view',
  outputExample: {},
  middleware: ['auth'],

  inputs: {
    id: { required: true }
  },

  run: function (api, data, next) {
    const q = { where: {} }
    let scope = 'default'

    if (data.params.id === 'me' || parseInt(data.params.id) === data.session.userId) {
      q.where.id = data.session.userId
    } else if (data.session.user.isAdmin || data.session.user.isModerator || data.session.user.isOrgAdmin) {
      // need access to all users because they may be accessing a record in their own organization of
      // user who already switched to another
      q.where.id = data.params.id
    } else {
      // data.connection.rawConnection.responseHttpCode = 403
      // return next(new Error('Admin required'))
      q.where.id = data.params.id
      q.include = q.include || []
      q.include.push(api.models.user.associations.sharees)
      q.where['$sharees.id$'] = data.session.userId
      scope = 'sharee'
    }
    api.models.user.findOne(q).then(function (user) {
      if (!user) {
        data.connection.rawConnection.responseHttpCode = 404
        return next(new Error('Няма такъв потребител'))
      }

      if (scope === 'default' && !data.session.user.isAdmin && user.organizationSlug !== data.session.user.organizationSlug) {
        scope = 'foreign'
      }
      data.response.data = user.apiData(api, scope)
      next()
    })
      .catch(next)
  }
})

exports.userEdit = upgradeAction('ah17', {
  name: 'user:edit',
  description: 'user:edit',
  outputExample: {},
  middleware: ['auth'],

  inputs: {
    id: { required: true },
    email: { required: false },
    password: { required: false },
    firstName: { required: false },
    lastName: { required: false },
    role: { required: false },
    forms: { required: false },

    notes: { required: false },
    language: { required: false },
    privacy: { required: false },
    organization: { required: false }
  },

  run: function (api, {
    connection,
    params: {
      id: paramId,
      organization: paramOrganization,
      role: paramRole,
      ...paramsUpdate
    },
    response,
    session: { user: sessionUser }
  }, next) {
    const userId = paramId === 'me' ? sessionUser.id : parseInt(paramId)

    const q = {
      where: {
        id: userId
      }
    }

    if (sessionUser.isAdmin) {
      // allow access
    } else if (sessionUser.isOrgAdmin) {
      // allow access only to same org users
      q.where.organizationSlug = sessionUser.organizationSlug
    } else {
      // everybody else can only edit self
      if (userId !== sessionUser.id) {
        // id is required so looking for null value shouldn't find any record
        q.where.id = null
      }
    }

    api.models.user.findOne(q).then(function (user) {
      if (!user) {
        connection.rawConnection.responseHttpCode = 404
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

      const isUpdatingSelf = user.id === sessionUser.id

      // changing organization
      if (paramOrganization && paramOrganization !== user.organizationSlug) {
        // only self or if admin
        if (sessionUser.isAdmin || isUpdatingSelf) {
          user.organizationSlug = paramOrganization
          user.role = 'user'
          user.forms = null
        }
      }

      // changing role is only allowed for admin and not to self
      if (paramRole) {
        if ((sessionUser.isAdmin || sessionUser.isOrgAdmin) && !isUpdatingSelf) {
          user.role = paramRole
        }
      }

      user.apiUpdate(paramsUpdate)

      user.save().then(function () {
        response.data = user.apiData(api)
        next()
      }).catch(next)
    })
      .catch(next)
  }
})

exports.userList = upgradeAction('ah17', {
  name: 'user:list',
  description: 'List users. Requires admin role',
  outputExample: {
    data: [{ id: 1, email: 'user@example.com', firstName: 'John', lastName: 'Doe', role: 'user' }],
    count: 123
  },
  middleware: ['auth'],

  inputs: {
    limit: { required: false, default: 20 },
    offset: { required: false, default: 0 },
    context: { required: false, default: 'private' },
    q: { required: false }
  },

  run: function (api, data, next) {
    const limit = Math.min(5000, data.params.limit || 20)
    const offset = data.params.offset || 0

    const q = {
      offset
    }

    if (limit !== -1) {
      q.limit = limit
    }

    if (data.params.q) {
      const vals = ('' + data.params.q).split(' ')
      switch (vals.length) {
        case 0:
          break
        case 1:
          q.where = _.extend(q.where || {}, {
            $or: [].concat(
              vals.map(function (val) {
                return {
                  firstName: { $ilike: val + '%' }
                }
              }),
              vals.map(function (val) {
                return {
                  lastName: { $ilike: val + '%' }
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
                  { firstName: { $ilike: array.slice(0, idx).join(' ') + '%' } },
                  { lastName: { $ilike: array.slice(idx).join(' ') + '%' } }
                ]
              }
            }).concat([
              { firstName: { $ilike: data.params.q + '%' } },
              { lastName: { $ilike: data.params.q + '%' } }
            ])
          })
          break
      }
    }

    let promise = false
    if (data.params.context === 'public') {
      q.where = q.where || {}
      q.where.privacy = 'public'
    } else if (data.session.user.isModerator || data.session.user.isOrgAdmin) {
      // limit only to organization users
      q.where = q.where || {}
      q.where.organizationSlug = data.session.user.organizationSlug
    } else if (!data.session.user.isAdmin) {
      promise = api.models.user
        .findByPk(data.session.userId)
        .then(function (user) {
          if (!user) return { count: 0, rows: [] }
          return user
            .getSharers(q)
            .then(function (users) {
              if (!users) users = []
              users.unshift(user)
              return { count: users.length, rows: users }
            })
        })
    }
    if (!promise) promise = api.models.user.findAndCountAll(q)

    promise
      .then(function (result) {
        data.response.count = result.count
        data.response.data = result.rows.map(function (user) {
          return user.apiData(api, data.params.context)
        })
        next()
      }).catch(next)
  }
})

exports.userChangePassword = upgradeAction('ah17', {
  name: 'user:changepw',
  description: 'Change password of user',
  middleware: ['auth', 'owner'],
  inputs: {
    id: { required: true },
    oldPassword: { required: true },
    newPassword: { required: true }
  },

  run: function (api, data, next) {
    Promise.resolve(data)
      .then(function (data) {
        return api.models.user.findOne({ where: { id: data.params.id } })
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
})

exports.userSharers = upgradeAction('ah17', {
  name: 'user:sharers',
  description: 'user:sharers',
  outputExample: {
    data: ['user@example.com'],
    count: 123
  },
  middleware: ['auth', 'owner'],

  inputs: {
    id: { required: true }
  },

  run: function (api, data, next) {
    if (!data.session.user.isAdmin) {
      if (data.params.id === 'me' || parseInt(data.params.id) === data.session.userId) {
        data.params.id = data.session.userId
      } else {
        data.connection.rawConnection.responseHttpCode = 403
        return next(new Error('Admin required'))
      }
    }

    const query = {
      include: [
        api.models.user.associations.sharers
      ],
      where: { id: data.params.id }
    }

    api.models.user.findOne(query).then(function (user) {
      if (!user) {
        data.connection.rawConnection.responseHttpCode = 404
        return next(new Error('Няма такъв потребител'))
      }

      data.response.count = user.sharers.length
      data.response.data = user.sharers.map(function (user) {
        return user.apiData(api, 'sharee')
      })
      next()
    })
      .catch(next)
  }
})

exports.userSharees = upgradeAction('ah17', {
  name: 'user:sharees',
  description: 'user:sharees',
  outputExample: {
    data: ['user@example.com'],
    count: 123
  },
  middleware: ['auth', 'owner'],

  inputs: {
    id: { required: true }
  },

  run: function (api, data, next) {
    if (!data.session.user.isAdmin) {
      if (data.params.id === 'me' || parseInt(data.params.id) === data.session.userId) {
        data.params.id = data.session.userId
      } else {
        data.connection.rawConnection.responseHttpCode = 403
        return next(new Error('Admin required'))
      }
    }

    const query = {
      include: [
        api.models.user.associations.sharees
      ],
      where: { id: data.params.id }
    }

    api.models.user.findOne(query).then(function (user) {
      if (!user) {
        data.connection.rawConnection.responseHttpCode = 404
        return next(new Error('Няма такъв потребител'))
      }

      data.response.count = user.sharees.length
      data.response.data = user.sharees.map(function (user) {
        return user.apiData(api, 'sharer')
      })
      next()
    })
      .catch(next)
  }
})

exports.updateSharees = upgradeAction('ah17', {
  name: 'user:sharees:update',
  description: 'user:sharees:update',
  outputExample: {
    data: ['user@example.com'],
    count: 123
  },
  middleware: ['auth'],

  inputs: {
    sharees: { required: true }
  },

  run: function (api, data, next) {
    const query = {
      include: [
        api.models.user.associations.sharees
      ],
      where: { id: data.session.userId }
    }

    api.models.user.findOne(query)
      .then(function (user) {
        if (!user) {
          data.connection.rawConnection.responseHttpCode = 404
          return next(new Error('Няма такъв потребител'))
        }

        return Promise
          .all(data.params.sharees.map(function (filter) {
            if (filter.id) {
              return api.models.user.findByPk(filter.id)
            }
            return api.models.user.findOne({ where: { email: filter.email } })
          }))
          .then(function (sharees) {
            return {
              user,
              sharees: sharees.filter(function (u) { return u && u.id !== user.id })
            }
          })
      })
      .then(function ({ user, sharees }) {
        return user.setSharees(sharees).then(function () { return user })
      })
      .then(function (user) {
        return user.getSharees()
      })
      .then(function (sharees) {
        data.response.count = sharees.length
        data.response.data = sharees.map(function (user) {
          return user.apiData('sharer')
        })
        next()
      })
      .catch(next)
  }
})

exports.userDelete = upgradeAction('ah17', {
  name: 'user:delete',
  description: 'user:delete',
  outputExample: {},
  middleware: ['auth'],

  inputs: {
    id: { required: true }
  },

  run: async function (api, data, next) {
    data.response.success = false
    const sessionUser = data.session.user
    const userId = parseInt(data.params.id)

    const q = {
      where: {
        id: userId
      }
    }

    if (sessionUser.isAdmin) {
      // allow access
    } else if (sessionUser.isOrgAdmin) {
      // allow access only to same org users
      q.where.organizationSlug = sessionUser.organizationSlug
    } else {
      // everybody else can only delete self
      if (userId !== sessionUser.id) {
        // id is required so looking for null value shouldn't find any record
        q.where.id = null
      }
    }

    try {
      const user = await api.models.user.findOne(q)
      if (!user) {
        data.connection.rawConnection.responseHttpCode = 404
        return next(new Error('Няма такъв потребител'))
      }

      const adopter = api.config.app.orphanRecordsAdopter && await api.models.user.findOne({ where: { email: api.config.app.orphanRecordsAdopter } })
      if (!adopter) {
        data.connection.rawConnection.responseHttpCode = 500
        return next(new Error('orphanRecordsAdopter not defined'))
      }

      const adoptForms = []
      _.forEach(api.forms, form => {
        if (!form.model) return
        adoptForms.push(form.model.update({ userId: adopter.id }, { where: { userId: user.id } }))
      })
      await Promise.all(adoptForms)

      await api.tasks.enqueue('mailchimp:delete', { email: user.email }, 'default')

      await user.destroy()

      data.response.success = true

      if (userId === sessionUser.id) {
        api.session.destroy(data.connection, next)
      } else {
        next()
      }
    } catch (e) {
      next(e)
    }
  }
})
