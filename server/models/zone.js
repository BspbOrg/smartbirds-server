'use strict';
module.exports = function(sequelize, DataTypes) {
  var Zone = sequelize.define('Zone', {
    id: {
      type: DataTypes.STRING(10),
      primaryKey: true
    },
    lat1: DataTypes.DOUBLE,
    lon1: DataTypes.DOUBLE,
    lat2: DataTypes.DOUBLE,
    lon2: DataTypes.DOUBLE,
    lat3: DataTypes.DOUBLE,
    lon3: DataTypes.DOUBLE,
    lat4: DataTypes.DOUBLE,
    lon4: DataTypes.DOUBLE,
    locationNameBg: DataTypes.TEXT,
    locationNameEn: DataTypes.TEXT,
    locationAreaBg: DataTypes.TEXT,
    locationAreaEn: DataTypes.TEXT,
    locationTypeBg: DataTypes.TEXT,
    locationTypeEn: DataTypes.TEXT,
    ownerId: DataTypes.INTEGER
  }, {
    indexes: [
      {
        fields: ['ownerId']
      },
    ],
    classMethods: {
      associate: function(models) {
        // associations can be defined here
        models.zone.hasOne(models.user, {foreignKey: 'ownerId'});
      }
    },
    instanceMethods: {
      apiData: function(api) {
        return {
          id: this.id,
          coordinates: [
            {lat: this.lat1, lon: this.lon1},
            {lat: this.lat2, lon: this.lon2},
            {lat: this.lat3, lon: this.lon3},
            {lat: this.lat4, lon: this.lon4}
          ],
          location: {
            name: {
              bg: this.locationNameBg,
              en: this.locationNameEn
            },
            area: {
              bg: this.locationAreaBg,
              en: this.locationAreaEn
            },
            type: {
              bg: this.locationTypeBg,
              en: this.locationTypeEn
            }
          },
          owner: {
            id: this.ownerId
          }
        };
      }
    }
  });
  return Zone;
};
