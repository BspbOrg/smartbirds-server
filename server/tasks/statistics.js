/**
 * Created by groupsky on 12.04.16.
 */

var Promise = require('bluebird');
var writeFile = Promise.promisify(require("fs").writeFile);

module.exports.generateStatistics = {
  name: 'stats:generate',
  description: 'generates statistics for homepage',
  queue: 'default',
  // every 24 hours
  frequency: 24*60*60*1000,
  run: function(api, params, next) {
    Promise.resolve(params)

      .then(function() {
        return api.models.statistics.findAll();
      })

      .then(function(stats) {
        return writeFile(api.config.general.paths.public[0]+'/stats.json', JSON.stringify(stats));
      })

      // final statement
      .then(function(){
        next();
      }, function(error){
        next(error);
      });
  }
};
