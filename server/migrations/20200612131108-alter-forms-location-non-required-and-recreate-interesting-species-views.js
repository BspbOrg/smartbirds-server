'use strict'

const tables = [
  'FormBirds',
  'FormCiconia',
  'FormHerptiles',
  'FormInvertebrates',
  'FormMammals',
  'FormPlants',
  'FormThreats'
]

const statTables = [
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

async function dropViews (queryInterface) {
  if (queryInterface.sequelize.options.dialect === 'sqlite') return

  await Promise.all([
    queryInterface.sequelize.query('DROP VIEW birds_top_interesting_species_month'),
    ...statTables.map((table) =>
      queryInterface.sequelize.query(`DROP VIEW ${table.viewPrefix}_top_interesting_species_month`)
    )
  ])
}

async function createViews (queryInterface) {
  if (queryInterface.sequelize.options.dialect === 'sqlite') return

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
    ...statTables.map((table) =>
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
}

module.exports = {
  up: async function (queryInterface, Sequelize) {
    await dropViews(queryInterface)

    await Promise.all(tables.map(async (table) => {
      await queryInterface.changeColumn(table, 'location', { type: Sequelize.TEXT, allowNull: true })
    }))

    await createViews(queryInterface)
  },

  down: async function (queryInterface, Sequelize) {
    await dropViews(queryInterface)

    await Promise.all(tables.map(async (table) => {
      await queryInterface.changeColumn(table, 'location', { type: Sequelize.TEXT, allowNull: false })
    }))

    await createViews(queryInterface)
  }
}
