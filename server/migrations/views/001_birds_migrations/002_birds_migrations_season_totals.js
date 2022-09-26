module.exports = {
  up: `
    CREATE OR REPLACE VIEW birds_migrations_season_totals AS
    SELECT
      extract(year from observation_date_time)::int as year,
      season,
      migration_point_en,
      p.label_bg as migration_point_bg,
      species,
      sum(count) as count
    FROM birds_migrations_observations
    LEFT OUTER JOIN "Users" u ON user_id = u.id
    LEFT OUTER JOIN "Species" s ON "labelLa" = species AND type = 'birds'
    LEFT OUTER JOIN pois p ON p.label_en = migration_point_en
    WHERE season is not null
    AND count > 0
    AND (NOT confidential OR confidential IS NULL)
    AND (NOT sensitive OR sensitive IS NULL)
    AND u.privacy = 'public'
    GROUP BY extract(year from observation_date_time), season, migration_point_en, p.label_bg, species
    ORDER BY year DESC, season = 'spring', migration_point_en, count desc
  `,
  down: `
    DROP VIEW IF EXISTS birds_migrations_season_totals
  `
}
