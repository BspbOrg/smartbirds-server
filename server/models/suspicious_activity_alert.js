'use strict'

module.exports = function (sequelize, DataTypes) {
  const SuspiciousActivityAlert = sequelize.define('suspicious_activity_alert', {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    patternType: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    status: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'new' // api.suspiciousActivityDetector.statuses.NEW (can't use at define time)
    },
    detectedAt: {
      type: DataTypes.DATE,
      allowNull: false
    },
    resolvedAt: {
      type: DataTypes.DATE
    },
    resolvedBy: {
      type: DataTypes.INTEGER
    },
    detectionData: {
      type: DataTypes.JSONB,
      allowNull: false
    },
    requestCount: {
      type: DataTypes.INTEGER
    },
    ipCount: {
      type: DataTypes.INTEGER
    },
    distinctIps: {
      type: DataTypes.ARRAY(DataTypes.TEXT)
    },
    endpoints: {
      type: DataTypes.ARRAY(DataTypes.TEXT)
    },
    timeWindow: {
      type: DataTypes.TEXT
    },
    adminNotes: {
      type: DataTypes.TEXT
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false
    }
  }, {
    tableName: 'suspicious_activity_alerts'
  })

  return SuspiciousActivityAlert
}
