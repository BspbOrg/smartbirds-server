'use strict'

var Promise = require('bluebird')
var tables = [
  {
    tableName: 'FormHerptiles',
    speciesType: 'herptiles',
    viewPrefix: 'herptiles'
  },
  {
    tableName: 'FormMammals',
    speciesType: 'mammals',
    viewPrefix: 'mammals'
  },
  {
    tableName: 'FormPlants',
    speciesType: 'plants',
    viewPrefix: 'plants'
  },
  {
    tableName: 'FormInvertebrates',
    speciesType: 'invertebrates',
    viewPrefix: 'invertebrates'
  }
]

module.exports = {
  up: function (queryInterface, Sequelize) {
    if (queryInterface.sequelize.options.dialect !== 'postgres') return

    return Promise.map(tables, function (table) {
      return Promise.all([
        queryInterface.sequelize.query(`
          CREATE OR REPLACE VIEW ${table.viewPrefix}_top_users_species_year AS 
          SELECT "userId" as user_id, COUNT(DISTINCT species) as count
          FROM "${table.tableName}" form
          JOIN "Users" u ON "userId" = u.id
          WHERE "observationDateTime" >= DATE_TRUNC('year', NOW())
          AND u.privacy = 'public'
          GROUP BY "userId"
          ORDER BY count DESC
        `),
        queryInterface.sequelize.query(`
          CREATE OR REPLACE VIEW ${table.viewPrefix}_top_users_records_year AS 
          SELECT "userId" as user_id, COUNT(*) as count
          FROM "${table.tableName}" form
          JOIN "Users" u ON "userId" = u.id
          WHERE "observationDateTime" >= DATE_TRUNC('year', NOW())
          AND u.privacy = 'public'
          GROUP BY "userId"
          ORDER BY count DESC
        `),
        queryInterface.sequelize.query(`
          CREATE OR REPLACE VIEW ${table.viewPrefix}_top_species_month AS 
          SELECT species, COUNT(*) AS count
          FROM "${table.tableName}" form
          WHERE "observationDateTime" >= CURRENT_DATE - INTERVAL '1 month'
          GROUP BY species
          ORDER BY COUNT(*) DESC
        `),
        queryInterface.sequelize.query(`
          CREATE OR REPLACE VIEW ${table.viewPrefix}_top_interesting_species_month AS 
          SELECT "userId" as user_id, species, count, "observationDateTime", location
          FROM "${table.tableName}" form
          LEFT OUTER JOIN "Users" u ON "userId" = u.id
          LEFT OUTER JOIN "Species" s ON "labelLa" = species AND type = '${table.speciesType}'
          WHERE "observationDateTime" >= CURRENT_DATE - INTERVAL '1 month'
          AND count > 0
          AND (NOT confidential OR confidential IS NULL)
          AND interesting = true
          AND (NOT sensitive OR sensitive IS NULL)
          AND u.privacy = 'public'
          ORDER BY "observationDateTime" DESC
        `)
      ])
    })
  },

  down: async function (queryInterface, Sequelize) {
    if (queryInterface.sequelize.options.dialect !== 'postgres') return
    return Promise.map(tables, function (table) {
      return Promise.all([
        queryInterface.sequelize.query(`DROP VIEW IF EXISTS ${table.viewPrefix}_top_users_species_year`),
        queryInterface.sequelize.query(`DROP VIEW IF EXISTS ${table.viewPrefix}_top_users_records_year`),
        queryInterface.sequelize.query(`DROP VIEW IF EXISTS ${table.viewPrefix}_top_species_month`),
        queryInterface.sequelize.query(`DROP VIEW IF EXISTS ${table.viewPrefix}_top_interesting_species_month`)
      ])
    })
  }
}
