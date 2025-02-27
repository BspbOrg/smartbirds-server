'use strict'

module.exports = function (sequelize, DataTypes) {
  return sequelize.define('settings', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    value: {
      type: DataTypes.TEXT
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE
  }, {
    tableName: 'settings',
    indexes: [
      { unique: true, fields: ['name'] }
    ],
    instanceMethods: {
      apiData: function () {
        return {
          id: this.id,
          name: this.name,
          value: this.value
        }
      },
      apiUpdate: function (data) {
        this.name = data.name
        this.value = data.value
      }
    }
  })
}
