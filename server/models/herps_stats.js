'use strict'
module.exports = function (sequelize, DataTypes) {
  return sequelize.define('herps_stats', {
    latitude: { type: DataTypes.DOUBLE, primaryKey: true },
    longitude: { type: DataTypes.DOUBLE, primaryKey: true },
    species_count: DataTypes.INTEGER,
    units_count: DataTypes.INTEGER
  }, {
    timestamps: false,
    tableName: 'herps_stats'
  })
}
