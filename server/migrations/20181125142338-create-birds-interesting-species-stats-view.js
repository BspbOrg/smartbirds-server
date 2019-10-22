'use strict'

module.exports = {
  up: async function (queryInterface, Sequelize) {
    if (queryInterface.sequelize.options.dialect !== 'postgres') return new Promise(resolve => resolve())

    await queryInterface.sequelize.query(`
          CREATE OR REPLACE VIEW birds_top_interesting_species_month AS 
          SELECT "userId" as user_id, species, count, "observationDateTime", location
          FROM "FormBirds" form
          LEFT OUTER JOIN "Users" u ON "userId" = u.id
          LEFT OUTER JOIN "Species" s ON "labelLa" = species AND type = 'birds'
          WHERE "observationDateTime" >= CURRENT_DATE - INTERVAL '1 month'
          AND count > 0
          AND (NOT confidential OR confidential IS NULL)
          AND interesting = true
          AND (NOT sensitive OR sensitive IS NULL)
          AND u.privacy = 'public'
          ORDER BY "observationDateTime" DESC
        `)
  },

  down: async function (queryInterface, Sequelize) {
    if (queryInterface.sequelize.options.dialect !== 'postgres') return new Promise(resolve => resolve())

    await queryInterface.sequelize.query('DROP VIEW IF EXISTS birds_top_interesting_species_month')
  }
}
