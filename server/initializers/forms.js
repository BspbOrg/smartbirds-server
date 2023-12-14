const _ = require('lodash')
const crypto = require('crypto')
const fs = require('fs')
const moment = require('moment')
const path = require('path')
const Promise = require('bluebird')
const { DataTypes, Op } = require('sequelize')
const { hooks } = require('sequelize/lib/hooks')
const capitalizeFirstLetter = require('../utils/capitalizeFirstLetter')
const { upgradeInitializer } = require('../utils/upgrade')
const localField = require('../utils/localField')
const { mapObject } = require('../utils/object')
const languages = Object.keys(require('../../config/languages'))
const { api } = require('actionhero')

// Add custom hooks to sequelize hooks list
hooks.beforeApiUpdate = { params: 2 }
hooks.afterApiUpdate = { params: 2 }

async function runFieldHooks (fields, hookName, ...args) {
  for (const name in fields) {
    if (!Object.hasOwnProperty.call(fields, name)) continue
    const field = fields[name]
    if (!(field instanceof Object)) continue
    if (!(hookName in field)) continue
    await field[hookName](...args, name, field)
  }
}

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
      .map(key => '"' + key + '":' + serialize(obj[key]))
      .join(',') +
    '}'
}

function formAttributes (fields) {
  const fieldsDef = {}

  if (!('hash' in fieldsDef)) {
    fieldsDef.hash = DataTypes.TEXT
  }

  _.forEach(fields, function (field, name) {
    if (_.isString(field)) {
      field = { type: field }
    }

    const fd = {
      allowNull: !field.required
    }

    if (field.default) {
      fd.defaultValue = field.default
    }

    switch (field.type) {
      case 'multi':
      case 'choice': {
        switch (field.relation.model) {
          case 'nomenclature':
          case 'poi':
          case 'settlement': {
            Object.assign(fieldsDef, localField(name, { required: field.required }).attributes)
            break
          }
          case 'organization':
          case 'species': {
            fieldsDef[name] = _.extend({
              type: DataTypes.TEXT
            }, fd)
            break
          }
          case 'zone': {
            fieldsDef[name + 'Id'] = _.extend({
              type: field.type === 'multi'
                ? DataTypes.TEXT
                : DataTypes.STRING(10)
            }, fd)
            break
          }
          case 'user': {
            fieldsDef[name + 'Id'] = _.extend({
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
        fieldsDef[name] = _.extend({
          type: DataTypes.DATE
        }, fd)
        break
      }
      case 'float':
      case '+num':
      case 'num': {
        fieldsDef[name] = _.extend({
          type: DataTypes.FLOAT
        }, fd)
        break
      }
      case '+int':
      case 'int': {
        fieldsDef[name] = _.extend({
          type: DataTypes.INTEGER
        }, fd)
        break
      }
      case 'text': {
        fieldsDef[name] = _.extend({
          type: field.length ? DataTypes.STRING(field.length) : DataTypes.TEXT
        }, fd)
        break
      }
      case 'boolean': {
        fieldsDef[name] = _.extend({
          type: DataTypes.BOOLEAN
        }, fd)
        break
      }
      case 'json': {
        fieldsDef[name] = _.extend({
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
  const hashFields = []

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
    const serialized =
      '{' +
      hashFields
        .filter(key => key in this)
        .map(key => '"' + key + '":' + serialize(this[key]))
        .join(',') +
      '}'
    if (process.env.DEBUG_HASH) {
      console.log('hash', serialized)
    }
    const hash = crypto.createHash('sha256')
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
                const res = []
                const field = localField(name)

                // get the values from model as {en: enJoined, [localLang]: localJoined}
                const values = field.values(this)
                if (values == null) {
                  return res
                }

                const lang = field.getLocalLanguage(this)

                // split the values
                const local = values[lang]
                  ? values[lang].split('|').map((val) => val.trim())
                  : []
                const en = values.en
                  ? values.en.split('|').map((val) => val.trim())
                  : []

                // en is the primary language
                for (let idx = 0; idx < en.length; idx++) {
                  const label = { en: en[idx] }
                  if (local[idx]) {
                    label[lang] = local[idx]
                  }
                  res.push({ label })
                }
                return res
              }
              case 'organization':
              case 'species': {
                return this[name]
                  ? this[name].split('|').map((val) => val.trim())
                  : []
              }
              default:
                return Promise.reject(new Error('[' + name + '] Unhandled multi relation model ' + field.relation.model))
            }
          }
          case 'choice': {
            switch (field.relation.model) {
              case 'nomenclature':
              case 'poi':
              case 'settlement': {
                const label = localField(name).values(this)
                if (label != null) {
                  return { label }
                } else {
                  return null
                }
              }
              case 'organization':
              case 'species': {
                return this[name]
              }
              case 'user':
              case 'zone': {
                return this[name + 'Id']
              }
              default:
                return Promise.reject(new Error('[' + name + '] Unhandled choice relation model ' + field.relation.model))
            }
          }
          case 'json': {
            return this[name] && JSON.parse(this[name])
          }
          default:
            return this[name]
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
  const orderExportFields = (exportType, record) => {
    switch (exportType) {
      case 'full': return record
      case 'simple': return Object.fromEntries(form.simpleExportFields.map(key => [key, record[key]]))
      default: {
        api.log('Unknown export type: ' + exportType, 'error')
        return { error: 'Unknown export type: ' + exportType }
      }
    }
  }

  return async function (api, exportType = 'full') {
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
    let mid = _.omitBy(this.dataValues, function (value, key) {
      const name = key.split('.')[0]
      return form.exportSkipFields.indexOf(name) !== -1 || /Lang$/.test(name)
    })
    if (form.prepareCsv) {
      mid = await form.prepareCsv(api, this, mid)
    }
    const post = {
      notes: (this.notes || '').replace(/[\n\r]+/g, ' '),
      speciesNotes: (this.speciesNotes || '').replace(/[\n\r]+/g, ' '),
      pictures: (this.pictures ? JSON.parse(this.pictures) || [] : []).map(function (pic) {
        return pic.url && pic.url.split('/').slice(-1)[0] + '.jpg'
      }).filter(function (val) {
        return val
      }).join(', ') || '',
      track: this.track && this.monitoringCode + '.gpx',
      trackId: this.track && this.track.split('/').slice(-1)[0]
    }

    if (this.speciesInfo) {
      post.species = this.speciesInfo.labelLa
      for (const lang of languages) {
        post[`species${capitalizeFirstLetter(lang)}`] = this.speciesInfo.labelLa + ' | ' + this.speciesInfo[`label${capitalizeFirstLetter(lang)}`]
      }
      post.speciesEuringCode = this.speciesInfo.euring
    } else if (form.hasSpecies) {
      // when not required we still need to output the field to include in csv header
      post.species = ''
      for (const lang of languages) {
        post[`species${capitalizeFirstLetter(lang)}`] = ''
      }
    }

    const prepared = { ...pre, ...mid, ...post }
    if ('organization' in prepared) {
      const organization = prepared.organization
      delete prepared.organization
      prepared.organization = organization
    }
    return orderExportFields(exportType, prepared)
  }
}

function generateApiUpdate (fields) {
  return async function (data, language, role, { validateNomenclatures = false, nomenclatures = [], species = [] } = {}) {
    const modelName = this.constructor.tableName
    await this.constructor.runHooks('beforeApiUpdate', this, data)
    await runFieldHooks(fields, 'beforeApiUpdate', this, data, language)
    await runFieldHooks(fields, `beforeApiUpdate:${role}`, this, data, language)

    _.forEach(fields, (field, name) => {
      if (_.isString(field)) field = { type: field }
      switch (field.type) {
        case 'multi': {
          switch (field.relation.model) {
            case 'nomenclature': {
              if (!_.has(data, name)) return

              // localField works with {bg, en}, while the multi nomenclature use [{label: {bg, en}}, ...]
              const val = data[name]

              if (validateNomenclatures) {
                const fieldNomenclatures = nomenclatures[field.relation.filter?.type] || []
                const found = (_.isArray(val) ? val : [val])
                  .filter(v => v?.label?.en)
                  .every(v => fieldNomenclatures.find(n => n.label?.en === v.label?.en))
                if (!found) {
                  throw new Error(`[${modelName}.${name}] Invalid value: ${data[name]?.label?.en}`)
                }
              }

              // directly set if null or not array
              if (val == null || !Array.isArray(val)) {
                localField(name).update(this, val != null ? val.label : null, language)
              } else {
                // convert [{label: {bg, en, ...}}] into {bg: [...], en: [...], ...}
                const mergedValues = {}
                val.forEach((v) => {
                  // iterate over our defined languages as this is user provided structure and may contain unsafe keys
                  for (const lang of languages) {
                    if (lang in v.label) {
                      if (mergedValues[lang] == null) {
                        mergedValues[lang] = []
                      }
                      mergedValues[lang].push(v.label[lang])
                    }
                  }
                })
                const joinedValues = mapObject(mergedValues, (values) => values.join(' | '))
                localField(name).update(this, joinedValues, language)
              }
              break
            }
            case 'organization':
            case 'species': {
              if (!_.has(data, name)) return

              let val = data[name]

              if (!val) {
                this[name] = null
                return
              }

              if (field.relation.model === 'species' && validateNomenclatures) {
                const modelSpecies = species[modelName === 'FormThreats' ? data.class : field.relation.filter?.type] || []
                const found = (_.isArray(val) ? val : [val])
                  .filter(v => v)
                  .every(v => modelSpecies.find(s => s.label?.la === v))
                if (!found) {
                  throw new Error(`[${modelName}.${name}] Invalid value: ${data[name]}`)
                }
              }

              if (!_.isArray(val)) val = [val]
              this[name] = _.reduce(val, (sum, v) => sum + (sum ? ' | ' : '') + v, '')

              break
            }
            default:
              throw new Error(`[${modelName}.${name}] Unsupported relation model ${field.relation.model}`)
          }
          break
        }
        case 'choice': {
          switch (field.relation.model) {
            case 'nomenclature':
            case 'poi':
            case 'settlement': {
              if (!_.has(data, name)) return

              if (field.relation.model === 'nomenclature' && validateNomenclatures && data[name]?.label?.en) {
                const fieldNomenclatures = nomenclatures[field.relation.filter?.type] || []
                const found = fieldNomenclatures.find(n => n.label?.en === data[name]?.label?.en)
                if (!found) {
                  throw new Error(`[${modelName}.${name}] Invalid value: ${data[name]?.label?.en}`)
                }
              }

              localField(name).update(this, data[name] != null ? data[name].label : null, language)
              break
            }
            case 'organization':
            case 'species': {
              if (!_.has(data, name)) return

              if (field.relation.model === 'species' && validateNomenclatures && data[name]) {
                const modelSpecies = species[modelName === 'FormThreats' ? data.class : field.relation.filter?.type] || []
                const found = modelSpecies.find(s => s.label?.la === data[name])
                if (!found) {
                  throw new Error(`[${modelName}.${name}] Invalid value: ${data[name]}`)
                }
              }

              this[name] = data[name]
              break
            }
            case 'user':
            case 'zone': {
              if (!_.has(data, name)) return

              this[name + 'Id'] = data[name]
              break
            }
            default: {
              throw new Error(`[${modelName}.${name}] Unsupported relation model ${field.relation.model}`)
            }
          }
          break
        }
        case 'json':
          if (!_.has(data, name)) return

          if (data[name] == null) {
            this[name] = null
            return
          }

          this[name] = JSON.stringify(data[name])
          break
        case 'timestamp': {
          if (!_.has(data, name)) return

          if (data[name] == null) {
            this[name] = null
            return
          }

          this[name] = new Date(data[name])
          break
        }
        case 'float':
        case '+num':
        case 'num':
        case '+int':
        case 'int': {
          if (!_.has(data, name)) return

          if (data[name] == null) {
            this[name] = null
            return
          }

          this[name] = parseFloat(Number(data[name]).toFixed(13))

          let valid = !isNaN(this[name])
          if (valid && ['+int', 'int'].includes(field.type)) {
            valid = Number.isInteger(this[name])
          }
          if (valid && ['+num', '+int'].includes(field.type)) {
            valid = this[name] >= 0
          }
          if (!valid) {
            throw new Error(`[${modelName}.${name}] Invalid ${field.type} value: ${data[name]}`)
          }
          break
        }
        case 'text': {
          if (!_.has(data, name)) return

          if (typeof data[name] === 'string') {
            this[name] = data[name]
          } else if (data[name] == null) {
            this[name] = null
          } else {
            throw new Error(`[${modelName}.${name}] Invalid ${field.type} value: ${data[name]}`)
          }
          break
        }
        case 'boolean': {
          if (!_.has(data, name)) return

          if (data[name] === true || data[name] === false) {
            this[name] = data[name]
          } else if (data[name] === 'true') {
            this[name] = true
          } else if (data[name] === 'false') {
            this[name] = false
          } else if (data[name] === '1') {
            this[name] = true
          } else if (data[name] === '0') {
            this[name] = false
          } else if (data[name] == null) {
            this[name] = null
          } else {
            throw new Error(`[${modelName}.${name}] Invalid ${field.type} value: ${data[name]}`)
          }
          break
        }
        default:
          throw new Error(`[${modelName}.${name}] Unsupported field type ${field.type}`)
      }
    })

    await runFieldHooks(fields, `afterApiUpdate:${role}`, this, data, language)
    await runFieldHooks(fields, 'afterApiUpdate', this, data, language)
    await this.constructor.runHooks('afterApiUpdate', this, data)
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
          this.belongsTo(models[foreignKey.targetModelName], {
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
    hooks: form.hooks,
    validate: form.validate
  }
}

function updateHash (instance) {
  instance.hash = instance.calculateHash()
}

module.exports = upgradeInitializer('ah17', {
  name: 'forms',
  loadPriority: 320,
  initialize: function (api, next) {
    api.forms = {
      userCanManage (user, modelName) {
        return ['admin', 'org-admin'].includes(user.role) || (user.role === 'moderator' && user.forms && user.forms[modelName])
      },
      import (filename) {
        const form = require(filename)
        form.modelName = form.modelName || `form${capitalizeFirstLetter(filename.split('/').pop().split('.')[0])}`

        api.forms.register(form)
        return form
      },
      register (form) {
        form.$isForm = true
        api.forms[form.modelName] = form

        const attributes = formAttributes(form.fields)
        delete attributes.createdAt
        delete attributes.updatedAt

        form.model = api.models[form.modelName] = api.sequelize.sequelize.define(form.tableName, attributes, formOptions(form))

        const hooks = ['beforeCreate', 'beforeUpdate', 'beforeSave']
        hooks.forEach(function (hook) {
          form.model.addHook(hook, updateHash)
        })

        return form.model
      },
      /**
       * A utility method to update a form record useful for tasks.
       * Handles duplicates that may arise from the change
       * @param {Model} record - the record to be saved
       * @param form - a form reference from api.forms
       * @return {Promise<boolean>} true if all went well, false if duplicate was discovered
       */
      async trySave (record, form) {
        try {
          await record.save()
          return true
        } catch (e) {
          // if we already know it's duplicate do nothing
          if (await api.models.duplicate.findOne({ where: { form: form.modelName, id1: record.id } })) {
            return false
          }
          // find the duplicated
          const duplicated = await form.model.findOne({
            attributes: ['id'],
            where: { hash: record.hash, id: { [Op.ne]: record.id } }
          })
          if (duplicated) {
            api.log(`[${form.modelName}] Duplicate records ${record.id} and ${duplicated.id}`, 'error')
            await api.models.duplicate.create({
              form: form.modelName,
              id1: record.id,
              id2: duplicated.id,
              hash: record.hash
            })
          } else {
            api.log(`Could not update record ${form.modelName}.${record.id} (hash: ${record.hash})`, 'error', e)
            throw e
          }
        }
      }
    }

    const dir = path.normalize(api.projectRoot + '/forms')
    fs.readdirSync(dir).forEach(function (file) {
      if (file.substr(0, 1) === '_') return
      const filename = path.join(dir, file)
      const form = api.forms.import(filename)

      api.watchFileAndAct(filename, () => {
        api.log('rebooting due to form change: ' + form.modelName, 'info')
        delete require.cache[require.resolve(filename)]
        api.commands.restart()
      })
    })

    next()
  }
})
