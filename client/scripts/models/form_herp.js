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
    },
    preCopy: function() {
      delete this.species;
      delete this.sex;
      delete this.age;
      delete this.habitat;
      delete this.threatsHerps;
      delete this.count;
      delete this.marking;
      delete this.axisDistance;
      delete this.weight;
      delete this.sCLL;
      delete this.mPLLcdC;
      delete this.mCWA;
      delete this.hLcapPl;
      delete this.tempSubstrat;
      delete this.tempAir;
      delete this.tempCloaca;
      delete this.sqVentr;
      delete this.sqCaud;
      delete this.sqDors;
      delete this.speciesNotes;
    },
  });

  // class methods
  angular.extend(FormHerp, {

  });

  return FormHerp;
});
