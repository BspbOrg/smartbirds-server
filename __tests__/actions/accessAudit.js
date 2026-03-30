/* eslint-env node, jest */
/* globals setup */

const userFactory = require('../../__utils__/factories/userFactory')

describe('Action: accessAudit:list', () => {
  let testUser
  let auditRecords

  beforeAll(async () => {
    // Create test user for audit records
    testUser = await userFactory(setup.api, { role: 'user', organizationSlug: 'test-org' })

    // Create test audit records with valid UUID v7 operationIds
    auditRecords = await setup.api.models.access_audit.bulkCreate([
      {
        recordType: 'formBirds',
        recordId: 1001,
        actorUserId: testUser.id,
        action: 'VIEW',
        occurredAt: new Date('2026-01-10T10:00:00Z'),
        ownerUserId: testUser.id + 1,
        actorRole: 'user',
        actorOrganization: 'test-org',
        operationId: '01936d8f-7c4a-7b32-9c5e-1a2b3c4d5e6f' // Valid UUID v7
      },
      {
        recordType: 'formMammals',
        recordId: 1002,
        actorUserId: testUser.id,
        action: 'EDIT',
        occurredAt: new Date('2026-01-12T11:00:00Z'),
        ownerUserId: testUser.id + 1,
        actorRole: 'user',
        actorOrganization: 'test-org'
      },
      {
        recordType: 'formBirds',
        recordId: 1003,
        actorUserId: testUser.id,
        action: 'DELETE',
        occurredAt: new Date('2026-01-15T12:00:00Z'),
        ownerUserId: testUser.id + 1,
        actorRole: 'user',
        actorOrganization: 'test-org',
        operationId: '01936d90-1234-7abc-8def-0123456789ab' // Valid UUID v7
      },
      {
        recordType: 'formBirds',
        recordId: 1004,
        actorUserId: testUser.id,
        action: 'LIST',
        occurredAt: new Date('2026-01-17T13:00:00Z'),
        ownerUserId: testUser.id + 1,
        actorRole: 'user',
        actorOrganization: 'test-org',
        operationId: '01936d91-5678-7def-9abc-fedcba987654' // Valid UUID v7
      },
      {
        recordType: 'formBirds',
        recordId: 1005,
        actorUserId: testUser.id,
        action: 'EXPORT',
        occurredAt: new Date('2026-01-18T14:00:00Z'),
        ownerUserId: testUser.id + 1,
        actorRole: 'user',
        actorOrganization: 'test-org',
        operationId: '01936d91-5678-7def-9abc-fedcba987654' // Same UUID v7 as LIST (same operation)
      }
    ])
  })

  describe('Authorization', () => {
    it('allows admin users to access audit logs', async () => {
      const response = await setup.runActionAsAdmin('accessAudit:list', {})

      expect(response).not.toEqual(expect.objectContaining({ error: expect.anything() }))
      expect(response).toEqual(expect.objectContaining({
        data: expect.any(Array),
        count: expect.any(Number)
      }))
    })

    it('denies non-admin users', async () => {
      const response = await setup.runActionAsUser('accessAudit:list', {})

      expect(response).toEqual(expect.objectContaining({
        error: expect.stringMatching(/Admin required/)
      }))
    })

    it('denies birds moderator', async () => {
      const response = await setup.runActionAsBirds('accessAudit:list', {})

      expect(response).toEqual(expect.objectContaining({
        error: expect.stringMatching(/Admin required/)
      }))
    })

    it('denies guest users', async () => {
      const response = await setup.runActionAsGuest('accessAudit:list', {})

      expect(response.error).toMatch(/Please log in to continue/)
    })
  })

  describe('Pagination', () => {
    it('returns records with count', async () => {
      const response = await setup.runActionAsAdmin('accessAudit:list', {})

      expect(response).not.toEqual(expect.objectContaining({ error: expect.anything() }))
      expect(response).toEqual(expect.objectContaining({
        data: expect.any(Array),
        count: expect.any(Number)
      }))
      expect(response.count).toBeGreaterThanOrEqual(auditRecords.length)
    })

    it('respects limit parameter', async () => {
      const response = await setup.runActionAsAdmin('accessAudit:list', { limit: 2 })

      expect(response).not.toEqual(expect.objectContaining({ error: expect.anything() }))
      expect(response.data.length).toBeLessThanOrEqual(2)
    })

    it('respects offset parameter', async () => {
      const response1 = await setup.runActionAsAdmin('accessAudit:list', { limit: 1, offset: 0 })
      const response2 = await setup.runActionAsAdmin('accessAudit:list', { limit: 1, offset: 1 })

      expect(response1).not.toEqual(expect.objectContaining({ error: expect.anything() }))
      expect(response2).not.toEqual(expect.objectContaining({ error: expect.anything() }))

      if (response1.data.length > 0 && response2.data.length > 0) {
        expect(response1.data[0].id).not.toBe(response2.data[0].id)
      }
    })
  })

  describe('Filtering', () => {
    it('filters by actorUserId', async () => {
      const response = await setup.runActionAsAdmin('accessAudit:list', { actorUserId: testUser.id })

      expect(response).not.toEqual(expect.objectContaining({ error: expect.anything() }))
      expect(response.data.length).toBeGreaterThan(0)
      response.data.forEach(row => {
        expect(row.actorUserId).toBe(testUser.id)
      })
    })

    it('filters by ownerUserId', async () => {
      const ownerUserId = testUser.id + 1
      const response = await setup.runActionAsAdmin('accessAudit:list', { ownerUserId })

      expect(response).not.toEqual(expect.objectContaining({ error: expect.anything() }))
      response.data.forEach(row => {
        expect(row.ownerUserId).toBe(ownerUserId)
      })
    })

    it('filters by recordType', async () => {
      const response = await setup.runActionAsAdmin('accessAudit:list', { recordType: 'formBirds' })

      expect(response).not.toEqual(expect.objectContaining({ error: expect.anything() }))
      expect(response.data.length).toBeGreaterThan(0)
      response.data.forEach(row => {
        expect(row.recordType).toBe('formBirds')
      })
    })

    it('filters by userAction', async () => {
      const response = await setup.runActionAsAdmin('accessAudit:list', { userAction: 'VIEW' })

      expect(response).not.toEqual(expect.objectContaining({ error: expect.anything() }))
      expect(response.data.length).toBeGreaterThan(0)
      response.data.forEach(row => {
        expect(row.action).toBe('VIEW')
      })
    })

    it('filters by operationId', async () => {
      const response = await setup.runActionAsAdmin('accessAudit:list', { operationId: '01936d8f-7c4a-7b32-9c5e-1a2b3c4d5e6f' })

      expect(response).not.toEqual(expect.objectContaining({ error: expect.anything() }))
      expect(response.data.length).toBeGreaterThan(0)
      response.data.forEach(row => {
        expect(row.operationId).toBe('01936d8f-7c4a-7b32-9c5e-1a2b3c4d5e6f')
      })
    })

    it('filters by date range', async () => {
      const response = await setup.runActionAsAdmin('accessAudit:list', {
        fromDate: '2026-01-12T00:00:00Z',
        toDate: '2026-01-15T23:59:59Z'
      })

      expect(response).not.toEqual(expect.objectContaining({ error: expect.anything() }))
      response.data.forEach(row => {
        const date = new Date(row.occurredAt)
        expect(date.getTime()).toBeGreaterThanOrEqual(new Date('2026-01-12T00:00:00Z').getTime())
        expect(date.getTime()).toBeLessThanOrEqual(new Date('2026-01-15T23:59:59Z').getTime())
      })
    })
  })

  describe('Data Fields', () => {
    it('includes all required audit fields', async () => {
      const response = await setup.runActionAsAdmin('accessAudit:list', { actorUserId: testUser.id, limit: 1 })

      expect(response).not.toEqual(expect.objectContaining({ error: expect.anything() }))
      expect(response.data.length).toBeGreaterThan(0)

      const record = response.data[0]
      expect(record).toMatchObject({
        id: expect.any(Number),
        recordType: expect.any(String),
        recordId: expect.any(Number),
        action: expect.any(String),
        actorUserId: testUser.id,
        ownerUserId: expect.any(Number),
        actorRole: expect.any(String),
        actorOrganization: expect.any(String)
      })
      expect(record.occurredAt).toBeDefined()
    })

    it('tracks cross-user access correctly', async () => {
      const response = await setup.runActionAsAdmin('accessAudit:list', {
        actorUserId: testUser.id,
        limit: 10
      })

      expect(response).not.toEqual(expect.objectContaining({ error: expect.anything() }))
      expect(response.data.length).toBeGreaterThan(0)

      // All records should have ownerUserId (cross-user access tracking)
      response.data.forEach(row => {
        expect(row.ownerUserId).toBeDefined()
        expect(row.ownerUserId).not.toBe(row.actorUserId)
      })
    })
  })

  describe('Sorting', () => {
    it('sorts by occurredAt DESC by default', async () => {
      const response = await setup.runActionAsAdmin('accessAudit:list', {
        actorUserId: testUser.id,
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

    it('respects sortOrder ASC parameter', async () => {
      const response = await setup.runActionAsAdmin('accessAudit:list', {
        actorUserId: testUser.id,
        sortBy: 'occurredAt',
        sortOrder: 'ASC',
        limit: 10
      })

      expect(response).not.toEqual(expect.objectContaining({ error: expect.anything() }))
      expect(response.data.length).toBeGreaterThan(1)

      for (let i = 1; i < response.data.length; i++) {
        const prevDate = new Date(response.data[i - 1].occurredAt)
        const currDate = new Date(response.data[i].occurredAt)
        expect(prevDate.getTime()).toBeLessThanOrEqual(currDate.getTime())
      }
    })
  })

  describe('Input Validation', () => {
    it('defaults to safe sortBy when invalid field provided', async () => {
      const response = await setup.runActionAsAdmin('accessAudit:list', {
        sortBy: 'maliciousField; DROP TABLE access_audit;'
      })

      // Should not error, should default to occurredAt
      expect(response).not.toEqual(expect.objectContaining({ error: expect.anything() }))
      expect(response.data).toBeDefined()
    })

    it('rejects invalid fromDate format', async () => {
      const response = await setup.runActionAsAdmin('accessAudit:list', {
        fromDate: 'not-a-date'
      })

      expect(response.error).toMatch(/Invalid fromDate format/)
    })

    it('rejects invalid toDate format', async () => {
      const response = await setup.runActionAsAdmin('accessAudit:list', {
        toDate: 'invalid-date-string'
      })

      expect(response.error).toMatch(/Invalid toDate format/)
    })

    it('rejects invalid actorUserId', async () => {
      const response = await setup.runActionAsAdmin('accessAudit:list', {
        actorUserId: 'abc'
      })

      expect(response.error).toMatch(/must be a valid positive integer/)
    })

    it('rejects invalid ownerUserId', async () => {
      const response = await setup.runActionAsAdmin('accessAudit:list', {
        ownerUserId: 'not-a-number'
      })

      expect(response.error).toMatch(/must be a valid positive integer/)
    })

    it('rejects invalid recordId', async () => {
      const response = await setup.runActionAsAdmin('accessAudit:list', {
        recordId: '-123'
      })

      expect(response.error).toMatch(/must be a valid positive integer/)
    })

    it('rejects invalid recordType', async () => {
      const response = await setup.runActionAsAdmin('accessAudit:list', {
        recordType: 'formInvalid'
      })

      expect(response.error).toMatch(/Invalid recordType/)
    })

    it('rejects invalid userAction', async () => {
      const response = await setup.runActionAsAdmin('accessAudit:list', {
        userAction: 'MALICIOUS_ACTION'
      })

      expect(response.error).toMatch(/Invalid userAction/)
    })

    it('enforces maximum limit of 500', async () => {
      const response = await setup.runActionAsAdmin('accessAudit:list', {
        limit: 9999
      })

      expect(response).not.toEqual(expect.objectContaining({ error: expect.anything() }))
      expect(response.data.length).toBeLessThanOrEqual(500)
    })

    it('filters by recordId', async () => {
      const response = await setup.runActionAsAdmin('accessAudit:list', {
        recordId: 1001
      })

      expect(response).not.toEqual(expect.objectContaining({ error: expect.anything() }))
      if (response.data.length > 0) {
        response.data.forEach(row => {
          expect(row.recordId).toBe(1001)
        })
      }
    })

    it('handles toDate as inclusive of entire day', async () => {
      const response = await setup.runActionAsAdmin('accessAudit:list', {
        toDate: '2026-01-15'
      })

      expect(response).not.toEqual(expect.objectContaining({ error: expect.anything() }))
      // Should include records from entire day of 2026-01-15
      const hasRecordFromThatDay = response.data.some(row => {
        const date = new Date(row.occurredAt)
        return date >= new Date('2026-01-15T00:00:00Z') &&
               date < new Date('2026-01-16T00:00:00Z')
      })
      expect(hasRecordFromThatDay).toBe(true)
    })

    it('rejects SQL injection attempts in operationId', async () => {
      const sqlInjectionAttempts = [
        '\'; DROP TABLE access_audit; --',
        '1\' OR \'1\'=\'1',
        'admin\'--',
        'not-a-uuid'
      ]

      for (const malicious of sqlInjectionAttempts) {
        const response = await setup.runActionAsAdmin('accessAudit:list', {
          operationId: malicious
        })

        expect(response.error).toMatch(/operationId must be a valid UUID v7 format/)
      }
    })
  })
})

describe('Action: accessAudit:summary', () => {
  let summaryUser

  beforeAll(async () => {
    summaryUser = await userFactory(setup.api, { role: 'user', organizationSlug: 'summary-org' })

    await setup.api.models.access_audit.bulkCreate([
      {
        recordType: 'formBirds',
        recordId: 2001,
        actorUserId: summaryUser.id,
        action: 'VIEW',
        occurredAt: new Date('2026-02-15T08:00:00Z'),
        actorRole: 'user',
        actorOrganization: 'summary-org'
      },
      {
        recordType: 'formBirds',
        recordId: 2002,
        actorUserId: summaryUser.id,
        action: 'VIEW',
        occurredAt: new Date('2026-02-15T09:00:00Z'),
        actorRole: 'user',
        actorOrganization: 'summary-org'
      },
      {
        recordType: 'formMammals',
        recordId: 2003,
        actorUserId: summaryUser.id,
        action: 'EDIT',
        occurredAt: new Date('2026-02-15T10:00:00Z'),
        actorRole: 'user',
        actorOrganization: 'summary-org'
      },
      {
        recordType: 'formBirds',
        recordId: 2004,
        actorUserId: summaryUser.id,
        action: 'EXPORT',
        occurredAt: new Date('2026-02-15T11:00:00Z'),
        actorRole: 'user',
        actorOrganization: 'summary-org',
        operationId: '01936d92-aaaa-7bbb-8ccc-ddddeeeeeeee'
      },
      // Record outside of target date - should not be included
      {
        recordType: 'formBirds',
        recordId: 2005,
        actorUserId: summaryUser.id,
        action: 'VIEW',
        occurredAt: new Date('2026-02-16T08:00:00Z'),
        actorRole: 'user',
        actorOrganization: 'summary-org'
      }
    ])
  })

  describe('Authorization', () => {
    it('allows admin users', async () => {
      const response = await setup.runActionAsAdmin('accessAudit:summary', { date: '2026-02-15' })

      expect(response).not.toEqual(expect.objectContaining({ error: expect.anything() }))
    })

    it('denies non-admin users', async () => {
      const response = await setup.runActionAsUser('accessAudit:summary', { date: '2026-02-15' })

      expect(response).toEqual(expect.objectContaining({
        error: expect.stringMatching(/Admin required/)
      }))
    })

    it('denies guest users', async () => {
      const response = await setup.runActionAsGuest('accessAudit:summary', { date: '2026-02-15' })

      expect(response.error).toMatch(/Please log in to continue/)
    })
  })

  describe('Response shape', () => {
    it('returns date and data array', async () => {
      const response = await setup.runActionAsAdmin('accessAudit:summary', { date: '2026-02-15' })

      expect(response).not.toEqual(expect.objectContaining({ error: expect.anything() }))
      expect(response.date).toBe('2026-02-15')
      expect(Array.isArray(response.data)).toBe(true)
    })

    it('returns correct count fields for the test user', async () => {
      const response = await setup.runActionAsAdmin('accessAudit:summary', { date: '2026-02-15' })

      expect(response).not.toEqual(expect.objectContaining({ error: expect.anything() }))

      const userRow = response.data.find(row => row.actorUserId === summaryUser.id)
      expect(userRow).toBeDefined()
      expect(userRow.viewCount).toBe(2)
      expect(userRow.editCount).toBe(1)
      expect(userRow.exportCount).toBe(1)
      expect(userRow.deleteCount).toBe(0)
      expect(userRow.listCount).toBe(0)
      expect(userRow.totalCount).toBe(4)
    })

    it('excludes records from other dates', async () => {
      // Records on 2026-02-16 should not appear in the 2026-02-15 summary
      const response = await setup.runActionAsAdmin('accessAudit:summary', { date: '2026-02-15' })

      expect(response).not.toEqual(expect.objectContaining({ error: expect.anything() }))

      const userRow = response.data.find(row => row.actorUserId === summaryUser.id)
      expect(userRow.totalCount).toBe(4) // Not 5
    })

    it('returns empty data for a date with no records', async () => {
      const response = await setup.runActionAsAdmin('accessAudit:summary', { date: '2020-01-01' })

      expect(response).not.toEqual(expect.objectContaining({ error: expect.anything() }))
      expect(response.data).toEqual([])
    })
  })

  describe('Filtering', () => {
    it('filters by actorUserId', async () => {
      const response = await setup.runActionAsAdmin('accessAudit:summary', {
        date: '2026-02-15',
        actorUserId: summaryUser.id
      })

      expect(response).not.toEqual(expect.objectContaining({ error: expect.anything() }))
      expect(response.data.length).toBe(1)
      expect(response.data[0].actorUserId).toBe(summaryUser.id)
    })
  })

  describe('Input Validation', () => {
    it('requires date parameter', async () => {
      const response = await setup.runActionAsAdmin('accessAudit:summary', {})

      expect(response.error).toBeDefined()
    })

    it('rejects invalid date format', async () => {
      const response = await setup.runActionAsAdmin('accessAudit:summary', { date: 'not-a-date' })

      expect(response.error).toMatch(/Invalid date format/)
    })

    it('rejects invalid actorUserId', async () => {
      const response = await setup.runActionAsAdmin('accessAudit:summary', {
        date: '2026-02-15',
        actorUserId: 'abc'
      })

      expect(response.error).toMatch(/must be a valid positive integer/)
    })
  })
})
