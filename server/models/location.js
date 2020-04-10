/**
 * Created by groupsky on 04.12.15.
 */

'use strict'
module.exports = function (sequelize, DataTypes) {
  return sequelize.define('Location', {
    nameEn: DataTypes.TEXT,
    nameLocal: DataTypes.TEXT,
    nameLang: DataTypes.STRING(3),
    areaEn: DataTypes.TEXT,
    areaLocal: DataTypes.TEXT,
    areaLang: DataTypes.STRING(3),
    typeEn: DataTypes.TEXT,
    typeLocal: DataTypes.TEXT,
    typeLang: DataTypes.STRING(3),
    regionEn: DataTypes.TEXT,
    regionLocal: DataTypes.TEXT,
    regionLang: DataTypes.STRING(3),
    longitude: DataTypes.FLOAT,
    latitude: DataTypes.FLOAT,
    ekatte: DataTypes.TEXT
  }, {
    indexes: [
      { fields: ['nameLocal', 'nameLang'] },
      { fields: ['nameEn'] },
      { fields: ['areaLocal', 'areaLang'] },
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
            [this.nameLang]: this.nameLocal,
            en: this.nameEn
          },
          area: {
            [this.areaLang]: this.areaLocal,
            en: this.areaEn
          },
          type: {
            [this.typeLang]: this.typeLocal,
            en: this.typeEn
          },
          region: {
            [this.regionLang]: this.regionLocal,
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
