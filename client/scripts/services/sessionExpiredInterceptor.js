/**
 * Created by groupsky on 29.03.16.
 */

require('../app').factory('sessionExpiredInterceptor', /* @ngInject */function ($q, $injector, $cookies) {
  var loginPromise = false
  var user,
    $uibModal,
    $http,
    api

  function autoLogin () {
    return $q.resolve($cookies.get(user.sessionKey))
      .then(function (sessionKey) {
        if (!sessionKey) return $q.reject('no session key')
        return (api || (api = $injector.get('api'))).session.restore(sessionKey, {
          skipSessionExpiredInterceptor: true
        })
      })
      .then(function (response) {
        if (!response.data.success) return $q.reject(response.data)
        $cookies.put(user.sessionKey, response.data.csrfToken)
        user.setIdentity(response.data.user)
        return response.data.user
      })
  }

  function manualLogin () {
    $uibModal = $uibModal || $injector.get('$uibModal')
    return $uibModal
      .open({
        templateUrl: '/views/login-dialog.html'
      }).result.then(function (result) {
        return user.authenticate(result)
      })
  }

  return {
    responseError: function (rejection) {
      if (rejection && rejection.config && rejection.config.skipSessionExpiredInterceptor) {
        return $q.reject(rejection)
      }
      if (rejection.status === 401) {
        console.log('Unauthorized', rejection)
        user = user || $injector.get('user')
        $http = $http || $injector.get('$http')
        return (loginPromise || (loginPromise = $q.resolve(autoLogin()).catch(manualLogin)))
          .then(function retryRequest () {
            rejection.config.headers['x-sb-csrf-token'] = $cookies.get('sb-csrf-token')
            return $http(rejection.config)
          })
          .catch(function (rejection) {
            console.log('rejection', rejection)
            return $q.reject(rejection)
          })
      }
      return $q.reject(rejection)
    }
  }
})
