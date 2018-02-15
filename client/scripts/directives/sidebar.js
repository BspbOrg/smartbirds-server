require('../app').directive('sidebar', /* @ngInject */function () {
  return {
    templateUrl: '/views/directives/sidebar.html',
    scope: {},
    controller: /* @ngInject */function ($scope, $q, $state, api) {
      this.isPrivateCollapsed = !$state.includes('auth.monitoring.private')
      this.isPublicCollapsed = !$state.includes('auth.monitoring.public')
    },
    controllerAs: '$ctrl'
  }
})
