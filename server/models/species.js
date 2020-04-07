'use strict'

const { DataTypes } = require('sequelize')
const languageField = require('../utils/languageField')

const labelField = languageField('label', {
  dataType: DataTypes.TEXT,
  requireFallback: false
})

module.exports = function (sequelize, DataTypes) {
  return sequelize.define('Species', {
    type: {
      type: DataTypes.STRING(32),
      allowNull: false
    },
    labelLa: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    ...labelField.attributes,
    euring: DataTypes.TEXT,
    code: DataTypes.TEXT,
    interesting: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false
    },
    sensitive: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false
    }
  }, {
    indexes: [
      { unique: true, fields: ['type', 'labelLa'] },
      ...labelField.fieldNames.map((fieldName) => ({ fields: ['type', fieldName] })),
      { fields: ['type', 'euring'] },
      { fields: ['type', 'code'] }
    ],
    instanceMethods: {
      apiData: function (api, context) {
        const res = {
          type: this.type,
          label: {
            la: this.labelLa,
            ...labelField.values(this)
          }
        }
        if (context !== 'public') {
          Object.assign(res, {
            euring: this.euring,
            code: this.code,
            interesting: this.interesting,
            sensitive: this.sensitive
          })
        }
        return res
      },
      apiUpdate: function (data) {
        this.type = data.type || this.type
        if (data.label) {
          labelField.update(this, data.label)
          this.labelLa = data.label ? data.label.la : this.labelLa
        }
        this.euring = data.euring || this.euring
        this.code = data.code || this.code
        this.interesting = data.interesting != null ? data.interesting : this.interesting
        this.sensitive = data.sensitive != null ? data.sensitive : this.sensitive
      }
    }
  })
}
