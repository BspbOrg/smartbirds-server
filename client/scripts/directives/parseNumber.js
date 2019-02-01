require('../app').directive('parseNumber', function () {
  return {
    restrict: 'A',
    require: 'ngModel',
    link: function (scope, element, attrs, ngModel) {
      ngModel.$formatters.push(function (value) {
        return parseFloat(value)
      })
    }
  }
})
