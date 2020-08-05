const { upgradeAction } = require('../utils/upgrade')

exports.sessionCreate = upgradeAction('ah17', {
  name: 'session:create',
  description: 'session:create',
  outputExample: {},
  middleware: [],

  inputs: {
    email: { required: true },
    password: { required: true },
    gdprConsent: { required: false },
    include: {
      require: false,
      validator: (param) => {
        const includeOptions = ['bgatlasCells']

        const invalidOptions = Object.keys(param).filter((option) => !includeOptions.includes(option))
        if (invalidOptions.length > 0) {
          return `Invalid "include" options: ${invalidOptions.join(', ')}`
        }
      },
      formatter: (param) => {
        const options = {}
        if (!param) return options
        if (!Array.isArray(param)) {
          throw new Error('"include" must be an array')
        }
        param.forEach((option) => { options[option] = true })
        return options
      },
      default: []
    }
  },

  run: function (api, data, next) {
    data.response.success = false
    api.models.user
      .findOne({ where: { email: data.params.email } })
      // check that we found a user and password match
      .then(function (user) {
        if (!user) {
          data.connection.rawConnection.responseHttpCode = 401
          return Promise.reject(new Error(api.config.errors.sessionInvalidCredentials(data.connection)))
        }
        return new Promise(function (resolve, reject) {
          user.checkPassword(data.params.password, function (error, match) {
            if (error) return reject(error)
            resolve(match)
          })
        })
          .then(function (match) {
            if (!match) {
              data.connection.rawConnection.responseHttpCode = 401
              return Promise.reject(new Error(api.config.errors.sessionInvalidCredentials(data.connection)))
            }
            return user
          })
      })
      // check GDPR consent
      .then(function (user) {
        if (user.gdprConsent) return user
        if (data.params.gdprConsent) {
          return user.update({ gdprConsent: true })
            .then(function () { return user })
        }
        data.connection.rawConnection.responseHttpCode = 401
        data.response.require = 'gdpr-consent'
        data.response.error = api.config.errors.missingGDPRconsent(data.connection)
        return false
      })
      // create session
      .then(function (user) {
        if (!user) return
        return new Promise(function (resolve, reject) {
          api.session.create(data.connection, user, function (error, sessionData) {
            if (error) {
              return reject(error)
            }
            return resolve(sessionData)
          })
        })
          .then(async (sessionData) => {
            data.response.user = user.apiData(api)
            if (data.params.include.bgatlasCells) {
              data.response.user.bgatlasCells = (await user.getBgatlas2008Cells()).map((cell) => cell.apiData())
            }
            data.response.success = true
            data.response.csrfToken = sessionData.csrfToken
          })
      })
      .then(function () {
        next()
      })
      .catch(function (error) {
        console.error('sequelize error: ', error)
        next(error)
      })
  }
})

exports.sessionDestroy = upgradeAction('ah17', {
  name: 'session:destroy',
  description: 'session:destroy',
  outputExample: {},

  inputs: {},

  run: function (api, data, next) {
    data.response.success = true
    api.session.destroy(data.connection, next)
  }
})

exports.sessionCheck = upgradeAction('ah17', {
  name: 'session:check',
  description: 'session:check',
  outputExample: {},

  inputs: {},

  run: function (api, data, next) {
    api.session.load(data.connection, function (error, sessionData) {
      if (error) {
        return next(error)
      } else if (!sessionData) {
        data.connection.rawConnection.responseHttpCode = 401
        return next(new Error(api.config.errors.sessionRequireAuthentication(data.connection)))
      } else {
        api.models.user.findOne({ where: { id: sessionData.userId } }).then(function (user) {
          if (!user) {
            data.connection.rawConnection.responseHttpCode = 404
            return next(new Error(api.config.errors.sessionInvalidCredentials(data.connection)))
          }
          data.response.user = user.apiData(api)
          data.response.csrfToken = sessionData.csrfToken
          data.response.success = true
          next()
        }).catch(next)
      }
    })
  }
})

exports.sessionWSAuthenticate = upgradeAction('ah17', {
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
        return next(new Error(api.config.errors.sessionRequireAuthentication(data.connection)))
      } else {
        data.connection.authorized = true
        data.response.authorized = true
        next()
      }
    })
  }
})
