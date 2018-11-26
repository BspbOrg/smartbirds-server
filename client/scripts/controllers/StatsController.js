require('../app').controller('StatsController', /* @ngInject */function ($scope, api, form, prefix) {
  var controller = this
  controller.form = form
  controller.translationPrefix = prefix

  controller.tab = 'interesting'

  api.stats[controller.form + '_top_stats']().then(function (stats) {
    controller.stats = stats
  })
})
