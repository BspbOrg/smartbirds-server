const forms = require('./_forms')

module.exports = {
  up: forms.map(form => `
          CREATE OR REPLACE VIEW ${form.viewPrefix}_top_users_species_year AS
          SELECT "userId" as user_id, COUNT(DISTINCT species) as count
          FROM "${form.tableName}" form
          JOIN "Users" u ON "userId" = u.id
          WHERE "observationDateTime" >= DATE_TRUNC('year', NOW())
          AND u.privacy = 'public'
          GROUP BY "userId"
          ORDER BY count DESC
  `),
  down: forms.map(form => `
    DROP VIEW IF EXISTS ${form.viewPrefix}_top_users_species_year
  `)
}
