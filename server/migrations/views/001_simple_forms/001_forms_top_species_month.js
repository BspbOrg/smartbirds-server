const forms = require('./_forms')

module.exports = {
  up: forms.map(form => `
        CREATE OR REPLACE VIEW ${form.viewPrefix}_top_species_month AS
        SELECT species, COUNT(*) AS count
        FROM "${form.tableName}" form
        WHERE "observationDateTime" >= CURRENT_DATE - INTERVAL '1 month'
        GROUP BY species
        ORDER BY COUNT(*) DESC
  `),
  down: forms.map(form => `
        DROP VIEW IF EXISTS ${form.viewPrefix}_top_species_month
  `)
}
