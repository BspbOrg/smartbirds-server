module.exports = {
  up: `
    CREATE OR REPLACE VIEW birds_migrations_top_interesting_species_month AS
    SELECT
      form_name,
      user_id,
      species,
      migration_point_en,
      p.label_bg as migration_point_bg,
      extract(year from DATE_TRUNC('day', observation_date_time))::int as year,
      DATE_TRUNC('day', observation_date_time) AS "observationDateTime",
      SUM(count)::integer AS count
    FROM birds_migrations_observations
    LEFT OUTER JOIN "Users" u ON user_id = u.id
    LEFT OUTER JOIN "Species" s ON "labelLa" = species AND type = 'birds'
    LEFT OUTER JOIN pois p ON p.label_en = migration_point_en
    WHERE observation_date_time >= CURRENT_DATE - INTERVAL '1 month'
    AND count > 0
    AND (NOT confidential OR confidential IS NULL)
    AND interesting = true
    AND (NOT sensitive OR sensitive IS NULL)
    AND u.privacy = 'public'
    GROUP BY form_name, user_id, species, migration_point_en, p.label_bg, DATE_TRUNC('day', observation_date_time)
    ORDER BY "observationDateTime" DESC
  `,
  down: `
    DROP VIEW IF EXISTS birds_migrations_top_interesting_species_month
  `
}
