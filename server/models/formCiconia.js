'use strict';

var _ = require('lodash');
var Promise = require('bluebird');
var Model = require('../helpers/Model');

var fields = {  
  primarySubstrateType: {
    type: 'choice',
    relation: {
      model: 'nomenclature',
      filter: { type: 'ciconia_substratum' }
    }
  },  
  electricityPole: {
    type: 'choice',
    relation: {
      model: 'nomenclature',
      filter: { type: 'ciconia_column' }
    }
  },
  nestIsOnArtificialPlatform: 'boolean',
  typeElectricityPole: {
    type: 'choice',
    relation: {
      model: 'nomenclature',
      filter: { type: 'ciconia_column_type' }
    }
  },
  tree: {
    type: 'choice',
    relation: {
      model: 'nomenclature',
      filter: { type: 'ciconia_tree' }
    }
  },
  building: {
    type: 'choice',
    relation: {
      model: 'nomenclature',
      filter: { type: 'ciconia_building' }
    }
  },
  nestOnArtificialHumanMadePlatform: 'boolean',
  nestIsOnAnotherTypeOfSubstrate: 'text',  
  nestThisYearNotUtilizedByWhiteStorks: {
    type: 'choice',
    relation: {
      model: 'nomenclature',
      filter: { type: 'ciconia_not_occupied' }
    }
  },
  thisYearOneTwoBirdsAppearedInNest: {
    type: 'choice',
    relation: {
      model: 'nomenclature',
      filter: { type: 'ciconia_new_birds' }
    }
  },
  approximateDateStorksAppeared: 'timestamp',
  approximateDateDisappearanceWhiteStorks: 'timestamp',
  thisYearInTheNestAppeared: {
    type: 'choice',
    relation: {
      model: 'nomenclature',
      filter: { type: 'ciconia_new_birds' }
    }
  },
  countJuvenilesInNest: '+int',
  nestNotUsedForOverOneYear: '+int',
  dataOnJuvenileMortalityFromElectrocutions: '+int',
  dataOnJuvenilesExpelledFromParents: '+int',
  diedOtherReasons: '+int',
  reason: 'text',    
  speciesNotes: 'text',  
  location: {
    type: 'text',
    required: true
  }  
};

var model = Model('FormCiconia', fields, [
  {targetModelName: 'user', as: 'user'},
]);

module.exports = model.getModelDefinition;

module.exports.fields = model.getFields();
module.exports.schema = model.getSchema();

module.exports.editInputs = model.getEditInputs();

module.exports.insertInputs = model.getInsertInputs();