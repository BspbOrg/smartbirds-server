var angular = require('angular')

require('../app').factory('FormPlants', /* @ngInject */function ($resource, ENDPOINT_URL, db) {
  var Form = $resource(ENDPOINT_URL + '/plants/:id', {
    id: '@id'
  }, {
    // api methods
    export: { method: 'POST', url: ENDPOINT_URL + '/export/plants' }
  })

  // instance methods
  angular.extend(Form.prototype, {
    getUser: function () {
      return db.users[ this.user ]
    },
    getSpecies: function () {
      return db.species.plants && db.species.plants[ this.species ]
    },
    getAccompanyingSpecies: function () {
      return db.species.plants && (this.accompanyingSpecies || []).map(species => db.species.plants[ species ])
    },
    preCopy: function () {
      delete this.species
      delete this.elevation
      delete this.habitat
      delete this.accompanyingSpecies
      delete this.reportingUnit
      delete this.phenologicalPhase
      delete this.count
      delete this.density
      delete this.cover
      delete this.threatsPlants
      delete this.speciesNotes
      delete this.location
    }
  })

  // class methods
  angular.extend(Form, {})

  return Form
})
