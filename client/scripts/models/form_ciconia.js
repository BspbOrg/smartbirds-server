/**
 * Created by groupsky on 08.01.16.
 */

var angular = require('angular')

require('../app').factory('FormCiconia', /* @ngInject */function ($resource, ENDPOINT_URL, db) {
  var FormCiconia = $resource(ENDPOINT_URL + '/ciconia/:id', {
    id: '@id'
  }, {
    // api methods
  })

  // instance methods
  angular.extend(FormCiconia.prototype, {
    getUser: function () {
      return db.users[this.user]
    },
    preCopy: function () {
      delete this.primarySubstrateType
      delete this.electricityPole
      delete this.nestIsOnArtificialPlatform
      delete this.typeElectricityPole
      delete this.tree
      delete this.building
      delete this.nestOnArtificialHumanMadePlatform
      delete this.nestIsOnAnotherTypeOfSubstrate
      delete this.nestThisYearNotUtilizedByWhiteStorks
      delete this.thisYearOneTwoBirdsAppearedInNest
      delete this.approximateDateStorksAppeared
      delete this.approximateDateDisappearanceWhiteStorks
      delete this.thisYearInTheNestAppeared
      delete this.countJuvenilesInNest
      delete this.nestNotUsedForOverOneYear
      delete this.dataOnJuvenileMortalityFromElectrocutions
      delete this.dataOnJuvenilesExpelledFromParents
      delete this.diedOtherReasons
      delete this.reason
      delete this.speciesNotes
    }
  })

  // class methods
  angular.extend(FormCiconia, {

  })

  return FormCiconia
})
