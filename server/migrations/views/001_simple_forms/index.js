const migrationFactory = require('../_factory')

const views = [
  require('./001_forms_stats'),
  require('./001_forms_top_interesting_species_month'),
  require('./001_forms_top_species_month'),
  require('./001_forms_top_users_records_year'),
  require('./001_forms_top_users_species_year')
]

module.exports = migrationFactory(views)
