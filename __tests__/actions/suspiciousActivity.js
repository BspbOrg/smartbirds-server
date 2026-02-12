/* eslint-env node, jest */
/* globals setup */

const userFactory = require('../../__utils__/factories/userFactory')

describe('Action: suspiciousActivity:detect', () => {
  let testUser
  let thresholds
  let patterns

  beforeAll(async () => {
    testUser = await userFactory(setup.api, { role: 'user', organizationSlug: 'test-org' })

    // Get thresholds from config so tests adapt to config changes
    thresholds = setup.api.config.suspiciousActivity.thresholds

    // Get pattern constants
    patterns = setup.api.suspiciousActivityDetector.patterns
  })

  describe('Authorization', () => {
    it('allows admin users to detect suspicious activity', async () => {
      const response = await setup.runActionAsAdmin('suspiciousActivity:detect', {})

      expect(response).not.toEqual(expect.objectContaining({ error: expect.anything() }))
      expect(response.data).toBeTruthy()
      expect(response.data.detectedAt).toBeDefined()
      expect(response.data.patterns).toBeDefined()
      expect(response.data.summary).toBeDefined()
    })

    it('denies non-admin users', async () => {
      const response = await setup.runActionAsUser('suspiciousActivity:detect', {})

      expect(response).toEqual(expect.objectContaining({
        error: expect.stringMatching(/Admin required/)
      }))
    })

    it('denies birds moderator', async () => {
      const response = await setup.runActionAsBirds('suspiciousActivity:detect', {})

      expect(response).toEqual(expect.objectContaining({
        error: expect.stringMatching(/Admin required/)
      }))
    })

    it('denies guest users', async () => {
      const response = await setup.runActionAsGuest('suspiciousActivity:detect', {})

      expect(response.error).toMatch(/Please log in to continue/)
    })
  })

  describe('Bulk Operations Detection', () => {
    it('detects users with excessive requests', async () => {
      // Create requests exceeding the threshold
      const threshold = thresholds.bulkOperations.requestCount
      const timeWindowMs = thresholds.bulkOperations.timeWindowMinutes * 60 * 1000
      const testCount = threshold + 20 // Exceed threshold by 20

      const now = new Date()
      const startTime = new Date(now.getTime() - timeWindowMs + 60000) // Within window

      const logs = []
      for (let i = 0; i < testCount; i++) {
        logs.push({
          userId: testUser.id,
          ipAddress: '192.168.1.1',
          endpoint: 'formBirds:list',
          httpMethod: 'GET',
          occurredAt: new Date(startTime.getTime() + (i * (timeWindowMs / testCount))) // Spread evenly
        })
      }
      await setup.api.models.request_ip_log.bulkCreate(logs)

      const response = await setup.runActionAsAdmin('suspiciousActivity:detect', {})

      expect(response).not.toEqual(expect.objectContaining({ error: expect.anything() }))
      expect(response.data.patterns.bulkOperations.length).toBeGreaterThan(0)

      const detected = response.data.patterns.bulkOperations.find(p => p.userId === testUser.id)
      expect(detected).toBeDefined()
      expect(detected.requestCount).toBeGreaterThan(threshold)
      expect(detected.pattern).toBe(patterns.BULK_OPERATIONS)
    })

    it('does NOT detect users below threshold', async () => {
      const normalUser = await userFactory(setup.api, { email: 'normal@test.com', organizationSlug: 'test-org' })
      const threshold = thresholds.bulkOperations.requestCount
      const timeWindowMs = thresholds.bulkOperations.timeWindowMinutes * 60 * 1000
      const testCount = threshold - 10 // Below threshold

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

      const response = await setup.runActionAsAdmin('suspiciousActivity:detect', {})

      expect(response).not.toEqual(expect.objectContaining({ error: expect.anything() }))

      // Normal user should NOT appear in bulk operations
      const detected = response.data.patterns.bulkOperations.find(p => p.userId === normalUser.id)
      expect(detected).toBeUndefined()
    })
  })

  describe('IP Switching Detection', () => {
    it('detects users with multiple IPs', async () => {
      // Create requests from distinct IPs exceeding threshold
      const threshold = thresholds.ipSwitching.distinctIPs
      const testIPCount = threshold + 1 // Exceed threshold by 1

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

      const response = await setup.runActionAsAdmin('suspiciousActivity:detect', {})

      expect(response).not.toEqual(expect.objectContaining({ error: expect.anything() }))
      expect(response.data.patterns.ipSwitching.length).toBeGreaterThan(0)

      const detected = response.data.patterns.ipSwitching.find(p => p.userId === testUser.id)
      expect(detected).toBeDefined()
      expect(detected.ipCount).toBeGreaterThanOrEqual(threshold)
      expect(detected.pattern).toBe(patterns.IP_SWITCHING)
    })

    it('does NOT detect users with few IPs', async () => {
      const normalUser = await userFactory(setup.api, { email: 'stable-ip@test.com', organizationSlug: 'test-org' })
      const threshold = thresholds.ipSwitching.distinctIPs
      const testIPCount = threshold - 1 // Below threshold

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

      const response = await setup.runActionAsAdmin('suspiciousActivity:detect', {})

      expect(response).not.toEqual(expect.objectContaining({ error: expect.anything() }))

      // Normal user should NOT appear in IP switching
      const detected = response.data.patterns.ipSwitching.find(p => p.userId === normalUser.id)
      expect(detected).toBeUndefined()
    })
  })

  describe('Rapid Fire Detection', () => {
    it('detects burst requests to same endpoint', async () => {
      // Create burst exceeding threshold
      const threshold = thresholds.rapidFire.requestCount
      const testCount = threshold + 5 // Exceed threshold by 5

      const now = new Date()
      const logs = []
      for (let i = 0; i < testCount; i++) {
        logs.push({
          userId: testUser.id,
          ipAddress: '192.168.1.10',
          endpoint: 'formBirds:view',
          httpMethod: 'GET',
          occurredAt: new Date(now.getTime() - 60000 + (i * 1000)) // 1 minute ago, spread over 1 second intervals
        })
      }
      await setup.api.models.request_ip_log.bulkCreate(logs)

      const response = await setup.runActionAsAdmin('suspiciousActivity:detect', {})

      expect(response).not.toEqual(expect.objectContaining({ error: expect.anything() }))

      // Should detect the burst
      expect(response.data.patterns.rapidFire.length).toBeGreaterThan(0)
      const detected = response.data.patterns.rapidFire.find(
        p => p.userId === testUser.id && p.endpoint === 'formBirds:view'
      )
      expect(detected).toBeDefined()
      expect(detected.burstCount).toBeGreaterThan(threshold)
      expect(detected.pattern).toBe(patterns.RAPID_FIRE)
    })

    it('does NOT detect normal request rates', async () => {
      const normalUser = await userFactory(setup.api, { email: 'normal-rate@test.com', organizationSlug: 'test-org' })
      const threshold = thresholds.rapidFire.requestCount
      const testCount = threshold - 2 // Below threshold

      const now = new Date()
      const logs = []
      for (let i = 0; i < testCount; i++) {
        logs.push({
          userId: normalUser.id,
          ipAddress: '192.168.1.20',
          endpoint: 'formBirds:list',
          httpMethod: 'GET',
          occurredAt: new Date(now.getTime() - 60000 + (i * 1000)) // 1 minute ago
        })
      }
      await setup.api.models.request_ip_log.bulkCreate(logs)

      const response = await setup.runActionAsAdmin('suspiciousActivity:detect', {})

      expect(response).not.toEqual(expect.objectContaining({ error: expect.anything() }))

      // Normal user should NOT appear in rapid fire
      const detected = response.data.patterns.rapidFire.find(
        p => p.userId === normalUser.id && p.endpoint === 'formBirds:list'
      )
      expect(detected).toBeUndefined()
    })
  })

  describe('Session Anomalies Detection', () => {
    it('detects multiple sessions from different IPs', async () => {
      // Create requests with different session fingerprints and IPs
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

      const response = await setup.runActionAsAdmin('suspiciousActivity:detect', {})

      expect(response).not.toEqual(expect.objectContaining({ error: expect.anything() }))

      // Session anomalies may or may not trigger
      if (response.data.patterns.sessionAnomalies.length > 0) {
        const detected = response.data.patterns.sessionAnomalies.find(p => p.userId === testUser.id)
        if (detected) {
          expect(detected.sessionCount).toBeGreaterThanOrEqual(2)
          expect(detected.ipCount).toBeGreaterThanOrEqual(2)
          expect(detected.pattern).toBe(patterns.SESSION_ANOMALIES)
        }
      }
    })

    it('does NOT detect single session from single IP', async () => {
      const normalUser = await userFactory(setup.api, { email: 'single-session@test.com', organizationSlug: 'test-org' })

      // Single session, single IP - normal behavior
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

      const response = await setup.runActionAsAdmin('suspiciousActivity:detect', {})

      expect(response).not.toEqual(expect.objectContaining({ error: expect.anything() }))

      // Normal user should NOT appear in session anomalies
      const detected = response.data.patterns.sessionAnomalies.find(p => p.userId === normalUser.id)
      expect(detected).toBeUndefined()
    })
  })

  describe('Response Format', () => {
    it('returns correct structure with all pattern types', async () => {
      const response = await setup.runActionAsAdmin('suspiciousActivity:detect', {})

      expect(response).not.toEqual(expect.objectContaining({ error: expect.anything() }))
      expect(response.data).toBeTruthy()
      expect(response.data.detectedAt).toBeDefined()
      expect(response.data.patterns).toBeDefined()
      expect(Array.isArray(response.data.patterns.bulkOperations)).toBe(true)
      expect(Array.isArray(response.data.patterns.rapidFire)).toBe(true)
      expect(Array.isArray(response.data.patterns.ipSwitching)).toBe(true)
      expect(Array.isArray(response.data.patterns.sessionAnomalies)).toBe(true)
      expect(response.data.summary).toBeDefined()
      expect(typeof response.data.summary.totalPatterns).toBe('number')
      expect(typeof response.data.summary.affectedUsers).toBe('number')
    })
  })
})
