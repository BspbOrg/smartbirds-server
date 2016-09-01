/**
 * Created by groupsky on 01.09.16.
 */

var angular = require('angular');

require('../app').directive('sbScrollTo', /*@ngInject*/function ($log, $rootScope, $timeout, $uiViewScroll, $window) {
  var pending;

  $rootScope.$on('$stateChangeStart', function () {
    if (pending) {
      $timeout.cancel(pending.timeout);
    }
  });
  $rootScope.$on('$stateChangeSuccess', function () {
    if (pending) {
      pending.timeout = $timeout(pending.f);
    }
  });
  $rootScope.$on('$stateChangeError', function() {
    if (pending) {
      pending.timeout = $timeout(pending.f);
    }
  });

  return {
    link: function ($scope, elem, attrs) {
      elem.on('click', function (event) {
        // if (event && angular.isFunction(event.preventDefault))
        //   event.preventDefault();

        var p = pending = {
          tries: 0,
          f: function () {
            if (pending !== p) return;
            p.tries++;
            console.log('sbScrollTo.click', p.tries);
            var selector = attrs.sbScrollTo;
            if (!selector) {
              $log.warn('no selector provided at', elem);
              pending = false;
              return;
            }

            var target = $window.document.querySelector(selector);
            if (!target) {
              if (p.tries < 3) {
                p.timeout = $timeout(p.f);
              } else {
                $log.warn('cannot find element for', selector);
                pending = false;
              }
              return;
            }

            $uiViewScroll(angular.element(target));
            pending = false;
          },
        };

        pending.timeout = $timeout(p.f);
      });
    }
  }
});
