'use strict'

var Model = require('../helpers/Model')

var fields = {
  source: {
    type: 'choice',
    relation: {
      model: 'nomenclature',
      filter: { type: 'main_source' }
    }
  },
  species: {
    type: 'choice',
    required: true,
    uniqueHash: true,
    relation: {
      model: 'species',
      filter: { type: 'birds' }
    }
  },
  confidential: {
    type: 'boolean'
  },
  countUnit: {
    type: 'choice',
    required: true,
    uniqueHash: true,
    relation: {
      model: 'nomenclature',
      filter: { type: 'birds_count_units' }
    }
  },
  typeUnit: {
    type: 'choice',
    required: true,
    relation: {
      model: 'nomenclature',
      filter: { type: 'birds_count_type' }
    }
  },
  typeNesting: {
    type: 'choice',
    relation: {
      model: 'nomenclature',
      filter: { type: 'birds_nesting' }
    }
  },
  count: {
    type: '+int',
    required: true
  },
  countMin: {
    type: '+int',
    required: true
  },
  countMax: {
    type: '+int',
    required: true
  },
  sex: {
    type: 'choice',
    uniqueHash: true,
    relation: {
      model: 'nomenclature',
      filter: { type: 'birds_sex' }
    }
  },
  age: {
    type: 'choice',
    uniqueHash: true,
    relation: {
      model: 'nomenclature',
      filter: { type: 'birds_age' }
    }
  },
  marking: {
    type: 'choice',
    relation: {
      model: 'nomenclature',
      filter: { type: 'birds_marking' }
    }
  },
  speciesStatus: {
    type: 'choice',
    relation: {
      model: 'nomenclature',
      filter: { type: 'birds_status' }
    }
  },
  behaviour: {
    type: 'multi',
    relation: {
      model: 'nomenclature',
      filter: { type: 'birds_behaviour' }
    }
  },
  deadIndividualCauses: {
    type: 'choice',
    relation: {
      model: 'nomenclature',
      filter: { type: 'birds_death' }
    }
  },
  substrate: {
    type: 'choice',
    relation: {
      model: 'nomenclature',
      filter: { type: 'birds_nest_substrate' }
    }
  },
  tree: 'text',
  treeHeight: '+num',
  treeLocation: {
    type: 'choice',
    relation: {
      model: 'nomenclature',
      filter: { type: 'birds_nest_location' }
    }
  },
  nestHeight: {
    type: 'choice',
    relation: {
      model: 'nomenclature',
      filter: { type: 'birds_nest_height' }
    }
  },
  nestLocation: {
    type: 'choice',
    relation: {
      model: 'nomenclature',
      filter: { type: 'birds_nest_position' }
    }
  },
  brooding: 'boolean',
  eggsCount: '+int',
  countNestling: '+int',
  countFledgling: '+int',
  countSuccessfullyLeftNest: '+int',
  nestProtected: 'boolean',
  ageFemale: {
    type: 'choice',
    relation: {
      model: 'nomenclature',
      filter: { type: 'birds_age_individual' }
    }
  },
  ageMale: {
    type: 'choice',
    relation: {
      model: 'nomenclature',
      filter: { type: 'birds_age_individual' }
    }
  },
  nestingSuccess: {
    type: 'choice',
    relation: {
      model: 'nomenclature',
      filter: { type: 'birds_nest_success' }
    }
  },
  landuse300mRadius: 'text',
  location: {
    type: 'text',
    required: true
  },
  speciesNotes: 'text'
}

var model = Model('FormBirds', fields, [
  {
    targetModelName: 'species',
    as: 'speciesInfo',
    foreignKey: 'species',
    targetKey: 'labelLa',
    scope: { type: 'birds' }
  },
  {targetModelName: 'user', as: 'user'}
])

module.exports = model.getModelDefinition

module.exports.fields = model.getFields()
module.exports.schema = model.getSchema()

module.exports.editInputs = model.getEditInputs()

module.exports.insertInputs = model.getInsertInputs()
