/**
 * Created by groupsky on 10.11.15.
 */

require('../app').service('api', function ($log, $http, $resource, $q, ENDPOINT_URL, User) {

  var api = this;

  api.session = {
    login: function (auth) {
      return $http({
        method: 'POST',
        url: ENDPOINT_URL + '/session',
        data: auth,
        withCredentials: true
      });
    },
    restore: function(xsrf) {
      return $http({
        method: 'PUT',
        url: ENDPOINT_URL + '/session',
        data: {
          csrfToken: xsrf
        },
        withCredentials: true
      });
    }
  };


});
