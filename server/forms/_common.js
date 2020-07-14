const extra = require('./_extra')
const latitude = require('./_fields/latitude')
const longitude = require('./_fields/longitude')
const observationDateTime = require('./_fields/observationDateTime')

// Common form fields - all forms except CBM
exports.fields = {
  ...extra.fields,
  ...latitude.fields,
  ...longitude.fields,
  ...observationDateTime.fields,
  monitoringCode: {
    type: 'text',
    required: true,
    uniqueHash: true
  },
  endDateTime: {
    type: 'timestamp',
    required: true,
    uniqueHash: true
  },
  startDateTime: {
    type: 'timestamp',
    required: true,
    uniqueHash: true
  },
  observers: {
    type: 'text',
    uniqueHash: true
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
  pictures: {
    type: 'json',
    public: true
  },
  track: 'text',
  confidential: 'boolean',
  geolocationAccuracy: 'num',
  location: 'text',

  // Internal fields
  user: {
    type: 'choice',
    required: true,
    uniqueHash: true,
    relation: {
      model: 'user'
    }
  },
  organization: {
    type: 'choice',
    required: true,
    relation: {
      model: 'organization'
    },
    default: 'bspb'
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
  { fields: ['userId'] },
  { fields: ['organization'] }
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

exports.validate = {
  ...extra.validate
}
