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
      remoteIP: '10.0.0.1', // Cloudflare proxy IP
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
      expect(row.ipAddress).toBe('10.0.0.1')
      expect(row.sessionFingerprint).toBe('test-fingerprint-abc')
      expect(row.httpMethod).toBe('GET')
      expect(row.userAgent).toBe('TestAgent/1.0')
    })

    it('extracts real client IP from CF-Connecting-IP header', async () => {
      if (!isPg()) return

      const connectionWithCloudflare = {
        ...mockConnection,
        rawConnection: {
          req: {
            method: 'POST',
            headers: {
              'user-agent': 'Mozilla/5.0',
              'cf-connecting-ip': '203.0.113.45'
            }
          }
        }
      }

      await setup.api.ipLogger.logRequest(testUser.id, connectionWithCloudflare, 'formBirds:create')

      const row = await setup.api.models.request_ip_log.findOne({
        where: { userId: testUser.id, endpoint: 'formBirds:create' },
        order: [['occurredAt', 'DESC']]
      })

      expect(row).toBeDefined()
      expect(row.ipAddress).toBe('203.0.113.45')
    })

    it('extracts real client IP from X-Real-IP header', async () => {
      if (!isPg()) return

      const connectionWithRealIP = {
        ...mockConnection,
        rawConnection: {
          req: {
            method: 'POST',
            headers: {
              'user-agent': 'Mozilla/5.0',
              'x-real-ip': '198.51.100.22'
            }
          }
        }
      }

      await setup.api.ipLogger.logRequest(testUser.id, connectionWithRealIP, 'formMammals:list')

      const row = await setup.api.models.request_ip_log.findOne({
        where: { userId: testUser.id, endpoint: 'formMammals:list' },
        order: [['occurredAt', 'DESC']]
      })

      expect(row).toBeDefined()
      expect(row.ipAddress).toBe('198.51.100.22')
    })

    it('extracts real client IP from X-Forwarded-For header', async () => {
      if (!isPg()) return

      const connectionWithForwardedFor = {
        ...mockConnection,
        rawConnection: {
          req: {
            method: 'POST',
            headers: {
              'user-agent': 'Mozilla/5.0',
              'x-forwarded-for': '192.0.2.1, 198.51.100.2, 203.0.113.3'
            }
          }
        }
      }

      await setup.api.ipLogger.logRequest(testUser.id, connectionWithForwardedFor, 'formHerptiles:view')

      const row = await setup.api.models.request_ip_log.findOne({
        where: { userId: testUser.id, endpoint: 'formHerptiles:view' },
        order: [['occurredAt', 'DESC']]
      })

      expect(row).toBeDefined()
      expect(row.ipAddress).toBe('192.0.2.1') // First IP in chain
    })

    it('prioritizes CF-Connecting-IP over other headers', async () => {
      if (!isPg()) return

      const connectionWithMultipleHeaders = {
        ...mockConnection,
        rawConnection: {
          req: {
            method: 'POST',
            headers: {
              'user-agent': 'Mozilla/5.0',
              'cf-connecting-ip': '203.0.113.100',
              'x-real-ip': '198.51.100.99',
              'x-forwarded-for': '192.0.2.99'
            }
          }
        }
      }

      await setup.api.ipLogger.logRequest(testUser.id, connectionWithMultipleHeaders, 'formPlants:list')

      const row = await setup.api.models.request_ip_log.findOne({
        where: { userId: testUser.id, endpoint: 'formPlants:list' },
        order: [['occurredAt', 'DESC']]
      })

      expect(row).toBeDefined()
      expect(row.ipAddress).toBe('203.0.113.100') // CF header wins
    })

    it('falls back to connection.remoteIP when no proxy headers present', async () => {
      if (!isPg()) return

      await setup.api.ipLogger.logRequest(testUser.id, mockConnection, 'formBirds:update')

      const row = await setup.api.models.request_ip_log.findOne({
        where: { userId: testUser.id, endpoint: 'formBirds:update' },
        order: [['occurredAt', 'DESC']]
      })

      expect(row).toBeDefined()
      expect(row.ipAddress).toBe('10.0.0.1') // Falls back to remoteIP
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
