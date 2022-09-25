const forms = require('./_forms')

module.exports = {
  up: `
    CREATE OR REPLACE VIEW user_rank_stats AS
    SELECT
      user_id,
      ${forms.map((form) => `
        ${form}_top_users_species_year.count as "${form}SpeciesCount",
        ${form}_top_users_species_year.position as "${form}SpeciesPosition",
        ${form}_top_users_records_year.count as "${form}RecordsCount",
        ${form}_top_users_records_year.position as "${form}RecordsPosition"
      `).join(', ')}
    FROM
      ${forms.map((form, index) => `
        (
          SELECT
            user_id,
            count,
            row_number() OVER (ORDER BY count DESC) as position
          FROM ${form}_top_users_species_year
        ) as ${form}_top_users_species_year ${index > 0 ? ' using (user_id) ' : ''}
        FULL JOIN (
          SELECT
            user_id,
            count,
            row_number() over (order by count desc) as position
          FROM ${form}_top_users_records_year
        ) as ${form}_top_users_records_year using (user_id)
      `).join(' FULL JOIN ')}
    ORDER BY user_id
  `,
  down: `
    DROP VIEW IF EXISTS user_rank_stats
  `
}
