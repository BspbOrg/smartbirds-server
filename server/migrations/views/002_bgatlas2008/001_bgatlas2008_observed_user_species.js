module.exports = {
  up: `
    CREATE MATERIALIZED VIEW bgatlas2008_observed_user_species AS
    SELECT
      bgatlas2008_utm_code as utm_code,
      user_id,
      o.species,
      SUM(count)::integer as count,
      (count(e.species) > 0) as existing,
      COUNT(*)::integer as records_count
    FROM birds_observations o
    LEFT JOIN bgatlas2008_species e ON (e.utm_code = o.bgatlas2008_utm_code AND e.species = o.species)
    WHERE bgatlas2008_utm_code IS NOT NULL
    AND bgatlas2008_utm_code != ''
    AND nesting
    AND observation_date_time >= '2016-01-01'
    GROUP BY bgatlas2008_utm_code, user_id, o.species
  `,
  down: `
    DROP MATERIALIZED VIEW IF EXISTS bgatlas2008_observed_user_species
  `
}
