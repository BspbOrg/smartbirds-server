const { upgradeAction } = require('../utils/upgrade')

exports.showDocumentation = upgradeAction('ah17', {
  name: 'showDocumentation',
  description: 'return API documentation',
  // middleware: [ 'logged-in-session' ],

  outputExample: {},

  run: function (api, data, next) {
    data.response.documentation = api.documentation.documentation
    next()
  }
})
