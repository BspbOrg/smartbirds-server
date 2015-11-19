/**
 * Created by groupsky on 18.11.15.
 */

require('../app').directive('sortableColumn', function ($timeout) {
    return {
      restrict: 'A',
      link: function (scope, element, attr) {
        var name = attr.sortableColumn || attr.name;
        if (angular.isUndefined(name)) throw new Error('sortableColumn requires a name!');

        scope.data = scope.data || {};
        scope.data.order = scope.data.order || {};

        element.on('click', function (event) {
          $timeout(function() {
            scope.data.order.reverse = scope.data.order.key == name && !scope.data.order.reverse;
            scope.data.order.key = name;
          });
        });

        scope.$watch('data.order', function (order) {
          angular.forEach(element, function (el) {
            if (order.key == name) {
              el.classList.add('sorted');
              if (order.reverse)
                el.classList.add('reverse');
              else
                el.classList.remove('reverse');
            } else {
              el.classList.remove('sorted', 'reverse');
            }
          });
        }, true);
      }
    }
  }
);
