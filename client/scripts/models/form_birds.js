/**
 * Created by groupsky on 08.01.16.
 */

var angular = require('angular')

require('../app').factory('FormBirds', /* @ngInject */function ($localStorage, $resource, ENDPOINT_URL, db) {
  var FormBirds = $resource(ENDPOINT_URL + '/birds/:id', {
    id: '@id'
  }, {
    // api methods
  })

  // instance methods
  angular.extend(FormBirds.prototype, {
    afterCreate: function () {
      this.initDefaults()
    },
    getUser: function () {
      return db.users[this.user]
    },
    getSpecies: function () {
      return db.species.birds && db.species.birds[this.species]
    },
    hasSource: true,
    preSave: function () {
      this.count = parseInt(this.count) || 0
      this.countMin = parseInt(this.countMin) || 0
      this.countMax = parseInt(this.countMax) || 0
      $localStorage.defaults = $localStorage.defaults || {}
      $localStorage.defaults.birds = $localStorage.defaults.birds || {}
      $localStorage.defaults.birds.countUnit = this.countUnit
      $localStorage.defaults.birds.typeUnit = this.typeUnit
    },
    preCopy: function () {
      delete this.species
      delete this.confidential
      delete this.countUnit
      delete this.typeUnit
      delete this.typeNesting
      delete this.count
      delete this.countMin
      delete this.countMax
      delete this.sex
      delete this.age
      delete this.marking
      delete this.speciesStatus
      delete this.behaviour
      delete this.deadIndividualCauses
      delete this.substrate
      delete this.tree
      delete this.treeHeight
      delete this.treeLocation
      delete this.nestHeight
      delete this.nestLocation
      delete this.brooding
      delete this.eggsCount
      delete this.countNestling
      delete this.countFledgling
      delete this.countSuccessfullyLeftNest
      delete this.nestProtected
      delete this.ageFemale
      delete this.ageMale
      delete this.nestingSuccess
      delete this.landuse300mRadius
      delete this.speciesNotes
    },
    postCopy: function () {
      this.initDefaults()
    },
    initDefaults: function () {
      this.countUnit = (($localStorage.defaults || {}).birds || {}).countUnit
      this.typeUnit = (($localStorage.defaults || {}).birds || {}).typeUnit
    }
  })

  // class methods
  angular.extend(FormBirds, {

  })

  return FormBirds
})
