const _ = require('lodash')
const { assign } = Object

exports = module.exports = _.cloneDeep(require('./_common'))

exports.tableName = 'FormInvertebrates'
exports.hasSpecies = true

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
  findings: {
    type: 'multi',
    relation: {
      model: 'nomenclature',
      filter: { type: 'invertebrates_danger_observation' }
    }
  },
  count: {
    type: '+int',
    public: true,
    required: true
  },
  marking: 'text',
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
  scope: { type: 'invertebrates' }
})

exports.indexes.push({ fields: [ 'species' ] })
