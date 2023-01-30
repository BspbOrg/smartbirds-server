const migrationFactory = require('./_factory')

const views = [
  require('./001_birds_forms'),
  require('./001_birds_migrations'),
  require('./001_mammals_forms'),
  require('./001_simple_forms'),
  require('./001_threats'),
  require('./002_bgatlas2008'),
  require('./002_users')
]

module.exports = migrationFactory(views)
