const _ = require('lodash')
const { assign } = Object

exports = module.exports = _.cloneDeep(require('./_common'))

exports.tableName = 'FormHerptiles'
exports.hasSpecies = true

exports.fields = assign(exports.fields, {
  species: {
    type: 'choice',
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
  count: {
    type: '+int',
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
  scope: { type: 'herptiles' }
})

exports.indexes.push({ fields: [ 'species' ] })
