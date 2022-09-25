const forms = require('./_forms')

module.exports = {
  up: forms.map(form => `
    CREATE OR REPLACE VIEW ${form.viewPrefix}_top_interesting_species_month AS
    SELECT "userId" as user_id, species, count, "observationDateTime", location, "autoLocationEn", "autoLocationLocal", "autoLocationLang"
    FROM "${form.tableName}" form
    LEFT OUTER JOIN "Users" u ON "userId" = u.id
    LEFT OUTER JOIN "Species" s ON "labelLa" = species AND type = '${form.speciesType}'
    WHERE "observationDateTime" >= CURRENT_DATE - INTERVAL '1 month'
    AND count > 0
    AND (NOT confidential OR confidential IS NULL)
    AND interesting = true
    AND (NOT sensitive OR sensitive IS NULL)
    AND u.privacy = 'public'
    ORDER BY "observationDateTime" DESC
  `),
  down: forms.map(form => `
    DROP VIEW IF EXISTS ${form.viewPrefix}_top_interesting_species_month
  `)
}
