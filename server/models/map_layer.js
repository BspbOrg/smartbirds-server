const { DataTypes } = require('sequelize')
const languageField = require('../utils/languageField')

const labelField = languageField('label', {
  dataType: DataTypes.TEXT
})
const summaryField = languageField('summary', { dataType: DataTypes.TEXT })

module.exports = function (sequelize, DataTypes) {
  const attributes = {
    enabled: DataTypes.BOOLEAN,
    type: DataTypes.STRING(32),
    ...labelField.attributes,
    ...summaryField.attributes,
    url: DataTypes.TEXT,
    tile_width: DataTypes.INTEGER,
    tile_height: DataTypes.INTEGER
  }

  const options = {
    tableName: 'map_layers',
    instanceMethods: {
      apiData: function () {
        return {
          id: this.id,
          enabled: this.enabled,
          type: this.type,
          label: labelField.values(this),
          summary: summaryField.values(this),
          url: this.url,
          tile_width: this.tile_width,
          tile_height: this.tile_height
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
        if (data.url != null) {
          this.url = data.url
        }
        if (data.tile_width != null) {
          this.tile_width = data.tile_width
        }
        if (data.tile_height != null) {
          this.tile_height = data.tile_height
        }
      }
    }
  }

  const MapLayer = sequelize.define('MapLayer', attributes, options)

  return MapLayer
}
