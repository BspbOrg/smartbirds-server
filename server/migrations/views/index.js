const views = [
  require('./001_birds_observations'),
  require('./001_birds_stats'),
  require('./001_birds_top_users_species_month'),
  require('./001_cbm_stats'),
  require('./001_ciconia_stats'),
  require('./001_herptiles_stats'),
  require('./001_invertebrates_stats'),
  require('./001_mammals_stats'),
  require('./001_plants_stats'),
  require('./001_threats_stats'),
  require('./001_total_users_records_year'),
  require('./001_user_rank_stats'),
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
