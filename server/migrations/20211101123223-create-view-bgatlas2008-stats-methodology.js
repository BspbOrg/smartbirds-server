'use strict'

const tableName = 'bgatlas2008_stats_methodology'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    if (queryInterface.sequelize.options.dialect !== 'postgres') return
    await queryInterface.sequelize.query(`
      CREATE OR REPLACE VIEW ${tableName} AS
      SELECT
        utm_code,
        observation_methodology,
        (count(*))::integer as records_count
      FROM (
        SELECT
          bgatlas2008_utm_code as utm_code,
          COALESCE(observation_methodology_en, '') as observation_methodology
        FROM birds_observations
        WHERE bgatlas2008_utm_code IS NOT NULL
          AND bgatlas2008_utm_code != ''
      ) as t
      GROUP BY
        utm_code,
        observation_methodology
    `)
  },

  down: async (queryInterface, Sequelize) => {
    if (queryInterface.sequelize.options.dialect !== 'postgres') return
    await queryInterface.sequelize.query(`DROP VIEW IF EXISTS ${tableName}`)
  }
}
