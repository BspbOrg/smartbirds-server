module.exports = {
  up: `
    CREATE OR REPLACE VIEW mammals_stats (
      latitude, longitude, species_count, units_count
    ) AS SELECT
      ROUND(latitude/0.05)*0.05 as lat,
      ROUND(longitude/0.05)*0.05 as lon,
      COUNT(DISTINCT species),
      SUM(count)
    FROM "mammals_observations" as form
    GROUP BY lat, lon
  `,
  down: `
    DROP VIEW IF EXISTS mammals_stats
  `
}
