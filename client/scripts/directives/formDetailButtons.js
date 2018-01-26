require('../app').directive('formDetailButtons', /* @ngInject */function () {
  return {
    restrict: 'E',
    require: '^form',
    templateUrl: '/views/directives/formdetailbuttons.html',
    scope: {
      monitoringDetailController: '<'
    },
    link: function ($scope, $element, $attrs, formCtrl) {
      $scope.smartform = formCtrl
    }
  }
})
