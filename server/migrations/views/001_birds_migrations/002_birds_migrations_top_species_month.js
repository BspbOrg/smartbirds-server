module.exports = {
  up: `
        CREATE OR REPLACE VIEW birds_migrations_top_species_month AS
        SELECT species, SUM(count) AS count
        FROM birds_migrations_observations form
        WHERE observation_date_time >= CURRENT_DATE - INTERVAL '1 month'
        GROUP BY species
        ORDER BY count DESC
  `,
  down: `
        DROP VIEW IF EXISTS birds_migrations_top_species_month
  `
}
