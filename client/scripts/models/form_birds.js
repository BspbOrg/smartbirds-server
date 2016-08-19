/**
 * Created by groupsky on 08.01.16.
 */

var angular = require('angular');

require('../app').factory('FormBirds', function ($resource, ENDPOINT_URL, db) {

  var FormBirds = $resource(ENDPOINT_URL + '/birds/:id', {
    id: '@id'
  }, {
    // api methods
  });

  // instance methods
  angular.extend(FormBirds.prototype, {
    getUser: function() {
      return db.users[this.user];
    },
    getSpecies: function() {
      return db.species.birds && db.species.birds[this.species];
    }
  });

  // class methods
  angular.extend(FormBirds, {
    
  });

  return FormBirds;
});
