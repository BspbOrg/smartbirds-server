const _ = require('lodash')
const { assign } = Object

exports = module.exports = _.cloneDeep(require('./_common'))

exports.tableName = 'FormHerps'
exports.hasSpecies = true
exports.hasThreats = true

exports.fields = assign(exports.fields, {
  species: {
    type: 'choice',
    required: true,
    public: true,
    uniqueHash: true,
    relation: {
      model: 'species',
      filter: { type: 'herp_name' }
    }
  },
  sex: {
    type: 'choice',
    uniqueHash: true,
    relation: {
      model: 'nomenclature',
      filter: { type: 'herp_gender' }
    }
  },
  age: {
    type: 'choice',
    uniqueHash: true,
    relation: {
      model: 'nomenclature',
      filter: { type: 'herp_age' }
    }
  },
  habitat: {
    type: 'choice',
    relation: {
      model: 'nomenclature',
      filter: { type: 'herp_habitat' }
    }
  },
  threatsHerps: {
    type: 'multi',
    relation: {
      model: 'nomenclature',
      filter: { type: 'herp_danger_observation' }
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
  scope: { type: 'herp' }
})

exports.indexes.push({ fields: [ 'species' ] })
