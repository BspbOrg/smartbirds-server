const forms = require('./_forms')

module.exports = {
  up: forms.map(form => `
    CREATE OR REPLACE VIEW ${form.viewPrefix}_observations AS
    SELECT
      '${form.tableName}' as form_name, id,
      latitude, longitude,
      "userId" as user_id, organization,
      "observationDateTime" as observation_date_time, species, count,
      "monitoringCode" as monitoring, "startDateTime" as start_datetime, "endDateTime" as end_datetime, confidential,
      "moderatorReview" as moderator_review,
      "autoLocationEn" as auto_location_en, "autoLocationLocal" as auto_location_local, "autoLocationLang" as auto_location_lang,
      "observationMethodologyEn" as observation_methodology_en,
      "observationMethodologyLocal" as observation_methodology_local,
      "observationMethodologyLang" as observation_methodology_lang
    FROM "${form.tableName}"
  `),
  down: forms.map(form => `
    DROP VIEW IF EXISTS ${form.viewPrefix}_observations
  `)
}
