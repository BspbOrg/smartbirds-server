const { api } = require('actionhero')
const PublicStatTask = require('../classes/PublicStatTask')
const { QueryTypes } = require('sequelize')

module.exports = class AtlasBspbStats extends PublicStatTask {
  constructor () {
    super()
    this.name = 'AtlasBspbStats'
    this.description = 'Export atlas statistics for use on bspb.org'
    // use cronjob to schedule the task
    // npm run enqueue AtlasBspbStats
    this.frequency = 0
  }

  async generateStats (data, worker) {
    return {
      atlas_bspb_summer_species:
        api.sequelize.sequelize.query(`
          SELECT DISTINCT b.bgatlas2008_utm_code AS "utmCode",
             b.species AS "specLat",
             s."labelBg" AS "specBG",
             s."labelEn" AS "specEN",
             (a.lat1 + a.lat2 + a.lat3 + a.lat4)/4 as "lat",
             (a.lon1 + a.lon2 + a.lon3 + a.lon4)/4 as "lon"
          FROM "birds_observations" b
          JOIN "Species" s ON (b.species = s."labelLa" AND s.type = 'birds' AND NOT s.sensitive)
          JOIN "bgatlas2008_cells" a ON (b.bgatlas2008_utm_code = a.utm_code)
          WHERE
            (
              date_part('month', b.start_datetime) = 4 OR
              date_part('month', b.start_datetime) = 5 OR
              date_part('month', b.start_datetime) = 6 OR
              (date_part('month', b.start_datetime) = 7 AND
               date_part('day', b.start_datetime) <= 15)
            )
            AND b.start_datetime >= '2016-04-01 00:00:00.000+00'
            AND b.bgatlas2008_utm_code IS NOT NULL
            AND b.bgatlas2008_utm_code != ''
        `, { type: QueryTypes.SELECT }),
      atlas_bspb_winter_species:
        api.sequelize.sequelize.query(`
          SELECT DISTINCT b.bgatlas2008_utm_code AS "utmCode",
             b.species AS "specLat",
             s."labelBg" AS "specBG",
             s."labelEn" AS "specEN",
             (a.lat1 + a.lat2 + a.lat3 + a.lat4)/4 as "lat",
             (a.lon1 + a.lon2 + a.lon3 + a.lon4)/4 as "lon"
          FROM "birds_observations" b
          JOIN "Species" s ON (b.species = s."labelLa" AND s.type = 'birds' AND NOT s.sensitive)
          JOIN "bgatlas2008_cells" a ON (b.bgatlas2008_utm_code = a.utm_code)
          WHERE
            (
              date_part('month', b.observation_date_time) = 12 OR
              date_part('month', b.observation_date_time) = 1 OR
              date_part('month', b.observation_date_time) = 2
            )
            AND b.start_datetime >= '2016-01-01 00:00:00.000+00'
            AND b.bgatlas2008_utm_code IS NOT NULL
            AND b.bgatlas2008_utm_code != ''
        `, { type: QueryTypes.SELECT })

    }
  }
}
