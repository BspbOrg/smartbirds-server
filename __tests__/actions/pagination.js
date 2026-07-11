/* eslint-env node, jest */
/* globals setup */

const formBearsFactory = require('../../__utils__/factories/formBearsFactory')
const zoneFactory = require('../../__utils__/factories/zoneFactory')
const userFactory = require('../../__utils__/factories/userFactory')

const { api } = setup
// These clamp assertions run against real DB queries and target Postgres.
// __tests__/** runs only under jest.pg.config.js, so this guard is defensive.
const isPg = () => api.sequelize.sequelize.options.dialect === 'postgres'

describe('SB-C02: pagination limits', () => {
  describe('formBears query builders', () => {
    let user

    beforeAll(async () => {
      user = await api.models.user.findOne({ where: { email: 'admin@smartbirds.com' } })
    })

    test('list clamps limit=-1 to formListMax (bounded), not 1', async () => {
      if (!isPg()) return
      const q = await api.forms.formBears.prepareQuery(api, { params: { limit: -1 }, user })
      expect(q.limit).toBe(api.config.pagination.formListMax)
    })

    test('list caps an oversized positive limit at formListMax', async () => {
      if (!isPg()) return
      const q = await api.forms.formBears.prepareQuery(api, { params: { limit: 999999 }, user })
      expect(q.limit).toBe(api.config.pagination.formListMax)
    })

    test('list preserves a valid small limit', async () => {
      if (!isPg()) return
      const q = await api.forms.formBears.prepareQuery(api, { params: { limit: 25 }, user })
      expect(q.limit).toBe(25)
    })

    test('export clamps limit=-1 to formExportMax (bounded, never 1)', async () => {
      if (!isPg()) return
      const q = await api.forms.formBears.prepareCsvQuery(api, { params: { limit: -1 }, user })
      expect(q.limit).toBe(api.config.pagination.formExportMax)
      expect(q.limit).toBeGreaterThan(1)
    })

    test('negative offset is floored to 0', async () => {
      if (!isPg()) return
      const q = await api.forms.formBears.prepareQuery(api, { params: { limit: 10, offset: -5 }, user })
      expect(q.offset).toBe(0)
    })

    test('public context caps limit to publicMax minus offset', async () => {
      if (!isPg()) return
      const offset = 200
      const q = await api.forms.formBears.prepareQuery(api, { params: { context: 'public', limit: -1, offset }, user })
      expect(q.limit).toBe(api.config.pagination.publicMax - offset)
    })

    test('public context yields limit 0 when offset exceeds publicMax', async () => {
      if (!isPg()) return
      const offset = api.config.pagination.publicMax + 50
      const q = await api.forms.formBears.prepareQuery(api, { params: { context: 'public', limit: -1, offset }, user })
      expect(q.limit).toBe(0)
    })
  })

  // Scoped to a dedicated owner + user-filter so the count/cleanup are isolated
  // from suites sharing the same Postgres DB in parallel workers.
  describe('formBears:list action', () => {
    let owner
    let originalMax

    beforeEach(async () => {
      originalMax = api.config.pagination.formListMax
      owner = await userFactory(api, { role: 'user' })
      await formBearsFactory(api, { user: owner, observationDateTime: '2022-08-15T10:00:00Z' })
      await formBearsFactory(api, { user: owner, observationDateTime: '2022-08-16T10:00:00Z' })
      await formBearsFactory(api, { user: owner, observationDateTime: '2022-08-17T10:00:00Z' })
    })

    afterEach(async () => {
      api.config.pagination.formListMax = originalMax
      await api.models.formBears.destroy({ force: true, where: { userId: owner.id } })
    })

    setup.describeAsAdmin((runAction) => {
      test('rows clamped to formListMax while count stays the true (larger) total', async () => {
        if (!isPg()) return
        api.config.pagination.formListMax = 2
        const response = await runAction('formBears:list', { limit: -1, user: owner.id })
        expect(response.error).toBeFalsy()
        expect(response.data).toHaveLength(2) // clamped to formListMax
        expect(response.count).toBe(3) // unclamped total for this owner
      })

      test('count context returns the true total regardless of the page limit', async () => {
        if (!isPg()) return
        api.config.pagination.formListMax = 2
        const response = await runAction('formBears:list', { limit: -1, user: owner.id, context: 'count' })
        expect(response.error).toBeFalsy()
        expect(response.count).toBe(3)
      })
    })
  })

  // zone:list enforces a hard ceiling and preserves the true count.
  describe('zone:list action', () => {
    let owner
    let originalMax

    beforeEach(async () => {
      originalMax = api.config.pagination.zoneListMax
      owner = await userFactory(api, { role: 'user' })
      await zoneFactory(api, { ownerId: owner.id, status: 'owned' })
      await zoneFactory(api, { ownerId: owner.id, status: 'owned' })
      await zoneFactory(api, { ownerId: owner.id, status: 'owned' })
    })

    afterEach(async () => {
      api.config.pagination.zoneListMax = originalMax
      await api.models.zone.destroy({ force: true, where: { ownerId: owner.id } })
    })

    setup.describeAsAdmin((runAction) => {
      test('caps returned zones to zoneListMax while count stays the true total', async () => {
        if (!isPg()) return
        api.config.pagination.zoneListMax = 2
        const response = await runAction('zone:list', { limit: -1, owner: owner.id })
        expect(response.error).toBeFalsy()
        expect(response.data).toHaveLength(2) // clamped to zoneListMax
        expect(response.count).toBe(3) // unclamped total for this owner
      })
    })
  })

  describe('user:list action', () => {
    setup.describeAsAdmin((runAction) => {
      test('limit=-1 resolves to userListMax', async () => {
        if (!isPg()) return
        const original = api.config.pagination.userListMax
        api.config.pagination.userListMax = 2
        try {
          const response = await runAction('user:list', { limit: -1 })
          expect(response.error).toBeFalsy()
          expect(response.data).toHaveLength(2) // -1 resolves to userListMax
          expect(response.count).toBeGreaterThan(2) // full directory, unclamped
        } finally {
          api.config.pagination.userListMax = original
        }
      })
    })
  })

  describe('suspiciousActivityAlert:list action', () => {
    test('a negative limit is bounded and does not raise a DB error', async () => {
      if (!isPg()) return
      const response = await setup.runActionAsAdmin('suspiciousActivityAlert:list', { limit: -1 })
      expect(response).not.toEqual(expect.objectContaining({ error: expect.anything() }))
      expect(Array.isArray(response.data)).toBe(true)
    })
  })
})
