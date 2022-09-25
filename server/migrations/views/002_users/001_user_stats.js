const forms = require('./_forms')

module.exports = {
  up: `
      CREATE OR REPLACE VIEW user_stats (
        id, species_count, entry_count, first_name, last_name
      ) AS
       SELECT
         users.id as id,
         ${forms.map(form => `coalesce(${form}.species_count, 0)`).join(' + ')} AS species_count,
         ${forms.map(form => `coalesce(${form}.count, 0)`).join(' + ')} AS entry_count,
         users."firstName" as first_name,
         users."lastName" as last_name

       FROM "Users" users
       ${forms.map(form => `
         LEFT JOIN (
           SELECT
             user_id as id,
             count(DISTINCT species) as species_count,
             count(*) as count
           FROM ${form}_observations as ${form}
           GROUP BY user_id
         ) ${form} USING (id)
       `).join('\n')}
  `,
  down: `
      DROP VIEW IF EXISTS user_stats
  `
}
