var angular = require('angular')
var LocalCache = require('./mixins/local_cache')

require('../app').factory('FormMammals', /* @ngInject */function ($resource, ENDPOINT_URL, db) {
  var FormMammals = $resource(ENDPOINT_URL + '/mammals/:id', {
    id: '@id'
  }, {
    // api methods
    export: { method: 'POST', url: ENDPOINT_URL + '/export/mammals' }
  })

  // instance methods
  angular.extend(FormMammals.prototype, {
    getUser: function () {
      return db.users[this.user]
    },
    getSpecies: function () {
      return db.species.mammals && db.species.mammals[this.species]
    },
    preCopy: function () {
      delete this.species
      delete this.sex
      delete this.age
      delete this.habitat
      delete this.findings
      delete this.count
      delete this.marking
      delete this.axisDistance
      delete this.weight
      delete this.sCLL
      delete this.mPLLcdC
      delete this.mCWA
      delete this.hLcapPl
      delete this.tempSubstrat
      delete this.tempAir
      delete this.tempCloaca
      delete this.sqVentr
      delete this.sqCaud
      delete this.sqDors
      delete this.speciesNotes
    }
  })

  // class methods
  angular.extend(FormMammals, {
  })

  LocalCache.inject(FormMammals, {
    name: 'mammals'
  })

  return FormMammals
})
