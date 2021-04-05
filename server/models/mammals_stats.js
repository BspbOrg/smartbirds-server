'use strict'
module.exports = function (sequelize, DataTypes) {
  const mammalsStats = sequelize.define('mammals_stats', {
    latitude: { type: DataTypes.DOUBLE, primaryKey: true },
    longitude: { type: DataTypes.DOUBLE, primaryKey: true },
    species_count: DataTypes.INTEGER,
    units_count: DataTypes.INTEGER
  }, {
    timestamps: false,
    tableName: 'mammals_stats'
  })
  return mammalsStats
}
