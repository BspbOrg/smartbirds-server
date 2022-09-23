module.exports = {
  up: `
    CREATE OR REPLACE VIEW ciconia_stats (
      latitude, longitude, records_count
    ) AS SELECT
      ROUND(latitude/0.05)*0.05 as lat,
      ROUND(longitude/0.05)*0.05 as lon,
      COUNT(*)
    FROM "FormCiconia" as form
    GROUP BY lat, lon
  `,
  down: `
    DROP VIEW IF EXISTS ciconia_stats
  `
}
