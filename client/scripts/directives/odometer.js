var Odometer = require('odometer')

require('../app').directive('sbOdometer', /* @ngInject */function () {
  return {
    restrict: 'AE',
    scope: {value: '='},
    link: function (scope, element) {
      var odometer = new Odometer({
        el: element[0],
        value: 0,
        format: 'ddd,dddd',
        duration: 2000,
        animation: 'count'
      })

      scope.$watch('value', function (value) {
        odometer.update(Math.min(parseInt(value), 999999) * 10)
      })
    }
  }
})
