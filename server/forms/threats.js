const _ = require('lodash')
const { assign } = Object

exports = module.exports = _.cloneDeep(require('./_common'))

exports.tableName = 'FormThreats'
exports.hasSpecies = true

exports.fields = assign(exports.fields, {
  category: {
    type: 'choice',
    uniqueHash: true,
    relation: {
      model: 'nomenclature',
      filter: { type: 'threats_category' }
    }
  },
  species: {
    type: 'choice',
    public: true,
    uniqueHash: true,
    relation: {
      model: 'species'
    }
  },
  estimate: {
    type: 'choice',
    relation: {
      model: 'nomenclature',
      filter: { type: 'threats_estimate' }
    }
  },
  poisonedType: 'text',
  stateCarcass: {
    type: 'choice',
    relation: {
      model: 'nomenclature',
      filter: { type: 'threats_state_carcass' }
    }
  },
  sampleTaken1: {
    type: 'choice',
    relation: {
      model: 'nomenclature',
      filter: { type: 'threats_sample' }
    }
  },
  sampleTaken2: {
    type: 'choice',
    relation: {
      model: 'nomenclature',
      filter: { type: 'threats_sample' }
    }
  },
  sampleTaken3: {
    type: 'choice',
    relation: {
      model: 'nomenclature',
      filter: { type: 'threats_sample' }
    }
  },
  location: {
    type: 'text',
    required: true
  },
  class: 'text',
  sampleCode1: 'text',
  sampleCode2: 'text',
  sampleCode3: 'text',
  count: '+int',
  threatsNotes: 'text',
  primaryType: 'text'
})

exports.foreignKeys.push({
  targetModelName: 'species',
  as: 'speciesInfo',
  foreignKey: 'species',
  targetKey: 'labelLa'
})

exports.listInputs = {
  primaryType: {},
  class: {}
}

exports.filterList = async function (api, data, q) {
  if (data.params.primaryType) {
    q.where = _.extend(q.where || {}, {
      primaryType: data.params.primaryType
    })
  }
  if (data.params.class) {
    q.where = _.extend(q.where || {}, {
      class: data.params.class
    })
  }
  return q
}

exports.indexes.push({ fields: ['species'] })
