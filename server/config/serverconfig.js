const path = require('path')

exports.default = {
  serverConfig: {
    configFilename: 'config.env',
    configPath: path.join(__dirname, '..', '..', 'config')
  }
}
