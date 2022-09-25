module.exports = {
  up: `
    CREATE OR REPLACE VIEW plants_stats (
      latitude, longitude, species_count, units_count
    ) AS SELECT
      ROUND(latitude/0.05)*0.05 as lat,
      ROUND(longitude/0.05)*0.05 as lon,
      COUNT(DISTINCT species),
      SUM(count)
    FROM "FormPlants" as form
    GROUP BY lat, lon
  `,
  down: `
    DROP VIEW IF EXISTS plants_stats
  `
}
