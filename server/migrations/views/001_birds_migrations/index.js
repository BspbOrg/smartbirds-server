const migrationFactory = require('../_factory')

const views = [
  require('./001_birds_migrations_observations'),
  require('./002_birds_migrations_peak_daily_species'),
  require('./002_birds_migrations_season_totals'),
  require('./002_birds_migrations_top_interesting_species_month'),
  require('./002_birds_migrations_top_species_month'),
  require('./002_birds_migrations_top_users_records_year'),
  require('./002_birds_migrations_top_users_species_year')
]

module.exports = migrationFactory(views)
