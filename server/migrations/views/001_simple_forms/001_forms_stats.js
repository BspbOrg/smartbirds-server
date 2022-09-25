const forms = require('./_forms')

module.exports = {
  up: forms.map(form => `
    CREATE OR REPLACE VIEW ${form.viewPrefix}_stats (
      latitude, longitude, species_count, units_count
    ) AS SELECT
      ROUND(latitude/0.05)*0.05 as lat,
      ROUND(longitude/0.05)*0.05 as lon,
      COUNT(DISTINCT species),
      SUM(count)
    FROM "${form.tableName}" as form
    GROUP BY lat, lon
  `),
  down: forms.map(form => `
    DROP VIEW IF EXISTS ${form.viewPrefix}_stats
  `)
}
