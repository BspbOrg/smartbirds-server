var lodash = require('lodash')

var baseModel = {
  latitude: 42.1463749,
  longitude: 24.7492006,
  monitoringCode: 'random_mammal_1234',
  species: 'Accipiter nisus',
  count: 10,
  marking: 'some marking',
  axisDistance: 1.23,
  weight: 102,
  L: 2.3,
  C: 1.2,
  A: 3.4,
  Pl: 4.5,
  tempSubstrat: 5.4,
  tempAir: 6.5,
  speciesNotes: 'some notes text',
  location: 'location somewhere',

  endDateTime: '2015-12-10T11:15Z',
  startDateTime: '2015-12-10T15:15Z',
  observers: 'Some test observers',
  notes: 'some notes'
}

module.exports = [
  {
    model: 'formMammals',
    data: lodash.extend({}, baseModel, {
      species: 'Accipiter nisus',
      user: {email: 'user@smartbirds.com'},
      observationDateTime: '2016-12-10T10:15:01Z'
    })
  },
  {
    model: 'formMammals',
    data: lodash.extend({}, baseModel, {
      species: 'Accipiter nisus',
      user: {email: 'user@smartbirds.com'},
      observationDateTime: '2016-12-20T10:15:02Z'
    })
  },
  {
    model: 'formMammals',
    data: lodash.extend({}, baseModel, {
      species: 'Accipiter nisus',
      user: {email: 'user@smartbirds.com'},
      observationDateTime: '2016-12-30T10:15:03Z'
    })
  },
  {
    model: 'formMammals',
    data: lodash.extend({}, baseModel, {
      species: 'Alle alle',
      user: {email: 'admin@smartbirds.com'},
      observationDateTime: '2016-12-20T10:15:04Z'
    })
  },
  {
    model: 'formMammals',
    data: lodash.extend({}, baseModel, {
      species: 'Aix sponsa',
      user: {email: 'admin@smartbirds.com'},
      observationDateTime: '2016-12-20T10:15:05Z'
    })
  },
  {
    model: 'formMammals',
    data: lodash.extend({}, baseModel, {
      species: 'Acrocephalus agricola',
      user: {email: 'admin@smartbirds.com'},
      observationDateTime: '2016-12-20T10:15:06Z'
    })
  },
  {
    model: 'formMammals',
    data: lodash.extend({}, baseModel, {
      species: 'Acrocephalus agricola',
      user: {email: 'user2@smartbirds.com'},
      observationDateTime: '2016-12-20T10:15:07Z'
    })
  }
]
