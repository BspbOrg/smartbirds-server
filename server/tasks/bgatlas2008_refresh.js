const { api, Task } = require('actionhero')

module.exports = class BgAtlas2008Observed extends Task {
  constructor () {
    super()
    this.name = 'bgatlas2008_refresh'
    this.description = 'Refresh bg atlas 2008 observed'
    // use cronjob to schedule the task
    // npm run enqueue forms_fill_bgatlas2008_utmcode
    this.frequency = 0
  }

  async run () {
    await Promise.all([
      api.sequelize.sequelize.query('REFRESH MATERIALIZED VIEW bgatlas2008_observed_species'),
      api.sequelize.sequelize.query('REFRESH MATERIALIZED VIEW bgatlas2008_observed_user_species')
    ])
  }
}
