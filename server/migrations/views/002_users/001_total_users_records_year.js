const forms = require('./_forms')

module.exports = {
  up: `
    CREATE OR REPLACE VIEW total_users_records_year AS
    SELECT all_forms.user_id as user_id, SUM(all_forms.count) as count
    FROM (
      ${forms.map((form) => `
        SELECT user_id, COUNT(*) as count
        FROM ${form}_observations form
        JOIN "Users" u ON form.user_id = u.id
        WHERE form.observation_date_time >= DATE_TRUNC('year', NOW())
          AND u.privacy = 'public'
        GROUP BY form.user_id
      `).join(' UNION ALL ')}
    ) all_forms
    GROUP BY user_id
    ORDER BY count DESC
  `,
  down: `
    DROP VIEW IF EXISTS total_users_records_year
  `
}
