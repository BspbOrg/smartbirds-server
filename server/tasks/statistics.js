/**
 * Created by groupsky on 12.04.16.
 */

var _ = require('lodash')
var Promise = require('bluebird')
var writeFile = Promise.promisify(require('fs').writeFile)

module.exports.generateStatistics = {
  name: 'stats:generate',
  description: 'generates statistics for homepage',
  queue: 'default',
  // use cronjob to schedule the task
  // npm run enqueue stats:generate
  frequency: 0,
  run: async function (api, params, next) {
    try {
      let stats = await Promise.props({

        campaign_stats: api.sequelize.sequelize.query('select last_value as total_count from "FormBirds_id_seq"', { type: api.sequelize.sequelize.QueryTypes.SELECT }).then(rows => rows[0]),
        birds_stats: api.models.birds_stats.findAll(),
        cbm_stats: api.models.cbm_stats.findAll(),
        ciconia_stats: api.models.ciconia_stats.findAll(),
        herps_stats: api.models.herps_stats.findAll(),
        herptiles_stats: api.models.herptiles_stats.findAll(),
        mammals_stats: api.models.mammals_stats.findAll(),
        invertebrates_stats: api.models.invertebrates_stats.findAll(),
        plants_stats: api.models.plants_stats.findAll(),
        birds_top_stats: Promise.props({
          top_users_species_month: api.models.birds_top_users_species_month.findAll({
            limit: 10,
            include: [api.models.birds_top_users_species_month.associations.user],
            order: [['count', 'DESC']]
          }).then(records => records.map(r => r.apiData(api))),

          top_users_species_year: api.models.birds_top_users_species_year.findAll({
            limit: 10,
            include: [api.models.birds_top_users_species_year.associations.user],
            order: [['count', 'DESC']]
          }).then(records => records.map(r => r.apiData(api))),

          top_users_records_month: api.models.birds_top_users_records_month.findAll({
            limit: 10,
            include: [api.models.birds_top_users_records_month.associations.user],
            order: [['count', 'DESC']]
          }).then(records => records.map(r => r.apiData(api))),

          top_users_records_year: api.models.birds_top_users_records_year.findAll({
            limit: 10,
            include: [api.models.birds_top_users_records_year.associations.user],
            order: [['count', 'DESC']]
          }).then(records => records.map(r => r.apiData(api))),

          top_species_month: api.models.birds_top_species_month.findAll({
            limit: 10,
            include: [api.models.birds_top_species_month.associations.speciesInfo],
            order: [['count', 'DESC']]
          }).then(records => records.map(r => r.apiData(api))),

          interesting_species: api.models.formBirds.findAll({
            where: {
              count: { '$gt': '0' },
              confidential: { '$or': [false, null] },
              '$speciesInfo.interesting$': true,
              '$speciesInfo.sensitive$': { '$or': [false, null] },
              '$user.privacy$': 'public'
            },
            include: [api.models.formBirds.associations.speciesInfo, api.models.formBirds.associations.user],
            order: [['observationDateTime', 'DESC']],
            limit: 20
          }).then(records => Promise.all(records.map(r => {
            return {
              species: r.speciesInfo.apiData(api, 'public'),
              date: r.observationDateTime,
              location: r.location,
              count: r.count,
              observer: r.user.apiData(api, 'public')
            }
          })))
        })

      })

      await Promise.props(_.mapValues(stats, function (stat, name) {
        return writeFile(api.config.general.paths.public[0] + '/' + name + '.json', JSON.stringify(stat))
      }))

      next()
    } catch (error) {
      next(error)
    }
  }
}
