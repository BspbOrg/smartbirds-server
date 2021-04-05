'use strict'

const { DataTypes } = require('sequelize')
const languageField = require('../utils/languageField')

const labelField = languageField('label', {
  dataType: DataTypes.TEXT
})

module.exports = function (sequelize, DataTypes) {
  const attributes = {
    type: {
      type: DataTypes.STRING(32),
      allowNull: false
    },
    ...labelField.attributes
  }

  // create indexes for label${lang}
  const indexes = labelField.fieldNames.map((fieldName) => ({
    unique: true,
    fields: ['type', fieldName]
  }))

  const options = {
    indexes,
    instanceMethods: {
      apiData: function (api) {
        return {
          type: this.type,
          label: labelField.values(this)
        }
      },
      apiUpdate: function (data) {
        if (data.type) {
          this.type = data.type
        }
        if (data.label) {
          labelField.update(this, data.label)
        }
      }
    }
  }

  const Nomenclature = sequelize.define('Nomenclature', attributes, options)

  return Nomenclature
}
