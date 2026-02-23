'use strict'

module.exports = function (sequelize, DataTypes) {
  return sequelize.define('request_ip_log', {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    ipAddress: {
      type: DataTypes.INET,
      allowNull: false
    },
    sessionFingerprint: {
      type: DataTypes.STRING(255)
    },
    endpoint: DataTypes.TEXT,
    httpMethod: {
      type: DataTypes.STRING(10)
    },
    occurredAt: {
      type: DataTypes.DATE,
      allowNull: false
    },
    userAgent: DataTypes.TEXT
  }, {
    tableName: 'request_ip_log',
    timestamps: false
  })
}
