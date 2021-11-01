'use strict'

const tableName = 'bgatlas2008_stats_methodology'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    if (queryInterface.sequelize.options.dialect !== 'postgres') return
    await queryInterface.sequelize.query(`
      CREATE OR REPLACE VIEW ${tableName} AS
      SELECT
        bgatlas2008_utm_code as utm_code,
        observation_methodology_en as observation_methodology,
        count(*) as records_count
      FROM birds_observations
      WHERE bgatlas2008_utm_code IS NOT NULL
        AND bgatlas2008_utm_code != ''
      GROUP BY
        bgatlas2008_utm_code,
        observation_methodology_en
    `)
  },

  down: async (queryInterface, Sequelize) => {
    if (queryInterface.sequelize.options.dialect !== 'postgres') return
    await queryInterface.sequelize.query(`DROP VIEW IF EXISTS ${tableName}`)
  }
}
