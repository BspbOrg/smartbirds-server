/* global describe, it */
const should = require('should')
const { Op } = require('sequelize')
const auditHelpers = require('../../server/helpers/auditHelpers')

describe('auditHelpers', () => {
  describe('validateInteger', () => {
    it('should return null for empty values', () => {
      should(auditHelpers.validateInteger(null, 'test')).equal(null)
      should(auditHelpers.validateInteger(undefined, 'test')).equal(null)
      should(auditHelpers.validateInteger('', 'test')).equal(null)
    })

    it('should parse valid integers', () => {
      auditHelpers.validateInteger(123, 'test').should.equal(123)
      auditHelpers.validateInteger('456', 'test').should.equal(456)
      auditHelpers.validateInteger('789', 'test').should.equal(789)
    })

    it('should throw for invalid integers', () => {
      try {
        auditHelpers.validateInteger(-1, 'test')
        throw new Error('Should have thrown')
      } catch (err) {
        err.message.should.match(/test must be a valid positive integer/)
      }

      try {
        auditHelpers.validateInteger('abc', 'test')
        throw new Error('Should have thrown')
      } catch (err) {
        err.message.should.match(/test must be a valid positive integer/)
      }
    })
  })

  describe('validateUUID', () => {
    it('should return null for empty values', () => {
      should(auditHelpers.validateUUID(null, 'operationId')).equal(null)
      should(auditHelpers.validateUUID(undefined, 'operationId')).equal(null)
      should(auditHelpers.validateUUID('', 'operationId')).equal(null)
    })

    it('should validate UUIDv7 format', () => {
      const validUUIDs = [
        '01234567-89ab-7def-89ab-0123456789ab',
        '01936d8f-7c4a-7b32-9c5e-1a2b3c4d5e6f',
        'FFFFFFFF-FFFF-7FFF-9FFF-FFFFFFFFFFFF'
      ]
      validUUIDs.forEach(uuid => {
        auditHelpers.validateUUID(uuid, 'operationId').should.equal(uuid)
      })
    })

    it('should accept both uppercase and lowercase UUIDs', () => {
      const lowercase = '01234567-89ab-7def-89ab-0123456789ab'
      const uppercase = '01234567-89AB-7DEF-89AB-0123456789AB'
      auditHelpers.validateUUID(lowercase, 'operationId').should.equal(lowercase)
      auditHelpers.validateUUID(uppercase, 'operationId').should.equal(uppercase)
    })

    it('should reject invalid UUIDs', () => {
      const invalidUUIDs = [
        'not-a-uuid',
        '01234567-89ab-4def-89ab-0123456789ab', // v4, not v7
        '01234567-89ab-1def-89ab-0123456789ab', // v1, not v7
        '01234567-89ab-7def-89ab-0123456789', // too short
        '01234567-89ab-7def-89ab-0123456789abcd', // too long
        '01234567_89ab_7def_89ab_0123456789ab', // underscores instead of dashes
        'g1234567-89ab-7def-89ab-0123456789ab' // invalid hex character
      ]

      invalidUUIDs.forEach(uuid => {
        (() => auditHelpers.validateUUID(uuid, 'operationId')).should.throw()
      })
    })

    it('should reject SQL injection attempts', () => {
      const sqlInjectionAttempts = [
        '\'; DROP TABLE access_audit; --',
        '1\' OR \'1\'=\'1',
        'admin\'--',
        '../../../etc/passwd',
        '\' UNION SELECT * FROM users--'
      ]

      sqlInjectionAttempts.forEach(malicious => {
        (() => auditHelpers.validateUUID(malicious, 'operationId')).should.throw()
      })
    })
  })

  describe('validateDate', () => {
    it('should return null for empty values', () => {
      should(auditHelpers.validateDate(null, 'fromDate')).equal(null)
      should(auditHelpers.validateDate(undefined, 'fromDate')).equal(null)
      should(auditHelpers.validateDate('', 'fromDate')).equal(null)
    })

    it('should parse valid ISO dates', () => {
      const testCases = [
        { input: '2026-02-17T10:00:00Z', expected: '2026-02-17T10:00:00.000Z' },
        { input: '2026-01-01T00:00:00Z', expected: '2026-01-01T00:00:00.000Z' },
        { input: '2025-12-31T23:59:59Z', expected: '2025-12-31T23:59:59.000Z' }
      ]

      testCases.forEach(({ input, expected }) => {
        const date = auditHelpers.validateDate(input, 'fromDate')
        date.should.be.instanceOf(Date)
        date.toISOString().should.equal(expected)
      })
    })

    it('should parse various valid date formats', () => {
      const validDates = [
        '2026-02-17',
        '2026-02-17T10:00:00',
        '2026-02-17T10:00:00.000Z',
        '2026-02-17T10:00:00+02:00'
      ]

      validDates.forEach(dateStr => {
        const date = auditHelpers.validateDate(dateStr, 'fromDate')
        date.should.be.instanceOf(Date)
        isNaN(date.getTime()).should.equal(false)
      })
    })

    it('should throw for invalid dates', () => {
      const invalidDates = [
        'invalid-date',
        '2026-13-40', // invalid month/day
        'not a date'
      ]

      invalidDates.forEach(dateStr => {
        try {
          auditHelpers.validateDate(dateStr, 'fromDate')
          throw new Error('Should have thrown')
        } catch (err) {
          err.message.should.match(/Invalid fromDate format/)
        }
      })
    })
  })

  describe('buildDateRangeFilter', () => {
    it('should return null if no dates provided', () => {
      should(auditHelpers.buildDateRangeFilter(null, null)).equal(null)
      should(auditHelpers.buildDateRangeFilter(undefined, undefined)).equal(null)
      should(auditHelpers.buildDateRangeFilter('', '')).equal(null)
    })

    it('should build filter with only fromDate', () => {
      const filter = auditHelpers.buildDateRangeFilter('2026-01-01', null)
      filter[Op.gte].should.be.instanceOf(Date)
      should(filter[Op.lt]).be.undefined()
    })

    it('should build filter with only toDate', () => {
      const filter = auditHelpers.buildDateRangeFilter(null, '2026-01-31')
      should(filter[Op.gte]).be.undefined()
      filter[Op.lt].should.be.instanceOf(Date)
    })

    it('should build range filter with both dates', () => {
      const filter = auditHelpers.buildDateRangeFilter('2026-01-01', '2026-01-31')
      filter[Op.gte].should.be.instanceOf(Date)
      filter[Op.lt].should.be.instanceOf(Date)

      // Verify fromDate is start of day
      filter[Op.gte].toISOString().should.equal('2026-01-01T00:00:00.000Z')

      // Verify toDate is extended by 1 day (to include entire day)
      filter[Op.lt].toISOString().should.equal('2026-02-01T00:00:00.000Z')
    })

    it('should extend toDate by 1 day to include entire day', () => {
      const filter = auditHelpers.buildDateRangeFilter(null, '2026-02-17')
      const expectedNext = new Date('2026-02-18T00:00:00.000Z')
      filter[Op.lt].toISOString().should.equal(expectedNext.toISOString())
    })
  })

  describe('validateEnum', () => {
    const validActions = ['VIEW', 'EDIT', 'DELETE', 'LIST', 'EXPORT']

    it('should return null for empty values', () => {
      should(auditHelpers.validateEnum(null, validActions, 'action')).equal(null)
      should(auditHelpers.validateEnum(undefined, validActions, 'action')).equal(null)
      should(auditHelpers.validateEnum('', validActions, 'action')).equal(null)
    })

    it('should validate against whitelist', () => {
      validActions.forEach(action => {
        auditHelpers.validateEnum(action, validActions, 'action').should.equal(action)
      })
    })

    it('should throw for invalid values', () => {
      const invalidActions = ['HACK', 'DESTROY', 'admin', 'DROP TABLE']

      invalidActions.forEach(action => {
        (() => auditHelpers.validateEnum(action, validActions, 'action')).should.throw()
      })
    })

    it('should be case-sensitive', () => {
      try {
        auditHelpers.validateEnum('view', validActions, 'action')
        throw new Error('Should have thrown')
      } catch (err) {
        err.message.should.match(/Invalid action/)
      }
    })
  })

  describe('validateSort', () => {
    const validFields = ['id', 'occurredAt', 'actorUserId', 'recordType']

    it('should validate valid sort field and order', () => {
      const result = auditHelpers.validateSort('occurredAt', 'DESC', validFields)
      result.sortBy.should.equal('occurredAt')
      result.sortOrder.should.equal('DESC')
    })

    it('should default to first field if sortBy is invalid', () => {
      const result = auditHelpers.validateSort('invalidField', 'ASC', validFields)
      result.sortBy.should.equal('id') // First field in array
      result.sortOrder.should.equal('ASC')
    })

    it('should default to DESC if sortOrder is not ASC', () => {
      auditHelpers.validateSort('id', 'DESC', validFields).sortOrder.should.equal('DESC')
      auditHelpers.validateSort('id', 'invalid', validFields).sortOrder.should.equal('DESC')
      auditHelpers.validateSort('id', '', validFields).sortOrder.should.equal('DESC')
      auditHelpers.validateSort('id', null, validFields).sortOrder.should.equal('DESC')
    })

    it('should accept ASC explicitly', () => {
      const result = auditHelpers.validateSort('id', 'ASC', validFields)
      result.sortOrder.should.equal('ASC')
    })
  })

  describe('validatePagination', () => {
    it('should use defaults for missing values', () => {
      const result = auditHelpers.validatePagination(null, null, 500)
      result.limit.should.equal(50) // Default limit
      result.offset.should.equal(0) // Default offset
    })

    it('should parse valid pagination values', () => {
      const result = auditHelpers.validatePagination(100, 200, 500)
      result.limit.should.equal(100)
      result.offset.should.equal(200)
    })

    it('should enforce max limit', () => {
      const result = auditHelpers.validatePagination(1000, 0, 500)
      result.limit.should.equal(500) // Capped at maxLimit
    })

    it('should enforce min limit of 1', () => {
      const result = auditHelpers.validatePagination(-10, 0, 500)
      result.limit.should.be.above(0)
    })

    it('should enforce min offset of 0', () => {
      const result = auditHelpers.validatePagination(50, -100, 500)
      result.offset.should.equal(0)
    })

    it('should parse string values', () => {
      const result = auditHelpers.validatePagination('75', '150', 500)
      result.limit.should.equal(75)
      result.offset.should.equal(150)
    })

    it('should handle different maxLimit values', () => {
      const result1 = auditHelpers.validatePagination(200, 0, 100)
      result1.limit.should.equal(100)

      const result2 = auditHelpers.validatePagination(200, 0, 1000)
      result2.limit.should.equal(200)
    })
  })
})
