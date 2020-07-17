'use strict'

const tableName = 'bgatlas2008_stats_user'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    if (queryInterface.sequelize.options.dialect !== 'postgres') return
    await queryInterface.sequelize.query(`
      CREATE OR REPLACE VIEW ${tableName} AS
      SELECT
        c.utm_code,
        c.user_id,
        COALESCE(spec_known, 0) as spec_known,
        COALESCE(spec_unknown, 0) as spec_unknown,
        COALESCE(spec_old, 0) as spec_old
      FROM (SELECT utm_code, u.id as user_id FROM bgatlas2008_cells c, "Users" u) c
      LEFT JOIN (
        SELECT
          utm_code,
          user_id,
          sum(case when existing then 1 else 0 end) as spec_known,
          sum(case when existing then 0 else 1 end) as spec_unknown,
          (SELECT count(e.species) FROM bgatlas2008_species e WHERE o.utm_code = e.utm_code) as spec_old
        FROM bgatlas2008_observed_user_species o
        GROUP BY utm_code, user_id
      ) s ON (c.utm_code = s.utm_code AND c.user_id = s.user_id)
`)
  },

  down: async (queryInterface, Sequelize) => {
    if (queryInterface.sequelize.options.dialect !== 'postgres') return
    await queryInterface.sequelize.query(`DROP VIEW IF EXISTS ${tableName}`)
  }
}
