'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    if (queryInterface.sequelize.options.dialect !== 'postgres') return
    await queryInterface.sequelize.query(`
      CREATE OR REPLACE VIEW birds_observations AS
      SELECT
        form_name, id,
        latitude, longitude,
        "userId" as user_id, organization,
        "observationDateTime" as observation_date_time, species, count,
        "monitoringCode" as monitoring, "startDateTime" as start_datetime, "endDateTime" as end_datetime, confidential,
        "autoLocationEn" as auto_location_en, "autoLocationLocal" as auto_location_local, "autoLocationLang" as auto_location_lang,
        "bgatlas2008UtmCode" as bgatlas2008_utm_code
      FROM
        (
          SELECT
            'FormBirds' as form_name, id,
            latitude, longitude,
            "userId", organization,
            "observationDateTime", species, GREATEST(count, "countMin", "countMax") as count,
            "monitoringCode", "startDateTime", "endDateTime", confidential,
            "autoLocationEn", "autoLocationLocal", "autoLocationLang",
            "bgatlas2008UtmCode"
          FROM "FormBirds"

          UNION ALL

          SELECT
            'FormCBM' as form_name, id,
            latitude, longitude,
            "userId", organization,
            "observationDateTime", species, count,
            "monitoringCode", "startDateTime", "endDateTime", confidential,
            "autoLocationEn", "autoLocationLocal", "autoLocationLang",
            "bgatlas2008UtmCode"
          FROM "FormCBM"

          UNION ALL

          SELECT
            'FormCiconia' as form_name, id,
            latitude, longitude,
            "userId", organization,
            "observationDateTime", 'Ciconia ciconia' as species, NULL::integer as count,
            "monitoringCode", "startDateTime", "endDateTime", confidential,
            "autoLocationEn", "autoLocationLocal", "autoLocationLang",
            "bgatlas2008UtmCode"
          FROM "FormCiconia"
        ) birds_observations
    `)
  },

  down: async (queryInterface, Sequelize) => {
    if (queryInterface.sequelize.options.dialect !== 'postgres') return
    await queryInterface.sequelize.query('DROP VIEW IF EXISTS birds_observations')
  }
}
