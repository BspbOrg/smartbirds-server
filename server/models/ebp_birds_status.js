'use strict'
module.exports = function (sequelize, DataTypes) {
  return sequelize.define('ebp_birds_status', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    ebpId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    sbNameEn: {
      type: DataTypes.TEXT
    }
  }, {
    tableName: 'ebp_birds_status',
    timestamps: false,
    indexes: [
      { unique: true, fields: ['sbNameEn'] }
    ],
    instanceMethods: {
      apiData: function () {
        return {
          id: this.id,
          ebpId: this.ebpId,
          sbNameEn: this.sbNameEn
        }
      },
      apiUpdate: function (data) {
        this.ebpId = data.ebpId
        this.sbNameEn = data.sbNameEn
      }
    }
  })
}
