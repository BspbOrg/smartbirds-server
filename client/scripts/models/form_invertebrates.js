var angular = require('angular')

require('../app').factory('FormInvertebrates', /* @ngInject */function ($resource, ENDPOINT_URL, db) {
  var FormInvertebrates = $resource(ENDPOINT_URL + '/invertebrates/:id', {
    id: '@id'
  }, {
    // api methods
    export: { method: 'POST', url: ENDPOINT_URL + '/export/invertebrates' }
  })

  // instance methods
  angular.extend(FormInvertebrates.prototype, {
    getUser: function () {
      return db.users[this.user]
    },
    getSpecies: function () {
      return db.species.invertebrates && db.species.invertebrates[this.species]
    },
    preCopy: function () {
      delete this.species
      delete this.sex
      delete this.age
      delete this.habitat
      delete this.threatsInvertebrates
      delete this.count
      delete this.marking
      delete this.speciesNotes
    }
  })

  // class methods
  angular.extend(FormInvertebrates, {

  })

  return FormInvertebrates
})
