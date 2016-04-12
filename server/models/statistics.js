'use strict';
module.exports = function (sequelize, DataTypes) {
  var Statistics = sequelize.define('Statistics', {
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
    species_count: DataTypes.INTEGER,
    units_count: DataTypes.INTEGER
  }, {
    timestamps: false,
    tableName: 'cbm_stats'
  });
  return Statistics;
};
