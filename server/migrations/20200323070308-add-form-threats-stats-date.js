'use strict'

const tables = [
  'FormBirds',
  'FormCBM',
  'FormCiconia',
  'FormHerptiles',
  'FormInvertebrates',
  'FormMammals',
  'FormPlants'
]

module.exports = {
  up: function (queryInterface) {
    if (queryInterface.sequelize.options.dialect !== 'postgres') return new Promise(resolve => resolve())
    return queryInterface.sequelize.query(`
      CREATE OR REPLACE VIEW threats_stats (
        latitude, longitude, "threatsBg", "threatsEn", form, "threatsLocal", "observationDateTime"
      ) AS
      SELECT
        latitude, longitude, "threatsLocal", "threatsEn", form, "threatsLocal", "observationDateTime"
      FROM (
        ${tables.map(tableName => `
          (
            SELECT
              latitude, longitude,
              "observationDateTime",
              unnest(string_to_array("threatsLocal", ' | ')) AS "threatsLocal",
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
            "observationDateTime",
            CASE
              WHEN "primaryType" = 'threat' THEN "categoryLocal"
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

  down: function (queryInterface) {
    // nothing to do, as views are backwards compatible
    return new Promise((resolve) => resolve())
  }
}
