/* eslint-env node, jest */
/* globals setup */

const userFactory = require('../../__utils__/factories/userFactory')

describe('Model: suspicious_activity_alert', () => {
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

  it('creates an alert with all fields', async () => {
    const alert = await setup.api.models.suspicious_activity_alert.create({
      userId: testUser.id,
      patternType: patterns.BULK_OPERATIONS,
      status: statuses.NEW,
      detectedAt: new Date(),
      detectionData: {
        requestCount: 120,
        ipCount: 2,
        timeWindow: '60 minutes'
      },
      requestCount: 120,
      ipCount: 2,
      timeWindow: '60 minutes'
    })

    expect(alert.id).toBeDefined()
    expect(alert.userId).toBe(testUser.id)
    expect(alert.patternType).toBe(patterns.BULK_OPERATIONS)
    expect(alert.status).toBe(statuses.NEW)
    expect(alert.detectedAt).toBeDefined()
    expect(alert.detectionData).toEqual({
      requestCount: 120,
      ipCount: 2,
      timeWindow: '60 minutes'
    })
    expect(alert.requestCount).toBe(120)
    expect(alert.ipCount).toBe(2)
  })

  it('applies default value for status', async () => {
    const alert = await setup.api.models.suspicious_activity_alert.create({
      userId: testUser.id,
      patternType: patterns.RAPID_FIRE,
      detectedAt: new Date(),
      detectionData: { burstCount: 15 }
    })

    expect(alert.status).toBe(statuses.NEW)
  })

  it('requires userId', async () => {
    await expect(
      setup.api.models.suspicious_activity_alert.create({
        patternType: patterns.BULK_OPERATIONS,
        status: statuses.NEW,
        detectedAt: new Date(),
        detectionData: {}
      })
    ).rejects.toThrow()
  })

  it('requires patternType', async () => {
    await expect(
      setup.api.models.suspicious_activity_alert.create({
        userId: testUser.id,
        status: statuses.NEW,
        detectedAt: new Date(),
        detectionData: {}
      })
    ).rejects.toThrow()
  })

  it('requires detectedAt', async () => {
    await expect(
      setup.api.models.suspicious_activity_alert.create({
        userId: testUser.id,
        patternType: patterns.BULK_OPERATIONS,
        status: statuses.NEW,
        detectionData: {}
      })
    ).rejects.toThrow()
  })

  it('requires detectionData', async () => {
    await expect(
      setup.api.models.suspicious_activity_alert.create({
        userId: testUser.id,
        patternType: patterns.BULK_OPERATIONS,
        status: statuses.NEW,
        detectedAt: new Date()
      })
    ).rejects.toThrow()
  })

  it('stores JSONB data in detectionData', async () => {
    const complexData = {
      requestCount: 120,
      ipAddresses: ['1.1.1.1', '2.2.2.2', '3.3.3.3'],
      endpoints: ['/api/birds', '/api/mammals'],
      metadata: {
        nested: {
          deep: 'value'
        }
      }
    }

    const alert = await setup.api.models.suspicious_activity_alert.create({
      userId: testUser.id,
      patternType: patterns.IP_SWITCHING,
      status: statuses.NEW,
      detectedAt: new Date(),
      detectionData: complexData
    })

    expect(alert.detectionData).toEqual(complexData)
    expect(alert.detectionData.metadata.nested.deep).toBe('value')
  })

  it('stores timestamps automatically', async () => {
    const alert = await setup.api.models.suspicious_activity_alert.create({
      userId: testUser.id,
      patternType: patterns.SESSION_ANOMALIES,
      status: statuses.NEW,
      detectedAt: new Date(),
      detectionData: { sessionCount: 3 }
    })

    expect(alert.createdAt).toBeDefined()
    expect(alert.updatedAt).toBeDefined()
    expect(new Date(alert.createdAt).getTime()).toBeGreaterThan(0)
    expect(new Date(alert.updatedAt).getTime()).toBeGreaterThan(0)
  })
})
