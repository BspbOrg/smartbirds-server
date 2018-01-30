require('../app').directive('exportButtons', /* @ngInject */function () {
  return {
    restrict: 'E',
    templateUrl: '/views/directives/exportbuttons.html',
    scope: {
      monitoringController: '<'
    }
  }
})
