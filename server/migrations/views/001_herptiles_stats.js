module.exports = {
  up: `
    CREATE OR REPLACE VIEW herptiles_stats (
      latitude, longitude, species_count, units_count
    ) AS SELECT
      ROUND(latitude/0.05)*0.05 as lat,
      ROUND(longitude/0.05)*0.05 as lon,
      COUNT(DISTINCT species),
      SUM(count)
    FROM "FormHerptiles" as form
    GROUP BY lat, lon
  `,
  down: `
    DROP VIEW IF EXISTS herptiles_stats
  `
}
