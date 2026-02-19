/* eslint-env node, jest */
/* globals setup */

const userFactory = require('../../__utils__/factories/userFactory')

describe('Action: suspiciousActivity:detect', () => {
  let testUser
  let thresholds

  beforeAll(async () => {
    testUser = await userFactory(setup.api, { role: 'user', organizationSlug: 'test-org' })
    thresholds = setup.api.config.suspiciousActivity.thresholds
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

  describe('saveAlerts parameter', () => {
    it('creates alerts when saveAlerts is true', async () => {
      // Seed enough requests to trigger bulkOperations detection
      const threshold = thresholds.bulkOperations.requestCount
      const timeWindowMs = thresholds.bulkOperations.timeWindowMinutes * 60 * 1000
      const now = new Date()
      const logs = []
      for (let i = 0; i < threshold + 10; i++) {
        logs.push({
          userId: testUser.id,
          ipAddress: '10.10.10.1',
          endpoint: 'formBirds:list',
          httpMethod: 'GET',
          occurredAt: new Date(now.getTime() - timeWindowMs + 60000 + i * 100)
        })
      }
      await setup.api.models.request_ip_log.bulkCreate(logs)

      const beforeCount = await setup.api.models.suspicious_activity_alert.count()

      const response = await setup.runActionAsAdmin('suspiciousActivity:detect', {
        saveAlerts: true
      })

      expect(response).not.toEqual(expect.objectContaining({ error: expect.anything() }))
      expect(response.data.alertsCreated).toBeGreaterThan(0)

      const afterCount = await setup.api.models.suspicious_activity_alert.count()
      expect(afterCount).toBeGreaterThan(beforeCount)
    })

    it('does not create alerts when saveAlerts is false', async () => {
      const beforeCount = await setup.api.models.suspicious_activity_alert.count()

      const response = await setup.runActionAsAdmin('suspiciousActivity:detect', {
        saveAlerts: false
      })

      expect(response).not.toEqual(expect.objectContaining({ error: expect.anything() }))
      expect(response.data.alertsCreated).toBeUndefined()

      const afterCount = await setup.api.models.suspicious_activity_alert.count()
      expect(afterCount).toBe(beforeCount)
    })
  })
})
