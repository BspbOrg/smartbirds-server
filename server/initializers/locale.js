const { upgradeInitializer } = require('../utils/upgrade')

module.exports = upgradeInitializer('ah17', {
  name: 'locale',
  initialize: function (api, next) {
    api.i18n.determineConnectionLocale = (function (defaultLocale) {
      return function (connection) {
        let locale = defaultLocale(connection)

        if (connection.type === 'web') {
          locale = connection.rawConnection.req.headers.language || locale
        }

        return locale
      }
    })(api.i18n.determineConnectionLocale)
    next()
  }
})
