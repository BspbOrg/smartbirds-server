const _ = require('lodash')
const { assign } = Object

exports = module.exports = _.cloneDeep(require('./_common'))

exports.tableName = 'FormMammals'
exports.hasSpecies = true

exports.fields = assign(exports.fields, {
  species: {
    type: 'choice',
    public: true,
    required: true,
    uniqueHash: true,
    relation: {
      model: 'species',
      filter: { type: 'mammals_name' }
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
    relation: {
      model: 'nomenclature',
      filter: { type: 'mammals_findings' }
    }
  },
  count: {
    type: '+int',
    public: true,
    required: true
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
  speciesNotes: 'text',
  location: {
    type: 'text',
    required: true
  }
})

exports.foreignKeys.push({
  targetModelName: 'species',
  as: 'speciesInfo',
  foreignKey: 'species',
  targetKey: 'labelLa',
  scope: { type: 'mammals' }
})

exports.indexes.push({ fields: [ 'species' ] })

exports.exportSkipFields = [
  'threatsMammals'
]
