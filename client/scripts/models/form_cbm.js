var angular = require('angular')
var LocalCache = require('./mixins/local_cache')

require('../app').factory('FormCBM', /* @ngInject */function ($resource, ENDPOINT_URL, db) {
  var FormCBM = $resource(ENDPOINT_URL + '/cbm/:id', {
    id: '@id'
  }, {
    // api methods
    export: { method: 'POST', url: ENDPOINT_URL + '/export/cbm' }
  })

  // instance methods
  angular.extend(FormCBM.prototype, {
    getUser: function () {
      return db.users[ this.user ]
    },
    getZone: function () {
      return db.zones[ this.zone ]
    },
    getSpecies: function () {
      return db.species.birds && db.species.birds[ this.species ]
    },
    getPosition: function () {
      return { lat: this.latitude, lng: this.longitude }
    },
    preCopy: function () {
      delete this.species
      delete this.distance
      delete this.count
      delete this.plot
    },
    hasVisit: true
  })

  // class methods
  angular.extend(FormCBM, {})

  LocalCache.inject(FormCBM, {
    name: 'cbm'
  })

  return FormCBM
})
