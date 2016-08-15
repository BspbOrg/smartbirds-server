'use strict';

var _ = require('lodash');
var Promise = require('bluebird');
var commonFormFields = require('../helpers/commonFormFields');
var Sequelize = require('sequelize');
var baseModel = require('../helpers/baseModel');

var fields = {
  latitude: {
    type: 'num',
    required: true
  },
  longitude: {
    type: 'num',
    required: true
  },
  observationDateTime: {
    type: 'timestamp',
    required: true
  },
  monitoringCode: {
    type: 'text',
    required: true
  },
  species: {
    type: 'choice',
    required: true,
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
    relation: {
      model: 'nomenclature',
      filter: { type: 'birds_sex' }
    }
  },
  age: {
    type: 'choice',
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
  landuse300mRadius: 'text'
};



//var fields = _.extend(fields, commonFormFields.commonFields);
//var fieldsDef = commonFormFields.generateFieldDef(fields);

// models[_.lowerFirst(modelName)].belongsTo(models.species, { as: 'speciesInfo', foreignKey: 'species', targetKey: 'labelLa' });        
// models[_.lowerFirst(modelName)].belongsTo(models.user, { as: 'user' });

var model = baseModel.CreateModel('formBirds', fields, [
  {targetModelName: 'species', as: 'speciesInfo', foreignKey: 'species', targetKey: 'labelLa'},
  {targetModelName: 'user', as: 'user'},
]);

module.exports = model.getModelDefinition;

module.exports.fields = model.getFields();
module.exports.sequelizeFieldDefinitions = model.getFieldsDef();
