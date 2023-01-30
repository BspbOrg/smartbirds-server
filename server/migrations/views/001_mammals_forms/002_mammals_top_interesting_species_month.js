module.exports = {
  up: `
    CREATE OR REPLACE VIEW mammals_top_interesting_species_month AS
    SELECT
      user_id,
      species,
      count,
      observation_date_time as "observationDateTime",
      location,
      auto_location_en as "autoLocationEn",
      auto_location_local as "autoLocationLocal",
      auto_location_lang as "autoLocationLang"
    FROM "mammals_observations" form
    LEFT OUTER JOIN "Users" u ON user_id = u.id
    LEFT OUTER JOIN "Species" s ON "labelLa" = species
      AND ((form_name = 'FormMammals' AND type = 'mammals') OR (form_name = 'FormBats' AND type = 'bats'))
    WHERE "observation_date_time" >= CURRENT_DATE - INTERVAL '1 month'
    AND count > 0
    AND (NOT confidential OR confidential IS NULL)
    AND interesting = true
    AND (NOT sensitive OR sensitive IS NULL)
    AND u.privacy = 'public'
    ORDER BY "observation_date_time" DESC
  `,
  down: `
    DROP VIEW IF EXISTS mammals_top_interesting_species_month
  `
}
