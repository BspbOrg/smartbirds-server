const _ = require('lodash')
const { assign } = Object

exports = module.exports = _.cloneDeep(require('./_common'))

exports.tableName = 'FormMammals'
exports.hasSpecies = true
exports.hasThreats = true

exports.fields = assign(exports.fields, {
  species: {
    type: 'choice',
    public: true,
    required: true,
    uniqueHash: true,
    relation: {
      model: 'species',
      filter: { type: 'mammals' }
    }
  },
  sex: {
    type: 'choice',
    uniqueHash: true,
    relation: {
      model: 'nomenclature',
      filter: { type: 'mammals_gender' }
    }
  },
  age: {
    type: 'choice',
    uniqueHash: true,
    relation: {
      model: 'nomenclature',
      filter: { type: 'mammals_age' }
    }
  },
  habitat: {
    type: 'choice',
    relation: {
      model: 'nomenclature',
      filter: { type: 'mammals_habitat' }
    }
  },
  threatsMammals: {
    type: 'multi',
    relation: {
      model: 'nomenclature',
      filter: { type: 'mammals_danger_observation' }
    }
  },
  findings: {
    type: 'multi',
    uniqueHash: true,
    relation: {
      model: 'nomenclature',
      filter: { type: 'mammals_findings' }
    }
  },
  count: {
    type: '+int',
    public: true,
    required: true,
    uniqueHash: true
  },
  marking: 'text',
  axisDistance: 'num',
  weight: 'num',
  L: 'num',
  C: 'num',
  A: 'num',
  Pl: 'num',
  tempSubstrat: 'num',
  tempAir: 'num',
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
  'habitatEn',
  'habitatLocal',
  'findingsLocal',
  'findingsEn',
  'threatsMammalsLocal',
  'threatsMammalsEn',
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
  scope: { type: 'mammals' }
})

exports.indexes.push({ fields: ['species'] })

exports.exportSkipFields.push('threatsHerptiles')
