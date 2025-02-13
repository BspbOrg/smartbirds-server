const { Initializer, api } = require('actionhero')

module.exports = class ServerConfigInit extends Initializer {
  constructor () {
    super()
    this.name = 'server-config'
    this.loadPriority = 500
  }

  async initialize () {
    api.config.pendingConfigurationChange = false
  }
}
