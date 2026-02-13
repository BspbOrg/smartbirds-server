exports.default = {
  suspiciousActivity: function (api) {
    return {
      // Detection thresholds
      thresholds: {
        bulkOperations: {
          requestCount: 100,
          timeWindowMinutes: 60 // 1 hour
        },
        rapidFire: {
          requestCount: 10,
          timeWindowMinutes: 1, // Threshold per minute
          lookbackMinutes: 60 // How far back to search for bursts
        },
        ipSwitching: {
          distinctIPs: 3,
          timeWindowMinutes: 60 // 1 hour
        },
        sessionAnomalies: {
          timeWindowMinutes: 15 // 15 minutes
        }
      }
    }
  }
}
