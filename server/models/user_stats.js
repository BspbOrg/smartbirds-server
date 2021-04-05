'use strict'
module.exports = function (sequelize, DataTypes) {
  const userStats = sequelize.define('user_stats', {
    id: { type: DataTypes.INTEGER, primaryKey: true },
    species_count: DataTypes.INTEGER,
    entry_count: DataTypes.INTEGER,
    first_name: DataTypes.STRING,
    last_name: DataTypes.STRING
  }, {
    timestamps: false,
    tableName: 'user_stats'
  })
  return userStats
}
