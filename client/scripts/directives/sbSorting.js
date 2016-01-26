/**
 * Created by groupsky on 26.01.16.
 */

var noop = require('angular').noop;
var isFunction = require('angular').isFunction;
require('../app').directive('sbSorting', /*@ngInject*/function ($timeout) {
  return {
    restrict: 'A',
    require: '^sbTable',
    link: function ($scope, $elem, $attrs, sbTable) {
      var key = $attrs.sbSorting;

      $elem.on('click', function (event) {
        isFunction(event.preventDefault) && event.preventDefault();
        isFunction(event.stopPropagation) && event.stopPropagation();

        if (sbTable.order.elem)
          sbTable.order.elem.removeClass('sorted asc desc');

        sbTable.order.reverse = sbTable.order.key === key && !sbTable.order.reverse;
        sbTable.order.key = key;
        sbTable.order.elem = $elem;

        $elem.addClass('sorted').addClass(sbTable.order.reverse ? 'desc' : 'asc');

        $timeout(noop);
      });
    }
  }
});
