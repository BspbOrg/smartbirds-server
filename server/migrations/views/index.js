const views = [
  require('./001_birds_observations'),
  require('./001_threats_stats'),
  require('./002_bgatlas2008_observed_species'),
  require('./002_bgatlas2008_observed_user_species'),
  require('./002_birds_top_interesting_species_month'),
  require('./002_bgatlas2008_stats_methodology'),
  require('./003_bgatlas2008_stats_global'),
  require('./003_bgatlas2008_stats_user'),
  require('./003_bgatlas2008_stats_user_rank')
]

const upViews = views.map(view => view.up)
const downViews = views.reverse().map(view => view.down)

module.exports = {
  up: async (queryInterface) => {
    if (queryInterface.sequelize.options.dialect !== 'postgres') return
    for (const view of upViews) {
      await queryInterface.sequelize.query(view)
    }
  },
  down: async (queryInterface) => {
    if (queryInterface.sequelize.options.dialect !== 'postgres') return
    for (const view of downViews) {
      await queryInterface.sequelize.query(view)
    }
  }
}
