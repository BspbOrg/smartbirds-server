'use strict'

module.exports = {
  up: async (queryInterface) => {
    if (queryInterface.sequelize.options.dialect !== 'postgres') return
    // drop threat_stats view since it is now managed separately
    await queryInterface.sequelize.query('DROP VIEW IF EXISTS threat_stats')
  },

  down: async () => {
    // do nothing as we haven't figured out how to rollback views
  }
}
