const _ = require('lodash')
const { assign } = Object

exports = module.exports = _.cloneDeep(require('./_common'))

exports.tableName = 'FormPlants'
exports.hasSpecies = true
exports.hasThreats = true

exports.fields = assign(exports.fields, {
  species: {
    type: 'choice',
    required: true,
    uniqueHash: true,
    public: true,
    relation: {
      model: 'species',
      filter: { type: 'plants' }
    }
  },
  elevation: {
    type: 'num',
    uniqueHash: true
  },
  habitat: {
    type: 'choice',
    uniqueHash: true,
    relation: {
      model: 'nomenclature',
      filter: { type: 'plants_habitat' }
    }
  },
  accompanyingSpecies: {
    type: 'multi',
    uniqueHash: true,
    relation: {
      model: 'species',
      filter: { type: 'plants' }
    }
  },
  reportingUnit: {
    type: 'choice',
    uniqueHash: true,
    relation: {
      model: 'nomenclature',
      filter: { type: 'plants_reporting_unit' }
    }
  },
  phenologicalPhase: {
    type: 'choice',
    uniqueHash: true,
    relation: {
      model: 'nomenclature',
      filter: { type: 'plants_phenological_phase' }
    }
  },
  count: {
    type: '+int',
    public: true,
    uniqueHash: true
  },
  density: {
    type: 'num',
    uniqueHash: true
  },
  cover: {
    type: 'num',
    uniqueHash: true
  },
  threatsPlants: {
    type: 'multi',
    uniqueHash: true,
    relation: {
      model: 'nomenclature',
      filter: { type: 'plants_threats' }
    }
  },
  speciesNotes: {
    type: 'text',
    uniqueHash: true
  }
})

exports.foreignKeys.push({
  targetModelName: 'species',
  as: 'speciesInfo',
  foreignKey: 'species',
  targetKey: 'labelLa',
  scope: { type: 'plants' }
})

exports.indexes.push({ fields: ['species'] })
