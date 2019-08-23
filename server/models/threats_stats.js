'use strict'
module.exports = function (sequelize, DataTypes) {
  return sequelize.define('threats_stats', {
    latitude: { type: DataTypes.DOUBLE, primaryKey: true },
    longitude: { type: DataTypes.DOUBLE, primaryKey: true },
    threats_count: DataTypes.INTEGER
  }, {
    timestamps: false,
    tableName: 'threats_stats'
  })
}
