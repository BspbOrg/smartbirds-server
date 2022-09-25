const migrationFactory = require('../_factory')

const views = [
  require('./001_bgatlas2008_observed_species'),
  require('./001_bgatlas2008_observed_user_species'),
  require('./001_bgatlas2008_stats_methodology'),
  require('./002_bgatlas2008_stats_global'),
  require('./002_bgatlas2008_stats_user'),
  require('./002_bgatlas2008_stats_user_rank')
]

module.exports = migrationFactory(views)
