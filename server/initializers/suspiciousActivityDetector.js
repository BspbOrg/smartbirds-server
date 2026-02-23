const { Initializer, api } = require('actionhero')

module.exports = class SuspiciousActivityDetectorInit extends Initializer {
  constructor () {
    super()
    this.name = 'suspiciousActivityDetector'
    this.loadPriority = 650
  }

  async initialize () {
    api.suspiciousActivityDetector = {
      // Alert status constants
      statuses: {
        NEW: 'new',
        INVESTIGATING: 'investigating',
        RESOLVED: 'resolved',
        FALSE_POSITIVE: 'false_positive'
      },

      // Pattern definitions - each pattern is self-contained
      patterns: {
        bulkOperations: {
          name: 'bulkOperations',
          detect: async (thresholds) => {
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
              WHERE "occurredAt" > NOW() - (:timeWindowMinutes * INTERVAL '1 minute')
              GROUP BY "userId"
              HAVING COUNT(*) > :requestCount
              ORDER BY request_count DESC
            `, {
              replacements: { requestCount, timeWindowMinutes },
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
              pattern: 'bulkOperations'
            }))
          }
        },

        rapidFire: {
          name: 'rapidFire',
          detect: async (thresholds) => {
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
              WHERE "occurredAt" > NOW() - (:lookbackMinutes * INTERVAL '1 minute')
              GROUP BY
                "userId",
                "ipAddress",
                endpoint,
                "httpMethod",
                DATE_TRUNC('minute', "occurredAt")
              HAVING COUNT(*) > :requestCount
              ORDER BY burst_count DESC, burst_minute DESC
            `, {
              replacements: { requestCount, lookbackMinutes },
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
              pattern: 'rapidFire'
            }))
          }
        },

        ipSwitching: {
          name: 'ipSwitching',
          detect: async (thresholds) => {
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
              WHERE "occurredAt" > NOW() - (:timeWindowMinutes * INTERVAL '1 minute')
              GROUP BY "userId"
              HAVING COUNT(DISTINCT "ipAddress") >= :distinctIPs
              ORDER BY ip_count DESC
            `, {
              replacements: { distinctIPs, timeWindowMinutes },
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
              pattern: 'ipSwitching'
            }))
          }
        },

        sessionAnomalies: {
          name: 'sessionAnomalies',
          detect: async (thresholds) => {
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
              WHERE "occurredAt" > NOW() - (:timeWindowMinutes * INTERVAL '1 minute')
                AND "sessionFingerprint" IS NOT NULL
              GROUP BY "userId"
              HAVING COUNT(DISTINCT "sessionFingerprint") > 1
                AND COUNT(DISTINCT "ipAddress") > 1
              ORDER BY session_count DESC, ip_count DESC
            `, {
              replacements: { timeWindowMinutes },
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
              pattern: 'sessionAnomalies'
            }))
          }
        }
      },

      // Run all detection patterns dynamically
      detectAll: async () => {
        const thresholds = api.config.suspiciousActivity.thresholds

        // Get all pattern keys
        const patternKeys = Object.keys(api.suspiciousActivityDetector.patterns)

        // Run all detection functions in parallel
        const detectionResults = await Promise.all(
          patternKeys.map(key =>
            api.suspiciousActivityDetector.patterns[key].detect(thresholds)
          )
        )

        // Build patterns object dynamically
        const patterns = {}
        const allDetections = []

        patternKeys.forEach((key, index) => {
          const patternName = api.suspiciousActivityDetector.patterns[key].name
          patterns[patternName] = detectionResults[index]
          allDetections.push(...detectionResults[index])
        })

        // Get unique user IDs across all patterns
        const affectedUserIds = new Set(allDetections.map(r => r.userId))

        return {
          detectedAt: new Date(),
          patterns,
          summary: {
            totalPatterns: allDetections.length,
            affectedUsers: affectedUserIds.size
          }
        }
      },

      // Helper: Extract summary fields from detection result
      extractSummaryFields: (pattern, detectionData) => {
        return {
          requestCount: detectionData.requestCount || detectionData.burstCount || detectionData.totalRequests || null,
          ipCount: detectionData.ipCount || null,
          distinctIps: detectionData.ipAddresses || null,
          endpoints: detectionData.endpoint ? [detectionData.endpoint] : null,
          timeWindow: detectionData.timeWindow || null
        }
      },

      // Helper: Extract detected timestamp from detection data
      extractDetectedAt: (detectionData) => {
        return new Date(
          detectionData.lastRequest ||
          detectionData.lastSeen ||
          detectionData.burstEnd ||
          new Date()
        )
      },

      // Create alert from detection result
      createAlert: async (userId, patternType, detectionData) => {
        const detectedAt = api.suspiciousActivityDetector.extractDetectedAt(detectionData)

        // Extract summary fields
        const summary = api.suspiciousActivityDetector.extractSummaryFields(patternType, detectionData)

        // Create alert
        const alert = await api.models.suspicious_activity_alert.create({
          userId,
          patternType,
          status: api.suspiciousActivityDetector.statuses.NEW,
          detectedAt,
          detectionData,
          requestCount: summary.requestCount,
          ipCount: summary.ipCount,
          distinctIps: summary.distinctIps,
          endpoints: summary.endpoints,
          timeWindow: summary.timeWindow
        })

        api.log(`Created alert: id=${alert.id}, userId=${userId}, pattern=${patternType}`, 'info')
        return alert
      },

      // Process detection results and create alerts
      processDetectionResults: async (detectionResults) => {
        const { patterns } = detectionResults
        const createdAlerts = []

        // Iterate through all pattern types dynamically
        const patternNames = Object.keys(api.suspiciousActivityDetector.patterns).map(
          key => api.suspiciousActivityDetector.patterns[key].name
        )

        for (const patternName of patternNames) {
          const detections = patterns[patternName] || []

          for (const detection of detections) {
            const alert = await api.suspiciousActivityDetector.createAlert(
              detection.userId,
              patternName,
              detection
            )
            if (alert) createdAlerts.push(alert)
          }
        }

        api.log(`Processed detection results: ${createdAlerts.length} new alerts created`, 'info')
        return createdAlerts
      }
    }
  }
}
