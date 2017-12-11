var path = require('path')

exports['default'] = {
  poeditor: function (api) {
    return {
      enabled: process.env.POEDITOR_ENABLED,
      api_token: process.env.POEDITOR_API_TOKEN,
      project_id: process.env.POEDITOR_PROJECT_ID || 146255,
      fallbackPath: path.join(__dirname, '/../../i18n')
    }
  }
}
