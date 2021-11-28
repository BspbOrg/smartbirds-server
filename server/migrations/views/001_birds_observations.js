module.exports = {
  up: `
    CREATE OR REPLACE VIEW birds_observations AS
    SELECT
      form_name, id,
      latitude, longitude,
      "userId" as user_id, organization,
      "observationDateTime" as observation_date_time, species, count,
      "monitoringCode" as monitoring, "startDateTime" as start_datetime, "endDateTime" as end_datetime, confidential,
      "moderatorReview" as moderator_review,
      "autoLocationEn" as auto_location_en, "autoLocationLocal" as auto_location_local, "autoLocationLang" as auto_location_lang,
      "bgatlas2008UtmCode" as bgatlas2008_utm_code,
      "observationMethodologyEn" as observation_methodology_en,
      "observationMethodologyLocal" as observation_methodology_local,
      "observationMethodologyLang" as observation_methodology_lang
    FROM
      (
        SELECT
          'FormBirds' as form_name, id,
          latitude, longitude,
          "userId", organization,
          "observationDateTime", species, GREATEST(count, "countMin", "countMax") as count,
          "monitoringCode", "startDateTime", "endDateTime", confidential, "moderatorReview",
          "autoLocationEn", "autoLocationLocal", "autoLocationLang",
          "observationMethodologyEn", "observationMethodologyLocal", "observationMethodologyLang",
          "bgatlas2008UtmCode"
        FROM "FormBirds"

        UNION ALL

        SELECT
          'FormCBM' as form_name, id,
          latitude, longitude,
          "userId", organization,
          "observationDateTime", species, count,
          "monitoringCode", "startDateTime", "endDateTime", confidential, "moderatorReview",
          "autoLocationEn", "autoLocationLocal", "autoLocationLang",
          "observationMethodologyEn", "observationMethodologyLocal", "observationMethodologyLang",
          "bgatlas2008UtmCode"
        FROM "FormCBM"

        UNION ALL

        SELECT
          'FormCiconia' as form_name, id,
          latitude, longitude,
          "userId", organization,
          "observationDateTime", 'Ciconia ciconia' as species, NULL::integer as count,
          "monitoringCode", "startDateTime", "endDateTime", confidential, "moderatorReview",
          "autoLocationEn", "autoLocationLocal", "autoLocationLang",
          "observationMethodologyEn", "observationMethodologyLocal", "observationMethodologyLang",
          "bgatlas2008UtmCode"
        FROM "FormCiconia"
      ) birds_observations
  `,
  down: `
    DROP VIEW IF EXISTS birds_observations
  `
}
