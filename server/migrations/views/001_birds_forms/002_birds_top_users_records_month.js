module.exports = {
  up: `
      CREATE OR REPLACE VIEW birds_top_users_records_month AS
      SELECT form.user_id as user_id, COUNT(*) as count
      FROM birds_observations form
      JOIN "Users" u ON form.user_id = u.id
      WHERE form.observation_date_time >= CURRENT_DATE - INTERVAL '1 month'
      AND u.privacy = 'public'
      GROUP BY form.user_id
      ORDER BY count DESC
  `,
  down: `
      DROP VIEW IF EXISTS birds_top_users_records_month
  `
}
