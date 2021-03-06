'use strict'

const tableName = 'bgatlas2008_stats_global'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    if (queryInterface.sequelize.options.dialect !== 'postgres') return
    await queryInterface.sequelize.query(`
      CREATE OR REPLACE VIEW ${tableName} AS
      SELECT
        c.utm_code,
        COALESCE(spec_known, 0) as spec_known,
        COALESCE(spec_unknown, 0) as spec_unknown,
        COALESCE((SELECT count(e.species)::integer FROM bgatlas2008_species e WHERE c.utm_code = e.utm_code), 0) as spec_old
      FROM bgatlas2008_cells c
      LEFT JOIN (
        SELECT
          utm_code,
          sum(case when existing then 1 else 0 end)::integer as spec_known,
          sum(case when existing then 0 else 1 end)::integer as spec_unknown
        FROM bgatlas2008_observed_species o
        GROUP BY o.utm_code
      ) s ON (c.utm_code = s.utm_code)
    `)
  },

  down: async (queryInterface, Sequelize) => {
    if (queryInterface.sequelize.options.dialect !== 'postgres') return
    await queryInterface.sequelize.query(`DROP VIEW IF EXISTS ${tableName}`)
  }
}
