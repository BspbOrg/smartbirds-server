'use strict'
module.exports = function (sequelize, DataTypes) {
  var Ciconia_stats = sequelize.define('ciconia_stats', {
    latitude: { type: DataTypes.DOUBLE, primaryKey: true },
    longitude: { type: DataTypes.DOUBLE, primaryKey: true },
    records_count: DataTypes.INTEGER
  }, {
    timestamps: false,
    tableName: 'ciconia_stats'
  })
  return Ciconia_stats
}
