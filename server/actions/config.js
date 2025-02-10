const { upgradeAction } = require('../utils/upgrade')

exports.readServerConfig = upgradeAction('ah17', {
  name: 'server-config:get',
  description: 'server-config:get',
  middleware: ['admin'],

  run: function (api, data, next) {
    try {
      data.response.data = {
        config: 'Here we will return the server config'
      }
      return next()
    } catch (e) {
      console.error(e)
      return next(e)
    }
  }
})
