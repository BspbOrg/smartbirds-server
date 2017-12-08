'use strict'

var _ = require('lodash')
var Promise = require('bluebird')
var Sequelize = require('sequelize')
var crypto = require('crypto')

var commonFields = {
  // Common form fields
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
  endDateTime: {
    type: 'timestamp',
    required: true
  },
  startDateTime: {
    type: 'timestamp',
    required: true
  },
  observers: {
    type: 'text'
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
  pictures: 'json',
  track: 'text',

  // Internal fields
  user: {
    type: 'choice',
    required: true,
    uniqueHash: true,
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

}

module.exports = Model

function Model (modelName_, fields_, foreignKeyDefs) {
  if (!(this instanceof Model)) return new Model(modelName_, fields_, foreignKeyDefs)
  var fields = _.extend(fields_, commonFields)
  var schema = generateSchema(fields)
  var modelName = modelName_
  var modelLoweredName = modelName.substr(0, 1).toLowerCase() + modelName.substr(1)
  var foreignKeys = foreignKeyDefs

  this.getFields = function () {
    return fields
  }

  this.getSchema = function () {
    return schema
  }

  this.getEditInputs = function () {
    var editInputs = { id: { required: true } }
    for (var prop in fields) {
      if (prop == 'createdAt' || prop == 'updatedAt' || prop == 'imported') { continue }
      editInputs[ prop ] = {}
    }

    return editInputs
  }

  this.getInsertInputs = function () {
    var insertInputs = {}
    for (var prop in fields) {
      if (prop == 'createdAt' || prop == 'updatedAt' || prop == 'imported') { continue }
      insertInputs[ prop ] = { required: fields[ prop ].required && prop != 'user' }
    }

    return insertInputs
  }

  this.getModelDefinition = function (sequelize, DataTypes) {
    var modelFieldDef = _.cloneDeep(schema)
    delete modelFieldDef.createdAt
    delete modelFieldDef.updatedAt

    var model = sequelize.define(modelName, modelFieldDef, {
      freezeTableName: true,
      indexes: [
        { fields: [ 'species' ] },
        { fields: [ 'userId' ] }
      ],
      classMethods: {
        associate: function (models) {
          if (!foreignKeys || foreignKeys.length <= 0) { return }
          for (var i = 0; i < foreignKeys.length; i += 1) {
            var foreignKey = foreignKeys[ i ]
            models[ modelLoweredName ].belongsTo(models[ foreignKey.targetModelName ], {
              as: foreignKey.as,
              foreignKey: foreignKey.foreignKey,
              targetKey: foreignKey.targetKey
            })
          }
        }
      },
      instanceMethods: {
        calculateHash: Model.generateCalcHash(fields),
        apiData: function (api) {
          var data = {}
          var self = this
          return Promise.props(_.mapValues(fields, function (field, name) {
            if (_.isString(field)) field = { type: field }
            switch (field.type) {
              case 'multi':
                {
                  switch (field.relation.model) {
                    case 'nomenclature':
                      {
                        var res = []
                        var bg = self[ name + 'Bg' ] && self[ name + 'Bg' ].split('|').map(function (val) {
                          return val.trim()
                        }) || []
                        var en = self[ name + 'En' ] && self[ name + 'En' ].split('|').map(function (val) {
                          return val.trim()
                        }) || []
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
              case 'choice':
                {
                  switch (field.relation.model) {
                    case 'nomenclature':
                      {
                        return (self[ name + 'Bg' ] || self[ name + 'En' ]) && {
                          label: {
                            bg: self[ name + 'Bg' ],
                            en: self[ name + 'En' ]
                          }
                        } || null
                      }
                    case 'species':
                      {
                        return self[ name ]
                      }
                    case 'user':
                      {
                        return self[ name + 'Id' ]
                      }
                    default:
                      return Promise.reject(new Error('[' + name + '] Unhandled relation model ' + field.relation.model))
                  }
                }
              case 'json':
                {
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
              case 'multi':
                {
                  switch (field.relation.model) {
                    case 'nomenclature':
                      {
                        if (!_.has(data, name)) return

                        var val = data[ name ]

                        if (!val) {
                          self[ name + 'Bg' ] = null
                          self[ name + 'En' ] = null
                        }
                        if (!_.isArray(val)) val = [ val ]
                        self[ name + 'Bg' ] = _.reduce(val, function (sum, v) {
                          return sum + (sum && ' | ' || '') + v.label.bg
                        }, '')
                        self[ name + 'En' ] = _.reduce(val, function (sum, v) {
                          return sum + (sum && ' | ' || '') + v.label.en
                        }, '')

                        break
                      }
                    default:
                      throw new Error('[' + name + '] Unsupported relation model ' + field.relation.model)
                  }
                  break
                }
              case 'choice':
                {
                  switch (field.relation.model) {
                    case 'nomenclature':
                      {
                        if (!_.has(data, name)) return

                        console.log('saving nomenclature ' + name)
                        self[ name + 'Bg' ] = data[ name ] && data[ name ].label.bg
                        self[ name + 'En' ] = data[ name ] && data[ name ].label.en
                        break
                      }
                    case 'species':
                      {
                        if (!_.has(data, name)) return

                        self[ name ] = data[ name ]
                        break
                      }
                    case 'user':
                      {
                        if (!_.has(data, name)) return

                        self[ name + 'Id' ] = data[ name ]
                        break
                      }
                    default:
                      {
                        throw new Error('[' + name + '] Unsupported relation model ' + field.relation.model)
                      }
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

  return this
}

function generateSchema (fields, resultObj) {
  var fieldsDef = resultObj || {}

  if (!('hash' in fieldsDef)) {
    fieldsDef.hash = Sequelize.TEXT
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
      case 'choice':
        {
          switch (field.relation.model) {
            case 'nomenclature':
              {
                fieldsDef[ name + 'Bg' ] = _.extend({
                  type: Sequelize.TEXT
                }, fd)
                fieldsDef[ name + 'En' ] = _.extend({
                  type: Sequelize.TEXT
                }, fd)
                break
              }
            case 'species':
              {
                fieldsDef[ name ] = _.extend({
                  type: Sequelize.TEXT
                }, fd)
                break
              }
            case 'zone':
              {
                fieldsDef[ name + 'Id' ] = _.extend({
                  type: field.type === 'multi'
                ? Sequelize.TEXT
                : Sequelize.STRING(10)
                }, fd)
                break
              }
            case 'user':
              {
                fieldsDef[ name + 'Id' ] = _.extend({
                  type: field.type === 'multi'
                ? Sequelize.TEXT
                : Sequelize.INTEGER
                })
                break
              }
            default:
              throw new Error('[' + name + '] Unknown relation model ' + field.relation.model)
          }
          break
        }
      case 'timestamp':
        {
          fieldsDef[ name ] = _.extend({
            type: Sequelize.DATE
          }, fd)
          break
        }
      case 'float':
      case '+num':
      case 'num':
        {
          fieldsDef[ name ] = _.extend({
            type: Sequelize.FLOAT
          }, fd)
          break
        }
      case '+int':
      case 'int':
        {
          fieldsDef[ name ] = _.extend({
            type: Sequelize.INTEGER
          }, fd)
          break
        }
      case 'text':
        {
          fieldsDef[ name ] = _.extend({
            type: Sequelize.TEXT
          }, fd)
          break
        }
      case 'boolean':
        {
          fieldsDef[ name ] = _.extend({
            type: Sequelize.BOOLEAN
          }, fd)
          break
        }
      case 'json':
        {
          fieldsDef[ name ] = _.extend({
            type: Sequelize.TEXT
          }, fd)
          break
        }
      default:
        throw new Error('[' + name + '] Unknown field type ' + field.type)
    }
  })
  return fieldsDef
}

function serialize (obj) {
  if (Array.isArray(obj)) {
    return JSON.stringify(obj.map(function (item) { return serialize(item) }))
  }
  if (obj === undefined) return JSON.stringify(null)
  if (typeof obj !== 'object' || obj === null) return JSON.stringify(obj)
  if (obj instanceof Date) return JSON.stringify(obj)
  return '{' + Object.keys(obj)
      .sort()
      .map(function (key) {
        return '"' + key + '":' + serialize(obj[ key ])
      })
      .join(',') + '}'
}

function generateCalcHash (fields) {
  var hashFields = []

  var schemaFields = Model.generateSchema(_.pickBy(fields, function (field) {
    return field.uniqueHash
  }))
  _.forOwn(schemaFields, function (def, key) {
    if (key !== 'hash') hashFields.push(key)
  })
  schemaFields = null
  if (!hashFields.length) throw new Error('no hash fields defined!')
  hashFields.sort()

  return function () {
    var serialized = '{' + hashFields
        .filter(function (key) { return key in this }, this)
        .map(function (key) { return '"' + key + '":' + serialize(this[ key ]) }, this)
        .join(',') + '}'
    var hash = crypto.createHash('sha256')
    hash.update(serialized)
    var dig = hash.digest('hex')
    return dig
  }
}

Model.generateSchema = generateSchema
Model.generateCalcHash = generateCalcHash
