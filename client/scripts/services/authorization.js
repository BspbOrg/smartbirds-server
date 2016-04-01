/**
 * Created by groupsky on 11.11.15.
 */

require('../app').service('authorization', function ($log, $q, $rootScope, $state, $timeout, User, user) {
  var service = this;

  function check() {
    var isAuthenticated = user.isAuthenticated();

    if ($rootScope.toState && $rootScope.toState.data && $rootScope.toState.data.roles && $rootScope.toState.data.roles.length > 0 && !user.isInAnyRole($rootScope.toState.data.roles)) {
      if (isAuthenticated) {
        $timeout(function () {
          $state.go('forbidden');
        });
      } else {
        //$rootScope.returnToState = $rootScope.toState;
        //$rootScope.returnToStateParams = $rootScope.toStateParams;
        //$timeout(function () {
        //  $state.go('login');
        //});
      }
      return false;
    }
    $rootScope.$user = user;
    return true;
  }

  service.authorize = function () {
    if (user.isResolved()) return check();
    return user.resolve().then(function () {
      if (check()) {
        return true;
      }
      return $q.reject();
    }, function (error) {
      $log.warn('failure to resolve user', error);
      $timeout(function () {
        $state.go(user.isAuthenticated() ? 'forbidden' : 'login');
      });
      return $q.reject(error);
    });
  };

  return service;
});
