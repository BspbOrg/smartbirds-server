/* eslint-env node, jest */
/* globals setup */

const userFactory = require('../../__utils__/factories/userFactory')

describe('Model access_audit', () => {
  let user

  beforeAll(async () => {
    user = await userFactory(setup.api, { role: 'user' })
  })

  describe('create', () => {
    it('creates an audit record with all fields', async () => {
      const auditRecord = await setup.api.models.access_audit.create({
        recordType: 'formBirds',
        recordId: 123,
        ownerUserId: user.id,
        actorUserId: 456,
        action: 'VIEW',
        occurredAt: new Date(),
        actorRole: 'moderator',
        actorOrganization: 'test-org',
        meta: JSON.stringify({ context: 'view' })
      })

      expect(auditRecord).toBeTruthy()
      expect(auditRecord.id).toBeTruthy()
      expect(auditRecord.recordType).toBe('formBirds')
      expect(auditRecord.recordId).toBe(123)
      expect(auditRecord.ownerUserId).toBe(user.id)
      expect(auditRecord.actorUserId).toBe(456)
      expect(auditRecord.action).toBe('VIEW')
      expect(auditRecord.occurredAt).toBeTruthy()
      expect(auditRecord.actorRole).toBe('moderator')
      expect(auditRecord.actorOrganization).toBe('test-org')
      expect(auditRecord.meta).toBe('{"context":"view"}')
    })

    it('creates an audit record with minimal required fields', async () => {
      const auditRecord = await setup.api.models.access_audit.create({
        recordType: 'formMammals',
        recordId: 456,
        actorUserId: user.id,
        action: 'EDIT',
        occurredAt: new Date()
      })

      expect(auditRecord).toBeTruthy()
      expect(auditRecord.id).toBeTruthy()
      expect(auditRecord.recordType).toBe('formMammals')
      expect(auditRecord.recordId).toBe(456)
      expect(auditRecord.actorUserId).toBe(user.id)
      expect(auditRecord.action).toBe('EDIT')
      expect(auditRecord.occurredAt).toBeTruthy()
      expect(auditRecord.ownerUserId).toBeNull()
      expect(auditRecord.actorRole).toBeNull()
      expect(auditRecord.actorOrganization).toBeNull()
      expect(auditRecord.meta).toBeNull()
    })
  })

  describe('validation', () => {
    it('fails without recordType', async () => {
      await expect(
        setup.api.models.access_audit.create({
          recordId: 789,
          actorUserId: user.id,
          action: 'DELETE',
          occurredAt: new Date()
        })
      ).rejects.toThrow()
    })

    it('fails without recordId', async () => {
      await expect(
        setup.api.models.access_audit.create({
          recordType: 'formBirds',
          actorUserId: user.id,
          action: 'DELETE',
          occurredAt: new Date()
        })
      ).rejects.toThrow()
    })

    it('fails without actorUserId', async () => {
      await expect(
        setup.api.models.access_audit.create({
          recordType: 'formBirds',
          recordId: 789,
          action: 'DELETE',
          occurredAt: new Date()
        })
      ).rejects.toThrow()
    })

    it('fails without action', async () => {
      await expect(
        setup.api.models.access_audit.create({
          recordType: 'formBirds',
          recordId: 789,
          actorUserId: user.id,
          occurredAt: new Date()
        })
      ).rejects.toThrow()
    })

    it('fails without occurredAt', async () => {
      await expect(
        setup.api.models.access_audit.create({
          recordType: 'formBirds',
          recordId: 789,
          actorUserId: user.id,
          action: 'DELETE'
        })
      ).rejects.toThrow()
    })
  })
})
