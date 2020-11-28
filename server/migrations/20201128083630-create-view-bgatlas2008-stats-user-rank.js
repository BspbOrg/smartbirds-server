'use strict'

const tableName = 'bgatlas2008_stats_user_rank'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    if (queryInterface.sequelize.options.dialect !== 'postgres') return
    await queryInterface.sequelize.query(`
      CREATE OR REPLACE VIEW ${tableName} AS
      SELECT user_id, count, row_number() over (order by count desc)::integer as position
      FROM (
        SELECT user_id, COUNT(utm_code)::integer AS count
        FROM (
          SELECT user_id, utm_code FROM bgatlas2008_observed_user_species GROUP BY user_id, utm_code
        ) user_cells
        JOIN "Users" u ON u.id = user_cells.user_id
        WHERE u.privacy = 'public'
        GROUP BY user_id
      ) user_counts

`)
  },

  down: async (queryInterface, Sequelize) => {
    if (queryInterface.sequelize.options.dialect !== 'postgres') return
    await queryInterface.sequelize.query(`DROP VIEW IF EXISTS ${tableName}`)
  }
}
