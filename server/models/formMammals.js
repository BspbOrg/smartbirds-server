'use strict'

var Model = require('../helpers/Model')

var fields = {
  species: {
    type: 'choice',
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
  count: {
    type: '+int',
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
}

var model = Model('FormMammals', fields, [
  {
    targetModelName: 'species',
    as: 'speciesInfo',
    foreignKey: 'species',
    targetKey: 'labelLa',
    scope: { type: 'mammals' }
  },
  { targetModelName: 'user', as: 'user' }
])

module.exports = model.getModelDefinition

module.exports.fields = model.getFields()
module.exports.schema = model.getSchema()

module.exports.editInputs = model.getEditInputs()

module.exports.insertInputs = model.getInsertInputs()
