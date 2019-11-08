/**
 * Created by groupsky on 04.12.15.
 */

'use strict'
module.exports = function (sequelize, DataTypes) {
  return sequelize.define('Location', {
    nameLocal: DataTypes.TEXT,
    nameEn: DataTypes.TEXT,
    areaLocal: DataTypes.TEXT,
    areaEn: DataTypes.TEXT,
    typeLocal: DataTypes.TEXT,
    typeEn: DataTypes.TEXT,
    regionEn: DataTypes.TEXT,
    regionLocal: DataTypes.TEXT,
    longitude: DataTypes.FLOAT,
    latitude: DataTypes.FLOAT,
    ekatte: DataTypes.TEXT
  }, {
    indexes: [
      { fields: ['nameLocal'] },
      { fields: ['nameEn'] },
      { fields: ['areaLocal'] },
      { fields: ['areaEn'] }
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
          name: {
            local: this.nameLocal,
            en: this.nameEn
          },
          area: {
            local: this.areaLocal,
            en: this.areaEn
          },
          type: {
            local: this.typeLocal,
            en: this.typeEn
          },
          region: {
            local: this.regionLocal,
            en: this.regionEn
          },
          longitude: this.longitude,
          latitude: this.latitude,
          ekatte: this.ekatte
        }
      }
    }
  })
}
