require('../app').directive('campaign', /* @ngInject */function () {
  return {
    restrict: 'AE',
    templateUrl: '/views/directives/campaign.html',
    scope: {},
    controller: /* @ngInject */function ($scope, $q, api) {
      var $ctrl = this

      api.stats.campaign_stats().then(function (stats) {
        $ctrl.stats = stats
      })
    },
    controllerAs: '$ctrl'
  }
})
