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
  run: function (api, params, next) {
    Promise.resolve(params)

      .then(function () {
        return Promise.props({

          birds: api.models.birds_stats.findAll(),
          cbm: api.models.cbm_stats.findAll(),
          ciconia: api.models.ciconia_stats.findAll(),
          herps: api.models.herps_stats.findAll(),
          herptiles: api.models.herptiles_stats.findAll(),
          mammals: api.models.mammals_stats.findAll(),
          invertebrates: api.models.invertebrates_stats.findAll()

        })
      })

      .then(function (stats) {
        return Promise.props(_.mapValues(stats, function (stat, table) {
          return writeFile(api.config.general.paths.public[0] + '/' + table + '_stats.json', JSON.stringify(stat))
        }))
      })

      // final statement
      .then(function () {
        next()
      }, function (error) {
        next(error)
      })
  }
}
