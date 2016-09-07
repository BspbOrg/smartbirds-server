'use strict';
module.exports = function (sequelize, DataTypes) {
  var Birds_Stats = sequelize.define('birds_stats', {
    latitude: {type: DataTypes.DOUBLE, primaryKey: true},
    longitude: {type: DataTypes.DOUBLE, primaryKey: true},
    species_count: DataTypes.INTEGER,
  }, {
    timestamps: false,
    tableName: 'birds_stats'
  });
  return Birds_Stats;
};
