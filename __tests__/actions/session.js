/* eslint-env node, jest */
/* globals setup */

const bgatlas2008CellsFactory = require('../../__utils__/factories/bgatlas2008CellsFactory')
const userFactory = require('../../__utils__/factories/userFactory')

const roles = ['user', 'admin', 'moderator', 'org-admin']

describe('Action session', () => {
  const password = 'secret'

  describe.each(roles)('logs %s', (role) => {
    let response
    let user

    beforeAll(async () => {
      user = await userFactory(setup.api, { role, password })

      response = await setup.runAction('session:create', { email: user.email, password })
    })

    it('doesn\'t have error', () => {
      expect(response).not.toEqual(expect.objectContaining({ error: expect.anything() }))
    })

    it('has csrfToken', () => {
      expect(response).toEqual(expect.objectContaining({
        csrfToken: expect.any(String)
      }))
    })

    it('has user data', () => {
      expect(response).toEqual(expect.objectContaining({
        user: expect.objectContaining({
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email
        })
      }))
    })
  })

  describe.each(roles)('logs %s', (role) => {
    let response
    let cell
    let user

    beforeAll(async () => {
      user = await userFactory(setup.api, { role, password })
      cell = await bgatlas2008CellsFactory(setup.api)
      await user.setBgatlas2008Cells([cell.utm_code])
    })

    it('does not have bg atlas selected cells by default', async () => {
      response = await setup.runAction('session:create', { email: user.email, password })
      expect(response).not.toEqual(expect.objectContaining({
        user: expect.objectContaining({
          bgatlasCells: expect.anything()
        })
      }))
    })

    it('has bg atlas selected cells when asked', async () => {
      response = await setup.runAction('session:create', { email: user.email, password, include: ['bgatlasCells'] })
      expect(response).toEqual(expect.objectContaining({
        user: expect.objectContaining({
          bgatlasCells: [expect.objectContaining({
            utm_code: cell.utm_code,
            coordinates: cell.coordinates(),
            spec_known: expect.any(Number),
            spec_unknown: expect.any(Number),
            spec_old: expect.any(Number)
          })]
        })
      }))
    })
  })

  describe.each(roles)('restore %s', (role) => {
    let response
    let cell
    let user
    let csrfToken
    let conn

    beforeAll(async () => {
      user = await userFactory(setup.api, { role, password })
      cell = await bgatlas2008CellsFactory(setup.api)
      await user.setBgatlas2008Cells([cell.utm_code])

      conn = await setup.api.specHelper.Connection.createAsync()
      conn.params = {
        email: user.email,
        password
      }

      csrfToken = await setup.runAction('session:create', conn)

      conn.params = {}
      conn.rawConnection.req = { headers: { 'x-sb-csrf-token': csrfToken } }
    })

    it('does not have bg atlas selected cells by default', async () => {
      conn.params = {}
      response = await setup.runAction('session:check', conn)
      expect(response).not.toEqual(expect.objectContaining({
        user: expect.objectContaining({
          bgatlasCells: expect.anything()
        })
      }))
    })

    it('has bg atlas selected cells when asked', async () => {
      conn.params = { include: ['bgatlasCells'] }
      response = await setup.runAction('session:check', conn)
      expect(response).toEqual(expect.objectContaining({
        user: expect.objectContaining({
          bgatlasCells: [expect.objectContaining({
            utm_code: cell.utm_code,
            coordinates: cell.coordinates(),
            spec_known: expect.any(Number),
            spec_unknown: expect.any(Number),
            spec_old: expect.any(Number)
          })]
        })
      }))
    })
  })
})
