/**
 * Created by groupsky on 08.01.16.
 */

var angular = require('angular');

require('../app').factory('FormCiconia', function ($resource, ENDPOINT_URL, db) {

  var FormCiconia = $resource(ENDPOINT_URL + '/ciconia/:id', {
    id: '@id'
  }, {
    // api methods
  });

  // instance methods
  angular.extend(FormCiconia.prototype, {
    getUser: function() {
      return db.users[this.user];
    },
  });

  // class methods
  angular.extend(FormCiconia, {

  });

  return FormCiconia;
});
