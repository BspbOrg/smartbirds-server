'use strict'
module.exports = function (sequelize, DataTypes) {
  return sequelize.define('birds_ebp', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    sbNameLa: {
      type: DataTypes.STRING,
      allowNull: false
    },
    ebpNameLa: {
      type: DataTypes.STRING,
      allowNull: true
    },
    ebpId: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    tableName: 'birds_ebp',
    instanceMethods: {
      apiData: function () {
        return {
          id: this.id,
          sbNameLa: this.sbNameLa,
          ebpNameLa: this.ebpNameLa,
          ebpId: this.ebpId
        }
      },
      apiUpdate: function (data) {
        this.sbNameLa = data.sbNameLa
        this.ebpNameLa = data.ebpNameLa
        this.ebpId = data.ebpId
      }
    }
  })
}
