const languages = require('../../config/languages')
const { forEachObject, mapObject } = require('./object')
const capitalizeFirstLetter = require('./capitalizeFirstLetter')

/**
 * @typedef { import("sequelize").DataType } DataType
 * @typedef { import("sequelize").Model } Model
 * @typedef { import("sequelize").ModelAttributeColumnOptions } ModelAttributeColumnOptions
 */

/**
 * @typedef LanguageField
 * @type object
 * @property {{[string]: string}} langMap - map from language key to field name
 * @property {string[]} fieldNames - list of all defined field names
 * @property {{[string]: DataType | ModelAttributeColumnOptions}} attributes - sequelize model definition attributes
 * @property {function (Model): object} values - Return a map from language code to model's field values
 * @property {function (Model, object)} update - Update all provided values to the model
 */

/**
 * Create a language based field - for each language a separate db field. Provides routines to read and write values
 * @param {string} prefix - prefix for field name
 * @param {object} options
 * @param {DataType | ModelAttributeColumnOptions} options.dataType - data type for the field
 * @param {boolean} [options.requireFallback = true] - true if the english value must always be provided
 * @returns LanguageField
 */
function languageField (prefix, {
  dataType,
  requireFallback = true
}) {
  /**
   * @type {{[string]: string}}
   */
  const langMap = mapObject(languages, (_, lang) => prefix + capitalizeFirstLetter(lang))

  /**
   * @type {string[]}
   */
  const fieldNames = Object.values(langMap)

  /**
   * @type {{[string]: DataType | ModelAttributeColumnOptions}}
   */
  const attributes = mapObject(
    langMap,
    (_, language) => requireFallback && language === 'en' ? {
      type: dataType,
      allowNull: false
    } : dataType,
    (_, fieldName) => fieldName
  )

  /**
   * Return a map from language code to model's field values
   * @param {Model} model
   * @returns {object}
   */
  const values = function (model) {
    return mapObject(langMap, (fieldName) => model[fieldName])
  }

  /**
   * Update all provided values to the model
   * @param {Model} model
   * @param {object} data
   */
  const update = function (model, data) {
    forEachObject.entries(langMap).forEach(([lang, fieldName]) => {
      if (data[lang]) {
        this[fieldName] = data[lang]
      }
    })
  }

  return {
    attributes,
    fieldNames,
    langMap,
    values,
    update
  }
}

module.exports = languageField
