/* eslint-env node, jest */
/* globals setup */

const formBirdsFactory = require('../../../__utils__/factories/formBirdsMigrationsFactory')

const { api } = setup

describe('Action: fromBirdsMigrations', () => {
  describe('create', () => {
    const action = 'formBirdsMigrations:create'

    afterEach(async () => {
      await api.models.formBirdsMigrations.destroy({ force: true, where: {} })
    })

    setup.describeAsUser((runAction) => {
      test('can create with default values', async () => {
        const record = await formBirdsFactory(api, {}, { create: false })
        console.log('record', record)
        const response = await runAction(action, record)
        expect(response.error).toBeFalsy()
        expect(response.data).toEqual(expect.objectContaining({
          id: expect.any(Number)
        }))
      })
    })
  })
})
