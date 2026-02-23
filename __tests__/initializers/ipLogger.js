/* eslint-env node, jest */
/* globals setup */

const userFactory = require('../../__utils__/factories/userFactory')

// ipLogger only writes to PostgreSQL
const isPg = () => setup.api.sequelize.sequelize.options.dialect === 'postgres'

describe('Initializer: ipLogger', () => {
  let testUser
  let mockConnection

  beforeAll(async () => {
    testUser = await userFactory(setup.api, { role: 'user', organizationSlug: 'test-org' })
  })

  beforeEach(() => {
    mockConnection = {
      remoteIP: '192.168.1.1',
      fingerprint: 'test-fingerprint-abc',
      rawConnection: {
        req: {
          method: 'GET',
          headers: { 'user-agent': 'TestAgent/1.0' }
        }
      }
    }
  })

  describe('logRequest', () => {
    it('creates a request_ip_log row with correct fields', async () => {
      if (!isPg()) return

      await setup.api.ipLogger.logRequest(testUser.id, mockConnection, 'formBirds:list')

      const row = await setup.api.models.request_ip_log.findOne({
        where: { userId: testUser.id, endpoint: 'formBirds:list' },
        order: [['occurredAt', 'DESC']]
      })

      expect(row).toBeDefined()
      expect(row.ipAddress).toBe('192.168.1.1')
      expect(row.sessionFingerprint).toBe('test-fingerprint-abc')
      expect(row.httpMethod).toBe('GET')
      expect(row.userAgent).toBe('TestAgent/1.0')
    })

    it('does not create a row for excluded endpoints', async () => {
      if (!isPg()) return

      const before = await setup.api.models.request_ip_log.count({ where: { userId: testUser.id, endpoint: 'session:check' } })

      await setup.api.ipLogger.logRequest(testUser.id, mockConnection, 'session:check')

      const after = await setup.api.models.request_ip_log.count({ where: { userId: testUser.id, endpoint: 'session:check' } })
      expect(after).toBe(before)
    })

    it('does not create a row when userId is missing', async () => {
      if (!isPg()) return

      const before = await setup.api.models.request_ip_log.count()
      await setup.api.ipLogger.logRequest(null, mockConnection, 'formBirds:list')
      const after = await setup.api.models.request_ip_log.count()

      expect(after).toBe(before)
    })
  })

  describe('middleware preProcessor', () => {
    const runMiddleware = (data) =>
      setup.api.actions.middleware.ipLogger.preProcessor(data)

    const makeData = (overrides = {}) => ({
      session: { userId: testUser.id },
      actionTemplate: { name: 'formBirds:list' },
      connection: mockConnection,
      params: {},
      ...overrides
    })

    it('logs an authenticated request', async () => {
      if (!isPg()) return

      const where = { userId: testUser.id, endpoint: 'formBirds:list' }
      const before = await setup.api.models.request_ip_log.count({ where })

      await runMiddleware(makeData())
      await new Promise(resolve => setTimeout(resolve, 100))

      const after = await setup.api.models.request_ip_log.count({ where })
      expect(after).toBeGreaterThan(before)
    })

    it('does not log when session is missing', async () => {
      if (!isPg()) return

      const where = { userId: testUser.id }
      const before = await setup.api.models.request_ip_log.count({ where })

      await runMiddleware(makeData({ session: null }))
      await new Promise(resolve => setTimeout(resolve, 100))

      const after = await setup.api.models.request_ip_log.count({ where })
      expect(after).toBe(before)
    })

    it('does not log a count query on a form list endpoint', async () => {
      if (!isPg()) return

      const where = { userId: testUser.id, endpoint: 'formBirds:list' }
      const before = await setup.api.models.request_ip_log.count({ where })

      await runMiddleware(makeData({ params: { context: 'count' } }))
      await new Promise(resolve => setTimeout(resolve, 100))

      const after = await setup.api.models.request_ip_log.count({ where })
      expect(after).toBe(before)
    })

    it('does log a count query on a non-form-list endpoint', async () => {
      if (!isPg()) return

      const where = { userId: testUser.id, endpoint: 'user:list' }
      const before = await setup.api.models.request_ip_log.count({ where })

      await runMiddleware(makeData({
        actionTemplate: { name: 'user:list' },
        params: { context: 'count' }
      }))
      await new Promise(resolve => setTimeout(resolve, 100))

      const after = await setup.api.models.request_ip_log.count({ where })
      expect(after).toBeGreaterThan(before)
    })
  })
})
