'use strict'

var _ = require('lodash');
var Promise = require('bluebird');
var commonFormFields = require('../helpers/commonFormFields');
var Sequelize = require('sequelize');


module.exports.CreateModel = function(modelName_, fields_, foreignKeyDefs) {
  var fields = _.extend(fields_, commonFormFields.commonFields);
  var fieldsDef = commonFormFields.generateFieldDef(fields);
  var modelName = modelName_;
  var modelLoweredName = modelName.substr(0, 1).toLowerCase() + modelName.substr(1);
  var foreignKeys = foreignKeyDefs;

  this.getFields = function () {
    return fields;
  };

  this.getFieldsDef = function () {
    return fieldsDef;
  }

  this.getModelDefinition = function (sequelize, DataTypes) {
    var modelFieldDef = _.cloneDeep(fieldsDef);
    delete modelFieldDef.createdAt;
    delete modelFieldDef.updatedAt;

    return sequelize.define(modelName, modelFieldDef, {
      freezeTableName: true,
      indexes: [
        { fields: ['species'] },
        { fields: ['userId'] }
      ],
      classMethods: {
        associate: function (models) {
          if (!foreignKeys || foreignKeys.length <= 0)
            return;
          for (var i = 0; i < foreignKeys.length; i+=1) {
            var foreignKey = foreignKeys[i];
            models[modelLoweredName].belongsTo(models[foreignKey.targetModelName], {
              as: foreignKey.as,
              foreignKey: foreignKey.foreignKey,
              targetKey: foreignKey.targetKey
            });   
          }
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

  return this; 
};