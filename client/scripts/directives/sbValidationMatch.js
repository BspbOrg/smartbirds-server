/**
 * Created by groupsky on 12.01.16.
 */
var angular = require('angular')

require('../app').directive('sbValidationMatch', /* @ngInject */function ($parse) {
  return {
    require: '?ngModel',
    restrict: 'A',
    link: function (scope, elem, attrs, ctrl) {
      if (!ctrl) {
        if (console && console.warn) {
          console.warn('Match validation requires ngModel to be on the element')
        }
        return
      }

      var matchGetter = $parse(attrs.sbValidationMatch)
      var caselessGetter = $parse(attrs.sbValidationMatchCaseless)
      var noMatchGetter = $parse(attrs.sbValidationNotMatch)

      scope.$watch(getMatchValue, function () {
        ctrl.$$parseAndValidate()
      })

      ctrl.$validators.match = function () {
        var match = getMatchValue()
        var notMatch = noMatchGetter(scope)
        var value

        if (caselessGetter(scope)) {
          value = angular.lowercase(ctrl.$viewValue) === angular.lowercase(match)
        } else {
          value = ctrl.$viewValue === match
        }
        value ^= notMatch
        return !!value
      }

      function getMatchValue () {
        var match = matchGetter(scope)
        if (angular.isObject(match) && Object.hasOwnProperty.call(match, '$viewValue')) {
          match = match.$viewValue
        }
        return match
      }
    }
  }
})
