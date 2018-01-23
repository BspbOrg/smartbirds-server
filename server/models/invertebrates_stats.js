'use strict'
module.exports = function (sequelize, DataTypes) {
  var invertebratesStats = sequelize.define('invertebrates_stats', {
    latitude: { type: DataTypes.DOUBLE, primaryKey: true },
    longitude: { type: DataTypes.DOUBLE, primaryKey: true },
    species_count: DataTypes.INTEGER,
    units_count: DataTypes.INTEGER
  }, {
    timestamps: false,
    tableName: 'invertebrates_stats'
  })
  return invertebratesStats
}
