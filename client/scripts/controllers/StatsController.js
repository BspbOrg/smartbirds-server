require('../app').controller('StatsController', /* @ngInject */function ($scope, $state, api, form, prefix) {
  var controller = this
  controller.form = form
  controller.translationPrefix = prefix

  controller.tab = 'interesting'

  api.stats[controller.form + '_top_stats']().then(function (stats) {
    controller.stats = stats
  })

  controller.generateInterestingSpeciesUrl = function (record) {
    var formName = record.form || controller.form
    return $state.href('auth.monitoring.public.' + formName, {
      user: record.observer.id,
      species: record.species.label.la,
      from_date: record.date,
      to_date: record.date,
      tab: 'map'
    })
  }

  controller.generateTopSpeciesUrl = function (record) {
    var fromDate = new Date()
    fromDate.setMonth(fromDate.getMonth() - 1)
    return $state.href('auth.monitoring.public.' + controller.form, {
      species: record.species.label.la,
      from_date: fromDate,
      tab: 'map'
    })
  }

  controller.generateTopUserUrl = function (record) {
    var fromDate = new Date()
    fromDate.setMonth(0)
    fromDate.setDate(1)
    return $state.href('auth.monitoring.public.' + controller.form, {
      user: record.user.id,
      from_date: fromDate,
      tab: 'map'
    })
  }
})
