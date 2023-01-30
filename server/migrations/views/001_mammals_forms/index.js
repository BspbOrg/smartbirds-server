const migrationFactory = require('../_factory')

const views = [
  require('./001_mammals_observations'),
  require('./002_mammals_stats'),
  require('./002_mammals_top_interesting_species_month'),
  require('./002_mammals_top_species_month'),
  require('./002_mammals_top_users_records_year'),
  require('./002_mammals_top_users_species_year')
]

module.exports = migrationFactory(views)
