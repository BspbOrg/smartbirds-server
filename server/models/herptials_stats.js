'use strict';
module.exports = function (sequelize, DataTypes) {
  var Herptials_stats = sequelize.define('herptials_stats', {
    latitude: { type: DataTypes.DOUBLE, primaryKey: true },
    longitude: { type: DataTypes.DOUBLE, primaryKey: true },
    species_count: DataTypes.INTEGER,
    units_count: DataTypes.INTEGER,
  }, {
    timestamps: false,
    tableName: 'herptials_stats'
  });
  return Herptials_stats;
};
