var angular = require('angular')

require('../app').factory('FormThreats', /* @ngInject */function ($localStorage, $resource, $translate, ENDPOINT_URL, db) {
  var FormThreats = $resource(ENDPOINT_URL + '/threats/:id', {
    id: '@id'
  }, {
    // api methods
    export: { method: 'POST', url: ENDPOINT_URL + '/export/threats' }
  })

  // instance methods
  angular.extend(FormThreats.prototype, {
    getUser: function () {
      return db.users[ this.user ]
    },
    getSpecies: function () {
      return db.species.birds && db.species.birds[ this.species ]
    },
    preCopy: function () {
      delete this.category
      delete this.species
      delete this.estimate
      delete this.poisonedType
      delete this.stateCarcass
      delete this.sampleTaken1
      delete this.sampleTaken2
      delete this.sampleTaken3
      delete this.location
      delete this.class
      delete this.sampleCode1
      delete this.sampleCode2
      delete this.sampleCode3
      delete this.count
      delete this.threatsNotes
    }
  })

  // class methods
  angular.extend(FormThreats, {})

  return FormThreats
})
