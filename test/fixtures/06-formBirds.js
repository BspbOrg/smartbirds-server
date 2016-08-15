/**
 * Created by dani on 11.01.16.
 */

var lodash = require('lodash');

var baseModel = {
  observationDateTime: '10/12/2015 10:15',
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
  endDateTime: '10/12/2015 10:15',
  startDateTime: '09/12/2015 08:10',
  latitude: 42.1463749,
  longitude: 24.7492006
};

module.exports = [
  {
    model: 'formBirds',
    data: lodash.extend({}, baseModel, {
      species: 'Accipiter nisus',
      user: {email: 'user@smartbirds.com'},
    })
  },
  {
    model: 'formBirds',
    data: lodash.extend({}, baseModel, {
      species: 'Alle alle',
      user: {email: 'admin@smartbirds.com'},
    })
  },
  {
    model: 'formBirds',
    data: lodash.extend({}, baseModel, {
      species: 'Aix sponsa',
      user: {email: 'admin@smartbirds.com'},
    })
  },
  {
    model: 'formBirds',
    data: lodash.extend({}, baseModel, {
      species: 'Acrocephalus agricola',
      user: {email: 'admin@smartbirds.com'},
    })
  },
  {
    model: 'formBirds',
    data: lodash.extend({}, baseModel, {
      species: 'Acrocephalus agricola',
      user: {email: 'user2@smartbirds.com'},
    })
  }
];
