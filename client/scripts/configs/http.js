/**
 * Created by groupsky on 21.10.16.
 */

require('../app').config(function($httpProvider) {
  $httpProvider.interceptors.push('xmlHttpInterceptor');
});
