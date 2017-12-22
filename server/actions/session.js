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
    data.response.success = false
    api.models.user.findOne({where: {email: data.params.email}}).then(function (user) {
      if (!user) {
        return next(new Error('Няма такъв потребител'))
      }
      user.checkPassword(data.params.password, function (error, match) {
        if (error) {
          return next(error)
        } else if (!match) {
          return next(new Error('Невалидна парола'))
        } else {
          api.session.create(data.connection, user, function (error, sessionData) {
            if (error) {
              return next(error)
            }
            data.response.user = user.apiData(api)
            data.response.success = true
            data.response.csrfToken = sessionData.csrfToken
            next()
          })
        }
      })
    })
      .catch(function (error) {
        console.error('sequelize error: ', error)
        next(error)
      })
  }
}

exports.sessionDestroy = {
  name: 'session:destroy',
  description: 'session:destroy',
  outputExample: {},

  inputs: {},

  run: function (api, data, next) {
    data.response.success = true
    api.session.destroy(data.connection, next)
  }
}

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
    }
    api.session.load(data.connection, function (error, sessionData) {
      if (error) {
        return next(error)
      } else if (!sessionData) {
        data.connection.rawConnection.responseHttpCode = 401
        return next(new Error('Необходимо е да се оторизирате'))
      } else {
        api.models.user.findOne({where: {id: sessionData.userId}}).then(function (user) {
          if (!user) {
            data.connection.rawConnection.responseHttpCode = 404
            return next(new Error('Няма такъв потребител'))
          }
          data.response.user = user.apiData(api)
          data.response.csrfToken = sessionData.csrfToken
          data.response.success = true
          next()
        }).catch(next)
      }
    })
  }
}

exports.sessionWSAuthenticate = {
  name: 'session:wsAuthenticate',
  description: 'session:wsAuthenticate',
  outputExample: {},
  blockedConnectionTypes: ['web'],

  inputs: {},

  run: function (api, data, next) {
    api.session.load(data.connection, function (error, sessionData) {
      if (error) {
        return next(error)
      } else if (!sessionData) {
        data.connection.rawConnection.responseHttpCode = 401
        return next(new Error('Необходимо е да се оторизирате'))
      } else {
        data.connection.authorized = true
        data.response.authorized = true
        next()
      }
    })
  }
}
