/**
 * Created by groupsky on 12.04.16.
 */

const _ = require('lodash')
const Promise = require('bluebird')
const writeFile = Promise.promisify(require('fs').writeFile)
const { upgradeTask } = require('../utils/upgrade')
const languages = require('../../config/languages')
const capitalizeFirstLetter = require('../utils/capitalizeFirstLetter')
const { QueryTypes } = require('sequelize')

module.exports.generateStatistics = upgradeTask('ah17', {
  name: 'stats:generate',
  description: 'generates statistics for homepage',
  queue: 'default',
  // use cronjob to schedule the task
  // npm run enqueue stats:generate
  frequency: 0,
  run: async function (api, params, next) {
    try {
      const currentYear = new Date().getFullYear()
      const stats = await Promise.props({

        campaign_stats: api.sequelize.sequelize.query('select last_value as total_count from "FormBirds_id_seq"', { type: api.sequelize.sequelize.QueryTypes.SELECT }).then(rows => rows[0]),
        birds_stats: api.models.birds_stats.findAll(),
        cbm_stats: api.models.cbm_stats.findAll(),
        ciconia_stats: api.models.ciconia_stats.findAll(),
        fishes_stats: api.models.fishes_stats.findAll(),
        herptiles_stats: api.models.herptiles_stats.findAll(),
        mammals_stats: api.models.mammals_stats.findAll(),
        invertebrates_stats: api.models.invertebrates_stats.findAll(),
        plants_stats: api.models.plants_stats.findAll(),
        threats_stats: api.models.threats_stats.findAll()
          .then(records => {
            return records.map(r => {
              const obj = {
                latitude: r.latitude,
                longitude: r.longitude,
                observationDateTime: r.observationDateTime
              }

              switch (r.primaryType) {
                case 'poison':
                  for (const lang in languages) {
                    if (languages[lang].threatsPrimaryType.poison) {
                      obj[`threats${capitalizeFirstLetter(lang)}`] = languages[lang].threatsPrimaryType.poison
                    }
                  }
                  break
                default:
                  obj.threatsEn = r.threatsEn
                  if (r.threatsLocal) {
                    obj[`threats${capitalizeFirstLetter(r.threatsLang)}`] = r.threatsLocal
                  }
                  break
              }

              return obj
            })
          }),
        user_rank_stats: api.models.user_rank_stats.findAll({})
          .then(records => {
            return records.map(r => r.apiData(api)).reduce((result, current) => ({ ...result, ...current }), {})
          }),
        total_user_records_stats: api.models.total_users_records_year.findAll({
          limit: 10,
          include: [api.models.total_users_records_year.associations.user],
          order: [['count', 'DESC']]
        }).then(records => records.map(r => r.apiData(api))),
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

          interesting_species: api.models.birds_top_interesting_species_month.findAll({
            include: [
              api.models.birds_top_interesting_species_month.associations.speciesInfo,
              api.models.birds_top_interesting_species_month.associations.user
            ],
            order: [['observationDateTime', 'DESC']],
            limit: 20
          }).then(records => records.map(r => r.apiData(api)))
        }),
        ...(['fishes', 'herptiles', 'invertebrates', 'mammals', 'plants'].map(form => ({
          [form + '_top_stats']: Promise.props({
            top_users_species_year: api.models[form + '_top_users_species_year'].findAll({
              limit: 10,
              include: [api.models[form + '_top_users_species_year'].associations.user],
              order: [['count', 'DESC']]
            }).then(records => records.map(r => r.apiData(api))),

            top_users_records_year: api.models[form + '_top_users_records_year'].findAll({
              limit: 10,
              include: [api.models[form + '_top_users_records_year'].associations.user],
              order: [['count', 'DESC']]
            }).then(records => records.map(r => r.apiData(api))),

            top_species_month: api.models[form + '_top_species_month'].findAll({
              limit: 10,
              include: [api.models[form + '_top_species_month'].associations.speciesInfo],
              order: [['count', 'DESC']]
            }).then(records => records.map(r => r.apiData(api))),

            interesting_species: api.models[form + '_top_interesting_species_month'].findAll({
              include: [
                api.models[form + '_top_interesting_species_month'].associations.speciesInfo,
                api.models[form + '_top_interesting_species_month'].associations.user
              ],
              order: [['observationDateTime', 'DESC']],
              limit: 20
            }).then(records => records.map(r => r.apiData(api)))
          })
        })).reduce((a, b) => ({ ...a, ...b }))),
        bgatlas2008_global_stats: api.models.bgatlas2008_stats_global.findAll({
          include: [
            api.models.bgatlas2008_stats_global.associations.utmCoordinates
          ]
        }).map((r) => r.apiData()),
        [`birds_migrations_peak_daily_species_${currentYear}`]: api.sequelize.sequelize.query(`select * from birds_migrations_peak_daily_species where year = ${currentYear}`, { type: QueryTypes.SELECT }).then(results => results.map(({ migration_point_bg: migrationPointBg, migration_point_en: migrationPointEn, ...row }) => ({ ...row, migration_point: { label: { bg: migrationPointBg, en: migrationPointEn } } }))),
        [`birds_migrations_season_totals_${currentYear}`]: api.sequelize.sequelize.query(`select * from birds_migrations_season_totals where year = ${currentYear}`, { type: QueryTypes.SELECT }).then(results => results.map(({ migration_point_bg: migrationPointBg, migration_point_en: migrationPointEn, ...row }) => ({ ...row, migration_point: { label: { bg: migrationPointBg, en: migrationPointEn } } }))),
        birds_migrations_top_interesting_species_month: api.sequelize.sequelize.query('select * from birds_migrations_top_interesting_species_month', { type: QueryTypes.SELECT }).then(results => results.map(({ migration_point_bg: migrationPointBg, migration_point_en: migrationPointEn, ...row }) => ({ ...row, migration_point: { label: { bg: migrationPointBg, en: migrationPointEn } } })))
      })

      await Promise.props(_.mapValues(stats, function (stat, name) {
        return writeFile(api.config.general.paths.public[0] + '/' + name + '.json', JSON.stringify(stat))
      }))

      next()
    } catch (error) {
      next(error)
    }
  }
})
