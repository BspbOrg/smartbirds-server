/**
 * Created by groupsky on 12.04.16.
 */

var _ = require('lodash');
var Promise = require('bluebird');
var writeFile = Promise.promisify(require("fs").writeFile);

module.exports.generateStatistics = {
  name: 'stats:generate',
  description: 'generates statistics for homepage',
  queue: 'default',
  // every 24 hours
  frequency: 24 * 60 * 60 * 1000,
  run: function (api, params, next) {
    Promise.resolve(params)

      .then(function () {
        return Promise.props({

          birds: api.models.birds_stats.findAll(),
          cbm: api.models.cbm_stats.findAll(),
          ciconia: api.models.ciconia_stats.findAll(),
          herps: api.models.herps_stats.findAll(),

        });
      })

      .then(function (stats) {
        return Promise.props(_.mapValues(stats, function (stat, table) {
          return writeFile(api.config.general.paths.public[0] + '/' + table + '_stats.json', JSON.stringify(stat));
        }));
      })

      // final statement
      .then(function () {
        next();
      }, function (error) {
        next(error);
      });
  }
};
