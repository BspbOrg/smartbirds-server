'use strict'
module.exports = function (sequelize, Sequelize) {
  return sequelize.define('bgatlas2008_species', {
    utm_code: { type: Sequelize.STRING(4), primaryKey: true },
    species: { type: Sequelize.TEXT, primaryKey: true },
    user_id: { type: Sequelize.INTEGER, primaryKey: true }
  }, {
    tableName: 'bgatlas2008_observed',
    timestamps: false,
    underscored: true
  })
}
