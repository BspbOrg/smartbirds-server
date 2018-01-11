/**
 * Created by dani on 06.01.16.
 */

'use strict'

var _ = require('lodash')
var Promise = require('bluebird')
var Model = require('../helpers/Model')

var fields = {
  plot: {
    type: 'choice',
    required: true,
    uniqueHash: true,
    relation: {
      model: 'nomenclature',
      filter: { type: 'cbm_sector' }
    }
  },
  visit: {
    type: 'choice',
    required: true,
    uniqueHash: true,
    relation: {
      model: 'nomenclature',
      filter: { type: 'cbm_visit_number' }
    }
  },
  secondaryHabitat: {
    type: 'choice',
    relation: {
      model: 'nomenclature',
      filter: { type: 'cbm_habitat' }
    }
  },
  primaryHabitat: {
    type: 'choice',
    relation: {
      model: 'nomenclature',
      filter: { type: 'cbm_habitat' }
    }
  },
  distance: {
    type: 'choice',
    required: true,
    uniqueHash: true,
    relation: {
      model: 'nomenclature',
      filter: { type: 'cbm_distance' }
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
  cloudiness: {
    type: 'choice',
    relation: {
      model: 'nomenclature',
      filter: { type: 'main_cloud_level' }
    }
  },
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
  rain: {
    type: 'choice',
    relation: {
      model: 'nomenclature',
      filter: { type: 'main_rain' }
    }
  },

  count: {
    type: '+int',
    required: true,
    uniqueHash: true
  },
  endDateTime: {
    type: 'timestamp',
    required: true,
    uniqueHash: true
  },
  startDateTime: {
    type: 'timestamp',
    required: true,
    uniqueHash: true
  },
  notes: 'text',
  visibility: '+num',
  mto: 'text',
  cloudsType: 'text',
  temperature: 'num',
  observers: 'text',
  latitude: {
    type: 'num',
    required: true,
    uniqueHash: true
  },
  longitude: {
    type: 'num',
    required: true,
    uniqueHash: true
  },

  observationDateTime: {
    type: 'timestamp',
    required: true,
    uniqueHash: true
  },
  monitoringCode: {
    type: 'text',
    required: true
  },

  zone: {
    type: 'choice',
    required: true,
    uniqueHash: true,
    relation: {
      model: 'zone'
    }
  },

  threats: {
    type: 'multi',
    relation: {
      model: 'nomenclature',
      filter: { type: 'main_threats' }
    }
  },

  user: {
    type: 'choice',
    required: true,
    uniqueHash: true,
    observationDateTime: '2015-12-10T12:15:04Z',
    relation: {
      model: 'user'
    }
  },

  pictures: 'json',
  track: 'text'
}

module.exports = function (sequelize, DataTypes) {
  var fieldsDef = {
    hash: DataTypes.STRING(64)
  }

  _.forEach(fields, function (field, name) {
    if (_.isString(field)) {
      field = { type: field }
    }

    var fd = {
      allowNull: !field.required
    }

    switch (field.type) {
      case 'multi':
      case 'choice': {
        switch (field.relation.model) {
          case 'nomenclature': {
            fieldsDef[ name + 'Bg' ] = _.extend({
              type: DataTypes.TEXT
            }, fd)
            fieldsDef[ name + 'En' ] = _.extend({
              type: DataTypes.TEXT
            }, fd)
            break
          }
          case 'species': {
            fieldsDef[ name ] = _.extend({
              type: DataTypes.TEXT
            }, fd)
            break
          }
          case 'zone': {
            fieldsDef[ name + 'Id' ] = _.extend({
              type: field.type === 'multi'
                ? DataTypes.TEXT
                : DataTypes.STRING(10)
            }, fd)
            break
          }
          case 'user': {
            fieldsDef[ name + 'Id' ] = _.extend({
              type: field.type === 'multi'
                ? DataTypes.TEXT
                : DataTypes.INTEGER
            })
            break
          }
          default:
            throw new Error('[' + name + '] Unknown relation model ' + field.relation.model)
        }
        break
      }
      case 'timestamp': {
        fieldsDef[ name ] = _.extend({
          type: DataTypes.DATE
        }, fd)
        break
      }
      case 'float':
      case '+num':
      case 'num': {
        fieldsDef[ name ] = _.extend({
          type: DataTypes.FLOAT
        }, fd)
        break
      }
      case '+int':
      case 'int': {
        fieldsDef[ name ] = _.extend({
          type: DataTypes.INTEGER
        }, fd)
        break
      }
      case 'text': {
        fieldsDef[ name ] = _.extend({
          type: DataTypes.TEXT
        }, fd)
        break
      }
      case 'json': {
        fieldsDef[ name ] = _.extend({
          type: DataTypes.TEXT
        }, fd)
        break
      }
      default:
        throw new Error('[' + name + '] Unknown field type ' + field.type)
    }
  })

  var model = sequelize.define('FormCBM', fieldsDef, {
    freezeTableName: true,
    indexes: [
      { fields: [ 'species' ] },
      { fields: [ 'zoneId' ] },
      { fields: [ 'userId' ] }
    ],
    classMethods: {
      associate: function (models) {
        models.formCBM.belongsTo(models.species, {
          targetModelName: 'species',
          as: 'speciesInfo',
          foreignKey: 'species',
          targetKey: 'labelLa',
          scope: { type: 'birds' }
        })
        models.formCBM.belongsTo(models.zone, { as: 'zone' })
        models.formCBM.belongsTo(models.user, { as: 'user' })
      }
    },
    instanceMethods: {
      calculateHash: Model.generateCalcHash(fields),
      apiData: function () {
        var self = this
        return Promise.props(_.mapValues(fields, function (field, name) {
          if (_.isString(field)) field = { type: field }
          switch (field.type) {
            case 'multi': {
              switch (field.relation.model) {
                case 'nomenclature': {
                  var res = []
                  var bg = self[ name + 'Bg' ] ? self[ name + 'Bg' ].split('|').map(function (val) {
                    return val.trim()
                  }) : []
                  var en = self[ name + 'En' ] ? self[ name + 'En' ].split('|').map(function (val) {
                    return val.trim()
                  }) : []
                  while (bg.length && en.length) {
                    res.push({
                      label: {
                        bg: bg.shift(),
                        en: en.shift()
                      }
                    })
                  }
                  return res
                }
                default:
                  return Promise.reject(new Error('[' + name + '] Unhandled relation model ' + field.relation.model))
              }
            }
            case 'choice': {
              switch (field.relation.model) {
                case 'nomenclature': {
                  return (self[ name + 'Bg' ] || self[ name + 'En' ]) ? {
                    label: {
                      bg: self[ name + 'Bg' ],
                      en: self[ name + 'En' ]
                    }
                  } : null
                }
                case 'species': {
                  return self[ name ]
                }
                case 'zone':
                case 'user': {
                  return self[ name + 'Id' ]
                }
                default:
                  return Promise.reject(new Error('[' + name + '] Unhandled relation model ' + field.relation.model))
              }
            }
            case 'json': {
              return self[ name ] && JSON.parse(self[ name ])
            }
            default:
              return self[ name ]
          }
        })).then(function (data) {
          data.id = self.id
          data.createdAt = self.createdAt
          data.updatedAt = self.updatedAt
          return data
        })
      },

      apiUpdate: function (data) {
        var self = this

        _.forEach(fields, function (field, name) {
          if (_.isString(field)) field = { type: field }
          switch (field.type) {
            case 'multi': {
              switch (field.relation.model) {
                case 'nomenclature': {
                  if (!_.has(data, name)) return

                  var val = data[ name ]

                  if (!val) {
                    self[ name + 'Bg' ] = null
                    self[ name + 'En' ] = null
                  }
                  if (!_.isArray(val)) val = [ val ]
                  self[ name + 'Bg' ] = _.reduce(val, function (sum, v) {
                    return sum + (sum ? ' | ' : '') + v.label.bg
                  }, '')
                  self[ name + 'En' ] = _.reduce(val, function (sum, v) {
                    return sum + (sum ? ' | ' : '') + v.label.en
                  }, '')

                  break
                }
                default:
                  throw new Error('[' + name + '] Unsupported relation model ' + field.relation.model)
              }
              break
            }
            case 'choice': {
              switch (field.relation.model) {
                case 'nomenclature': {
                  if (!_.has(data, name) || !data[ name ]) return

                  console.log('saving nomenclature ' + name)
                  self[ name + 'Bg' ] = data[ name ].label.bg
                  self[ name + 'En' ] = data[ name ].label.en
                  break
                }
                case 'species': {
                  if (!_.has(data, name)) return

                  self[ name ] = data[ name ]
                  break
                }
                case 'user':
                case 'zone': {
                  if (!_.has(data, name)) return

                  self[ name + 'Id' ] = data[ name ]
                  break
                }
                default:
                  throw new Error('[' + name + '] Unsupported relation model ' + field.relation.model)
              }
              break
            }
            case 'json':
              if (!_.has(data, name)) return

              self[ name ] = JSON.stringify(data[ name ])
              break
            default:
              if (!_.has(data, name)) return

              self[ name ] = data[ name ]
              break
          }
        })

        return this
      }
    }
  });

  [ 'beforeCreate', 'beforeUpdate', 'beforeSync', 'beforeSave' ].forEach(function (hook) {
    model.hook(hook, function (instance) {
      console.log('hook', hook, typeof this, typeof instance)
    })
    model.hook(hook, updateHash)
  })

  return model

  function updateHash (instance) {
    instance.hash = instance.calculateHash()
  }
}

module.exports.fields = fields
