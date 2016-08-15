'use strict';

var _ = require('lodash');
var Promise = require('bluebird');
var commonFormFields = require('../helpers/commonFormFields');
var Sequelize = require('sequelize');

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

var fields = _.extend(fields, commonFormFields.commonFields);

var fieldsDef = commonFormFields.generateFieldDef(fields);


module.exports = function (sequelize, DataTypes) {
  var modelFieldDef = _.cloneDeep(fieldsDef);
  delete modelFieldDef.createdAt;
  delete modelFieldDef.updatedAt;

  return sequelize.define('FormBirds', modelFieldDef, {
    freezeTableName: true,
    indexes: [
      { fields: ['species'] },
      { fields: ['userId'] }
    ],
    classMethods: {
      associate: function (models) {
        models.formBirds.belongsTo(models.species, { as: 'speciesInfo', foreignKey: 'species', targetKey: 'labelLa' });
        //models.formCBM.belongsTo(models.species, {as: 'speciesInfo', foreignKey: 'species', targetKey: 'labelLa'});        
        models.formBirds.belongsTo(models.user, { as: 'user' });
      }
    },
    instanceMethods: {
      apiData: function (api) {
        var data = {};
        var self = this;
        return Promise.props(_.mapValues(fields, function (field, name) {
          if (_.isString(field)) field = { type: field };
          switch (field.type) {
            case 'multi':
              {
                switch (field.relation.model) {
                  case 'nomenclature':
                    {
                      var res = [];
                      var bg = self[name + 'Bg'] && self[name + 'Bg'].split('|').map(function (val) {
                        return val.trim();
                      }) || [];
                      var en = self[name + 'En'] && self[name + 'En'].split('|').map(function (val) {
                        return val.trim();
                      }) || [];
                      while (bg.length && en.length) {
                        res.push({
                          label: {
                            bg: bg.shift(),
                            en: en.shift()
                          }
                        });
                      }
                      return res;
                    }
                  default:
                    return Promise.reject(new Error('[' + name + '] Unhandled relation model ' + field.relation.model));
                }
              }
            case 'choice':
              {
                switch (field.relation.model) {
                  case 'nomenclature':
                    {
                      return (self[name + 'Bg'] || self[name + 'En']) && {
                        label: {
                          bg: self[name + 'Bg'],
                          en: self[name + 'En']
                        }
                      } || null;
                    }
                  case 'species':
                    {                    
                      return self[name];
                    }        
                  case 'user':
                    {
                      return self[name + 'Id'];
                    }
                  default:
                    return Promise.reject(new Error('[' + name + '] Unhandled relation model ' + field.relation.model));
                }
              }
            default:
              return self[name];
          }
        })).then(function (data) {
          data.id = self.id;
          data.createdAt = self.createdAt;
          data.updatedAt = self.updatedAt;
          return data;
        });
      },

      apiUpdate: function (data) {
        var self = this;

        _.forEach(fields, function (field, name) {
          switch (field.type) {
            case 'multi':
              {
                switch (field.relation.model) {
                  case 'nomenclature':
                    {
                      if (!_.has(data, name)) return;

                      var val = data[name];

                      if (!val) {
                        self[name + 'Bg'] = null;
                        self[name + 'En'] = null;
                      }
                      if (!_.isArray(val)) val = [val];
                      self[name + 'Bg'] = _.reduce(val, function (sum, v) {
                        return sum + (sum && ' | ' || '') + v.label.bg;
                      }, '');
                      self[name + 'En'] = _.reduce(val, function (sum, v) {
                        return sum + (sum && ' | ' || '') + v.label.en;
                      }, '');

                      break;
                    }
                  default:
                    throw new Error('[' + name + '] Unsupported relation model ' + field.relation.model);
                }
                break;
              }
            case 'choice':
              {
                switch (field.relation.model) {
                  case 'nomenclature':
                    {
                      if (!_.has(data, name) || !data[name]) return;

                      console.log('saving nomenclature ' + name);
                      self[name + 'Bg'] = data[name].label.bg;
                      self[name + 'En'] = data[name].label.en;
                      break;
                    }
                  case 'species':
                    {                    
                      if (!_.has(data, name)) return;
                      
                      self[name] = data[name];
                      break;
                    }
                  case 'user':                 
                    {
                      if (!_.has(data, name)) return;

                      self[name + 'Id'] = data[name];
                      break;
                    }
                  default: {
                    console.log('WHYWWW');
                    throw new Error('[' + name + '] Unsupported relation model ' + field.relation.model);
                  }
                }
                break;
              }
            default:
              if (!_.has(data, name)) return;

              self[name] = data[name];
              break;
          }
        });

        return this;
      }
    }
  });
};

module.exports.fields = fields;
module.exports.sequelizeFieldDefinitions = fieldsDef;
