const { api, CLI } = require('actionhero')

class DbMigrate extends CLI {
  constructor () {
    super()
    this.name = 'db migrate'
    this.description = 'Applies missing migration to db and recreates views'
    this.example = 'actionhero db migrate'
  }

  async run () {
    await api.sequelize.migrate({ forceViewsRecreate: true })
  }
}

module.exports = DbMigrate
