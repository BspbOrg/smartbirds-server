var Promise = require('bluebird');

module.exports.generateUserBanners = {
  name: "banner:generate",
  description: "banner:generate",
  queue: "default",
  // every 24 hours
  frequency: 24 * 60 * 60 * 1000,
  run: function (api, params, next) {
    Promise.resolve(params)

      .then(function () {
        return api.models.user_stats.findAll()
      })

      .then(function (usersStats) {
        return Promise.map(usersStats, function (stat) {
          return api.banner.generate(
            stat.id,
            stat.first_name+' '+stat.last_name,
            stat.entry_count,
            stat.species_count)
        })
      })

      // final statement
      .then(function () {
        next();
      }, function (error) {
        next(error);
      });
  }
};
