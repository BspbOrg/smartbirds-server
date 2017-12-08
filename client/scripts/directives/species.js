/**
 * Created by groupsky on 17.03.16.
 */

require('../app').directive('species', /* @ngInject */function ($sce, $parse, db) {
  return {
    restrict: 'A',
    require: 'ngModel',
    link: function ($scope, $elem, $attrs, $ngModel) {
      var typeGetter = $parse($attrs.species)
      $ngModel.$formatters.push(function (modelValue) {
        if (!modelValue) return modelValue
        var species = db.species[typeGetter($scope)][modelValue]

        return species.toString()
      })
    }
  }
})
