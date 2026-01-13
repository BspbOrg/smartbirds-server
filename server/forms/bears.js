const _ = require('lodash')
const { assign } = Object

exports = module.exports = _.cloneDeep(require('./_common'))

exports.tableName = 'FormBears'
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
      filter: { type: 'bears_gender' }
    }
  },
  age: {
    type: 'choice',
    uniqueHash: true,
    relation: {
      model: 'nomenclature',
      filter: { type: 'bears_age' }
    }
  },
  count: {
    type: '+int',
    public: true,
    required: true,
    uniqueHash: true
  },
  excrementContent: {
    type: 'multi',
    uniqueHash: true,
    relation: {
      model: 'nomenclature',
      filter: { type: 'bears_excrement_content' }
    }
  },
  excrementConsistence: {
    type: 'choice',
    uniqueHash: true,
    relation: {
      model: 'nomenclature',
      filter: { type: 'bears_excrement_consistence' }
    }
  },
  den: {
    type: 'choice',
    uniqueHash: true,
    relation: {
      model: 'nomenclature',
      filter: { type: 'bears_den' }
    }
  },
  habitat: {
    type: 'multi',
    relation: {
      model: 'nomenclature',
      filter: { type: 'bears_habitat' }
    }
  },
  threatsBears: {
    type: 'multi',
    relation: {
      model: 'nomenclature',
      filter: { type: 'bears_danger_observation' }
    }
  },
  findings: {
    type: 'multi',
    uniqueHash: true,
    relation: {
      model: 'nomenclature',
      filter: { type: 'bears_findings' }
    }
  },
  speciesNotes: {
    type: 'text'
  },
  markingHeight: 'num',
  footprintFrontPawWidth: 'num',
  footprintFrontPawLength: 'num',
  footprintHindPawWidth: 'num',
  footprintHindPawLength: 'num'
})
