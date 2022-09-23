module.exports = {
  up: `
    CREATE OR REPLACE VIEW birds_stats (
      latitude, longitude, species_count
    ) AS SELECT
      ROUND(latitude/0.05)*0.05 as lat,
      ROUND(longitude/0.05)*0.05 as lon,
      COUNT(DISTINCT species)
    FROM "FormBirds" as form
    GROUP BY lat, lon
  `,
  down: `
    DROP VIEW IF EXISTS birds_stats
  `
}
