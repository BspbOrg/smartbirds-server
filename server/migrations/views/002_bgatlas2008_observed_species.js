module.exports = {
  up: `
    CREATE MATERIALIZED VIEW bgatlas2008_observed_species AS
    SELECT
      bgatlas2008_utm_code as utm_code,
      o.species,
      SUM(count)::integer as count,
      (count(e.species) > 0) as existing
    FROM birds_observations o
    LEFT JOIN bgatlas2008_species e ON (e.utm_code = o.bgatlas2008_utm_code AND e.species = o.species)
    WHERE bgatlas2008_utm_code IS NOT NULL
    AND bgatlas2008_utm_code != ''
    GROUP BY bgatlas2008_utm_code, o.species
  `,
  down: `
    DROP MATERIALIZED VIEW IF EXISTS bgatlas2008_observed_species
  `
}
