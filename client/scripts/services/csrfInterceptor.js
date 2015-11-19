/**
 * Created by groupsky on 13.11.15.
 */

require('../app').factory('csrfInterceptor', function($q, $cookies) {
  return {
    request: function(config) {
      var session = $cookies.get('sb-csrf-token');
      config.withCredentials = true;
      config.headers['x-sb-csrf-token'] = session;
      return config;
    },
    response: function(response) {
      return response;
    }
  }
});
