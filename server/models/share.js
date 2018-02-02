'use strict'
module.exports = function (sequelize, DataTypes) {
  return sequelize.define('Share', {}, {
    timestamps: false
  })
}
