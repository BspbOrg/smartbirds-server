'use strict'
module.exports = function (sequelize, DataTypes) {
  return sequelize.define('threats_stats', {
    latitude: { type: DataTypes.DOUBLE, primaryKey: true },
    longitude: { type: DataTypes.DOUBLE, primaryKey: true },
    threatsLocal: DataTypes.TEXT,
    threatsEn: DataTypes.TEXT,
    form: DataTypes.TEXT
  }, {
    timestamps: false,
    tableName: 'threats_stats'
  })
}
