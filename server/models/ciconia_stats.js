'use strict'
module.exports = function (sequelize, DataTypes) {
  return sequelize.define('ciconia_stats', {
    latitude: { type: DataTypes.DOUBLE, primaryKey: true },
    longitude: { type: DataTypes.DOUBLE, primaryKey: true },
    records_count: DataTypes.INTEGER
  }, {
    timestamps: false,
    tableName: 'ciconia_stats'
  })
}
