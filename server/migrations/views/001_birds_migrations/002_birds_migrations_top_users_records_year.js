module.exports = {
  up: `
          CREATE OR REPLACE VIEW birds_migrations_top_users_records_year AS
          SELECT user_id, COUNT(*) as count
          FROM birds_migrations_observations form
          JOIN "Users" u ON user_id = u.id
          WHERE observation_date_time >= DATE_TRUNC('year', NOW())
          AND u.privacy = 'public'
          GROUP BY user_id
          ORDER BY count DESC
  `,
  down: `
    DROP VIEW IF EXISTS birds_migrations_top_users_records_year
  `
}
