/**
 * Created by dani on 11.01.16.
 */

var lodash = require('lodash')

var baseModel = {
  monitoringCode: 'random_354',
  countUnitBg: 'Гнездо(а)',
  countUnitEn: 'Nests',
  typeUnitBg: 'Диапазон',
  typeUnitEn: 'Range',
  countMin: 2,
  countMax: 10,
  location: 'some location',
  count: 10,
  species: 'Accipiter nisus',
  notes: 'Some test notes',
  visibility: 5.5,
  mto: 'pretty nice weather',
  cloudinessBg: '33-66',
  cloudinessEn: '33-66',
  cloudsType: 'Light grey clouds',
  windDirectionBg: 'ene',
  windDirectionEn: 'ene',
  windSpeedBg: '2-light-breeze',
  windSpeedEn: '2-light-breeze',
  temperature: 24.3,
  rainBg: 'drizzle',
  rainEn: 'drizzle',
  observers: 'Some test observers',
  endDateTime: '2015-12-10T11:15Z',
  startDateTime: '2015-12-10T09:15Z',
  latitude: 42.1463749,
  longitude: 24.7492006
}

module.exports = [
  {
    model: 'formBirds',
    data: lodash.extend({}, baseModel, {
      species: 'Accipiter nisus',
      user: {email: 'user@smartbirds.com'},
      observationDateTime: '2016-12-10T10:15:01Z'
    })
  },
  {
    model: 'formBirds',
    data: lodash.extend({}, baseModel, {
      species: 'Accipiter nisus',
      user: {email: 'user@smartbirds.com'},
      observationDateTime: '2016-12-20T10:15:02Z'
    })
  },
  {
    model: 'formBirds',
    data: lodash.extend({}, baseModel, {
      species: 'Accipiter nisus',
      user: {email: 'user@smartbirds.com'},
      observationDateTime: '2016-12-30T10:15:03Z',
      location: 'some_unq_location'
    })
  },
  {
    model: 'formBirds',
    data: lodash.extend({}, baseModel, {
      species: 'Alle alle',
      user: {email: 'admin@smartbirds.com'},
      observationDateTime: '2015-12-10T10:15:04Z'
    })
  },
  {
    model: 'formBirds',
    data: lodash.extend({}, baseModel, {
      species: 'Aix sponsa',
      user: {email: 'admin@smartbirds.com'},
      observationDateTime: '2015-12-10T10:15:05Z'
    })
  },
  {
    model: 'formBirds',
    data: lodash.extend({}, baseModel, {
      species: 'Acrocephalus agricola',
      user: {email: 'admin@smartbirds.com'},
      observationDateTime: '2015-12-10T10:15:06Z'
    })
  },
  {
    model: 'formBirds',
    data: lodash.extend({}, baseModel, {
      species: 'Acrocephalus agricola',
      user: {email: 'user2@smartbirds.com'},
      observationDateTime: '2015-12-10T10:15:07Z'
    })
  }
]
