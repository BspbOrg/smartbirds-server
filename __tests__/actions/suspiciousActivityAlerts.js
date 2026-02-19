/* eslint-env node, jest */
/* globals setup */

const userFactory = require('../../__utils__/factories/userFactory')

describe('Action: suspiciousActivityAlert', () => {
  let testUser
  let adminUser
  let patterns
  let statuses

  beforeAll(async () => {
    adminUser = await userFactory(setup.api, { role: 'admin', organizationSlug: 'test-org' })
    testUser = await userFactory(setup.api, { role: 'user', organizationSlug: 'test-org' })

    // Extract pattern names from patterns object
    const patternDefs = setup.api.suspiciousActivityDetector.patterns
    patterns = {
      BULK_OPERATIONS: patternDefs.bulkOperations.name,
      RAPID_FIRE: patternDefs.rapidFire.name,
      IP_SWITCHING: patternDefs.ipSwitching.name,
      SESSION_ANOMALIES: patternDefs.sessionAnomalies.name
    }

    statuses = setup.api.suspiciousActivityDetector.statuses
  })

  describe('Authorization', () => {
    it('allows admin to list alerts', async () => {
      const response = await setup.runActionAsAdmin('suspiciousActivityAlert:list', {})

      expect(response).not.toEqual(expect.objectContaining({ error: expect.anything() }))
      expect(response.data).toBeDefined()
      expect(Array.isArray(response.data)).toBe(true)
    })

    it('denies non-admin users', async () => {
      const response = await setup.runActionAsUser('suspiciousActivityAlert:list', {})

      expect(response).toEqual(expect.objectContaining({
        error: expect.stringMatching(/Admin required/)
      }))
    })
  })

  describe('Alert CRUD', () => {
    it('lists alerts', async () => {
      // Create test alert
      await setup.api.models.suspicious_activity_alert.create({
        userId: testUser.id,
        patternType: patterns.IP_SWITCHING,
        status: statuses.NEW,
        detectedAt: new Date(),
        detectionData: { ipCount: 5 },
        ipCount: 5
      })

      const response = await setup.runActionAsAdmin('suspiciousActivityAlert:list', {})

      expect(response.data.length).toBeGreaterThan(0)
      expect(response.count).toBeGreaterThan(0)
    })

    it('filters alerts by status', async () => {
      // Create resolved alert
      await setup.api.models.suspicious_activity_alert.create({
        userId: testUser.id,
        patternType: patterns.RAPID_FIRE,
        status: statuses.RESOLVED,
        detectedAt: new Date(),
        resolvedAt: new Date(),
        resolvedBy: adminUser.id,
        detectionData: { burstCount: 15 },
        requestCount: 15
      })

      const response = await setup.runActionAsAdmin('suspiciousActivityAlert:list', { status: statuses.RESOLVED })

      expect(response.data.length).toBeGreaterThan(0)
      response.data.forEach(alert => {
        expect(alert.status).toBe(statuses.RESOLVED)
      })
    })

    it('returns error for non-existent alert id on view', async () => {
      const response = await setup.runActionAsAdmin('suspiciousActivityAlert:view', { id: 999999 })

      expect(response).toEqual(expect.objectContaining({
        error: expect.stringMatching(/Alert not found/)
      }))
    })

    it('views single alert', async () => {
      const alert = await setup.api.models.suspicious_activity_alert.create({
        userId: testUser.id,
        patternType: patterns.SESSION_ANOMALIES,
        status: statuses.NEW,
        detectedAt: new Date(),
        detectionData: { sessionCount: 3, ipCount: 3 },
        ipCount: 3
      })

      const response = await setup.runActionAsAdmin('suspiciousActivityAlert:view', { id: alert.id })

      expect(response).not.toEqual(expect.objectContaining({ error: expect.anything() }))
      expect(response.data.id).toBe(alert.id.toString())
      expect(response.data.patternType).toBe(patterns.SESSION_ANOMALIES)
      expect(response.data.userId).toBe(testUser.id)
    })

    it('updates alert status', async () => {
      const alert = await setup.api.models.suspicious_activity_alert.create({
        userId: testUser.id,
        patternType: patterns.BULK_OPERATIONS,
        status: statuses.NEW,
        detectedAt: new Date(),
        detectionData: { requestCount: 150 },
        requestCount: 150
      })

      const response = await setup.runActionAsAdmin('suspiciousActivityAlert:update', {
        id: alert.id,
        status: statuses.INVESTIGATING,
        adminNotes: 'Looking into this user'
      })

      expect(response.data.status).toBe('investigating')
      expect(response.data.adminNotes).toBe('Looking into this user')
    })

    it('returns error for non-existent alert id on update', async () => {
      const response = await setup.runActionAsAdmin('suspiciousActivityAlert:update', { id: 999999, status: statuses.RESOLVED })

      expect(response).toEqual(expect.objectContaining({
        error: expect.stringMatching(/Alert not found/)
      }))
    })

    it('returns error for invalid status', async () => {
      const alert = await setup.api.models.suspicious_activity_alert.create({
        userId: testUser.id,
        patternType: patterns.BULK_OPERATIONS,
        status: statuses.NEW,
        detectedAt: new Date(),
        detectionData: {}
      })

      const response = await setup.runActionAsAdmin('suspiciousActivityAlert:update', {
        id: alert.id,
        status: 'invalid_status'
      })

      expect(response).toEqual(expect.objectContaining({
        error: expect.stringMatching(/Invalid status/)
      }))
    })

    it('marks alert as false positive', async () => {
      const alert = await setup.api.models.suspicious_activity_alert.create({
        userId: testUser.id,
        patternType: patterns.RAPID_FIRE,
        status: statuses.INVESTIGATING,
        detectedAt: new Date(),
        detectionData: { burstCount: 12 },
        requestCount: 12
      })

      const response = await setup.runActionAsAdmin('suspiciousActivityAlert:update', {
        id: alert.id,
        status: statuses.FALSE_POSITIVE,
        adminNotes: 'Legitimate bulk export'
      })

      expect(response.data.status).toBe('false_positive')
      expect(response.data.resolvedAt).toBeDefined()
      expect(response.data.resolvedBy).toBeDefined() // Resolved by the admin who ran the action
    })
  })

  describe('Alert statistics', () => {
    it('returns stats grouped by status and pattern', async () => {
      // Create various alerts
      await setup.api.models.suspicious_activity_alert.bulkCreate([
        {
          userId: testUser.id,
          patternType: patterns.BULK_OPERATIONS,
          status: statuses.NEW,
          detectedAt: new Date(),
          detectionData: {},
          requestCount: 110
        },
        {
          userId: testUser.id,
          patternType: patterns.RAPID_FIRE,
          status: statuses.RESOLVED,
          detectedAt: new Date(),
          resolvedAt: new Date(),
          detectionData: {},
          requestCount: 15
        }
      ])

      const response = await setup.runActionAsAdmin('suspiciousActivityAlert:stats', {})

      expect(response.data.total).toBeGreaterThan(0)
      expect(response.data.byStatus).toBeDefined()
      expect(response.data.byPattern).toBeDefined()
    })
  })
})
