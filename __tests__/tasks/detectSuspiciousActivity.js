/* eslint-env node, jest */
/* globals setup */

const userFactory = require('../../__utils__/factories/userFactory')

describe('Task: suspiciousActivity:detect', () => {
  let testUser
  let thresholds

  beforeAll(async () => {
    testUser = await userFactory(setup.api, { role: 'user', organizationSlug: 'test-org' })
    thresholds = setup.api.config.suspiciousActivity.thresholds
  })

  it('runs detection and creates alerts', async () => {
    // Enable auto-detect for this test
    const originalAutoDetect = setup.api.config.suspiciousActivity.autoDetect
    setup.api.config.suspiciousActivity.autoDetect = true

    // Create suspicious activity (bulk operations)
    const threshold = thresholds.bulkOperations.requestCount
    const testCount = threshold + 50
    const timeWindowMs = thresholds.bulkOperations.timeWindowMinutes * 60 * 1000

    const now = new Date()
    const startTime = new Date(now.getTime() - timeWindowMs + 60000)

    const logs = []
    for (let i = 0; i < testCount; i++) {
      logs.push({
        userId: testUser.id,
        ipAddress: '192.168.100.1',
        endpoint: 'formBirds:list',
        httpMethod: 'GET',
        occurredAt: new Date(startTime.getTime() + (i * (timeWindowMs / testCount)))
      })
    }
    await setup.api.models.request_ip_log.bulkCreate(logs)

    // Run task
    const result = await setup.api.tasks.tasks['suspiciousActivity:detect'].run({})

    expect(result.success).toBe(true)
    expect(result.alertsCreated).toBeGreaterThan(0)

    // Verify alert was created
    const alerts = await setup.api.models.suspicious_activity_alert.findAll({
      where: { userId: testUser.id }
    })

    expect(alerts.length).toBeGreaterThan(0)
    expect(alerts[0].status).toBe('new')
    expect(alerts[0].patternType).toBe('bulkOperations')

    // Restore config
    setup.api.config.suspiciousActivity.autoDetect = originalAutoDetect
  })

  it('skips detection when autoDetect is disabled', async () => {
    // Disable auto-detect
    const originalAutoDetect = setup.api.config.suspiciousActivity.autoDetect
    setup.api.config.suspiciousActivity.autoDetect = false

    const result = await setup.api.tasks.tasks['suspiciousActivity:detect'].run({})

    expect(result).toBeUndefined() // Task returns early

    // Restore config
    setup.api.config.suspiciousActivity.autoDetect = originalAutoDetect
  })
})
