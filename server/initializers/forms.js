const _ = require('lodash')
const crypto = require('crypto')
const fs = require('fs')
const moment = require('moment')
const path = require('path')
const Promise = require('bluebird')
const { DataTypes } = require('sequelize')
const capitalizeFirstLetter = require('../utils/capitalizeFirstLetter')

function serialize (obj) {
  if (Array.isArray(obj)) {
    return JSON.stringify(obj.map(function (item) { return serialize(item) }))
  }
  if (obj === undefined) return JSON.stringify(null)
  if (typeof obj !== 'object' || obj === null) return JSON.stringify(obj)
  if (obj instanceof Date) return JSON.stringify(obj)
  return '{' +
    Object.keys(obj)
      .sort()
      .map(key => '"' + key + '":' + serialize(obj[ key ]))
      .join(',') +
    '}'
}

function formAttributes (fields) {
  let fieldsDef = {}

  if (!('hash' in fieldsDef)) {
    fieldsDef.hash = DataTypes.TEXT
  }

  _.forEach(fields, function (field, name) {
    if (_.isString(field)) {
      field = { type: field }
    }

    let fd = {
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
      case 'boolean': {
        fieldsDef[ name ] = _.extend({
          type: DataTypes.BOOLEAN
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
  return fieldsDef
}

function generateCalcHash (fields) {
  let hashFields = []

  let schemaFields = formAttributes(_.pickBy(fields, function (field) {
    return field.uniqueHash
  }))
  _.forOwn(schemaFields, function (def, key) {
    if (key !== 'hash') hashFields.push(key)
  })
  schemaFields = null
  if (!hashFields.length) throw new Error('no hash fields defined!')
  hashFields.sort()

  return function () {
    let serialized =
      '{' +
      hashFields
        .filter(key => key in this)
        .map(key => '"' + key + '":' + serialize(this[ key ]))
        .join(',') +
      '}'
    let hash = crypto.createHash('sha256')
    hash.update(serialized)
    return hash.digest('hex')
  }
}

function generateApiData (fields) {
  const publicFields = _.pickBy(fields, field => field.public)

  return async function (api, context) {
    return Promise
      .props(_.mapValues(context === 'public' ? publicFields : fields, (field, name) => {
        if (_.isString(field)) field = { type: field }
        switch (field.type) {
          case 'multi': {
            switch (field.relation.model) {
              case 'nomenclature': {
                let res = []
                let bg = this[ name + 'Bg' ] ? this[ name + 'Bg' ].split('|').map(function (val) {
                  return val.trim()
                }) : []
                let en = this[ name + 'En' ] ? this[ name + 'En' ].split('|').map(function (val) {
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
              case 'species': {
                return this[ name ] ? this[ name ].split('|').map(function (val) {
                  return val.trim()
                }) : []
              }
              default:
                return Promise.reject(new Error('[' + name + '] Unhandled relation model ' + field.relation.model))
            }
          }
          case 'choice': {
            switch (field.relation.model) {
              case 'nomenclature': {
                return (this[ name + 'Bg' ] || this[ name + 'En' ]) ? {
                  label: {
                    bg: this[ name + 'Bg' ],
                    en: this[ name + 'En' ]
                  }
                } : null
              }
              case 'species': {
                return this[ name ]
              }
              case 'user':
              case 'zone': {
                return this[ name + 'Id' ]
              }
              default:
                return Promise.reject(new Error('[' + name + '] Unhandled relation model ' + field.relation.model))
            }
          }
          case 'json': {
            return this[ name ] && JSON.parse(this[ name ])
          }
          default:
            return this[ name ]
        }
      }))
      .then(data => {
        data.id = this.id
        switch (context) {
          case 'public':
            data.user = this.user ? this.user.apiData(api, context) : this.user_id
            break
          default:
            data.createdAt = this.createdAt
            data.updatedAt = this.updatedAt
            break
        }
        return data
      })
  }
}

function generateExportData (form) {
  return async function (api) {
    const pre = {
      startTime: moment.tz(this.startDateTime, api.config.formats.tz).format(api.config.formats.time),
      startDate: moment.tz(this.startDateTime, api.config.formats.tz).format(api.config.formats.date),
      endTime: moment.tz(this.endDateTime, api.config.formats.tz).format(api.config.formats.time),
      endDate: moment.tz(this.endDateTime, api.config.formats.tz).format(api.config.formats.date),
      observationDate: moment.tz(this.observationDateTime, api.config.formats.tz).format(api.config.formats.date),
      observationTime: moment.tz(this.observationDateTime, api.config.formats.tz).format(api.config.formats.time),
      observationDateUTC: moment.tz(this.observationDateTime, 'UTC').format(api.config.formats.date),
      observationTimeUTC: moment.tz(this.observationDateTime, 'UTC').format(api.config.formats.time),
      otherObservers: this.observers
    }
    if (this.user) {
      pre.email = this.user.email
      pre.firstName = this.user.firstName
      pre.lastName = this.user.lastName
    }
    let mid = {}
    if (form.prepareCsv) {
      mid = await form.prepareCsv(api, this)
    } else {
      mid = _.omitBy(this.dataValues, function (value, key) {
        return form.exportSkipFields.indexOf(key.split('.')[ 0 ]) !== -1
      })
    }
    const post = {
      notes: (this.notes || '').replace(/[\n\r]+/g, ' '),
      speciesNotes: (this.speciesNotes || '').replace(/[\n\r]+/g, ' '),
      pictures: (this.pictures ? JSON.parse(this.pictures) || [] : []).map(function (pic) {
        return pic.url && pic.url.split('/').slice(-1)[ 0 ] + '.jpg'
      }).filter(function (val) {
        return val
      }).join(', ') || '',
      track: this.track && this.monitoringCode + '.gpx',
      trackId: this.track && this.track.split('/').slice(-1)[ 0 ]
    }

    if (this.speciesInfo) {
      post.species = this.speciesInfo.labelLa + ' | ' + this.speciesInfo.labelBg
      post.speciesEn = this.speciesInfo.labelLa + ' | ' + this.speciesInfo.labelEn
      post.speciesEuringCode = this.speciesInfo.euring
    }

    return _.assign(pre, mid, post)
  }
}

function generateApiUpdate (fields) {
  return function (data) {
    _.forEach(fields, (field, name) => {
      if (_.isString(field)) field = { type: field }
      switch (field.type) {
        case 'multi': {
          switch (field.relation.model) {
            case 'nomenclature': {
              if (!_.has(data, name)) return

              let val = data[ name ]

              if (!val) {
                this[ name + 'Bg' ] = null
                this[ name + 'En' ] = null
              }
              if (!_.isArray(val)) val = [ val ]
              this[ name + 'Bg' ] = _.reduce(val, (sum, v) => sum + (sum ? ' | ' : '') + v.label.bg, '')
              this[ name + 'En' ] = _.reduce(val, (sum, v) => sum + (sum ? ' | ' : '') + v.label.en, '')

              break
            }
            case 'species': {
              if (!_.has(data, name)) return

              let val = data[ name ]

              if (!val) {
                this[ name ] = null
              }
              if (!_.isArray(val)) val = [ val ]
              this[ name ] = _.reduce(val, (sum, v) => sum + (sum ? ' | ' : '') + v, '')

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
              if (!_.has(data, name)) return

              this[ name + 'Bg' ] = data[ name ] && data[ name ].label.bg
              this[ name + 'En' ] = data[ name ] && data[ name ].label.en
              break
            }
            case 'species': {
              if (!_.has(data, name)) return

              this[ name ] = data[ name ]
              break
            }
            case 'user':
            case 'zone': {
              if (!_.has(data, name)) return

              this[ name + 'Id' ] = data[ name ]
              break
            }
            default: {
              throw new Error('[' + name + '] Unsupported relation model ' + field.relation.model)
            }
          }
          break
        }
        case 'json':
          if (!_.has(data, name)) return

          this[ name ] = JSON.stringify(data[ name ])
          break
        default:
          if (!_.has(data, name)) return

          this[ name ] = data[ name ]
          break
      }
    })

    return this
  }
}

function formOptions (form) {
  return {
    freezeTableName: true,
    indexes: form.indexes,
    classMethods: {
      associate: function (models) {
        if (!form.foreignKeys || form.foreignKeys.length <= 0) return
        form.foreignKeys.forEach(foreignKey => {
          this.belongsTo(models[ foreignKey.targetModelName ], {
            as: foreignKey.as,
            foreignKey: foreignKey.foreignKey,
            targetKey: foreignKey.targetKey,
            scope: foreignKey.scope
          })
        })
      }
    },
    instanceMethods: {
      calculateHash: generateCalcHash(form.fields),
      apiData: generateApiData(form.fields),
      apiUpdate: generateApiUpdate(form.fields),
      exportData: generateExportData(form)
    },
    hooks: form.hooks
  }
}

function updateHash (instance) {
  instance.hash = instance.calculateHash()
}

module.exports = {
  loadPriority: 320,
  initialize: function (api, next) {
    api.forms = {
      isModerator (user, modelName) {
        return user.role === 'moderator' && user.forms && user.forms[ modelName ]
      },
      import (filename) {
        const form = require(filename)
        form.modelName = form.modelName || `form${capitalizeFirstLetter(filename.split('/').pop().split('.')[ 0 ])}`

        api.forms.register(form)
        return form
      },
      register (form) {
        api.forms[ form.modelName ] = form

        const attributes = formAttributes(form.fields)
        delete attributes.createdAt
        delete attributes.updatedAt

        form.model = api.models[ form.modelName ] = api.sequelize.sequelize.define(form.tableName, attributes, formOptions(form))

        const hooks = [ 'beforeCreate', 'beforeUpdate', 'beforeSave' ]
        hooks.forEach(function (hook) {
          form.model.hook(hook, updateHash)
        })

        return form.model
      }
    }

    const dir = path.normalize(api.projectRoot + '/forms')
    fs.readdirSync(dir).forEach(function (file) {
      if (file.substr(0, 1) === '_') return
      const filename = path.join(dir, file)
      const form = api.forms.import(filename)

      api.watchFileAndAct(filename, () => {
        api.log('rebooting due to form change: ' + form.modelName, 'info')
        delete require.cache[ require.resolve(filename) ]
        api.commands.restart()
      })
    })

    next()
  }
}
