'use strict'
module.exports = function (sequelize, DataTypes) {
  var CBM_Stats = sequelize.define('cbm_stats', {
    id: {
      type: DataTypes.STRING(10),
      primaryKey: true
    },
    latitude: DataTypes.DOUBLE,
    longitude: DataTypes.DOUBLE,
    species_count: DataTypes.INTEGER,
    units_count: DataTypes.INTEGER,
    visits_count: DataTypes.INTEGER,
    first_name: DataTypes.TEXT,
    last_name: DataTypes.TEXT
  }, {
    timestamps: false,
    tableName: 'cbm_stats'
  })
  return CBM_Stats
}
