var lodash = require('lodash')

var baseModel = {
  latitude: 42.1463749,
  longitude: 24.7492006,
  monitoringCode: 'random_ciconia_1234',
  primarySubstrateTypeEn: 'Accipiter nisus',
  primarySubstrateTypeLocal: 'Accipiter nisus',
  electricityPoleEn: '10',
  electricityPoleLocal: '10',
  nestIsOnArtificialPlatform: true,
  typeElectricityPoleEn: 'some marking',
  typeElectricityPoleLocal: 'some marking',
  treeEn: 'ciconia_tree',
  treeLocal: 'ciconia_tree',
  buildingEn: 'ciconia_building',
  buildingLocal: 'ciconia_building',
  nestOnArtificialHumanMadePlatform: true,
  nestIsOnAnotherTypeOfSubstrate: 'blah blah',
  nestThisYearNotUtilizedByWhiteStorksEn: 'ciconia_not_occupied',
  nestThisYearNotUtilizedByWhiteStorksLocal: 'ciconia_not_occupied',
  thisYearOneTwoBirdsAppearedInNestEn: 'ciconia_new_birds',
  thisYearOneTwoBirdsAppearedInNestLocal: 'ciconia_new_birds',
  approximateDateStorksAppeared: '2015-03-10T12:15Z',
  approximateDateDisappearanceWhiteStorks: '2015-08-10T12:15Z',
  thisYearInTheNestAppearedEn: 'ciconia_new_birds',
  thisYearInTheNestAppearedLocal: 'ciconia_new_birds',
  countJuvenilesInNest: 3,
  nestNotUsedForOverOneYear: 1,
  dataOnJuvenileMortalityFromElectrocutions: 1,
  dataOnJuvenilesExpelledFromParents: 1,
  diedOtherReasons: 23,
  reason: 'some reason',
  speciesNotes: 'some notes text',
  location: 'location somewhere',

  endDateTime: '2015-12-10T11:15Z',
  startDateTime: '2015-12-10T15:15Z',
  observers: 'Some test observers',
  notes: 'some notes'
}

module.exports = [
  {
    model: 'formCiconia',
    data: lodash.extend({}, baseModel, {
      user: {email: 'user@smartbirds.com'},
      observationDateTime: '2016-12-10T10:15:01Z'
    })
  },
  {
    model: 'formCiconia',
    data: lodash.extend({}, baseModel, {
      user: {email: 'user@smartbirds.com'},
      observationDateTime: '2016-12-20T10:15:02Z'
    })
  },
  {
    model: 'formCiconia',
    data: lodash.extend({}, baseModel, {
      user: {email: 'user@smartbirds.com'},
      observationDateTime: '2016-12-30T10:15:03Z'
    })
  },
  {
    model: 'formCiconia',
    data: lodash.extend({}, baseModel, {
      user: {email: 'admin@smartbirds.com'},
      observationDateTime: '2016-12-10T12:15:04Z'
    })
  },
  {
    model: 'formCiconia',
    data: lodash.extend({}, baseModel, {
      user: {email: 'admin@smartbirds.com'},
      observationDateTime: '2016-12-10T12:15:05Z'
    })
  },
  {
    model: 'formCiconia',
    data: lodash.extend({}, baseModel, {
      user: {email: 'admin@smartbirds.com'},
      observationDateTime: '2016-12-10T12:15:06Z'
    })
  },
  {
    model: 'formCiconia',
    data: lodash.extend({}, baseModel, {
      user: {email: 'user2@smartbirds.com'},
      observationDateTime: '2016-12-10T12:15:07Z'
    })
  }
]
