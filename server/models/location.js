/**
 * Created by groupsky on 04.12.15.
 */

'use strict'
module.exports = function (sequelize, DataTypes) {
  return sequelize.define('Location', {
    nameBg: DataTypes.TEXT,
    nameEn: DataTypes.TEXT,
    areaBg: DataTypes.TEXT,
    areaEn: DataTypes.TEXT,
    typeBg: DataTypes.TEXT,
    typeEn: DataTypes.TEXT,
    regionEn: DataTypes.TEXT,
    regionBg: DataTypes.TEXT,
    longitude: DataTypes.FLOAT,
    latitude: DataTypes.FLOAT,
    ekatte: DataTypes.TEXT
  }, {
    indexes: [
      { fields: [ 'nameBg' ] },
      { fields: [ 'nameEn' ] },
      { fields: [ 'areaBg' ] },
      { fields: [ 'areaEn' ] }
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
            bg: this.nameBg,
            en: this.nameEn
          },
          area: {
            bg: this.areaBg,
            en: this.areaEn
          },
          type: {
            bg: this.typeBg,
            en: this.typeEn
          },
          region: {
            bg: this.regionBg,
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
