const tables = [
  'FormBirds',
  'FormCBM',
  'FormCiconia',
  'FormFishes',
  'FormHerptiles',
  'FormInvertebrates',
  'FormMammals',
  'FormPlants'
]

module.exports = {
  up: `
      CREATE OR REPLACE VIEW threats_stats (
        latitude, longitude, "threatsBg", "threatsEn", form, "threatsLocal", "observationDateTime", "threatsLang", "primaryType"
      ) AS
      SELECT
        latitude, longitude, "threatsLocal", "threatsEn", form, "threatsLocal", "observationDateTime", "threatsLang", "primaryType"
      FROM (
        ${tables.map(tableName => `
          (
            SELECT
              latitude, longitude,
              "observationDateTime",
              CAST("threatsLang" as TEXT) as "threatsLang",
              unnest(string_to_array("threatsLocal", ' | ')) AS "threatsLocal",
              unnest(string_to_array("threatsEn", ' | ')) AS "threatsEn",
              '${tableName}' AS form,
              'threat' as "primaryType"
            FROM "${tableName}"
            WHERE "threatsEn" IS NOT NULL AND "threatsEn" != ''
          )
        `).join(' UNION ALL ')}
      UNION ALL
        (
          SELECT
            latitude, longitude,
            "observationDateTime",
            "categoryLang" AS "threatsLang",
            "categoryLocal" as "threatsLocal",
            "categoryEn" as "threatsEn",
            'threats' AS form,
            "primaryType"
          FROM "FormThreats"
        )
      ) AS all_forms
  `,
  down: `
    DROP VIEW IF EXISTS threats_stats
  `
}
