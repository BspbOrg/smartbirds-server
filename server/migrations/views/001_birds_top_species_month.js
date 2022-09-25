module.exports = {
  up: `
      CREATE OR REPLACE VIEW birds_top_species_month AS
      SELECT species, COUNT(*) AS count
      FROM
        (
          SELECT species, "observationDateTime"
          FROM "FormBirds"

          UNION ALL

          SELECT species, "observationDateTime"
          FROM "FormCBM"

          UNION ALL

          SELECT 'Ciconia ciconia' as species, "observationDateTime"
          FROM "FormCiconia"
        ) form
      WHERE "observationDateTime" >= CURRENT_DATE - INTERVAL '1 month'
      GROUP BY species
      ORDER BY COUNT(*) DESC
  `,
  down: `
      DROP VIEW IF EXISTS birds_top_species_month
  `
}
