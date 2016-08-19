/**
 * Created by groupsky on 08.01.16.
 */

var angular = require('angular');

require('../app').factory('FormHerp', function ($resource, ENDPOINT_URL, db) {

  var FormHerp = $resource(ENDPOINT_URL + '/herp/:id', {
    id: '@id'
  }, {
    // api methods
  });

  // instance methods
  angular.extend(FormHerp.prototype, {
    getUser: function() {
      return db.users[this.user];
    },
    getSpecies: function() {
      return db.species.herp && db.species.herp[this.species];
    }
  });

  // class methods
  angular.extend(FormHerp, {
    
  });

  return FormHerp;
});
