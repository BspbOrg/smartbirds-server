/* eslint-env jest */
/* global setup */

const userFactory = require('../../__utils__/factories/userFactory')
const visitFactory = require('../../__utils__/factories/visitFactory')

const ROLES_PERMISSIONS = [
  ['guest', null, {
    list: false,
    view: false,
    edit: false,
    create: false,
    delete: false
  }],
  ['user', { role: 'user' }, {
    list: true,
    view: true,
    edit: false,
    create: false,
    delete: false
  }],
  ['birds moderator', { role: 'moderator', forms: { formBirds: true } }, {
    list: true,
    view: true,
    edit: false,
    create: false,
    delete: false
  }],
  ['cbm moderator', { role: 'moderator', forms: { formCBM: true } }, {
    list: true,
    view: true,
    edit: true,
    create: true,
    delete: true
  }],
  ['birds and cbm moderator', { role: 'moderator', forms: { formBirds: true, formCBM: true } }, {
    list: true,
    view: true,
    edit: true,
    create: true,
    delete: true
  }],
  ['org admin', { role: 'org-admin' }, {
    list: true,
    view: true,
    edit: true,
    create: true,
    delete: true
  }],
  ['admin', { role: 'admin' }, {
    list: true,
    view: true,
    edit: true,
    create: true,
    delete: true
  }]
]

const generateApiPeriod = (year) => ({
  early: {
    start: `${year}-01-01`,
    end: `${year}-01-02`
  },
  late: {
    start: `${year}-02-01`,
    end: `${year}-02-02`
  }
})

const testPermissions = (action, permission, allowedTest, forbiddenTest) => {
  const allowed = ROLES_PERMISSIONS.filter(([_, __, permissions]) => permissions[permission])
  const forbidden = ROLES_PERMISSIONS.filter(item => !allowed.includes(item))
  const runWrapper = (test) => async (_, userParams) => {
    const user = userParams != null ? await userFactory(setup.api, userParams) : null

    await test((params) => user
      ? setup.runActionAs(action, params, user.email)
      : setup.runAction(action, params)
    )
  }

  if (allowed.length || forbidden.length) {
    describe(permission, () => {
      if (allowed.length) {
        test.each(allowed)(`%s can ${permission}`, runWrapper(allowedTest))
      }

      if (forbidden.length) {
        test.each(forbidden)(`%s cannot ${permission}`, runWrapper(forbiddenTest))
      }
    })
  }
}

describe('Action: visits', () => {
  const missingYear = 1982
  let visit

  beforeEach(async () => {
    visit = await visitFactory(setup.api)

    await setup.api.models.visit.destroy({ where: { year: missingYear } })
  })

  testPermissions('visit:list', 'list', async (runAction) => {
    const response = await runAction()

    expect(response).not.toEqual(expect.objectContaining({ error: expect.anything() }))
    expect(response).toEqual(expect.objectContaining({
      data: expect.arrayContaining([
        expect.objectContaining({ year: visit.year })
      ])
    }))
  }, async (runAction) => {
    const response = await runAction()

    expect(response.error).toMatchSnapshot()
    expect(response.data).toBeFalsy()
  })

  testPermissions('visit:view', 'view', async (runAction) => {
    const response = await runAction({ year: visit.year })

    expect(response).not.toEqual(expect.objectContaining({ error: expect.anything() }))
    expect(response).toEqual(expect.objectContaining({
      data: expect.objectContaining({ year: visit.year })
    }))
  }, async (runAction) => {
    const response = await runAction({ year: visit.year })

    expect(response.error).toMatchSnapshot()
    expect(response.data).toBeFalsy()
  })

  testPermissions('visit:edit', 'edit', async (runAction) => {
    const periods = generateApiPeriod(visit.year)

    const response = await runAction({
      year: visit.year,
      ...periods
    })

    expect(response).not.toEqual(expect.objectContaining({ error: expect.anything() }))
    expect(response).toEqual(expect.objectContaining({
      data: expect.objectContaining({
        year: visit.year,
        ...periods
      })
    }))
  }, async (runAction) => {
    const response = await runAction({
      year: visit.year,
      ...generateApiPeriod(visit.year)
    })

    expect(response.error).toMatchSnapshot()
    expect(response.data).toBeFalsy()
  })

  testPermissions('visit:edit', 'create', async (runAction) => {
    const periods = generateApiPeriod(missingYear)

    const response = await runAction({
      year: missingYear,
      ...periods
    })

    expect(response).not.toEqual(expect.objectContaining({ error: expect.anything() }))
    expect(response).toEqual(expect.objectContaining({
      data: expect.objectContaining({
        year: missingYear,
        ...periods
      })
    }))
  }, async (runAction) => {
    const response = await runAction({
      year: missingYear,
      ...generateApiPeriod(missingYear)
    })

    expect(response.error).toMatchSnapshot()
    expect(response.data).toBeFalsy()
  })

  testPermissions('visit:delete', 'delete', async (runAction) => {
    const response = await runAction({ year: visit.year })

    expect(response).not.toEqual(expect.objectContaining({ error: expect.anything() }))
    expect(await setup.api.models.visit.findOne({ where: { year: visit.year } })).toBe(null)
  }, async (runAction) => {
    const response = await runAction({ year: visit.year })

    expect(response.error).toMatchSnapshot()
    expect(response.data).toBeFalsy()
    expect(await setup.api.models.visit.findOne({ where: { year: visit.year } })).not.toBe(null)
  })
})
