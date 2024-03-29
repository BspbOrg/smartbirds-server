'use strict'

const tables = [
  'FormCBM',
  'FormCiconia',
  'FormBirds',
  'FormHerps',
  'FormHerptiles',
  'FormMammals',
  'FormInvertebrates',
  'FormPlants'
]

module.exports = {
  up: function (queryInterface) {
    if (queryInterface.sequelize.options.dialect !== 'postgres') return new Promise(resolve => resolve())
    return queryInterface.sequelize.query(`
      CREATE OR REPLACE VIEW threats_stats (
        latitude, longitude, "threatsBg", "threatsEn", form
      ) AS
      SELECT 
        latitude, longitude, "threatsBg", "threatsEn", form
      FROM (
        ${tables.map(tableName => `
          (
            SELECT
              latitude, longitude,
              unnest(string_to_array("threatsBg", ' | ')) AS "threatsBg",
              unnest(string_to_array("threatsEn", ' | ')) AS "threatsEn",
              '${tableName}' AS form
            FROM "${tableName}"
            WHERE "threatsEn" IS NOT NULL AND "threatsEn" != ''
          )
        `).join(' UNION ALL ')}
      UNION ALL
        (
          SELECT
            latitude, longitude,
            CASE
              WHEN "primaryType" = 'threat' THEN "categoryBg"
              ELSE 'Тровене'
            END AS "threatBg",
            CASE
              WHEN "primaryType" = 'threat' THEN "categoryEn"
              ELSE 'Poisoning'
            END AS "threatEn",
            'threats' AS form
          FROM "FormThreats"
        )
      ) AS all_forms
    `)
  },

  down: function (queryInterface, Sequelize) {
    if (queryInterface.sequelize.options.dialect !== 'postgres') return new Promise(resolve => resolve())
    return queryInterface.sequelize.query('DROP VIEW IF EXISTS threats_stats')
  }
}
