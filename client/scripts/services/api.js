/**
 * Created by groupsky on 10.11.15.
 */

var angular = require('angular')
require('../app').service('api', /* @ngInject */function ($log, $http, $resource, $q, $window, ENDPOINT_URL, User) {
  var api = this

  api.session = {
    login: function (auth) {
      return $http({
        method: 'POST',
        url: ENDPOINT_URL + '/session',
        data: auth,
        withCredentials: true,
        skipSessionExpiredInterceptor: true
      })
    },
    restore: function (xsrf, opts) {
      return $http(angular.extend({
        method: 'PUT',
        url: ENDPOINT_URL + '/session',
        data: {
          csrfToken: xsrf
        },
        withCredentials: true
      }, opts))
    },
    forgotPassword: function (auth) {
      return $http({
        method: 'POST',
        url: ENDPOINT_URL + '/session/' + auth.email + '/resetpw',
        data: auth
      })
    },
    resetPassword: function (auth) {
      return $http({
        method: 'POST',
        url: ENDPOINT_URL + '/session/' + auth.email + '/resetpw2',
        data: auth
      })
    },
    logout: function () {
      return $http({
        method: 'DELETE',
        url: ENDPOINT_URL + '/session'
      })
    },
    changePassword: function (userId, oldPassword, newPassword) {
      return $http({
        method: 'PATCH',
        url: ENDPOINT_URL + '/user/' + $window.encodeURIComponent(userId),
        data: {
          oldPassword: oldPassword,
          newPassword: newPassword
        }
      })
    }
  }

  api.stats = {}

  var forms = [
    'campaign',
    'birds',
    'cbm',
    'ciconia',
    'herps',
    'herptiles',
    'mammals',
    'invertebrates',
    'plants',
    'birds_top',
    'herptiles_top',
    'plants_top',
    'mammals_top',
    'invertebrates_top',
    'total_user_records',
    'user_rank'
  ]
  forms.forEach(function (form) {
    api.stats[form + '_stats'] = function () {
      return $http({
        method: 'GET',
        url: '/' + form + '_stats.json'
      }).then(function (response) {
        return response.data
      })
    }
  })
})
