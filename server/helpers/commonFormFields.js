'use strict';

var _ = require('lodash');
var Sequelize = require('sequelize');


module.exports.commonFields = {
  //Common form fields    
  endDateTime: {
    type: 'timestamp',
    required: true
  },
  startDateTime: {
    type: 'timestamp',
    required: true
  },
  location: {
    type: 'text',
    required: true
  },
  observers: {
    type: 'text',
    required: true
  },
  rain: {
    type: 'choice',
    relation: {
      model: 'nomenclature',
      filter: { type: 'main_rain' }
    }
  },
  temperature: 'num',
  windDirection: {
    type: 'choice',
    relation: {
      model: 'nomenclature',
      filter: { type: 'main_wind_direction' }
    }
  },
  windSpeed: {
    type: 'choice',
    relation: {
      model: 'nomenclature',
      filter: { type: 'main_wind_force' }
    }
  },
  cloudiness: {
    type: 'choice',
    relation: {
      model: 'nomenclature',
      filter: { type: 'main_cloud_level' }
    }
  },
  cloudsType: 'text',
  visibility: '+num',
  mto: 'text',
  notes: 'text',
  threats: {
    type: 'multi',
    relation: {
      model: 'nomenclature',
      filter: { type: 'main_threats' }
    }
  },

  //Internal fields
  user: {
    type: 'choice',
    required: true,
    relation: {
      model: 'user'
    }
  },
  createdAt: {
    type: 'timestamp',
    required: true
  },
  updatedAt: {
    type: 'timestamp',
    required: true
  },
  imported: 'int'

};

module.exports.generateFieldDef = function (fields, resultObj) {
  var fieldsDef = resultObj || {};

  _.forEach(fields, function (field, name) {
    if (_.isString(field)) {
      field = { type: field };
    }

    var fd = {
      allowNull: !field.required
    };

    switch (field.type) {
      case 'multi':
      case 'choice':
        {
          switch (field.relation.model) {
            case 'nomenclature':
              {
                fieldsDef[name + 'Bg'] = _.extend({
                  type: Sequelize.TEXT
                }, fd);
                fieldsDef[name + 'En'] = _.extend({
                  type: Sequelize.TEXT
                }, fd);
                break;
              }
            case 'species':
              {
                fieldsDef[name] = _.extend({
                  type: Sequelize.TEXT
                }, fd);
                break;
              }
            case 'zone':
              {
                fieldsDef[name + 'Id'] = _.extend({
                  type: field.type === 'multi'
                    ? Sequelize.TEXT
                    : Sequelize.STRING(10)
                }, fd);
                break;
              }
            case 'user':
              {
                fieldsDef[name + 'Id'] = _.extend({
                  type: field.type === 'multi'
                    ? Sequelize.TEXT
                    : Sequelize.INTEGER
                });
                break;
              }
            default:
              throw new Error('[' + name + '] Unknown relation model ' + field.relation.model);
          }
          break;
        }
      case 'timestamp':
        {
          fieldsDef[name] = _.extend({
            type: Sequelize.DATE
          }, fd);
          break;
        }
      case 'float':
      case '+num':
      case 'num':
        {
          fieldsDef[name] = _.extend({
            type: Sequelize.FLOAT
          }, fd);
          break;
        }
      case '+int':
      case 'int':
        {
          fieldsDef[name] = _.extend({
            type: Sequelize.INTEGER
          }, fd);
          break;
        }
      case 'text':
        {
          fieldsDef[name] = _.extend({
            type: Sequelize.TEXT
          }, fd);
          break;
        }
      case 'boolean':
        {
          fieldsDef[name] = _.extend({
            type: Sequelize.BOOLEAN
          }, fd);
          break;
        }
      default:
        throw new Error('[' + name + '] Unknown field type ' + field.type);

    }
  });
  return fieldsDef;
};

