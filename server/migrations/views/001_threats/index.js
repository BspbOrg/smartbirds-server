const migrationFactory = require('../_factory')

const views = [
  require('./001_threats_stats')
]

module.exports = migrationFactory(views)
