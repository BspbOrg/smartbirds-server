/* eslint-env node, jest */
/* globals setup */

const userFactory = require('../../__utils__/factories/userFactory')

describe('Action: requestIpLog:list', () => {
  let testUser
  let ipLogs

  beforeAll(async () => {
    // Create test user for IP log records
    testUser = await userFactory(setup.api, { role: 'user', organizationSlug: 'test-org' })

    // Create test IP log records
    ipLogs = await setup.api.models.request_ip_log.bulkCreate([
      {
        userId: testUser.id,
        ipAddress: '192.168.1.1',
        endpoint: 'formBirds:list',
        httpMethod: 'GET',
        occurredAt: new Date('2026-02-10T10:00:00Z'),
        sessionFingerprint: 'fingerprint-abc',
        userAgent: 'Mozilla/5.0'
      },
      {
        userId: testUser.id,
        ipAddress: '192.168.1.2',
        endpoint: 'formBirds:view',
        httpMethod: 'GET',
        occurredAt: new Date('2026-02-10T11:00:00Z'),
        sessionFingerprint: 'fingerprint-def',
        userAgent: 'Chrome/100'
      },
      {
        userId: testUser.id,
        ipAddress: '10.0.0.1',
        endpoint: 'session:create',
        httpMethod: 'POST',
        occurredAt: new Date('2026-02-10T12:00:00Z'),
        sessionFingerprint: 'fingerprint-ghi',
        userAgent: 'Safari/16'
      }
    ])
  })

  describe('Authorization', () => {
    it('allows admin users to access IP logs', async () => {
      const response = await setup.runActionAsAdmin('requestIpLog:list', {})

      expect(response).not.toEqual(expect.objectContaining({ error: expect.anything() }))
      expect(response).toEqual(expect.objectContaining({
        data: expect.any(Array),
        count: expect.any(Number)
      }))
    })

    it('denies non-admin users', async () => {
      const response = await setup.runActionAsUser('requestIpLog:list', {})

      expect(response).toEqual(expect.objectContaining({
        error: expect.stringMatching(/Admin required/)
      }))
    })

    it('denies birds moderator', async () => {
      const response = await setup.runActionAsBirds('requestIpLog:list', {})

      expect(response).toEqual(expect.objectContaining({
        error: expect.stringMatching(/Admin required/)
      }))
    })

    it('denies guest users', async () => {
      const response = await setup.runActionAsGuest('requestIpLog:list', {})

      expect(response.error).toMatch(/Please log in to continue/)
    })
  })

  describe('Pagination', () => {
    it('returns records with count', async () => {
      const response = await setup.runActionAsAdmin('requestIpLog:list', {})

      expect(response).not.toEqual(expect.objectContaining({ error: expect.anything() }))
      expect(response).toEqual(expect.objectContaining({
        data: expect.any(Array),
        count: expect.any(Number)
      }))
      expect(response.count).toBeGreaterThanOrEqual(ipLogs.length)
    })

    it('respects limit parameter', async () => {
      const response = await setup.runActionAsAdmin('requestIpLog:list', { limit: 2 })

      expect(response).not.toEqual(expect.objectContaining({ error: expect.anything() }))
      expect(response.data.length).toBeLessThanOrEqual(2)
    })

    it('respects offset parameter', async () => {
      const response1 = await setup.runActionAsAdmin('requestIpLog:list', { limit: 1, offset: 0 })
      const response2 = await setup.runActionAsAdmin('requestIpLog:list', { limit: 1, offset: 1 })

      expect(response1).not.toEqual(expect.objectContaining({ error: expect.anything() }))
      expect(response2).not.toEqual(expect.objectContaining({ error: expect.anything() }))

      if (response1.data.length > 0 && response2.data.length > 0) {
        expect(response1.data[0].id).not.toBe(response2.data[0].id)
      }
    })
  })

  describe('Filtering', () => {
    it('filters by userId', async () => {
      const response = await setup.runActionAsAdmin('requestIpLog:list', { userId: testUser.id })

      expect(response).not.toEqual(expect.objectContaining({ error: expect.anything() }))
      expect(response.data.length).toBeGreaterThan(0)
      response.data.forEach(row => {
        expect(row.userId).toBe(testUser.id)
      })
    })

    it('filters by ipAddress', async () => {
      const response = await setup.runActionAsAdmin('requestIpLog:list', { ipAddress: '192.168.1.1' })

      expect(response).not.toEqual(expect.objectContaining({ error: expect.anything() }))
      expect(response.data.length).toBeGreaterThan(0)
      response.data.forEach(row => {
        expect(row.ipAddress).toBe('192.168.1.1')
      })
    })

    it('filters by date range', async () => {
      const response = await setup.runActionAsAdmin('requestIpLog:list', {
        fromDate: '2026-02-10T10:30:00Z',
        toDate: '2026-02-10T12:30:00Z'
      })

      expect(response).not.toEqual(expect.objectContaining({ error: expect.anything() }))
      response.data.forEach(row => {
        const date = new Date(row.occurredAt)
        expect(date.getTime()).toBeGreaterThanOrEqual(new Date('2026-02-10T10:30:00Z').getTime())
        expect(date.getTime()).toBeLessThanOrEqual(new Date('2026-02-10T12:30:00Z').getTime())
      })
    })
  })

  describe('Data Fields', () => {
    it('includes all required IP log fields', async () => {
      const response = await setup.runActionAsAdmin('requestIpLog:list', { userId: testUser.id, limit: 1 })

      expect(response).not.toEqual(expect.objectContaining({ error: expect.anything() }))
      expect(response.data.length).toBeGreaterThan(0)

      const record = response.data[0]
      expect(record).toMatchObject({
        id: expect.any(String),
        userId: testUser.id,
        ipAddress: expect.any(String),
        endpoint: expect.any(String),
        httpMethod: expect.any(String)
      })
      expect(record.occurredAt).toBeDefined()
    })
  })

  describe('Sorting', () => {
    it('sorts by occurredAt DESC by default', async () => {
      const response = await setup.runActionAsAdmin('requestIpLog:list', {
        userId: testUser.id,
        limit: 10
      })

      expect(response).not.toEqual(expect.objectContaining({ error: expect.anything() }))
      expect(response.data.length).toBeGreaterThan(1)

      for (let i = 1; i < response.data.length; i++) {
        const prevDate = new Date(response.data[i - 1].occurredAt)
        const currDate = new Date(response.data[i].occurredAt)
        expect(prevDate.getTime()).toBeGreaterThanOrEqual(currDate.getTime())
      }
    })
  })
})
