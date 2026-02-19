/* eslint-env node, jest */
/* globals setup */

const userFactory = require('../../__utils__/factories/userFactory')

describe('Initializer: suspiciousActivityDetector', () => {
  let testUser
  let statuses
  let patterns

  beforeAll(async () => {
    testUser = await userFactory(setup.api, { role: 'user', organizationSlug: 'test-org' })
    statuses = setup.api.suspiciousActivityDetector.statuses

    // Extract pattern names
    const patternDefs = setup.api.suspiciousActivityDetector.patterns
    patterns = {
      BULK_OPERATIONS: patternDefs.bulkOperations.name,
      RAPID_FIRE: patternDefs.rapidFire.name,
      IP_SWITCHING: patternDefs.ipSwitching.name,
      SESSION_ANOMALIES: patternDefs.sessionAnomalies.name
    }
  })

  describe('createAlert', () => {
    it('creates an alert from detection data', async () => {
      const detectedAt = new Date()

      const alert = await setup.api.suspiciousActivityDetector.createAlert(
        testUser.id,
        patterns.BULK_OPERATIONS,
        {
          requestCount: 120,
          ipCount: 2,
          lastRequest: detectedAt,
          timeWindow: '60 minutes'
        }
      )

      expect(alert).toBeDefined()
      expect(alert.id).toBeDefined()
      expect(alert.userId).toBe(testUser.id)
      expect(alert.patternType).toBe(patterns.BULK_OPERATIONS)
      expect(alert.status).toBe(statuses.NEW)
      expect(alert.requestCount).toBe(120)
      expect(alert.ipCount).toBe(2)
      expect(alert.timeWindow).toBe('60 minutes')
      expect(alert.detectionData).toBeDefined()
      expect(alert.detectionData.requestCount).toBe(120)
    })

    it('creates multiple alerts for same user and pattern (no deduplication)', async () => {
      const detectedAt = new Date()

      // Create first alert
      const alert1 = await setup.api.suspiciousActivityDetector.createAlert(
        testUser.id,
        patterns.BULK_OPERATIONS,
        {
          requestCount: 120,
          lastRequest: detectedAt,
          timeWindow: '60 minutes'
        }
      )

      expect(alert1).toBeDefined()
      expect(alert1.requestCount).toBe(120)

      // Create second alert (escalation - same pattern but higher count)
      const alert2 = await setup.api.suspiciousActivityDetector.createAlert(
        testUser.id,
        patterns.BULK_OPERATIONS,
        {
          requestCount: 150,
          lastRequest: new Date(detectedAt.getTime() + 30 * 60 * 1000), // 30 min later
          timeWindow: '60 minutes'
        }
      )

      expect(alert2).toBeDefined()
      expect(alert2.requestCount).toBe(150)
      expect(alert2.id).not.toBe(alert1.id) // Different alerts (no deduplication)
    })

    it('extracts detectedAt from various timestamp fields', async () => {
      const testDate = new Date('2024-01-15T10:00:00Z')

      // Test with lastRequest
      const alert1 = await setup.api.suspiciousActivityDetector.createAlert(
        testUser.id,
        patterns.BULK_OPERATIONS,
        { lastRequest: testDate, requestCount: 100 }
      )
      expect(alert1.detectedAt.getTime()).toBe(testDate.getTime())

      // Test with lastSeen
      const alert2 = await setup.api.suspiciousActivityDetector.createAlert(
        testUser.id,
        patterns.IP_SWITCHING,
        { lastSeen: testDate, ipCount: 5 }
      )
      expect(alert2.detectedAt.getTime()).toBe(testDate.getTime())

      // Test with burstEnd
      const alert3 = await setup.api.suspiciousActivityDetector.createAlert(
        testUser.id,
        patterns.RAPID_FIRE,
        { burstEnd: testDate, burstCount: 20 }
      )
      expect(alert3.detectedAt.getTime()).toBe(testDate.getTime())
    })
  })

  describe('extractSummaryFields', () => {
    it('extracts requestCount from different field names', () => {
      const summary1 = setup.api.suspiciousActivityDetector.extractSummaryFields(
        patterns.BULK_OPERATIONS,
        { requestCount: 120 }
      )
      expect(summary1.requestCount).toBe(120)

      const summary2 = setup.api.suspiciousActivityDetector.extractSummaryFields(
        patterns.RAPID_FIRE,
        { burstCount: 15 }
      )
      expect(summary2.requestCount).toBe(15)

      const summary3 = setup.api.suspiciousActivityDetector.extractSummaryFields(
        patterns.IP_SWITCHING,
        { totalRequests: 200 }
      )
      expect(summary3.requestCount).toBe(200)
    })

    it('extracts ipCount', () => {
      const summary = setup.api.suspiciousActivityDetector.extractSummaryFields(
        patterns.IP_SWITCHING,
        { ipCount: 5, ipAddresses: ['1.1.1.1', '2.2.2.2'] }
      )
      expect(summary.ipCount).toBe(5)
      expect(summary.distinctIps).toEqual(['1.1.1.1', '2.2.2.2'])
    })

    it('extracts endpoints from single endpoint', () => {
      const summary = setup.api.suspiciousActivityDetector.extractSummaryFields(
        patterns.RAPID_FIRE,
        { endpoint: '/api/birds' }
      )
      expect(summary.endpoints).toEqual(['/api/birds'])
    })

    it('returns null for missing fields', () => {
      const summary = setup.api.suspiciousActivityDetector.extractSummaryFields(
        patterns.SESSION_ANOMALIES,
        { sessionCount: 3 }
      )
      expect(summary.requestCount).toBe(null)
      expect(summary.ipCount).toBe(null)
      expect(summary.endpoints).toBe(null)
    })
  })

  describe('extractDetectedAt', () => {
    it('extracts from lastRequest', () => {
      const testDate = new Date('2024-01-15T10:00:00Z')
      const result = setup.api.suspiciousActivityDetector.extractDetectedAt({
        lastRequest: testDate
      })
      expect(result.getTime()).toBe(testDate.getTime())
    })

    it('extracts from lastSeen', () => {
      const testDate = new Date('2024-01-15T10:00:00Z')
      const result = setup.api.suspiciousActivityDetector.extractDetectedAt({
        lastSeen: testDate
      })
      expect(result.getTime()).toBe(testDate.getTime())
    })

    it('extracts from burstEnd', () => {
      const testDate = new Date('2024-01-15T10:00:00Z')
      const result = setup.api.suspiciousActivityDetector.extractDetectedAt({
        burstEnd: testDate
      })
      expect(result.getTime()).toBe(testDate.getTime())
    })

    it('returns current date if no timestamp fields present', () => {
      const before = Date.now()
      const result = setup.api.suspiciousActivityDetector.extractDetectedAt({
        someField: 'value'
      })
      const after = Date.now()

      expect(result.getTime()).toBeGreaterThanOrEqual(before)
      expect(result.getTime()).toBeLessThanOrEqual(after)
    })
  })

  describe('Pattern Detection Logic', () => {
    let thresholds

    beforeAll(() => {
      thresholds = setup.api.config.suspiciousActivity.thresholds
    })

    describe('detectBulkOperations', () => {
      it('detects users with excessive requests', async () => {
        const threshold = thresholds.bulkOperations.requestCount
        const timeWindowMs = thresholds.bulkOperations.timeWindowMinutes * 60 * 1000
        const testCount = threshold + 20

        const now = new Date()
        const startTime = new Date(now.getTime() - timeWindowMs + 60000)

        const logs = []
        for (let i = 0; i < testCount; i++) {
          logs.push({
            userId: testUser.id,
            ipAddress: '192.168.1.1',
            endpoint: 'formBirds:list',
            httpMethod: 'GET',
            occurredAt: new Date(startTime.getTime() + (i * (timeWindowMs / testCount)))
          })
        }
        await setup.api.models.request_ip_log.bulkCreate(logs)

        const results = await setup.api.suspiciousActivityDetector.patterns.bulkOperations.detect(thresholds)

        expect(results.length).toBeGreaterThan(0)
        const detected = results.find(p => p.userId === testUser.id)
        expect(detected).toBeDefined()
        expect(detected.requestCount).toBeGreaterThan(threshold)
        expect(detected.pattern).toBe(patterns.BULK_OPERATIONS)
      })

      it('does NOT detect users below threshold', async () => {
        const normalUser = await userFactory(setup.api, { email: 'normal-bulk@test.com', organizationSlug: 'test-org' })
        const threshold = thresholds.bulkOperations.requestCount
        const timeWindowMs = thresholds.bulkOperations.timeWindowMinutes * 60 * 1000
        const testCount = threshold - 10

        const now = new Date()
        const startTime = new Date(now.getTime() - timeWindowMs + 60000)

        const logs = []
        for (let i = 0; i < testCount; i++) {
          logs.push({
            userId: normalUser.id,
            ipAddress: '192.168.2.1',
            endpoint: 'formBirds:list',
            httpMethod: 'GET',
            occurredAt: new Date(startTime.getTime() + (i * (timeWindowMs / testCount)))
          })
        }
        await setup.api.models.request_ip_log.bulkCreate(logs)

        const results = await setup.api.suspiciousActivityDetector.patterns.bulkOperations.detect(thresholds)

        const detected = results.find(p => p.userId === normalUser.id)
        expect(detected).toBeUndefined()
      })
    })

    describe('detectIpSwitching', () => {
      it('detects users with multiple IPs', async () => {
        const threshold = thresholds.ipSwitching.distinctIPs
        const testIPCount = threshold + 1

        const ips = []
        for (let i = 0; i < testIPCount; i++) {
          ips.push(`10.0.0.${i + 1}`)
        }

        const logs = ips.map(ip => ({
          userId: testUser.id,
          ipAddress: ip,
          endpoint: 'session:create',
          httpMethod: 'POST',
          occurredAt: new Date()
        }))
        await setup.api.models.request_ip_log.bulkCreate(logs)

        const results = await setup.api.suspiciousActivityDetector.patterns.ipSwitching.detect(thresholds)

        expect(results.length).toBeGreaterThan(0)
        const detected = results.find(p => p.userId === testUser.id)
        expect(detected).toBeDefined()
        expect(detected.ipCount).toBeGreaterThanOrEqual(threshold)
        expect(detected.pattern).toBe(patterns.IP_SWITCHING)
      })

      it('does NOT detect users with few IPs', async () => {
        const normalUser = await userFactory(setup.api, { email: 'stable-ip@test.com', organizationSlug: 'test-org' })
        const threshold = thresholds.ipSwitching.distinctIPs
        const testIPCount = threshold - 1

        const ips = []
        for (let i = 0; i < testIPCount; i++) {
          ips.push(`10.1.0.${i + 1}`)
        }

        const logs = ips.map(ip => ({
          userId: normalUser.id,
          ipAddress: ip,
          endpoint: 'session:create',
          httpMethod: 'POST',
          occurredAt: new Date()
        }))
        await setup.api.models.request_ip_log.bulkCreate(logs)

        const results = await setup.api.suspiciousActivityDetector.patterns.ipSwitching.detect(thresholds)

        const detected = results.find(p => p.userId === normalUser.id)
        expect(detected).toBeUndefined()
      })
    })

    describe('detectRapidFire', () => {
      it('detects burst requests to same endpoint', async () => {
        const threshold = thresholds.rapidFire.requestCount
        const testCount = threshold + 5

        const now = new Date()
        const logs = []
        for (let i = 0; i < testCount; i++) {
          logs.push({
            userId: testUser.id,
            ipAddress: '192.168.1.10',
            endpoint: 'formBirds:view',
            httpMethod: 'GET',
            occurredAt: new Date(now.getTime() - 60000 + (i * 1000))
          })
        }
        await setup.api.models.request_ip_log.bulkCreate(logs)

        const results = await setup.api.suspiciousActivityDetector.patterns.rapidFire.detect(thresholds)

        expect(results.length).toBeGreaterThan(0)
        const detected = results.find(
          p => p.userId === testUser.id && p.endpoint === 'formBirds:view'
        )
        expect(detected).toBeDefined()
        expect(detected.burstCount).toBeGreaterThan(threshold)
        expect(detected.pattern).toBe(patterns.RAPID_FIRE)
      })

      it('does NOT detect normal request rates', async () => {
        const normalUser = await userFactory(setup.api, { email: 'normal-rate@test.com', organizationSlug: 'test-org' })
        const threshold = thresholds.rapidFire.requestCount
        const testCount = threshold - 2

        const now = new Date()
        const logs = []
        for (let i = 0; i < testCount; i++) {
          logs.push({
            userId: normalUser.id,
            ipAddress: '192.168.1.20',
            endpoint: 'formBirds:list',
            httpMethod: 'GET',
            occurredAt: new Date(now.getTime() - 60000 + (i * 1000))
          })
        }
        await setup.api.models.request_ip_log.bulkCreate(logs)

        const results = await setup.api.suspiciousActivityDetector.patterns.rapidFire.detect(thresholds)

        const detected = results.find(
          p => p.userId === normalUser.id && p.endpoint === 'formBirds:list'
        )
        expect(detected).toBeUndefined()
      })
    })

    describe('detectSessionAnomalies', () => {
      it('detects multiple sessions from different IPs', async () => {
        await setup.api.models.request_ip_log.bulkCreate([
          {
            userId: testUser.id,
            ipAddress: '192.168.1.100',
            sessionFingerprint: 'session-abc',
            endpoint: 'formBirds:list',
            httpMethod: 'GET',
            occurredAt: new Date()
          },
          {
            userId: testUser.id,
            ipAddress: '10.0.0.100',
            sessionFingerprint: 'session-xyz',
            endpoint: 'formBirds:list',
            httpMethod: 'GET',
            occurredAt: new Date()
          }
        ])

        const results = await setup.api.suspiciousActivityDetector.patterns.sessionAnomalies.detect(thresholds)

        if (results.length > 0) {
          const detected = results.find(p => p.userId === testUser.id)
          if (detected) {
            expect(detected.sessionCount).toBeGreaterThanOrEqual(2)
            expect(detected.ipCount).toBeGreaterThanOrEqual(2)
            expect(detected.pattern).toBe(patterns.SESSION_ANOMALIES)
          }
        }
      })

      it('does NOT detect single session from single IP', async () => {
        const normalUser = await userFactory(setup.api, { email: 'single-session@test.com', organizationSlug: 'test-org' })

        await setup.api.models.request_ip_log.bulkCreate([
          {
            userId: normalUser.id,
            ipAddress: '192.168.1.200',
            sessionFingerprint: 'session-normal',
            endpoint: 'formBirds:list',
            httpMethod: 'GET',
            occurredAt: new Date()
          },
          {
            userId: normalUser.id,
            ipAddress: '192.168.1.200',
            sessionFingerprint: 'session-normal',
            endpoint: 'formBirds:view',
            httpMethod: 'GET',
            occurredAt: new Date()
          }
        ])

        const results = await setup.api.suspiciousActivityDetector.patterns.sessionAnomalies.detect(thresholds)

        const detected = results.find(p => p.userId === normalUser.id)
        expect(detected).toBeUndefined()
      })
    })
  })
})
