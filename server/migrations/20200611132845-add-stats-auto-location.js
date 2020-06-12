'use strict'

const tables = [
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
  up: async function (queryInterface) {
    if (queryInterface.sequelize.options.dialect !== 'postgres') return
    await Promise.all([
      queryInterface.sequelize.query(`
          CREATE OR REPLACE VIEW birds_top_interesting_species_month AS
          SELECT "userId" as user_id, species, count, "observationDateTime", location, form_name, "autoLocationEn", "autoLocationLocal", "autoLocationLang"
          FROM
            (
              SELECT "userId", species, count, "observationDateTime", location, confidential, 'birds' as form_name, "autoLocationEn", "autoLocationLocal", "autoLocationLang"
              FROM "FormBirds"

              UNION ALL

              SELECT "userId", species, count, "observationDateTime", l."nameLocal" as location, confidential, 'cbm' as form_name, "autoLocationEn", "autoLocationLocal", "autoLocationLang"
              FROM "FormCBM"
              LEFT OUTER JOIN "Zones" z ON "zoneId" = z.id
              LEFT OUTER JOIN "Locations" l ON z."locationId" = l.id
            ) form
          LEFT OUTER JOIN "Users" u ON "userId" = u.id
          LEFT OUTER JOIN "Species" s ON "labelLa" = species AND type = 'birds'
          WHERE "observationDateTime" >= CURRENT_DATE - INTERVAL '1 month'
          AND count > 0
          AND (NOT confidential OR confidential IS NULL)
          AND interesting = true
          AND (NOT sensitive OR sensitive IS NULL)
          AND u.privacy = 'public'
          ORDER BY "observationDateTime" DESC
        `),
      ...tables.map((table) =>
        queryInterface.sequelize.query(`
          CREATE OR REPLACE VIEW ${table.viewPrefix}_top_interesting_species_month AS
          SELECT "userId" as user_id, species, count, "observationDateTime", location, "autoLocationEn", "autoLocationLocal", "autoLocationLang"
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
      )
    ])
  },

  down: async function (queryInterface) {
    await Promise.all([
      queryInterface.sequelize.query(`
          CREATE OR REPLACE VIEW birds_top_interesting_species_month AS
          SELECT "userId" as user_id, species, count, "observationDateTime", location, form_name,
            CAST(NULL AS TEXT) as "autoLocationEn", CAST(NULL AS TEXT) as "autoLocationLocal", CAST(NULL AS VARCHAR(3)) as "autoLocationLang"
          FROM
            (
              SELECT "userId", species, count, "observationDateTime", location, confidential, 'birds' as form_name
              FROM "FormBirds"

              UNION ALL

              SELECT "userId", species, count, "observationDateTime", l."nameLocal" as location, confidential, 'cbm' as form_name
              FROM "FormCBM"
              LEFT OUTER JOIN "Zones" z ON "zoneId" = z.id
              LEFT OUTER JOIN "Locations" l ON z."locationId" = l.id
            ) form
          LEFT OUTER JOIN "Users" u ON "userId" = u.id
          LEFT OUTER JOIN "Species" s ON "labelLa" = species AND type = 'birds'
          WHERE "observationDateTime" >= CURRENT_DATE - INTERVAL '1 month'
          AND count > 0
          AND (NOT confidential OR confidential IS NULL)
          AND interesting = true
          AND (NOT sensitive OR sensitive IS NULL)
          AND u.privacy = 'public'
          ORDER BY "observationDateTime" DESC
        `),
      ...tables.map((table) =>
        queryInterface.sequelize.query(`
          CREATE OR REPLACE VIEW ${table.viewPrefix}_top_interesting_species_month AS
          SELECT "userId" as user_id, species, count, "observationDateTime", location,
            CAST(NULL AS TEXT) as "autoLocationEn", CAST(NULL AS TEXT) as "autoLocationLocal", CAST(NULL AS VARCHAR(3)) as "autoLocationLang"
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
      )
    ])
  }
}
