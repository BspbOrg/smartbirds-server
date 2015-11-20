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
        models.zone.belongsTo(models.user, {as: 'owner'});
      }
    },
    instanceMethods: {
      apiData: function(api) {
        return {
          id: this.id,
          coordinates: [
            {latitude: this.lat1, longitude: this.lon1},
            {latitude: this.lat2, longitude: this.lon2},
            {latitude: this.lat3, longitude: this.lon3},
            {latitude: this.lat4, longitude: this.lon4}
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
          owner: this.owner?this.owner.apiData(api):(this.ownerId?{id: this.ownerId}:null)
        };
      }
    }
  });
  return Zone;
};
