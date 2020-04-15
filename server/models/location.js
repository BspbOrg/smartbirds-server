/**
 * Created by groupsky on 04.12.15.
 */
'use strict'

const localField = require('../utils/localField')

const nameField = localField('name')
const areaField = localField('area')
const typeField = localField('type')
const regionField = localField('region')

module.exports = function (sequelize, DataTypes) {
  return sequelize.define('Location', {
    ...nameField.attributes,
    ...areaField.attributes,
    ...typeField.attributes,
    ...regionField.attributes,
    longitude: DataTypes.FLOAT,
    latitude: DataTypes.FLOAT,
    ekatte: DataTypes.TEXT
  }, {
    indexes: [
      { fields: [nameField.fieldNames.local, nameField.fieldNames.lang] },
      { fields: [nameField.fieldNames.en] },
      { fields: [areaField.fieldNames.local, areaField.fieldNames.lang] },
      { fields: [areaField.fieldNames.en] }
    ],
    classMethods: {
      associate: function (models) {
        models.location.hasMany(models.zone, { as: 'zones', foreignKey: 'locationId' })
      }
    },
    instanceMethods: {
      apiData: function (api) {
        return {
          id: this.id,
          name: nameField.values(this),
          area: areaField.values(this),
          type: typeField.values(this),
          region: regionField.values(this),
          longitude: this.longitude,
          latitude: this.latitude,
          ekatte: this.ekatte
        }
      }
    }
  })
}
