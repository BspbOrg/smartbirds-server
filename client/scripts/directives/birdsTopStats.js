require('../app').directive('birdsTopStats', /* @ngInject */function () {
  return {
    restrict: 'AE',
    templateUrl: function (elem, attr) {
      return '/views/directives/birdsTopStats.html'
    },
    scope: {},
    controller: /* @ngInject */function ($scope, $q, api) {
      var $ctrl = this

      api.stats.birds_top_stats().then(function (stats) {
        $ctrl.stats = stats
      })
    },
    controllerAs: '$ctrl'
  }
})
