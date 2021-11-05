module.exports = {
  up: `
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
  `,
  down: `
    DROP VIEW IF EXISTS birds_top_interesting_species_month
  `
}
