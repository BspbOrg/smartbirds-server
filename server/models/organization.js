'use strict'

const { DataTypes } = require('sequelize')
const languageField = require('../utils/languageField')

const labelField = languageField('label', {
  dataType: DataTypes.TEXT
})

module.exports = function (sequelize, DataTypes) {
  return sequelize.define('Organization', {
    slug: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    ...labelField.attributes
  }, {
    indexes: [
      { unique: true, fields: ['slug'] },
      ...labelField.fieldNames.map((fieldName) => ({ fields: ['type', fieldName] }))
    ],
    instanceMethods: {
      apiData: function (api, context) {
        const res = {
          slug: this.slug,
          label: labelField.values(this)
        }
        return res
      },
      apiUpdate: function (data) {
        if (data.label) {
          labelField.update(this, data.label)
        }
      }
    }
  })
}
