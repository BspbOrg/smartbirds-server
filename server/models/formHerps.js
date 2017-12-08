'use strict'

var Model = require('../helpers/Model')

var fields = {
  species: {
    type: 'choice',
    required: true,
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
}

var model = Model('FormHerps', fields, [
  {targetModelName: 'species', as: 'speciesInfo', foreignKey: 'species', targetKey: 'labelLa'},
  {targetModelName: 'user', as: 'user'}
])

module.exports = model.getModelDefinition

module.exports.fields = model.getFields()
module.exports.schema = model.getSchema()

module.exports.editInputs = model.getEditInputs()

module.exports.insertInputs = model.getInsertInputs()
