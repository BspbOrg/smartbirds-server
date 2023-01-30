module.exports = {
  up: `
        CREATE OR REPLACE VIEW mammals_top_species_month AS
        SELECT species, COUNT(*) AS count
        FROM "mammals_observations" form
        WHERE "observation_date_time" >= CURRENT_DATE - INTERVAL '1 month'
        GROUP BY species
        ORDER BY COUNT(*) DESC
  `,
  down: `
        DROP VIEW IF EXISTS mammals_top_species_month
  `
}
