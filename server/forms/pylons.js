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
  'pylonTypeLocal',
  'pylonTypeEn',
  'speciesNestOnPylon',
  'typeNestLocal',
  'typeNestEn',
  'pylonInsulated',
  'damagedInsulation',
  'habitat100mPrimeLocal',
  'habitat100mPrimeEn',
  'habitat100mSecondLocal',
  'habitat100mSecondEn',
  'threatsLocal',
  'threatsEn',
  'sourceLocal',
  'sourceEn',
  'speciesNotes',
  'notes'
]
