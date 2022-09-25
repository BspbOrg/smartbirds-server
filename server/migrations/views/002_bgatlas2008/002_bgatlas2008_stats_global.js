module.exports = {
  up: `
    CREATE OR REPLACE VIEW bgatlas2008_stats_global AS
    SELECT
      c.utm_code,
      COALESCE(s.spec_known, 0) as spec_known,
      COALESCE(s.spec_unknown, 0) as spec_unknown,
      COALESCE((SELECT count(e.species)::integer FROM bgatlas2008_species e WHERE c.utm_code = e.utm_code), 0) as spec_old,
      COALESCE(usu.selected, 0) as selected,
      COALESCE(ss.completed, FALSE) as completed
    FROM bgatlas2008_cells c
    LEFT JOIN (
      SELECT
        utm_code,
        sum(case when existing then 1 else 0 end)::integer as spec_known,
        sum(case when existing then 0 else 1 end)::integer as spec_unknown
      FROM bgatlas2008_observed_species o
      GROUP BY o.utm_code
    ) s ON (c.utm_code = s.utm_code)
    LEFT JOIN (
      SELECT
        utm_code,
        COUNT(*)::integer as selected
      FROM bgatlas2008_user_selected us
      GROUP BY utm_code
    ) usu ON (c.utm_code = usu.utm_code)
    LEFT JOIN bgatlas2008_cell_status ss ON (c.utm_code = ss.utm_code)
  `,
  down: `
    DROP VIEW IF EXISTS bgatlas2008_stats_global
  `
}
