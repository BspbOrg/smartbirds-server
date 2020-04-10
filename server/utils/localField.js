/**
 * language codes without english
 * @type {string[]}
 */
const languages = Object.keys(require('../../config/languages')).filter((l) => l !== 'en')
const { DataTypes } = require('sequelize')

/**
 * @typedef { import("sequelize").Model } Model
 */

/**
 * Get language code for a local field
 * @param {Model} model - model instance
 * @param {string} fieldName - field name
 * @returns {string} - language code
 */
function getLocalLang (model, fieldName, langFieldName = `${fieldName}Lang`) {
  // before introduction of local fields, there was only bg local
  return model[langFieldName] != null ? model[langFieldName] : 'bg'
}

/**
 * @typedef LocalField
 * @type object
 * @property {{[string]: DataType | ModelAttributeColumnOptions}} attributes - sequelize model definition attributes
 * @property {{en: string, local: string, lang: string}} fieldNames - list of all defined field names
 * @property {function (model: Model): object} values - Return a map from language code to model's field values
 * @property {function (model: Model, data: object, language: string)} update - Update all provided values to the model
 */

/**
 * Create a local based field - store english and one local language value
 * @param {string} prefix - prefix for field name
 * @param {object} options
 * @param {DataType | ModelAttributeColumnOptions} options.dataType - data type for the field
 * @param {boolean} [options.required = false] - if the field is required
 * @returns {LocalField}
 */
function localField (prefix, {
  dataType = DataTypes.TEXT,
  required = false
} = {}) {
  const enFieldName = `${prefix}En`
  const localFieldName = `${prefix}Local`
  const langFieldName = `${prefix}Lang`

  const attributes = {
    [enFieldName]: { type: dataType, allowNull: !required },
    [localFieldName]: dataType,
    [langFieldName]: DataTypes.STRING(3)
  }

  const fieldNames = { en: enFieldName, local: localFieldName, lang: langFieldName }

  const values = function (model) {
    if (model[enFieldName] == null) {
      return null
    }
    const vals = {
      en: model[enFieldName]
    }

    if (model[localFieldName] != null) {
      vals[getLocalLang(model, prefix, langFieldName)] = model[localFieldName]
    }

    return vals
  }

  const update = function (model, data, language = 'bg') {
    if (data == null) {
      model[enFieldName] = null
      model[localFieldName] = null
      model[langFieldName] = null
      return
    }

    model[enFieldName] = data.en
    if (languages.includes(language) && language in data) {
      model[localFieldName] = data[language]
      model[langFieldName] = language
      return
    }

    // look for any other language and use the first one found
    for (language of languages) {
      if (language in data) {
        model[localFieldName] = data[language]
        model[langFieldName] = language
        return
      }
    }

    // no supported language found - nullify
    model[localFieldName] = null
    model[langFieldName] = null
  }

  return {
    attributes,
    fieldNames,
    values,
    update
  }
}

module.exports = localField

module.exports.getLocalLang = getLocalLang
