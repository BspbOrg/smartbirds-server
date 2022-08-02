'use strict'

const { DataTypes } = require('sequelize')
const languageField = require('../utils/languageField')

const labelField = languageField('label', {
  dataType: DataTypes.TEXT
})

module.exports = function (sequelize) {
  const attributes = {
    type: {
      type: DataTypes.STRING(32),
      allowNull: false
    },
    ...labelField.attributes,
    longitude: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    latitude: {
      type: DataTypes.FLOAT,
      allowNull: false
    }
  }

  // create indexes for label${lang}
  const indexes = labelField.fieldNames.map((fieldName) => ({
    unique: true,
    fields: ['type', fieldName]
  }))

  const options = {
    tableName: 'pois',
    underscored: true,
    indexes,
    instanceMethods: {
      apiData () {
        return {
          type: this.type,
          label: labelField.values(this),
          longitude: this.longitude,
          latitude: this.latitude
        }
      },
      apiUpdate (data) {
        if (data.type) {
          this.type = data.type
        }
        if (data.label) {
          labelField.update(this, data.label)
        }
        if (data.longitude != null) {
          this.longitude = data.longitude
        }
        if (data.latitude != null) {
          this.latitude = data.latitude
        }
      }
    }
  }

  return sequelize.define('POI', attributes, options)
}
