/* eslint-env node, jest */
/* globals setup */

const userFactory = require('../../__utils__/factories/userFactory')
const formBirdsFactory = require('../../__utils__/factories/formBirdsFactory')
const formMammalsFactory = require('../../__utils__/factories/formMammalsFactory')

describe('Actions with audit logging', () => {
  let owner
  let actor
  let ownerConnection
  let actorConnection
  let ownerCsrfToken
  let actorCsrfToken

  beforeAll(async () => {
    // Create two users: one who owns records, one who accesses them
    owner = await userFactory(setup.api, { role: 'user', organizationSlug: 'owner-org' })
    actor = await userFactory(setup.api, { role: 'admin', organizationSlug: 'actor-org' })

    // Create connections for both users
    ownerConnection = await setup.api.specHelper.Connection.createAsync()
    ownerConnection.params = { email: owner.email, password: 'secret' }
    const ownerSession = await setup.runAction('session:create', ownerConnection)
    ownerCsrfToken = ownerSession.csrfToken

    actorConnection = await setup.api.specHelper.Connection.createAsync()
    actorConnection.params = { email: actor.email, password: 'secret' }
    const actorSession = await setup.runAction('session:create', actorConnection)
    actorCsrfToken = actorSession.csrfToken

    // Set up CSRF tokens
    ownerConnection.rawConnection.req = { headers: { 'x-sb-csrf-token': ownerCsrfToken } }
    actorConnection.rawConnection.req = { headers: { 'x-sb-csrf-token': actorCsrfToken } }
  })

  describe('formBirds:view', () => {
    it('logs audit when actor views owner record', async () => {
      const record = await formBirdsFactory(setup.api, { userId: owner.id })

      const auditCountBefore = await setup.api.models.access_audit.count({
        where: { actorUserId: actor.id, recordId: record.id, recordType: 'formBirds' }
      })

      actorConnection.params = { id: record.id }
      const response = await setup.runAction('formBirds:view', actorConnection)

      expect(response).not.toHaveProperty('error')
      expect(response.data.id).toBe(record.id)

      const auditCountAfter = await setup.api.models.access_audit.count({
        where: { actorUserId: actor.id, recordId: record.id, recordType: 'formBirds' }
      })

      expect(auditCountAfter).toBe(auditCountBefore + 1)

      const auditRecord = await setup.api.models.access_audit.findOne({
        where: { actorUserId: actor.id, recordId: record.id, recordType: 'formBirds' },
        order: [['occurredAt', 'DESC']]
      })

      expect(auditRecord).toBeTruthy()
      expect(auditRecord.action).toBe('VIEW')
      expect(auditRecord.ownerUserId).toBe(owner.id)
      expect(auditRecord.actorRole).toBe('admin')
      expect(auditRecord.actorOrganization).toBe('actor-org')
      expect(JSON.parse(auditRecord.meta)).toEqual({ context: 'view' })
    })

    it('does not log audit when owner views own record', async () => {
      const record = await formBirdsFactory(setup.api, { userId: owner.id })

      const auditCountBefore = await setup.api.models.access_audit.count({
        where: { actorUserId: owner.id, recordId: record.id, recordType: 'formBirds' }
      })

      ownerConnection.params = { id: record.id }
      const response = await setup.runAction('formBirds:view', ownerConnection)

      expect(response).not.toHaveProperty('error')

      const auditCountAfter = await setup.api.models.access_audit.count({
        where: { actorUserId: owner.id, recordId: record.id, recordType: 'formBirds' }
      })

      expect(auditCountAfter).toBe(auditCountBefore)
    })
  })

  describe('formBirds:edit', () => {
    it('logs audit when actor edits owner record', async () => {
      const record = await formBirdsFactory(setup.api, { userId: owner.id, count: 5 })

      const auditCountBefore = await setup.api.models.access_audit.count({
        where: { actorUserId: actor.id, recordId: record.id, recordType: 'formBirds', action: 'EDIT' }
      })

      actorConnection.params = {
        id: record.id,
        count: 10
      }
      const response = await setup.runAction('formBirds:edit', actorConnection)

      expect(response).not.toHaveProperty('error')
      expect(response.data.count).toBe(10)

      const auditCountAfter = await setup.api.models.access_audit.count({
        where: { actorUserId: actor.id, recordId: record.id, recordType: 'formBirds', action: 'EDIT' }
      })

      expect(auditCountAfter).toBe(auditCountBefore + 1)

      const auditRecord = await setup.api.models.access_audit.findOne({
        where: { actorUserId: actor.id, recordId: record.id, recordType: 'formBirds', action: 'EDIT' },
        order: [['occurredAt', 'DESC']]
      })

      expect(auditRecord).toBeTruthy()
      expect(auditRecord.ownerUserId).toBe(owner.id)
      expect(auditRecord.actorRole).toBe('admin')
      expect(JSON.parse(auditRecord.meta)).toEqual({ context: 'edit' })
    })

    it('does not log audit when owner edits own record', async () => {
      const record = await formBirdsFactory(setup.api, { userId: owner.id, count: 5 })

      const auditCountBefore = await setup.api.models.access_audit.count({
        where: { actorUserId: owner.id, recordId: record.id, recordType: 'formBirds', action: 'EDIT' }
      })

      ownerConnection.params = {
        id: record.id,
        count: 7
      }
      const response = await setup.runAction('formBirds:edit', ownerConnection)

      expect(response).not.toHaveProperty('error')

      const auditCountAfter = await setup.api.models.access_audit.count({
        where: { actorUserId: owner.id, recordId: record.id, recordType: 'formBirds', action: 'EDIT' }
      })

      expect(auditCountAfter).toBe(auditCountBefore)
    })
  })

  describe('formBirds:delete', () => {
    it('logs audit when actor deletes owner record', async () => {
      const record = await formBirdsFactory(setup.api, { userId: owner.id })

      const auditCountBefore = await setup.api.models.access_audit.count({
        where: { actorUserId: actor.id, recordId: record.id, recordType: 'formBirds', action: 'DELETE' }
      })

      actorConnection.params = { id: record.id }
      const response = await setup.runAction('formBirds:delete', actorConnection)

      expect(response).not.toHaveProperty('error')

      const auditCountAfter = await setup.api.models.access_audit.count({
        where: { actorUserId: actor.id, recordId: record.id, recordType: 'formBirds', action: 'DELETE' }
      })

      expect(auditCountAfter).toBe(auditCountBefore + 1)

      const auditRecord = await setup.api.models.access_audit.findOne({
        where: { actorUserId: actor.id, recordId: record.id, recordType: 'formBirds', action: 'DELETE' }
      })

      expect(auditRecord).toBeTruthy()
      expect(auditRecord.ownerUserId).toBe(owner.id)
      expect(JSON.parse(auditRecord.meta)).toEqual({ context: 'delete' })
    })

    it('does not log audit when owner deletes own record', async () => {
      const record = await formBirdsFactory(setup.api, { userId: owner.id })

      const auditCountBefore = await setup.api.models.access_audit.count({
        where: { actorUserId: owner.id, recordId: record.id, recordType: 'formBirds', action: 'DELETE' }
      })

      ownerConnection.params = { id: record.id }
      const response = await setup.runAction('formBirds:delete', ownerConnection)

      expect(response).not.toHaveProperty('error')

      const auditCountAfter = await setup.api.models.access_audit.count({
        where: { actorUserId: owner.id, recordId: record.id, recordType: 'formBirds', action: 'DELETE' }
      })

      expect(auditCountAfter).toBe(auditCountBefore)
    })

    it('calls audit.logAccess before record.destroy (verifies ordering)', async () => {
      const record = await formBirdsFactory(setup.api, { userId: owner.id })

      // Spy on both methods to track call order
      const auditSpy = jest.spyOn(setup.api.audit, 'logAccess')
      const destroySpy = jest.spyOn(setup.api.models.formBirds.prototype, 'destroy')

      actorConnection.params = { id: record.id }
      await setup.runAction('formBirds:delete', actorConnection)

      // Verify both were called
      expect(auditSpy).toHaveBeenCalled()
      expect(destroySpy).toHaveBeenCalled()

      // Verify audit was called BEFORE destroy
      const auditCallOrder = auditSpy.mock.invocationCallOrder[0]
      const destroyCallOrder = destroySpy.mock.invocationCallOrder[0]
      expect(auditCallOrder).toBeLessThan(destroyCallOrder)

      // Cleanup spies
      auditSpy.mockRestore()
      destroySpy.mockRestore()
    })
  })

  describe('formBirds:list', () => {
    it('logs audit for all owner records in list', async () => {
      const records = await Promise.all([
        formBirdsFactory(setup.api, { userId: owner.id }),
        formBirdsFactory(setup.api, { userId: owner.id }),
        formBirdsFactory(setup.api, { userId: owner.id })
      ])
      const recordIds = records.map(r => r.id)

      const auditCountBefore = await setup.api.models.access_audit.count({
        where: { actorUserId: actor.id, recordType: 'formBirds', action: 'LIST' }
      })

      actorConnection.params = { limit: 100 }
      const response = await setup.runAction('formBirds:list', actorConnection)

      expect(response).not.toHaveProperty('error')
      expect(response.data.length).toBeGreaterThanOrEqual(3)

      const auditCountAfter = await setup.api.models.access_audit.count({
        where: { actorUserId: actor.id, recordType: 'formBirds', action: 'LIST' }
      })

      // Should have logged at least the 3 owner records we created
      // (may log more if other tests created records that this actor can see)
      expect(auditCountAfter).toBeGreaterThanOrEqual(auditCountBefore + 3)

      const auditRecords = await setup.api.models.access_audit.findAll({
        where: {
          actorUserId: actor.id,
          recordId: recordIds,
          recordType: 'formBirds',
          action: 'LIST'
        }
      })

      expect(auditRecords.length).toBe(3)
      expect(auditRecords.every(r => r.ownerUserId === owner.id)).toBe(true)
      expect(auditRecords.every(r => r.actorRole === 'admin')).toBe(true)

      // Verify all records from the same list operation share the same operationId
      expect(auditRecords[0].operationId).toBeTruthy()
      expect(auditRecords.every(r => r.operationId === auditRecords[0].operationId)).toBe(true)
    })

    it('does not log audit for actor own records in list', async () => {
      const actorRecords = await Promise.all([
        formBirdsFactory(setup.api, { userId: actor.id }),
        formBirdsFactory(setup.api, { userId: actor.id })
      ])
      const actorRecordIds = actorRecords.map(r => r.id)

      const auditCountBefore = await setup.api.models.access_audit.count({
        where: {
          actorUserId: actor.id,
          recordId: actorRecordIds,
          recordType: 'formBirds',
          action: 'LIST'
        }
      })

      actorConnection.params = { limit: 100 }
      await setup.runAction('formBirds:list', actorConnection)

      const auditCountAfter = await setup.api.models.access_audit.count({
        where: {
          actorUserId: actor.id,
          recordId: actorRecordIds,
          recordType: 'formBirds',
          action: 'LIST'
        }
      })

      expect(auditCountAfter).toBe(auditCountBefore)
    })
  })

  describe('formMammals:view', () => {
    it('logs audit for different form type', async () => {
      const record = await formMammalsFactory(setup.api, { userId: owner.id })

      const auditCountBefore = await setup.api.models.access_audit.count({
        where: { actorUserId: actor.id, recordId: record.id, recordType: 'formMammals' }
      })

      actorConnection.params = { id: record.id }
      const response = await setup.runAction('formMammals:view', actorConnection)

      expect(response).not.toHaveProperty('error')

      const auditCountAfter = await setup.api.models.access_audit.count({
        where: { actorUserId: actor.id, recordId: record.id, recordType: 'formMammals' }
      })

      expect(auditCountAfter).toBe(auditCountBefore + 1)

      const auditRecord = await setup.api.models.access_audit.findOne({
        where: { actorUserId: actor.id, recordId: record.id, recordType: 'formMammals' }
      })

      expect(auditRecord).toBeTruthy()
      expect(auditRecord.action).toBe('VIEW')
      expect(auditRecord.recordType).toBe('formMammals')
    })
  })

  describe('multiple actions on same record', () => {
    it('creates separate audit entries for each action', async () => {
      const record = await formBirdsFactory(setup.api, { userId: owner.id, count: 1 })

      const countBefore = await setup.api.models.access_audit.count({
        where: {
          actorUserId: actor.id,
          recordId: record.id,
          recordType: 'formBirds'
        }
      })

      // View the record
      actorConnection.params = { id: record.id }
      await setup.runAction('formBirds:view', actorConnection)

      // Edit the record
      actorConnection.params = { id: record.id, count: 2 }
      await setup.runAction('formBirds:edit', actorConnection)

      // View again
      actorConnection.params = { id: record.id }
      await setup.runAction('formBirds:view', actorConnection)

      const countAfter = await setup.api.models.access_audit.count({
        where: {
          actorUserId: actor.id,
          recordId: record.id,
          recordType: 'formBirds'
        }
      })

      expect(countAfter).toBe(countBefore + 3)

      const auditRecords = await setup.api.models.access_audit.findAll({
        where: {
          actorUserId: actor.id,
          recordId: record.id,
          recordType: 'formBirds'
        },
        order: [['occurredAt', 'ASC']]
      })

      const recentRecords = auditRecords.slice(-3)
      expect(recentRecords[0].action).toBe('VIEW')
      expect(recentRecords[1].action).toBe('EDIT')
      expect(recentRecords[2].action).toBe('VIEW')
    })
  })
})
