require('../app').directive('sidebar', /* @ngInject */function () {
  return {
    templateUrl: '/views/directives/sidebar.html',
    scope: {},
    controller: /* @ngInject */function ($scope, $rootScope, $q, $state, api) {
      var ctrl = this

      function updateFlags () {
        ctrl.isPrivateCollapsed = !$state.includes('auth.monitoring.private')
        ctrl.isPublicCollapsed = !$state.includes('auth.monitoring.public')
        ctrl.isStatsCollapsed = !$state.includes('auth.stats')
      }

      updateFlags()

      $scope.$on('$destroy', $rootScope.$on('$stateChangeSuccess', updateFlags))
    },
    controllerAs: '$ctrl'
  }
})
