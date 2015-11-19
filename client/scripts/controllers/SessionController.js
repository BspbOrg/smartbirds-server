/**
 * Created by groupsky on 10.11.15.
 */

require('../app').controller('SessionController', function ($log,
                                                            $rootScope,
                                                            $scope,
                                                            $state,
                                                            $stateParams,
                                                            api,
                                                            flashService,
                                                            user,
                                                            User) {

  var ctrl = this;

  if ($stateParams.email) {
    $scope.auth = $scope.auth || {};
    $scope.user = $scope.user || {};
    $scope.auth.email = $scope.user.email = $stateParams.email;
  }

  ctrl.login = function (auth) {
    ctrl.loading = true;
    $scope.form.$setPristine();
    user.authenticate(auth).then(function (identity) {
      $log.debug('auth ok', identity);
      if ($rootScope.returnToState) {
        $state.go($rootScope.returnToState.name, $rootScope.returnToStateParams);
      } else {
        $state.go('auth.dashboard');
      }
    }, function (response) {
      $log.debug('auth err', response);
      flashService.error((response && (response.error || (response.data && response.data.error))) || 'Invalid email or password');
    }).finally(function () {
      ctrl.loading = false;
    });
  };

  ctrl.register = function (user) {
    ctrl.loading = true;
    $scope.form.$setPristine();
    User.save(user).$promise.then(function (response) {
      $log.debug('user created', response);
      flashService.success("Account created successfully", true);
      $state.go('login', {email: response.user.email});
    }, function (response) {
      $log.debug('error creating user', response);
      flashService.error(response.data.error || 'Could not create account');
    }).finally(function () {
      ctrl.loading = false;
    });
  };

  ctrl.logout = function () {
    user.logout();
    $state.go('home');
  };

});
