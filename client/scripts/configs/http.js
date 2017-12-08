/**
 * Created by groupsky on 21.10.16.
 */

require('../app').config(/* @ngInject */function ($httpProvider) {
  $httpProvider.interceptors.push('sbXmlHttpInterceptor')
})
