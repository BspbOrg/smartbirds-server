/**
 * Created by groupsky on 11.01.16.
 */

require('../app').directive('sbInclude', /*@ngInject*/function() {
  return  {
    restrict: 'AE',
    transclude: true,
    replace: true,
    templateUrl: function($element, $attrs) {
      return $attrs.sbInclude || $attrs.src;
    }
  }
});
