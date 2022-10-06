module.exports = {
  up: `
    CREATE OR REPLACE VIEW birds_migrations_peak_daily_species AS
    SELECT
      DATE_TRUNC('day', observation_date_time) as observation_date,
      season,
      migration_point_en,
      species,
      sum(count) as count
    FROM birds_migrations_observations
    LEFT OUTER JOIN "Users" u ON user_id = u.id
    WHERE season is not null
    AND observation_date_time >= DATE_TRUNC('year', CURRENT_DATE - INTERVAL '1 year')
    AND count > 0
    AND (NOT confidential OR confidential IS NULL)
    AND u.privacy = 'public'
    GROUP BY DATE_TRUNC('day', observation_date_time), season, migration_point_en, species
    ORDER BY observation_date DESC, count DESC
  `,
  down: `
    DROP VIEW IF EXISTS birds_migrations_peak_daily_species
  `
}
