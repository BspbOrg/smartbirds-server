require('../app').directive('monitoringList', /* @ngInject */function () {
  return {
    restrict: 'EA',
    transclude: true,
    templateUrl: '/views/directives/monitoring_list.html',
    scope: {
      monitoringController: '<'
    }
  }
})
