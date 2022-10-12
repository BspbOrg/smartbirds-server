const _ = require('lodash')
const { assign } = Object

exports = module.exports = _.cloneDeep(require('./_common'))

exports.tableName = 'FormHerptiles'
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
      filter: { type: 'herptiles_name' }
    }
  },
  sex: {
    type: 'choice',
    uniqueHash: true,
    relation: {
      model: 'nomenclature',
      filter: { type: 'herptiles_gender' }
    }
  },
  age: {
    type: 'choice',
    uniqueHash: true,
    relation: {
      model: 'nomenclature',
      filter: { type: 'herptiles_age' }
    }
  },
  habitat: {
    type: 'choice',
    relation: {
      model: 'nomenclature',
      filter: { type: 'herptiles_habitat' }
    }
  },
  threatsHerptiles: {
    type: 'multi',
    relation: {
      model: 'nomenclature',
      filter: { type: 'herptiles_danger_observation' }
    }
  },
  findings: {
    type: 'multi',
    uniqueHash: true,
    relation: {
      model: 'nomenclature',
      filter: { type: 'herptiles_findings' }
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
  sCLL: 'num',
  mPLLcdC: 'num',
  mCWA: 'num',
  hLcapPl: 'num',
  tempSubstrat: 'num',
  tempAir: 'num',
  tempCloaca: 'num',
  sqVentr: 'num',
  sqCaud: 'num',
  sqDors: 'num',
  speciesNotes: {
    type: 'text',
    uniqueHash: true
  }
})

exports.simpleExportFields = [
  'observationDate',
  'observationTime',
  'otherObservers',
  'email',
  'firstName',
  'lastName',
  'id',
  'autoLocationEn',
  'autoLocationLocal',
  'sourceEn',
  'sourceLocal',
  'latitude',
  'longitude',
  'threatsEn',
  'threatsLocal',
  'location',
  'species',
  'sexEn',
  'sexLocal',
  'ageEn',
  'ageLocal',
  'habitatEn',
  'habitatLocal',
  'threatsHerptilesEn',
  'threatsHerptilesLocal',
  'findingsEn',
  'findingsLocal',
  'count',
  'notes',
  'speciesNotes',
  'speciesBg',
  'speciesEn'
]

exports.foreignKeys.push({
  targetModelName: 'species',
  as: 'speciesInfo',
  foreignKey: 'species',
  targetKey: 'labelLa',
  scope: { type: 'herptiles' }
})

exports.indexes.push({ fields: ['species'] })

exports.exportSkipFields.push('threatsHerptiles')
