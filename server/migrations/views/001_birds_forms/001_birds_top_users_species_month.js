module.exports = {
  up: `
      CREATE OR REPLACE VIEW birds_top_users_species_month AS
      SELECT
        form."userId" as user_id, COUNT(DISTINCT form.species) as count
      FROM
        (
          SELECT "userId", species, "observationDateTime"
          FROM "FormBirds"

          UNION ALL

          SELECT "userId", species, "observationDateTime"
          FROM "FormCBM"

          UNION ALL

          SELECT "userId", 'Ciconia ciconia' species, "observationDateTime"
          FROM "FormCiconia"
        ) form
      JOIN "Users" u ON form."userId" = u.id
      WHERE "observationDateTime" >= CURRENT_DATE - INTERVAL '1 month'
      AND u.privacy = 'public'
      GROUP BY "userId"
      ORDER BY count DESC
  `,
  down: `
      DROP VIEW IF EXISTS birds_top_users_species_month
  `
}
