require('../app').directive('totalRecordsStats', /* @ngInject */function () {
  return {
    restrict: 'AE',
    scope: true,
    templateUrl: function (elem, attr) {
      return '/views/directives/totalRecordsStats.html'
    },
    controller: /* @ngInject */function ($q, api) {
      var $ctrl = this
      api.stats.total_user_records_stats().then(function (stats) {
        $ctrl.stats = stats
      })
    },
    controllerAs: '$ctrl'
  }
})
