module.exports = {
  up: `
    CREATE OR REPLACE VIEW birds_migrations_observations AS
    SELECT
      'FormBirdsMigrations'::text as form_name, id,
      latitude, longitude,
      "userId" as user_id, organization,
      "observationDateTime" as observation_date_time, species, count,
      "monitoringCode" as monitoring, "startDateTime" as start_datetime, "endDateTime" as end_datetime, confidential,
      "moderatorReview" as moderator_review,
      "newSpeciesModeratorReview" as new_species_moderator_review,
      "autoLocationEn" as auto_location_en, "autoLocationLocal" as auto_location_local, "autoLocationLang" as auto_location_lang,
      "bgatlas2008UtmCode" as bgatlas2008_utm_code,
      "observationMethodologyEn" as observation_methodology_en,
      "observationMethodologyLocal" as observation_methodology_local,
      "observationMethodologyLang" as observation_methodology_lang,
      case
          when "observationDateTime" between
              make_date(extract(year from "observationDateTime")::int, 3, 1)
              and
              make_date(extract(year from "observationDateTime")::int, 5, 31)
          then 'spring'
          when "observationDateTime" between
              make_date(extract(year from "observationDateTime")::int, 8, 10)
              and
              make_date(extract(year from "observationDateTime")::int, 10, 30)
          then 'fall'
      end as season,
      "migrationPointEn" as migration_point_en,
      "migrationPointLocal" as migration_point_local,
      "migrationPointLang" as migration_point_lang
    FROM "FormBirdsMigrations"
  `,
  down: `
    DROP VIEW IF EXISTS birds_migrations_observations
  `
}
