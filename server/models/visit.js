/**
 * Created by groupsky on 26.05.16.
 */

'use strict'
module.exports = function (sequelize, DataTypes) {
  const Visit = sequelize.define('Visit', {
    year: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    earlyStart: DataTypes.DATEONLY,
    earlyEnd: DataTypes.DATEONLY,
    lateStart: DataTypes.DATEONLY,
    lateEnd: DataTypes.DATEONLY
  }, {
    indexes: [
      { unique: true, fields: ['year'] }
    ],
    instanceMethods: {
      apiData: function (api) {
        return {
          year: parseInt(this.year),
          early: {
            start: this.earlyStart,
            end: this.earlyEnd
          },
          late: {
            start: this.lateStart,
            end: this.lateEnd
          }
        }
      },
      apiUpdate: function (api, params) {
        this.year = parseInt(params.year)
        this.earlyStart = params.early.start
        this.earlyEnd = params.early.end
        this.lateStart = params.late.start
        this.lateEnd = params.late.end
        return this
      }
    }
  })
  return Visit
}
