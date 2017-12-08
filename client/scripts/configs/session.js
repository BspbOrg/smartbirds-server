/**
 * Created by groupsky on 10.11.15.
 */

require('../app')
  .config(/* @ngInject */function ($httpProvider) {
    $httpProvider.defaults.xsrfHeaderName = 'x-sb-csrf-token'
    $httpProvider.defaults.xsrfCookieName = 'sb-csrf-token'
    $httpProvider.interceptors.push('csrfInterceptor')
    $httpProvider.interceptors.push('sessionExpiredInterceptor')
  })
