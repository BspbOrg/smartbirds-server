module.exports = {
  up: `
      CREATE OR REPLACE VIEW birds_top_users_records_year AS
      SELECT "userId" as user_id, COUNT(*) as count
      FROM
        (
          SELECT "userId", "observationDateTime"
          FROM "FormBirds"

          UNION ALL

          SELECT "userId", "observationDateTime"
          FROM "FormCBM"

          UNION ALL

          SELECT "userId", "observationDateTime"
          FROM "FormCiconia"
        ) form
      JOIN "Users" u ON form."userId" = u.id
      WHERE "observationDateTime" >= DATE_TRUNC('year', NOW())
      AND u.privacy = 'public'
      GROUP BY "userId"
      ORDER BY count DESC
  `,
  down: `
      DROP VIEW IF EXISTS birds_top_users_records_year
  `
}
