const Promise = require('bluebird')
const { upgradeTask } = require('../utils/upgrade')

module.exports.generateUserBanners = upgradeTask('ah17', {
  name: 'banner:generate',
  description: 'banner:generate',
  queue: 'default',
  // use cronjob to schedule the task
  // npm run enqueue banner:generate
  frequency: 0,
  run: function (api, params, next) {
    Promise.resolve(params)

      .then(function () {
        return api.models.user_stats.findAll()
      })

      .then(function (usersStats) {
        return Promise.map(usersStats, function (stat) {
          return api.banner.generate(
            stat.id,
            stat.first_name + ' ' + stat.last_name,
            stat.entry_count,
            stat.species_count)
        })
      })

      // final statement
      .then(function () {
        next()
      }, function (error) {
        next(error)
      })
  }
})
