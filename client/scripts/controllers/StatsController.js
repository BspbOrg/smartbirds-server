require('../app').controller('StatsController', /* @ngInject */function ($scope, $state, api, form, prefix, user) {
  var controller = this
  controller.form = form
  controller.translationPrefix = prefix

  controller.tab = 'interesting'

  api.stats[controller.form + '_top_stats']().then(function (stats) {
    controller.stats = stats
  })

  api.stats.user_rank_stats().then(function (stats) {
    controller.userRanks = stats
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

  controller.userRecordsPosition = function () {
    var userRank = controller.userRanks[user.getIdentity().id] && controller.userRanks[user.getIdentity().id][controller.form]
    return userRank && userRank.records.position ? userRank.records.position : '--'
  }

  controller.userRecordsCount = function () {
    var userRank = controller.userRanks[user.getIdentity().id] && controller.userRanks[user.getIdentity().id][controller.form]
    console.log(userRank)
    return userRank && userRank.records.count ? userRank.records.count : '0'
  }

  controller.userSpeciesPosition = function () {
    var userRank = controller.userRanks[user.getIdentity().id] && controller.userRanks[user.getIdentity().id][controller.form]
    return userRank && userRank.species.position ? userRank.species.position : '--'
  }

  controller.userSpeciesCount = function () {
    var userRank = controller.userRanks[user.getIdentity().id] && controller.userRanks[user.getIdentity().id][controller.form]
    return userRank && userRank.species.count ? userRank.species.count : '0'
  }
})
