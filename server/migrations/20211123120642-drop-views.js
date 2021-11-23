'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    if (queryInterface.sequelize.options.dialect !== 'postgres') return
    // drop all views since they are now managed separately and materialized views cannot be rewritten
    await queryInterface.sequelize.query('DROP VIEW IF EXISTS bgatlas2008_stats_user_rank')
    await queryInterface.sequelize.query('DROP VIEW IF EXISTS bgatlas2008_stats_user')
    await queryInterface.sequelize.query('DROP VIEW IF EXISTS bgatlas2008_stats_global')
    await queryInterface.sequelize.query('DROP VIEW IF EXISTS birds_top_interesting_species_month')
    await queryInterface.sequelize.query('DROP VIEW IF EXISTS bgatlas2008_stats_methodology')
    await queryInterface.sequelize.query('DROP MATERIALIZED VIEW IF EXISTS bgatlas2008_observed_user_species')
    await queryInterface.sequelize.query('DROP MATERIALIZED VIEW IF EXISTS bgatlas2008_observed_species')
    await queryInterface.sequelize.query('DROP VIEW IF EXISTS birds_observations')
  },

  down: async (queryInterface, Sequelize) => {
    // do nothing as we haven't figured out how to rollback views
  }
}
