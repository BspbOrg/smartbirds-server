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
    locationTypeEn: DataTypes.TEXT
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return Zone;
};
