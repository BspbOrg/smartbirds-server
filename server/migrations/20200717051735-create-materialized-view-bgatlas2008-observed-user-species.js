'use strict'

const tableName = 'bgatlas2008_observed_user_species'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    if (queryInterface.sequelize.options.dialect !== 'postgres') return
    await queryInterface.sequelize.query(`
      CREATE MATERIALIZED VIEW ${tableName} AS
      SELECT
        bgatlas2008_utm_code as utm_code,
        user_id,
        o.species,
        SUM(count) as count,
        (count(e.species) > 0) as existing
      FROM birds_observations o
      LEFT JOIN bgatlas2008_species e ON (e.utm_code = o.bgatlas2008_utm_code AND e.species = o.species)
      WHERE bgatlas2008_utm_code IS NOT NULL
      AND bgatlas2008_utm_code != ''
      GROUP BY bgatlas2008_utm_code, user_id, o.species
    `)
    await queryInterface.addIndex(tableName, { fields: ['user_id', 'utm_code', 'species'], unique: true })
  },

  down: async (queryInterface, Sequelize) => {
    if (queryInterface.sequelize.options.dialect !== 'postgres') return
    await queryInterface.sequelize.query(`DROP MATERIALIZED VIEW IF EXISTS ${tableName}`)
  }
}
