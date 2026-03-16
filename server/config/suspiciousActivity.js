exports.default = {
  suspiciousActivity: function (api) {
    return {
      // How long to keep request_ip_log records (days)
      retentionDays: parseInt(process.env.SUSPICIOUS_ACTIVITY_RETENTION_DAYS, 10) || 90,

      // Detection thresholds
      thresholds: {
        bulkOperations: {
          requestCount: parseInt(process.env.SUSPICIOUS_ACTIVITY_BULK_REQUEST_COUNT, 10) || 200,
          timeWindowMinutes: parseInt(process.env.SUSPICIOUS_ACTIVITY_BULK_TIME_WINDOW_MINUTES, 10) || 60
        },
        rapidFire: {
          requestCount: parseInt(process.env.SUSPICIOUS_ACTIVITY_RAPID_REQUEST_COUNT, 10) || 30,
          timeWindowMinutes: parseInt(process.env.SUSPICIOUS_ACTIVITY_RAPID_TIME_WINDOW_MINUTES, 10) || 1,
          lookbackMinutes: parseInt(process.env.SUSPICIOUS_ACTIVITY_RAPID_LOOKBACK_MINUTES, 10) || 60
        },
        ipSwitching: {
          distinctIPs: parseInt(process.env.SUSPICIOUS_ACTIVITY_IP_SWITCHING_DISTINCT_IPS, 10) || 3,
          timeWindowMinutes: parseInt(process.env.SUSPICIOUS_ACTIVITY_IP_SWITCHING_TIME_WINDOW_MINUTES, 10) || 60
        },
        sessionAnomalies: {
          timeWindowMinutes: parseInt(process.env.SUSPICIOUS_ACTIVITY_SESSION_TIME_WINDOW_MINUTES, 10) || 15
        }
      }
    }
  }
}
