/**
 * Created by groupsky on 10.11.15.
 */

require('../app').controller('SessionController', /* @ngInject */function ($log,
                                                            $rootScope,
                                                            $scope,
                                                            $state,
                                                            $stateParams,
                                                            $translate,
                                                            $uibModal,
                                                            api,
                                                            flashService,
                                                            user,
                                                            User) {
  var ctrl = this

  if ($stateParams.email) {
    $scope.auth = $scope.auth || {}
    $scope.user = $scope.user || {}
    $scope.auth.email = $scope.user.email = $stateParams.email
    if ($stateParams.token) { $scope.auth.token = $stateParams.token }
  }

  ctrl.login = function (auth) {
    ctrl.loading = true
    $scope.form.$setPristine()
    user.authenticate(auth).then(function (identity) {
      $log.debug('auth ok', identity)
      if ($rootScope.returnToState) {
        $state.go($rootScope.returnToState.name, $rootScope.returnToStateParams)
      } else {
        $state.go('auth.dashboard')
      }
    }, function (response) {
      $log.debug('auth err', response)
      flashService.error((response && (response.error || (response.data && response.data.error))) || $translate('Invalid credentials'))
    }).finally(function () {
      ctrl.loading = false
    })
  }

  ctrl.register = function (user) {
    ctrl.loading = true
    $scope.form.$setPristine()
    User.save(user).$promise.then(function (response) {
      $log.debug('user created', response)
      flashService.success($translate('Profile created successfully'), true)
      $state.go('login', {email: response.user.email})
    }, function (response) {
      $log.debug('error creating user', response)
      flashService.error(response.data.error || $translate('Could not create profile'))
    }).finally(function () {
      ctrl.loading = false
    })
  }

  ctrl.logout = function () {
    user.logout()
    $state.go('home')
  }

  ctrl.forgot = function (user) {
    ctrl.loading = true
    $scope.form.$setPristine()
    api.session.forgotPassword(user).then(function (response) {
      $log.debug('reset password sent', response)
      flashService.success($translate('Email with instructions to reset password has been sent to {{email}}', user), true)
      $state.go('login', {email: user.email})
    }, function (response) {
      $log.debug('error requesting password reset', response)
      flashService.error(response.data.error || $translate('Password reset failed'))
    }).finally(function () {
      ctrl.loading = false
    })
  }

  ctrl.reset = function (user) {
    user.token = user.token || $scope.auth.token
    ctrl.loading = true
    $scope.form.$setPristine()
    api.session.resetPassword(user).then(function (response) {
      $log.debug('password reset', response)
      flashService.success($translate('Password changed successfully'), true)
      $state.go('login', {email: user.email})
    }, function (response) {
      $log.debug('error resetting password', response)
      flashService.error(response.data.error || $translate('Password change failed'))
    }).finally(function () {
      ctrl.loading = true
    })
  }
})
