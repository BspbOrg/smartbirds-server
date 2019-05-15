require('../app')
  .service('geolocation', /* @ngInject */function ($q) {
    var service = this

    var currentLocationRequest = null

    service.isAvailable = 'geolocation' in navigator
    service.canCheckAllowed = 'permissions' in navigator

    service.checkAllowed = function () {
      return $q
        .resolve(service.canCheckAllowed && service.isAvailable)
        .then(function (canCheck) {
          if (!canCheck) return false
          return navigator.permissions
            .query({ name: 'geolocation' })
            .then(function (permission) {
              return permission.state === 'granted'
            })
        })
    }

    service.requestCurrentLocation = function () {
      // if already someone is asking for location, join that request
      if (currentLocationRequest) {
        return currentLocationRequest
      }

      // create new location request
      currentLocationRequest = $q
        .resolve(service.isAvailable)
        .then(function (isAvailable) {
          if (!isAvailable) {
            return $q.reject(new Error('Geolocation not available'))
          }
          return new Promise(function (resolve, reject) {
            navigator.geolocation
              .getCurrentPosition(resolve, reject, {
                enableHighAccuracy: true,
                timeout: 60 * 1000,
                maximumAge: 0
              })
          })
        })
        // when completed clear the request, so new one is generated next time
        .finally(function () {
          currentLocationRequest = null
        })

      return currentLocationRequest
    }
  })
