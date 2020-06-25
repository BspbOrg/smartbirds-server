const _ = require('lodash')
const { assign } = Object

exports = module.exports = _.cloneDeep(require('./_common'))

exports.tableName = 'FormInvertebrates'
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
      filter: { type: 'invertebrates_name' }
    }
  },
  sex: {
    type: 'choice',
    uniqueHash: true,
    relation: {
      model: 'nomenclature',
      filter: { type: 'invertebrates_gender' }
    }
  },
  age: {
    type: 'choice',
    uniqueHash: true,
    relation: {
      model: 'nomenclature',
      filter: { type: 'invertebrates_age' }
    }
  },
  habitat: {
    type: 'choice',
    relation: {
      model: 'nomenclature',
      filter: { type: 'invertebrates_habitat' }
    }
  },
  threatsInvertebrates: {
    type: 'multi',
    relation: {
      model: 'nomenclature',
      filter: { type: 'invertebrates_danger_observation' }
    }
  },
  findings: {
    type: 'multi',
    uniqueHash: true,
    relation: {
      model: 'nomenclature',
      filter: { type: 'invertebrates_findings' }
    }
  },
  count: {
    type: '+int',
    public: true,
    required: true,
    uniqueHash: true
  },
  marking: 'text',
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
  scope: { type: 'invertebrates' }
})

exports.indexes.push({ fields: ['species'] })

exports.exportSkipFields.push('threatsHerptiles')
