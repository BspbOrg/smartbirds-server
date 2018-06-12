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

  ctrl.clean = function () {
    if (ctrl.loading && ctrl.loading.$cancelRequest) {
      ctrl.loading.$cancelRequest()
    }
    ctrl.loading = false
    if ($scope.form) {
      $scope.form.$setPristine()
    }
    ctrl.requireGdprConsent = false
    flashService.clear()
  }
  ctrl.clean()

  var execute = function (cmd, success, error) {
    ctrl.clean()
    var q = ctrl.loading = cmd()
    var wrap = function (cb) {
      return function () {
        if (q !== ctrl.loading) {
          $log.debug('stale response')
          return
        }
        cb.apply(ctrl, arguments)
      }
    }
    return q.then(wrap(success), wrap(error))
      .finally(wrap(function () { ctrl.loading = false }))
  }

  ctrl.login = function (auth, callback) {
    execute(
      // operation
      user.authenticate.bind(user, auth),
      // success
      function (identity) {
        $log.debug('auth ok', identity)
        ctrl.loading = true
        if (callback) {
          callback()
        } else {
          if ($rootScope.returnToState) {
            $state.go($rootScope.returnToState.name, $rootScope.returnToStateParams)
          } else {
            $state.go('auth.dashboard')
          }
        }
      },
      // error
      function (response) {
        if (response.require === 'gdpr-consent' || response.data.require === 'gdpr-consent') {
          ctrl.requireGdprConsent = true
          flashService.error($translate.instant('Missing GDPR consent'))
          return
        }
        $log.debug('auth err', response)
        flashService.error((response && (response.error || (response.data && response.data.error))) || $translate.instant('Invalid credentials'))
      })
  }

  ctrl.register = function (user) {
    execute(
      // operation
      function () { return User.save(user).$promise },
      // success
      function (response) {
        $log.debug('user created', response)
        flashService.success($translate.instant('Profile created successfully'), true)
        $state.go('login', { email: user.email })
      },
      // error
      function (response) {
        $log.debug('error creating user', response)
        flashService.error(response.data.error || $translate.instant('Could not create profile'))
      })
  }

  ctrl.logout = function () {
    user.logout()
    $state.go('home')
  }

  ctrl.forgot = function (user) {
    execute(
      // operation
      api.session.forgotPassword.bind(null, user),
      // success
      function (response) {
        $log.debug('reset password sent', response)
        flashService.success($translate.instant('Email with instructions to reset password has been sent to {{email}}', user), true)
        $state.go('login', { email: user.email })
      },
      // error
      function (response) {
        $log.debug('error requesting password reset', response)
        flashService.error(response.data.error || $translate.instant('Password reset failed'))
      })
  }

  ctrl.reset = function (user) {
    user.token = user.token || $scope.auth.token
    execute(
      // operation
      api.session.resetPassword.bind(null, user),
      // success
      function (response) {
        $log.debug('password reset', response)
        flashService.success($translate.instant('Password changed successfully'), true)
        $state.go('login', { email: user.email })
      },
      // error
      function (response) {
        $log.debug('error resetting password', response)
        flashService.error(response.data.error || $translate.instant('Password change failed'))
      })
  }
})
