/**
 * Created by groupsky on 26.01.16.
 */

require('../app').directive('sbTable', /*@ngInject*/function($parse) {
  return {
    restrict: 'A',
    controller: /*@ngInject*/function() {

    },
    require: 'sbTable',
    link: function ($scope, $elem, $attrs, sbTable) {
      var $getter = $parse($attrs.sbTable);
      var $setter = $getter.assign;
      sbTable.order = $getter($scope);
      if (!sbTable.order) {
        $setter($scope, sbTable.order={});
      }
    }
  }
});
