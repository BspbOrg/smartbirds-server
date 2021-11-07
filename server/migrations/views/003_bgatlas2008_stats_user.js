module.exports = {
  up: `
    CREATE OR REPLACE VIEW bgatlas2008_stats_user AS
    SELECT
      c.utm_code,
      c.user_id,
      COALESCE(spec_known, 0) as spec_known,
      COALESCE(spec_unknown, 0) as spec_unknown,
      COALESCE((SELECT count(e.species)::integer FROM bgatlas2008_species e WHERE c.utm_code = e.utm_code), 0) as spec_old,
      COALESCE(records_count, 0) as records_count
    FROM (SELECT utm_code, u.id as user_id FROM bgatlas2008_cells c, "Users" u) c
    LEFT JOIN (
      SELECT
        utm_code,
        user_id,
        SUM(case when existing then 1 else 0 end)::integer AS spec_known,
        SUM(case when existing then 0 else 1 end)::integer AS spec_unknown,
        SUM(records_count)::integer as records_count
      FROM bgatlas2008_observed_user_species o
      GROUP BY utm_code, user_id
    ) s ON (c.utm_code = s.utm_code AND c.user_id = s.user_id)
  `,
  down: `
    DROP VIEW IF EXISTS bgatlas2008_stats_user
  `
}
