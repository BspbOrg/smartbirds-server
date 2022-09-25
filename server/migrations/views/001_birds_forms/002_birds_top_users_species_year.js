module.exports = {
  up: `
      CREATE OR REPLACE VIEW birds_top_users_species_year AS
      SELECT form.user_id as user_id, COUNT(DISTINCT form.species) as count
      FROM birds_observations form
      JOIN "Users" u ON form.user_id = u.id
      WHERE form.observation_date_time >= DATE_TRUNC('year', NOW())
      AND u.privacy = 'public'
      GROUP BY form.user_id
      ORDER BY count DESC
  `,
  down: `
      DROP VIEW IF EXISTS birds_top_users_species_year
  `
}
