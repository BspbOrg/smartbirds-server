require('../app').directive('sidebar', /* @ngInject */function () {
  return {
    templateUrl: '/views/directives/sidebar.html',
    scope: {},
    controller: /* @ngInject */function ($scope, $rootScope, $q, $state, api) {
      var ctrl = this
      ctrl.isPrivateCollapsed = !$state.includes('auth.monitoring.private')
      ctrl.isPublicCollapsed = !$state.includes('auth.monitoring.public')
      ctrl.isStatsCollapsed = !$state.includes('auth.stats')

      $rootScope.$on('$stateChangeSuccess', function () {
        ctrl.isPrivateCollapsed = !$state.includes('auth.monitoring.private')
        ctrl.isPublicCollapsed = !$state.includes('auth.monitoring.public')
        ctrl.isStatsCollapsed = !$state.includes('auth.stats')
      })
    },
    controllerAs: '$ctrl'
  }
})
