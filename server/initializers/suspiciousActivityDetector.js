const { Initializer, api } = require('actionhero')

module.exports = class SuspiciousActivityDetectorInit extends Initializer {
  constructor () {
    super()
    this.name = 'suspiciousActivityDetector'
    this.loadPriority = 650
  }

  async initialize () {
    api.suspiciousActivityDetector = {
      // Pattern type constants
      patterns: {
        BULK_OPERATIONS: 'bulkOperations',
        RAPID_FIRE: 'rapidFire',
        IP_SWITCHING: 'ipSwitching',
        SESSION_ANOMALIES: 'sessionAnomalies'
      },
      // Detect bulk operations (>N requests/hour)
      detectBulkOperations: async (thresholds) => {
        // Only PostgreSQL
        if (api.sequelize.sequelize.options.dialect !== 'postgres') {
          return []
        }

        const { requestCount, timeWindowMinutes } = thresholds.bulkOperations

        const results = await api.sequelize.sequelize.query(`
          SELECT
            "userId",
            COUNT(*) as request_count,
            MIN("occurredAt") as first_request,
            MAX("occurredAt") as last_request,
            COUNT(DISTINCT "ipAddress") as ip_count,
            COUNT(DISTINCT endpoint) as endpoint_count
          FROM request_ip_log
          WHERE "occurredAt" > NOW() - INTERVAL '${timeWindowMinutes} minutes'
          GROUP BY "userId"
          HAVING COUNT(*) > :requestCount
          ORDER BY request_count DESC
        `, {
          replacements: { requestCount },
          type: api.sequelize.sequelize.QueryTypes.SELECT
        })

        return results.map(row => ({
          userId: row.userId,
          requestCount: parseInt(row.request_count),
          firstRequest: row.first_request,
          lastRequest: row.last_request,
          ipCount: parseInt(row.ip_count),
          endpointCount: parseInt(row.endpoint_count),
          timeWindow: `${timeWindowMinutes} minutes`,
          pattern: api.suspiciousActivityDetector.patterns.BULK_OPERATIONS
        }))
      },

      // Detect rapid-fire requests (>N requests/minute to same endpoint)
      detectRapidFire: async (thresholds) => {
        if (api.sequelize.sequelize.options.dialect !== 'postgres') {
          return []
        }

        const { requestCount, timeWindowMinutes, lookbackMinutes } = thresholds.rapidFire

        const results = await api.sequelize.sequelize.query(`
          SELECT
            "userId",
            "ipAddress",
            endpoint,
            "httpMethod",
            DATE_TRUNC('minute', "occurredAt") as burst_minute,
            COUNT(*) as burst_count,
            MIN("occurredAt") as burst_start,
            MAX("occurredAt") as burst_end
          FROM request_ip_log
          WHERE "occurredAt" > NOW() - INTERVAL '${lookbackMinutes} minutes'
          GROUP BY
            "userId",
            "ipAddress",
            endpoint,
            "httpMethod",
            DATE_TRUNC('minute', "occurredAt")
          HAVING COUNT(*) > :requestCount
          ORDER BY burst_count DESC, burst_minute DESC
        `, {
          replacements: { requestCount },
          type: api.sequelize.sequelize.QueryTypes.SELECT
        })

        return results.map(row => ({
          userId: row.userId,
          ipAddress: row.ipAddress,
          endpoint: row.endpoint,
          httpMethod: row.httpMethod,
          burstMinute: row.burst_minute,
          burstCount: parseInt(row.burst_count),
          burstStart: row.burst_start,
          burstEnd: row.burst_end,
          timeWindow: `${timeWindowMinutes} minute`,
          pattern: api.suspiciousActivityDetector.patterns.RAPID_FIRE
        }))
      },

      // Detect IP switching (≥N distinct IPs/hour)
      detectIpSwitching: async (thresholds) => {
        if (api.sequelize.sequelize.options.dialect !== 'postgres') {
          return []
        }

        const { distinctIPs, timeWindowMinutes } = thresholds.ipSwitching

        const results = await api.sequelize.sequelize.query(`
          SELECT
            "userId",
            COUNT(DISTINCT "ipAddress") as ip_count,
            ARRAY_AGG(DISTINCT "ipAddress") as ip_addresses,
            MIN("occurredAt") as first_seen,
            MAX("occurredAt") as last_seen,
            COUNT(*) as total_requests
          FROM request_ip_log
          WHERE "occurredAt" > NOW() - INTERVAL '${timeWindowMinutes} minutes'
          GROUP BY "userId"
          HAVING COUNT(DISTINCT "ipAddress") >= :distinctIPs
          ORDER BY ip_count DESC
        `, {
          replacements: { distinctIPs },
          type: api.sequelize.sequelize.QueryTypes.SELECT
        })

        return results.map(row => ({
          userId: row.userId,
          ipCount: parseInt(row.ip_count),
          ipAddresses: row.ip_addresses,
          firstSeen: row.first_seen,
          lastSeen: row.last_seen,
          totalRequests: parseInt(row.total_requests),
          timeWindow: `${timeWindowMinutes} minutes`,
          pattern: api.suspiciousActivityDetector.patterns.IP_SWITCHING
        }))
      },

      // Detect session anomalies (multiple sessions from different IPs)
      detectSessionAnomalies: async (thresholds) => {
        if (api.sequelize.sequelize.options.dialect !== 'postgres') {
          return []
        }

        const { timeWindowMinutes } = thresholds.sessionAnomalies

        const results = await api.sequelize.sequelize.query(`
          SELECT
            "userId",
            COUNT(DISTINCT "sessionFingerprint") as session_count,
            COUNT(DISTINCT "ipAddress") as ip_count,
            ARRAY_AGG(DISTINCT "ipAddress") as ip_addresses,
            ARRAY_AGG(DISTINCT "sessionFingerprint") as session_fingerprints,
            MIN("occurredAt") as first_seen,
            MAX("occurredAt") as last_seen
          FROM request_ip_log
          WHERE "occurredAt" > NOW() - INTERVAL '${timeWindowMinutes} minutes'
            AND "sessionFingerprint" IS NOT NULL
          GROUP BY "userId"
          HAVING COUNT(DISTINCT "sessionFingerprint") > 1
            AND COUNT(DISTINCT "ipAddress") > 1
          ORDER BY session_count DESC, ip_count DESC
        `, {
          type: api.sequelize.sequelize.QueryTypes.SELECT
        })

        return results.map(row => ({
          userId: row.userId,
          sessionCount: parseInt(row.session_count),
          ipCount: parseInt(row.ip_count),
          ipAddresses: row.ip_addresses,
          sessionFingerprints: row.session_fingerprints,
          firstSeen: row.first_seen,
          lastSeen: row.last_seen,
          timeWindow: `${timeWindowMinutes} minutes`,
          pattern: api.suspiciousActivityDetector.patterns.SESSION_ANOMALIES
        }))
      },

      // Run all detection patterns
      detectAll: async () => {
        const thresholds = api.config.suspiciousActivity.thresholds

        const [
          bulkOperations,
          rapidFire,
          ipSwitching,
          sessionAnomalies
        ] = await Promise.all([
          api.suspiciousActivityDetector.detectBulkOperations(thresholds),
          api.suspiciousActivityDetector.detectRapidFire(thresholds),
          api.suspiciousActivityDetector.detectIpSwitching(thresholds),
          api.suspiciousActivityDetector.detectSessionAnomalies(thresholds)
        ])

        // Get unique user IDs across all patterns
        const affectedUserIds = new Set([
          ...bulkOperations.map(r => r.userId),
          ...rapidFire.map(r => r.userId),
          ...ipSwitching.map(r => r.userId),
          ...sessionAnomalies.map(r => r.userId)
        ])

        return {
          detectedAt: new Date(),
          patterns: {
            bulkOperations,
            rapidFire,
            ipSwitching,
            sessionAnomalies
          },
          summary: {
            totalPatterns: bulkOperations.length + rapidFire.length +
                          ipSwitching.length + sessionAnomalies.length,
            affectedUsers: affectedUserIds.size
          }
        }
      }
    }
  }
}
