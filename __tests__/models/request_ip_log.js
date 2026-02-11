/* eslint-env node, jest */
/* globals setup */

const userFactory = require('../../__utils__/factories/userFactory')

describe('Model request_ip_log', () => {
  let user

  beforeAll(async () => {
    user = await userFactory(setup.api, { role: 'user' })
  })

  describe('create', () => {
    it('creates an IP log record with all fields', async () => {
      const ipLog = await setup.api.models.request_ip_log.create({
        userId: user.id,
        ipAddress: '192.168.1.1',
        sessionFingerprint: 'fingerprint-abc123',
        endpoint: 'session:create',
        httpMethod: 'POST',
        occurredAt: new Date(),
        userAgent: 'Mozilla/5.0 (X11; Linux x86_64)'
      })

      expect(ipLog).toBeTruthy()
      expect(ipLog.id).toBeTruthy()
      expect(ipLog.userId).toBe(user.id)
      expect(ipLog.ipAddress).toBe('192.168.1.1')
      expect(ipLog.sessionFingerprint).toBe('fingerprint-abc123')
      expect(ipLog.endpoint).toBe('session:create')
      expect(ipLog.httpMethod).toBe('POST')
      expect(ipLog.occurredAt).toBeTruthy()
      expect(ipLog.userAgent).toBe('Mozilla/5.0 (X11; Linux x86_64)')
    })

    it('creates an IP log record with minimal required fields', async () => {
      const ipLog = await setup.api.models.request_ip_log.create({
        userId: user.id,
        ipAddress: '10.0.0.1',
        occurredAt: new Date()
      })

      expect(ipLog).toBeTruthy()
      expect(ipLog.id).toBeTruthy()
      expect(ipLog.userId).toBe(user.id)
      expect(ipLog.ipAddress).toBe('10.0.0.1')
      expect(ipLog.occurredAt).toBeTruthy()
      expect(ipLog.sessionFingerprint).toBeNull()
      expect(ipLog.endpoint).toBeNull()
      expect(ipLog.httpMethod).toBeNull()
      expect(ipLog.userAgent).toBeNull()
    })

    it('accepts IPv6 addresses', async () => {
      const ipLog = await setup.api.models.request_ip_log.create({
        userId: user.id,
        ipAddress: '2001:0db8:85a3::8a2e:0370:7334',
        occurredAt: new Date()
      })

      expect(ipLog).toBeTruthy()
      expect(ipLog.ipAddress).toBe('2001:db8:85a3::8a2e:370:7334') // PostgreSQL normalizes IPv6
    })

    it('rejects invalid IP addresses', async () => {
      await expect(
        setup.api.models.request_ip_log.create({
          userId: user.id,
          ipAddress: '999.999.999.999', // Invalid IP
          occurredAt: new Date()
        })
      ).rejects.toThrow()
    })

    it('rejects non-IP strings', async () => {
      await expect(
        setup.api.models.request_ip_log.create({
          userId: user.id,
          ipAddress: 'not-an-ip-address',
          occurredAt: new Date()
        })
      ).rejects.toThrow()
    })
  })

  describe('validation', () => {
    it('fails without userId', async () => {
      await expect(
        setup.api.models.request_ip_log.create({
          ipAddress: '192.168.1.1',
          occurredAt: new Date()
        })
      ).rejects.toThrow()
    })

    it('fails without ipAddress', async () => {
      await expect(
        setup.api.models.request_ip_log.create({
          userId: user.id,
          occurredAt: new Date()
        })
      ).rejects.toThrow()
    })

    it('fails without occurredAt', async () => {
      await expect(
        setup.api.models.request_ip_log.create({
          userId: user.id,
          ipAddress: '192.168.1.1'
        })
      ).rejects.toThrow()
    })
  })

  describe('querying', () => {
    beforeAll(async () => {
      // Create test data
      await setup.api.models.request_ip_log.bulkCreate([
        {
          userId: user.id,
          ipAddress: '192.168.1.100',
          endpoint: 'formBirds:list',
          occurredAt: new Date('2026-02-11T10:00:00Z')
        },
        {
          userId: user.id,
          ipAddress: '192.168.1.101',
          endpoint: 'formBirds:view',
          occurredAt: new Date('2026-02-11T11:00:00Z')
        },
        {
          userId: user.id,
          ipAddress: '192.168.1.100',
          endpoint: 'formBirds:create',
          occurredAt: new Date('2026-02-11T12:00:00Z')
        }
      ])
    })

    it('can query by userId', async () => {
      const logs = await setup.api.models.request_ip_log.findAll({
        where: { userId: user.id },
        order: [['occurredAt', 'DESC']]
      })

      expect(logs.length).toBeGreaterThanOrEqual(3)
    })

    it('can query by ipAddress', async () => {
      const logs = await setup.api.models.request_ip_log.findAll({
        where: { ipAddress: '192.168.1.100' }
      })

      expect(logs.length).toBeGreaterThanOrEqual(2)
      logs.forEach(log => {
        expect(log.ipAddress).toBe('192.168.1.100')
      })
    })
  })
})
