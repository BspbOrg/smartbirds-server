'use strict'

module.exports = function (sequelize, DataTypes) {
  return sequelize.define('access_audit', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    recordType: {
      type: DataTypes.STRING,
      allowNull: false
    },
    recordId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    actorUserId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    action: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    occurredAt: {
      type: DataTypes.DATE,
      allowNull: false
    },
    ownerUserId: DataTypes.INTEGER,
    actorRole: DataTypes.STRING,
    actorOrganization: DataTypes.TEXT,
    meta: DataTypes.TEXT
  }, {
    tableName: 'access_audit',
    timestamps: false,
    indexes: [
      {
        fields: ['recordType', 'recordId', 'occurredAt']
      },
      {
        fields: ['actorUserId', 'occurredAt']
      }
    ]
  })
}
