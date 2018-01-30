'use strict'

module.exports = {
  up: async function (queryInterface, Sequelize) {
    if (queryInterface.sequelize.options.dialect !== 'postgres') return

    await queryInterface.sequelize.query(`
      CREATE OR REPLACE VIEW birds_top_users_species_month AS 
      SELECT "userId" as user_id, COUNT(DISTINCT species) as count
      FROM "FormBirds" form
      JOIN "Users" u ON "userId" = u.id
      WHERE "observationDateTime" >= CURRENT_DATE - INTERVAL '1 month'
      AND (NOT confidential OR confidential IS NULL)
      AND u.privacy = 'public'
      GROUP BY "userId"
      ORDER BY count DESC
    `)

    await queryInterface.sequelize.query(`
      CREATE OR REPLACE VIEW birds_top_users_records_month AS 
      SELECT "userId" as user_id, COUNT(*) as count
      FROM "FormBirds" form
      JOIN "Users" u ON "userId" = u.id
      WHERE "observationDateTime" >= CURRENT_DATE - INTERVAL '1 month'
      AND (NOT confidential OR confidential IS NULL)
      AND u.privacy = 'public'
      GROUP BY "userId"
      ORDER BY count DESC
    `)

    await queryInterface.sequelize.query(`
      CREATE OR REPLACE VIEW birds_top_users_species_year AS 
      SELECT "userId" as user_id, COUNT(DISTINCT species) as count
      FROM "FormBirds" form
      JOIN "Users" u ON "userId" = u.id
      WHERE "observationDateTime" >= DATE_TRUNC('year', NOW())
      AND (NOT confidential OR confidential IS NULL)
      AND u.privacy = 'public'
      GROUP BY "userId"
      ORDER BY count DESC
    `)

    await queryInterface.sequelize.query(`
      CREATE OR REPLACE VIEW birds_top_users_records_year AS 
      SELECT "userId" as user_id, COUNT(*) as count
      FROM "FormBirds" form
      JOIN "Users" u ON "userId" = u.id
      WHERE "observationDateTime" >= DATE_TRUNC('year', NOW())
      AND (NOT confidential OR confidential IS NULL)
      AND u.privacy = 'public'
      GROUP BY "userId"
      ORDER BY count DESC
    `)

    await queryInterface.sequelize.query(`
      CREATE OR REPLACE VIEW birds_top_species_month AS 
      SELECT species, COUNT(*) AS count
      FROM "FormBirds" form
      WHERE "observationDateTime" >= CURRENT_DATE - INTERVAL '1 month'
      AND (NOT confidential OR confidential IS NULL)
      GROUP BY species
      ORDER BY count DESC
    `)
  },

  down: async function (queryInterface, Sequelize) {
    if (queryInterface.sequelize.options.dialect !== 'postgres') return
    await queryInterface.sequelize.query('DROP VIEW IF EXISTS birds_top_users_species_month')
    await queryInterface.sequelize.query('DROP VIEW IF EXISTS birds_top_users_records_month')
    await queryInterface.sequelize.query('DROP VIEW IF EXISTS birds_top_users_species_year')
    await queryInterface.sequelize.query('DROP VIEW IF EXISTS birds_top_users_records_year')
    await queryInterface.sequelize.query('DROP VIEW IF EXISTS birds_top_species_month')
  }
}
