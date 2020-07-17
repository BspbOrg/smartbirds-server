'use strict'

const tableName = 'bgatlas2008_stats_user'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    if (queryInterface.sequelize.options.dialect !== 'postgres') return
    await queryInterface.sequelize.query(`
      CREATE OR REPLACE VIEW ${tableName} AS
      SELECT
        utm_code,
        user_id,
        sum(case when existing then 1 else 0 end) as spec_known,
        sum(case when existing then 0 else 1 end) as spec_unknown,
        (SELECT count(e.species) FROM bgatlas2008_species e WHERE o.utm_code = e.utm_code) as spec_old
      FROM bgatlas2008_observed_user_species o
      GROUP BY utm_code, user_id
    `)
  },

  down: async (queryInterface, Sequelize) => {
    if (queryInterface.sequelize.options.dialect !== 'postgres') return
    await queryInterface.sequelize.query(`DROP VIEW IF EXISTS ${tableName}`)
  }
}
