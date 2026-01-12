/* eslint-env node, jest */
/* globals setup */

const userFactory = require('../../__utils__/factories/userFactory')

describe('Initializer audit', () => {
  let actor
  let owner

  beforeAll(async () => {
    actor = await userFactory(setup.api, { role: 'moderator', organizationSlug: 'test-org' })
    owner = await userFactory(setup.api, { role: 'user' })
  })

  describe('api.audit.actions', () => {
    it('defines action constants', () => {
      expect(setup.api.audit.actions).toEqual({
        view: 'VIEW',
        edit: 'EDIT',
        delete: 'DELETE',
        export: 'EXPORT',
        list: 'LIST'
      })
    })
  })

  describe('api.audit.logAccess', () => {
    it('creates audit record when owner differs from actor', async () => {
      const recordsBefore = await setup.api.models.access_audit.findAll({
        where: { actorUserId: actor.id }
      })
      const countBefore = recordsBefore.length

      await setup.api.audit.logAccess({
        action: setup.api.audit.actions.view,
        recordType: 'formBirds',
        recordId: 123,
        ownerUserId: owner.id,
        actorUserId: actor.id,
        actorRole: actor.role,
        actorOrganization: actor.organizationSlug,
        meta: JSON.stringify({ context: 'view' })
      })

      const recordsAfter = await setup.api.models.access_audit.findAll({
        where: { actorUserId: actor.id }
      })

      expect(recordsAfter.length).toBe(countBefore + 1)
      const newRecord = recordsAfter[recordsAfter.length - 1]
      expect(newRecord.recordType).toBe('formBirds')
      expect(newRecord.recordId).toBe(123)
      expect(newRecord.ownerUserId).toBe(owner.id)
      expect(newRecord.actorUserId).toBe(actor.id)
      expect(newRecord.action).toBe('VIEW')
      expect(newRecord.actorRole).toBe('moderator')
      expect(newRecord.actorOrganization).toBe('test-org')
      expect(newRecord.meta).toBe('{"context":"view"}')
    })

    it('does not create audit record when owner equals actor', async () => {
      const countBefore = await setup.api.models.access_audit.count({
        where: { actorUserId: actor.id, recordId: 456 }
      })

      await setup.api.audit.logAccess({
        action: setup.api.audit.actions.edit,
        recordType: 'formBirds',
        recordId: 456,
        ownerUserId: actor.id,
        actorUserId: actor.id,
        actorRole: actor.role,
        actorOrganization: actor.organizationSlug
      })

      const countAfter = await setup.api.models.access_audit.count({
        where: { actorUserId: actor.id, recordId: 456 }
      })

      expect(countAfter).toBe(countBefore)
    })

    it('handles null ownerUserId', async () => {
      const countBefore = await setup.api.models.access_audit.count({
        where: { actorUserId: actor.id, recordId: 789 }
      })

      await setup.api.audit.logAccess({
        action: setup.api.audit.actions.view,
        recordType: 'formBirds',
        recordId: 789,
        ownerUserId: null,
        actorUserId: actor.id,
        actorRole: actor.role,
        actorOrganization: actor.organizationSlug
      })

      const countAfter = await setup.api.models.access_audit.count({
        where: { actorUserId: actor.id, recordId: 789 }
      })

      expect(countAfter).toBe(countBefore)
    })

    it('handles undefined meta', async () => {
      const countBefore = await setup.api.models.access_audit.count({
        where: { actorUserId: actor.id, recordId: 999 }
      })

      await setup.api.audit.logAccess({
        action: setup.api.audit.actions.delete,
        recordType: 'formBirds',
        recordId: 999,
        ownerUserId: owner.id,
        actorUserId: actor.id,
        actorRole: actor.role,
        actorOrganization: actor.organizationSlug
      })

      const countAfter = await setup.api.models.access_audit.count({
        where: { actorUserId: actor.id, recordId: 999 }
      })

      expect(countAfter).toBe(countBefore + 1)

      const record = await setup.api.models.access_audit.findOne({
        where: { actorUserId: actor.id, recordId: 999 },
        order: [['occurredAt', 'DESC']]
      })

      expect(record).toBeTruthy()
      expect(record.meta).toBeNull()
    })
  })

  describe('api.audit.logAccessBulk', () => {
    it('creates multiple audit records when owners differ from actor', async () => {
      const owner2 = await userFactory(setup.api, { role: 'user' })
      const countBefore = await setup.api.models.access_audit.count({
        where: { actorUserId: actor.id }
      })

      await setup.api.audit.logAccessBulk({
        action: setup.api.audit.actions.list,
        recordType: 'formBirds',
        recordIds: [1001, 1002, 1003],
        ownerUserIds: [owner.id, owner2.id, owner.id],
        actorUserId: actor.id,
        actorRole: actor.role,
        actorOrganization: actor.organizationSlug,
        meta: JSON.stringify({ context: 'list' })
      })

      const countAfter = await setup.api.models.access_audit.count({
        where: { actorUserId: actor.id }
      })

      expect(countAfter).toBe(countBefore + 3)

      const records = await setup.api.models.access_audit.findAll({
        where: {
          actorUserId: actor.id,
          recordId: [1001, 1002, 1003]
        },
        order: [['recordId', 'ASC']]
      })

      expect(records).toHaveLength(3)
      expect(records[0].recordId).toBe(1001)
      expect(records[0].ownerUserId).toBe(owner.id)
      expect(records[1].recordId).toBe(1002)
      expect(records[1].ownerUserId).toBe(owner2.id)
      expect(records[2].recordId).toBe(1003)
      expect(records[2].ownerUserId).toBe(owner.id)
      expect(records.every(r => r.action === 'LIST')).toBe(true)
      expect(records.every(r => r.meta === '{"context":"list"}')).toBe(true)
    })

    it('skips records where owner equals actor', async () => {
      const countBefore = await setup.api.models.access_audit.count({
        where: { actorUserId: actor.id }
      })

      await setup.api.audit.logAccessBulk({
        action: setup.api.audit.actions.list,
        recordType: 'formBirds',
        recordIds: [2001, 2002, 2003],
        ownerUserIds: [owner.id, actor.id, owner.id],
        actorUserId: actor.id,
        actorRole: actor.role,
        actorOrganization: actor.organizationSlug
      })

      const countAfter = await setup.api.models.access_audit.count({
        where: { actorUserId: actor.id }
      })

      // Only 2 records should be created (skipping the one where owner === actor)
      expect(countAfter).toBe(countBefore + 2)

      const records = await setup.api.models.access_audit.findAll({
        where: {
          actorUserId: actor.id,
          recordId: [2001, 2002, 2003]
        },
        order: [['recordId', 'ASC']]
      })

      expect(records).toHaveLength(2)
      expect(records[0].recordId).toBe(2001)
      expect(records[1].recordId).toBe(2003)
      // Record 2002 should not be audited
      expect(records.find(r => r.recordId === 2002)).toBeUndefined()
    })

    it('handles large number of records with chunking', async () => {
      const recordIds = []
      const ownerUserIds = []

      // Create more records than the chunk size (default 10000)
      for (let i = 0; i < 15000; i++) {
        recordIds.push(3000 + i)
        ownerUserIds.push(owner.id)
      }

      const countBefore = await setup.api.models.access_audit.count({
        where: { actorUserId: actor.id }
      })

      await setup.api.audit.logAccessBulk({
        action: setup.api.audit.actions.export,
        recordType: 'formBirds',
        recordIds,
        ownerUserIds,
        actorUserId: actor.id,
        actorRole: actor.role,
        actorOrganization: actor.organizationSlug
      })

      const countAfter = await setup.api.models.access_audit.count({
        where: { actorUserId: actor.id }
      })

      expect(countAfter).toBe(countBefore + 15000)
    })

    it('handles empty arrays', async () => {
      const countBefore = await setup.api.models.access_audit.count({
        where: { actorUserId: actor.id }
      })

      await setup.api.audit.logAccessBulk({
        action: setup.api.audit.actions.list,
        recordType: 'formBirds',
        recordIds: [],
        ownerUserIds: [],
        actorUserId: actor.id,
        actorRole: actor.role,
        actorOrganization: actor.organizationSlug
      })

      const countAfter = await setup.api.models.access_audit.count({
        where: { actorUserId: actor.id }
      })

      expect(countAfter).toBe(countBefore)
    })

    it('handles all owners equal to actor', async () => {
      const countBefore = await setup.api.models.access_audit.count({
        where: { actorUserId: actor.id }
      })

      await setup.api.audit.logAccessBulk({
        action: setup.api.audit.actions.list,
        recordType: 'formBirds',
        recordIds: [4001, 4002, 4003],
        ownerUserIds: [actor.id, actor.id, actor.id],
        actorUserId: actor.id,
        actorRole: actor.role,
        actorOrganization: actor.organizationSlug
      })

      const countAfter = await setup.api.models.access_audit.count({
        where: { actorUserId: actor.id }
      })

      expect(countAfter).toBe(countBefore)
    })
  })

  describe('api.audit.createAuditRecords', () => {
    it('creates records directly without filtering', async () => {
      const countBefore = await setup.api.models.access_audit.count({
        where: { actorUserId: actor.id, recordType: 'formMammals' }
      })

      await setup.api.audit.createAuditRecords({
        action: setup.api.audit.actions.view,
        recordType: 'formMammals',
        recordIds: [5001, 5002],
        ownerUserIds: [owner.id, owner.id],
        actorUserId: actor.id,
        actorRole: actor.role,
        actorOrganization: actor.organizationSlug,
        meta: null
      })

      const countAfter = await setup.api.models.access_audit.count({
        where: { actorUserId: actor.id, recordType: 'formMammals' }
      })

      expect(countAfter).toBe(countBefore + 2)

      const records = await setup.api.models.access_audit.findAll({
        where: {
          actorUserId: actor.id,
          recordId: [5001, 5002],
          recordType: 'formMammals'
        },
        order: [['recordId', 'ASC']]
      })

      expect(records).toHaveLength(2)
      expect(records[0].recordType).toBe('formMammals')
    })
  })
})
