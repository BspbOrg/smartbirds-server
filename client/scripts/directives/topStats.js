require('../app').directive('topStats', /* @ngInject */function () {
  return {
    restrict: 'AE',
    templateUrl: function (elem, attr) {
      return '/views/directives/topStats.html'
    },
    scope: {
      form: '@',
      translationPrefix: '@'
    },
    bindToController: true,
    controller: /* @ngInject */function ($q, api) {
      var $ctrl = this
      api.stats[$ctrl.form + '_top_stats']().then(function (stats) {
        $ctrl.stats = stats
      })
    },
    controllerAs: '$ctrl'
  }
})
