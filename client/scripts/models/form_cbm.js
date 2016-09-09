/**
 * Created by groupsky on 08.01.16.
 */

var angular = require('angular');

require('../app').factory('FormCBM', function ($resource, ENDPOINT_URL, db) {

  var FormCBM = $resource(ENDPOINT_URL + '/cbm/:id', {
    id: '@id'
  }, {
    // api methods
  });

  // instance methods
  angular.extend(FormCBM.prototype, {
    getUser: function() {
      return db.users[this.user];
    },
    getZone: function() {
      return db.zones[this.zone];
    },
    getSpecies: function() {
      return db.species.birds && db.species.birds[this.species];
    },
    getPosition: function() {
      return new google.maps.LatLng(this.latitude, this.longitude);
    },
    hasVisit: true
  });

  // class methods
  angular.extend(FormCBM, {

  });

  return FormCBM;
});
