var angular = require('angular')
var formsConfig = require('../../../config/formsConfig')

require('../app').directive('configLabel', /* @ngInject */function () {
  return {
    restrict: 'E',
    template: '{{$ctrl.label}}',
    scope: {
      config: '@?',
      value: '@?'
    },
    controller: /* @ngInject */function ($scope, $attrs, $translate) {
      var $ctrl = this
      $ctrl.label = $attrs.value

      if (!($attrs.config in formsConfig)) {
        throw new Error('Unsupported config type: "' + $attrs.config + '"\nAvailable values are: ' + Object.keys(formsConfig).join(', '))
      }

      // if not selected, display nothing
      if (!$scope.value) {
        $ctrl.label = ''
        return
      }

      var currentValue = formsConfig[$attrs.config][$scope.value]

      // validate config has label
      if (!('label' in currentValue)) {
        throw new Error('formsConfig[' + $attrs.config + '][' + $scope.value + '] is missing label key')
      }

      $translate(currentValue.label).then(function (val) { $ctrl.label = val }).catch(angular.noop)
      $ctrl.label = $translate.instant(formsConfig[$attrs.config][$scope.value].label)
    },
    controllerAs: '$ctrl'
  }
})
