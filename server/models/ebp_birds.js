'use strict'
module.exports = function (sequelize, DataTypes) {
  return sequelize.define('ebp_birds', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    ebpId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    ebpNameLa: {
      type: DataTypes.TEXT
    },
    sbNameLa: {
      type: DataTypes.TEXT
    }
  }, {
    tableName: 'ebp_birds',
    timestamps: false,
    indexes: [
      { unique: true, fields: ['ebpId'] },
      { unique: true, fields: ['sbNameLa'] }
    ],
    instanceMethods: {
      apiData: function () {
        return {
          id: this.id,
          ebpId: this.ebpId,
          ebpNameLa: this.ebpNameLa,
          sbNameLa: this.sbNameLa
        }
      },
      apiUpdate: function (data) {
        this.ebpId = data.ebpId
        this.ebpNameLa = data.ebpNameLa
        this.sbNameLa = data.sbNameLa
      }
    }
  })
}
