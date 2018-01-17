const _ = require('lodash')

// Common form fields
exports.fields = {
  latitude: {
    type: 'num',
    required: true,
    uniqueHash: true
  },
  longitude: {
    type: 'num',
    required: true,
    uniqueHash: true
  },
  observationDateTime: {
    type: 'timestamp',
    required: true,
    uniqueHash: true
  },
  monitoringCode: {
    type: 'text',
    required: true
  },
  endDateTime: {
    type: 'timestamp',
    required: true
  },
  startDateTime: {
    type: 'timestamp',
    required: true
  },
  observers: {
    type: 'text'
  },
  rain: {
    type: 'choice',
    relation: {
      model: 'nomenclature',
      filter: { type: 'main_rain' }
    }
  },
  temperature: 'num',
  windDirection: {
    type: 'choice',
    relation: {
      model: 'nomenclature',
      filter: { type: 'main_wind_direction' }
    }
  },
  windSpeed: {
    type: 'choice',
    relation: {
      model: 'nomenclature',
      filter: { type: 'main_wind_force' }
    }
  },
  cloudiness: {
    type: 'choice',
    relation: {
      model: 'nomenclature',
      filter: { type: 'main_cloud_level' }
    }
  },
  cloudsType: 'text',
  visibility: '+num',
  mto: 'text',
  notes: 'text',
  threats: {
    type: 'multi',
    relation: {
      model: 'nomenclature',
      filter: { type: 'main_threats' }
    }
  },
  pictures: 'json',
  track: 'text',

  // Internal fields
  user: {
    type: 'choice',
    required: true,
    uniqueHash: true,
    relation: {
      model: 'user'
    }
  },
  createdAt: {
    type: 'timestamp',
    required: true
  },
  updatedAt: {
    type: 'timestamp',
    required: true
  },
  imported: 'int'
}

exports.foreignKeys = [
  { targetModelName: 'user', as: 'user' }
]

exports.indexes = [
  { fields: [ 'userId' ] }
]

exports.exportSkipFields = [
  'observers',
  'hash',
  'user',
  'speciesInfo',
  'observationDateTime',
  'endDateTime',
  'startDateTime',
  'imported',
  'createdAt',
  'updatedAt',
  'pictures',
  'notes',
  'speciesNotes',
  'track'
]
