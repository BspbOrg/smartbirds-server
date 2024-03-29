const _ = require('lodash')
const { assign } = Object

exports = module.exports = _.cloneDeep(require('./_common'))

exports.tableName = 'FormPylonsCasualties'
exports.hasSpecies = true
exports.hasThreats = false

exports.fields = assign(exports.fields, {
  species: {
    type: 'choice',
    required: true,
    public: true,
    uniqueHash: true,
    relation: {
      model: 'species',
      filter: { type: 'birds' }
    }
  },
  count: {
    type: '+int',
    public: true,
    required: true,
    uniqueHash: true
  },
  age: {
    type: 'choice',
    uniqueHash: true,
    relation: {
      model: 'nomenclature',
      filter: { type: 'birds_age' }
    }
  },
  sex: {
    type: 'choice',
    uniqueHash: true,
    relation: {
      model: 'nomenclature',
      filter: { type: 'birds_sex' }
    }
  },
  causeOfDeath: {
    type: 'choice',
    required: true,
    uniqueHash: true,
    relation: {
      model: 'nomenclature',
      filter: { type: 'pylons_cause_of_death' }
    }
  },
  bodyCondition: {
    type: 'choice',
    relation: {
      model: 'nomenclature',
      filter: { type: 'pylons_body_condition' }
    }
  },
  habitat100mPrime: {
    type: 'choice',
    relation: {
      model: 'nomenclature',
      filter: { type: 'pylons_habitat' }
    }
  },
  habitat100mSecond: {
    type: 'choice',
    relation: {
      model: 'nomenclature',
      filter: { type: 'pylons_habitat' }
    }
  },
  speciesNotes: {
    type: 'text',
    uniqueHash: true
  }
})

exports.simpleExportFields = [
  'id',
  'observationDate',
  'observationTime',
  'firstName',
  'lastName',
  'email',
  'otherObservers',
  'autoLocationLocal',
  'autoLocationEn',
  'latitude',
  'longitude',
  'location',
  'species',
  'speciesBg',
  'speciesEn',
  'count',
  'ageLocal',
  'ageEn',
  'sexLocal',
  'sexEn',
  'causeOfDeathLocal',
  'causeOfDeathEn',
  'bodyConditionLocal',
  'bodyConditionEn',
  'habitat100mPrimeLocal',
  'habitat100mPrimeEn',
  'habitat100mSecondLocal',
  'habitat100mSecondEn',
  'sourceLocal',
  'sourceEn',
  'speciesNotes',
  'notes'
]

exports.foreignKeys.push({
  targetModelName: 'species',
  as: 'speciesInfo',
  foreignKey: 'species',
  targetKey: 'labelLa',
  scope: { type: 'birds' }
})

exports.indexes.push({ fields: ['species'] })
