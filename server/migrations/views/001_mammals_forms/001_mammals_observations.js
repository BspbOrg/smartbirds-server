module.exports = {
  up: `
    CREATE OR REPLACE VIEW mammals_observations AS
    SELECT
      form_name, id,
      latitude, longitude, "geolocationAccuracy",
      "userId" as user_id, organization,
      "observationDateTime" as observation_date_time, species, count,
      "monitoringCode" as monitoring, "startDateTime" as start_datetime, "endDateTime" as end_datetime, confidential,
      "moderatorReview" as moderator_review,
      "autoLocationEn" as auto_location_en, "autoLocationLocal" as auto_location_local, "autoLocationLang" as auto_location_lang,
      "observationMethodologyEn" as observation_methodology_en,
      "observationMethodologyLocal" as observation_methodology_local,
      "observationMethodologyLang" as observation_methodology_lang,
      "sourceLocal", "sourceLang", "sourceEn",
      location,
      "createdAt", "updatedAt"
    FROM
      (
        SELECT
          'FormMammals' as form_name, id,
          latitude, longitude, "geolocationAccuracy",
          "userId", organization,
          "observationDateTime", species, count,
          "monitoringCode", "startDateTime", "endDateTime", confidential,
          "moderatorReview",
          "autoLocationEn", "autoLocationLocal", "autoLocationLang",
          "observationMethodologyEn", "observationMethodologyLocal", "observationMethodologyLang",
          "sourceLocal", "sourceLang", "sourceEn",
          location,
          "createdAt", "updatedAt"
        FROM "FormMammals"

        UNION ALL

        SELECT
          'FormBats' as form_name, id,
          latitude, longitude, "geolocationAccuracy",
          "userId", organization,
          "observationDateTime", species, count,
          "monitoringCode", "startDateTime", "endDateTime", confidential,
          "moderatorReview",
          "autoLocationEn", "autoLocationLocal", "autoLocationLang",
          "observationMethodologyEn", "observationMethodologyLocal", "observationMethodologyLang",
          "sourceLocal", "sourceLang", "sourceEn",
          location,
          "createdAt", "updatedAt"
        FROM "FormBats"
      ) mammals_observations
  `,
  down: `
    DROP VIEW IF EXISTS mammals_observations
  `
}
