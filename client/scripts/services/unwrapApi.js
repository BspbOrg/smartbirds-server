/**
 * Created by groupsky on 13.11.15.
 */

var angular = require('angular');

function defaultResourceResponseInterceptor(response) {
  var value = response.resource;
  value && (value.$$response = response);
  return value;
}

require('../app').config(/*@ngInject*/function ($httpProvider, $resourceProvider) {
  var defaults = $httpProvider.defaults;

  // make sure we are working with an array
  defaults.transformResponse =
    angular.isArray(defaults.transformResponse)
      ? defaults.transformResponse
      : [defaults.transformResponse];

  defaults.transformResponse.push(function (response) {
    // api responses are actually wrapped in a structure with real content inside data key
    if (angular.isObject(response) && response.data) {
      var data = response.data;
      // allow to inspect the original response
      data.$$response = response;
      // remove the circular reference for jsonification
      delete response.data;

      return data;
    }
    return response;
  });


  angular.forEach($resourceProvider.defaults.actions, function(action) {
    action.interceptor = action.interceptor || {};
    action.interceptor.response = defaultResourceResponseInterceptor;
  });
});
