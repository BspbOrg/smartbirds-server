const migrationFactory = require('../_factory')

const views = [
  require('./001_birds_observations'),
  require('./001_birds_stats'),
  require('./001_birds_top_species_month'),
  require('./001_birds_top_users_records_month'),
  require('./001_birds_top_users_records_year'),
  require('./001_birds_top_users_species_month'),
  require('./001_birds_top_users_species_year'),
  require('./001_cbm_stats'),
  require('./001_ciconia_stats'),
  require('./002_birds_top_interesting_species_month')
]

module.exports = migrationFactory(views)
