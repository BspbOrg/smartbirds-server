/**
 * Created by groupsky on 10.11.15.
 */

require('../app').service('api', function ($log, $http, $resource, $q) {

  var api = this;
  var ENDPOINT = 'http://localhost:5000/api';

  api.session = {
    login: function (auth) {
      return $http({
        method: 'POST',
        url: ENDPOINT + '/session',
        data: auth,
        withCredentials: true
      });
    },
    restore: function(xsrf) {
      return $http({
        method: 'PUT',
        url: ENDPOINT + '/session',
        data: {
          csrfToken: xsrf
        },
        withCredentials: true
      });
    }
  };

  api.user = $resource(ENDPOINT + '/user', {}, {
    save: {method: 'PUT'},
    create: {method: 'POST'}
  });

});
