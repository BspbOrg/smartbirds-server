/**
 * Created by groupsky on 08.01.16.
 */

var angular = require('angular');

require('../app').factory('FormCBM', function ($resource, ENDPOINT_URL) {

  var FormCBM = $resource(ENDPOINT_URL + '/cbm/:id', {
    id: '@id'
  }, {
    // api methods
  });

  // instance methods
  angular.extend(FormCBM.prototype, {

  });

  // class methods
  angular.extend(FormCBM, {

  });

  return FormCBM;
});
