'use strict'

module.exports = {
  up: async function (queryInterface, Sequelize) {
    if (queryInterface.sequelize.options.dialect !== 'postgres') return

    await queryInterface.sequelize.query(`
      CREATE OR REPLACE VIEW birds_top_users_species_month AS 
      SELECT 
        form."userId" as user_id, COUNT(DISTINCT form.species) as count
      FROM 
        (
          SELECT "userId", species
          FROM "FormBirds"
          WHERE "observationDateTime" >= CURRENT_DATE - INTERVAL '1 month'
          UNION ALL
          SELECT "userId", species
          FROM "FormCBM"
          WHERE "observationDateTime" >= CURRENT_DATE - INTERVAL '1 month'
          UNION ALL
          SELECT "userId", 'Ciconia ciconia' species
          FROM "FormCiconia"
          WHERE "observationDateTime" >= CURRENT_DATE - INTERVAL '1 month'
        ) form
      JOIN "Users" u ON form."userId" = u.id
      WHERE u.privacy = 'public'
      GROUP BY "userId"
      ORDER BY count DESC
    `)

    await queryInterface.sequelize.query(`
      CREATE OR REPLACE VIEW birds_top_users_records_month AS 
      SELECT "userId" as user_id, COUNT(*) as count
      FROM 
        (
          SELECT "userId"
          FROM "FormBirds"
          WHERE "observationDateTime" >= CURRENT_DATE - INTERVAL '1 month'
          UNION ALL
          SELECT "userId"
          FROM "FormCBM"
          WHERE "observationDateTime" >= CURRENT_DATE - INTERVAL '1 month'
          UNION ALL
          SELECT "userId"
          FROM "FormCiconia"
          WHERE "observationDateTime" >= CURRENT_DATE - INTERVAL '1 month'
        ) form
      JOIN "Users" u ON form."userId" = u.id
      WHERE u.privacy = 'public'
      GROUP BY "userId"
      ORDER BY count DESC
    `)

    await queryInterface.sequelize.query(`
      CREATE OR REPLACE VIEW birds_top_users_species_year AS 
      SELECT 
        form."userId" as user_id, COUNT(DISTINCT form.species) as count
      FROM 
        (
          SELECT "userId", species
          FROM "FormBirds"
          WHERE "observationDateTime" >= DATE_TRUNC('year', NOW())
          UNION ALL
          SELECT "userId", species
          FROM "FormCBM"
          WHERE "observationDateTime" >= DATE_TRUNC('year', NOW())
          UNION ALL
          SELECT "userId", 'Ciconia ciconia' species
          FROM "FormCiconia"
          WHERE "observationDateTime" >= DATE_TRUNC('year', NOW())
        ) form
      JOIN "Users" u ON form."userId" = u.id
      WHERE u.privacy = 'public'
      GROUP BY "userId"
      ORDER BY count DESC
    `)

    await queryInterface.sequelize.query(`
      CREATE OR REPLACE VIEW birds_top_users_records_year AS 
      SELECT "userId" as user_id, COUNT(*) as count
      FROM 
        (
          SELECT "userId"
          FROM "FormBirds"
          WHERE "observationDateTime" >= DATE_TRUNC('year', NOW())
          UNION ALL
          SELECT "userId"
          FROM "FormCBM"
          WHERE "observationDateTime" >= DATE_TRUNC('year', NOW())
          UNION ALL
          SELECT "userId"
          FROM "FormCiconia"
          WHERE "observationDateTime" >= DATE_TRUNC('year', NOW())
        ) form
      JOIN "Users" u ON form."userId" = u.id
      WHERE u.privacy = 'public'
      GROUP BY "userId"
      ORDER BY count DESC
    `)

    await queryInterface.sequelize.query(`
      CREATE OR REPLACE VIEW birds_top_species_month AS
      SELECT species, COUNT(*) AS count
      FROM 
        (
          SELECT species
          FROM "FormBirds"
          WHERE "observationDateTime" >= CURRENT_DATE - INTERVAL '1 month'
          UNION ALL
          SELECT species
          FROM "FormCBM"
          WHERE "observationDateTime" >= CURRENT_DATE - INTERVAL '1 month'
          UNION ALL
          SELECT 'Ciconia ciconia' as species
          FROM "FormCiconia"
          WHERE "observationDateTime" >= CURRENT_DATE - INTERVAL '1 month'
        ) form
      GROUP BY species
      ORDER BY COUNT(*) DESC
    `)

    await queryInterface.sequelize.query(`
          CREATE OR REPLACE VIEW birds_top_interesting_species_month AS 
          SELECT "userId" as user_id, species, count, "observationDateTime", location, form_name
          FROM 
            (
              SELECT "userId", species, count, "observationDateTime", location, 'birds' as form_name
              FROM "FormBirds"
              WHERE "observationDateTime" >= CURRENT_DATE - INTERVAL '1 month'
              AND count > 0
              AND (NOT confidential OR confidential IS NULL)
              UNION ALL
              SELECT "userId", species, count, "observationDateTime", l."nameBg" as location, 'cbm' as form_name
              FROM "FormCBM"
              LEFT OUTER JOIN "Zones" z ON "zoneId" = z.id
              LEFT OUTER JOIN "Locations" l ON z."locationId" = l.id
              WHERE "observationDateTime" >= CURRENT_DATE - INTERVAL '1 month'
              AND count > 0
              AND (NOT confidential OR confidential IS NULL)
            ) form
          LEFT OUTER JOIN "Users" u ON "userId" = u.id
          LEFT OUTER JOIN "Species" s ON "labelLa" = species AND type = 'birds'
          WHERE interesting = true
          AND (NOT sensitive OR sensitive IS NULL)
          AND u.privacy = 'public'
          ORDER BY "observationDateTime" DESC
        `)
  },

  down: async function (queryInterface, Sequelize) {
    if (queryInterface.sequelize.options.dialect !== 'postgres') return
    await queryInterface.sequelize.query('DROP VIEW IF EXISTS birds_top_users_species_month')
    await queryInterface.sequelize.query('DROP VIEW IF EXISTS birds_top_users_records_month')
    await queryInterface.sequelize.query('DROP VIEW IF EXISTS birds_top_users_species_year')
    await queryInterface.sequelize.query('DROP VIEW IF EXISTS birds_top_users_records_year')
    await queryInterface.sequelize.query('DROP VIEW IF EXISTS birds_top_species_month')
    await queryInterface.sequelize.query(`DROP VIEW IF EXISTS birds_top_interesting_species_month`)
  }
}
