/**
 * Created by groupsky on 11.11.15.
 */
var angular = require('angular')

var forms = require('../configs/forms')

require('../app')
  .service('user', /* @ngInject */function ($q, $cookies, api) {
    var service = this

    var _identity

    var _sessionKey = service.sessionKey = 'sb-csrf-token'

    var authDeferred = $q.defer()

    service.authPromise = authDeferred.promise

    service.identityCacheKey = 'sb-auth-identity'

    service.isResolved = function () {
      return angular.isDefined(_identity)
    }

    service.isAuthenticated = function () {
      return angular.isDefined($cookies.get(_sessionKey))
    }
    service.isInRole = function (role) {
      if (!service.isAuthenticated()) return false
      switch (role) {
        case 'user':
          return true
        case 'admin':
          return _identity.isAdmin
        case 'moderator':
          return _identity.isModerator
        default:
          return false
      }
    }
    service.isInAnyRole = function (roles) {
      if (!service.isAuthenticated()) return false
      return roles.some(function (role) {
        return service.isInRole(role)
      })
    }

    service.isAdmin = function () {
      return service.isInRole('admin')
    }

    service.isModerator = function (formName) {
      if (service.isInRole('moderator')) {
        return forms[formName] && !!(_identity.forms && _identity.forms[forms[formName].serverModel])
      }
      return false
    }

    service.canAccess = function (formName) {
      return service.isAdmin() || service.isModerator(formName)
    }

    service.getIdentity = function () {
      return _identity
    }

    service.setIdentity = function (identity) {
      _identity = identity
      if (identity == null) {
        $cookies.remove(_sessionKey)
      } else {
        authDeferred.resolve(_identity)
      }
    }

    service.authenticate = function (credentials) {
      if (credentials == null) {
        service.logout()
        return $q.when(null)
      }
      return api.session.login(credentials).then(function (response) {
        if (response.data.success) {
          $cookies.put(_sessionKey, response.data.csrfToken)
          service.setIdentity(response.data.user)
          if ('localStorage' in window) {
            window.localStorage.setItem(service.identityCacheKey, JSON.stringify(_identity))
          }
          return _identity
        }

        return $q.reject(response.data)
      })
    }

    service.logout = function () {
      api.session.logout()
      service.setIdentity(null)
      service.clearCachedIdentity()
    }

    service.clearCachedIdentity = function () {
      if ('localStorage' in window) {
        window.localStorage.removeItem(service.identityCacheKey)
      }
    }

    service.resolve = function (silent) {
      var deferred = $q.defer()

      if (_identity != null) {
        deferred.resolve(_identity)

        return deferred.promise
      }

      api.session.restore($cookies.get(_sessionKey), {
        skipSessionExpiredInterceptor: silent
      }).then(function (response) {
        if (response.data.success) {
          $cookies.put(_sessionKey, response.data.csrfToken)
          return response.data.user
        }
        return $q.reject(response.data)
      }, function (response) {
        switch (response.status) {
          case -1:
            if (!('localStorage' in window)) break
            var cachedIdentity = window.localStorage.getItem(service.identityCacheKey)
            if (!cachedIdentity) break
            var parsedIdentity
            try {
              parsedIdentity = JSON.parse(cachedIdentity)
            } catch (e) {
              console.warn('Failure while parsing cached identity', e)
              break
            }
            if (!parsedIdentity) break
            return parsedIdentity
          case 400:
            service.setIdentity(null)
            return $q.reject(response.data)
        }
        $q.reject(response)
      }).then(function (identity) {
        service.setIdentity(identity)
        deferred.resolve(_identity)
        if ('localStorage' in window) {
          window.localStorage.setItem(service.identityCacheKey, JSON.stringify(identity))
        }
      }, function (error) {
        service.clearCachedIdentity()
        deferred.reject(error)
      })

      return deferred.promise
    }

    return service
  })
