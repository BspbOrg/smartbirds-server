'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    if (queryInterface.sequelize.options.dialect !== 'postgres') return
    await queryInterface.sequelize.query(`
      CREATE OR REPLACE VIEW birds_top_interesting_species_month AS
      SELECT
        user_id,
        species,
        SUM(count)::integer AS count,
        DATE_TRUNC('day', observation_date_time) AS "observationDateTime",
        NULL::text as location,
        form_name,
        auto_location_en AS "autoLocationEn",
        auto_location_local AS "autoLocationLocal",
        auto_location_lang AS "autoLocationLang"
      FROM birds_observations
      LEFT OUTER JOIN "Users" u ON user_id = u.id
      LEFT OUTER JOIN "Species" s ON "labelLa" = species AND type = 'birds'
      WHERE observation_date_time >= CURRENT_DATE - INTERVAL '1 month'
      AND count > 0
      AND (NOT confidential OR confidential IS NULL)
      AND interesting = true
      AND (NOT sensitive OR sensitive IS NULL)
      AND u.privacy = 'public'
      AND auto_location_en IS NOT NULL
      GROUP BY form_name, user_id, species, DATE_TRUNC('day', observation_date_time), auto_location_en, auto_location_local, auto_location_lang
      ORDER BY "observationDateTime" DESC
    `)
  },

  down: async (queryInterface, Sequelize) => {
    if (queryInterface.sequelize.options.dialect !== 'postgres') return
    await queryInterface.sequelize.query(`
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
    `)
  }
}
