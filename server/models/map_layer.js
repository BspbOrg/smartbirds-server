const { DataTypes } = require('sequelize')
const languageField = require('../utils/languageField')

const labelField = languageField('label', {
  dataType: DataTypes.TEXT
})
const summaryField = languageField('summary', { dataType: DataTypes.TEXT })
const urlField = languageField('url', { dataType: DataTypes.TEXT })

module.exports = function (sequelize, DataTypes) {
  const attributes = {
    enabled: DataTypes.BOOLEAN,
    type: DataTypes.STRING(32),
    ...labelField.attributes,
    ...summaryField.attributes,
    ...urlField.attributes,
    tileWidth: DataTypes.INTEGER,
    tileHeight: DataTypes.INTEGER
  }

  const options = {
    instanceMethods: {
      apiData: function () {
        return {
          id: this.id,
          enabled: this.enabled,
          type: this.type,
          label: labelField.values(this),
          summary: summaryField.values(this),
          url: urlField.values(this),
          tileWidth: this.tileWidth,
          tileHeight: this.tileHeight
        }
      },
      apiUpdate: function (data) {
        if (data.enabled != null) {
          this.enabled = data.enabled
        }
        if (data.type) {
          this.type = data.type
        }
        if (data.label) {
          labelField.update(this, data.label)
        }
        if (data.summary) {
          summaryField.update(this, data.summary)
        }
        if (data.url) {
          urlField.update(this, data.url)
        }
        if (data.tileWidth != null) {
          this.tileWidth = data.tileWidth
        }
        if (data.tileHeight != null) {
          this.tileHeight = data.tileHeight
        }
      }
    }
  }

  const MapLayer = sequelize.define('MapLayer', attributes, options)

  return MapLayer
}
