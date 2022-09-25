const migrationFactory = require('../_factory')

const views = [
  require('./001_total_users_records_year'),
  require('./001_user_stats'),
  require('./002_user_rank_stats')
]

module.exports = migrationFactory(views)
