'use strict';
module.exports = function (sequelize, DataTypes) {
  var Statistics = sequelize.define('Statistics', {
    latitude: DataTypes.DOUBLE,
    longitude: DataTypes.DOUBLE,
    species_count: DataTypes.INTEGER,
    units_count: DataTypes.INTEGER
  }, {
    timestamps: false,
    tableName: 'cbm_stats'
  });
  Statistics.removeAttribute('id');
  return Statistics;
};
