const _ = require('lodash')
const { assign } = Object

exports = module.exports = _.cloneDeep(require('./_common'))

exports.tableName = 'FormPylons'
exports.hasSpecies = false
exports.hasThreats = false

exports.fields = assign(exports.fields, {
  pylonType: {
    type: 'choice',
    required: true,
    uniqueHash: true,
    relation: {
      model: 'nomenclature',
      filter: { type: 'pylons_type' }
    }
  },
  speciesNestOnPylon: {
    type: 'choice',
    relation: {
      model: 'species',
      filter: { type: 'birds' }
    }
  },
  typeNest: {
    type: 'choice',
    relation: {
      model: 'nomenclature',
      filter: { type: 'pylons_type_nest' }
    }
  },
  pylonInsulated: {
    type: 'boolean',
    uniqueHash: true
  },
  damagedInsulation: {
    type: 'boolean'
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
  'pylonTypeEn',
  'pylonTypeLocal',
  'speciesNestOnPylon',
  'typeNestEn',
  'typeNestLocal',
  'pylonInsulated',
  'damagedInsulation',
  'habitat100mPrimeEn',
  'habitat100mPrimeLocal',
  'habitat100mSecondEn',
  'habitat100mSecondLocal',
  'notes',
  'speciesNotes'
]
