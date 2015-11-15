/**
 * Created by groupsky on 13.11.15.
 */

require('../app').factory('csrfInterceptor', function($q, $cookies) {
  return {
    request: function(config) {
      //var session = $cookies.get('sb-csrf-token');
      config.withCredentials = true;
      return config;
    },
    response: function(response) {
      console.log('csrf response', response);
      return response;
    }
  }
});
