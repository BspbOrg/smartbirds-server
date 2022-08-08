/* eslint-env node, jest */
/* globals setup */

const poisFactory = require('../../../__utils__/factories/poisFactory')
const speciesFactory = require('../../../__utils__/factories/speciesFactory')

const { api } = setup

describe('Action: fromBirdsMigrations', () => {
  describe('create', () => {
    const action = 'formBirdsMigrations:create'

    const BASE_RECORD = {
      monitoringCode: 'test',
      latitude: 23,
      longitude: 45,
      observationDateTime: '2022-08-08T01:23:45Z',
      startDateTime: '2022-08-07T01:23:45Z',
      endDateTime: '2022-08-09T01:23:45Z',
      count: 1
    }

    afterEach(async () => {
      await api.models.formBirdsMigrations.destroy({ force: true, where: {} })
    })

    setup.describeAsUser((runAction) => {
      test('can create with default values', async () => {
        const species = await speciesFactory(api, 'birds')
        const poi = await poisFactory(api, { type: 'birds_migration_point' })
        const record = {
          ...BASE_RECORD,
          species: species.labelLa,
          migrationPoint: poi.apiData()
        }
        const response = await runAction(action, record)
        expect(response.error).toBeFalsy()
        expect(response.data).toEqual(expect.objectContaining({
          id: expect.any(Number)
        }))
      })

      test('cannot create without migration point', async () => {
        const species = await speciesFactory(api, 'birds')
        const record = {
          ...BASE_RECORD,
          species: species.labelLa
        }
        const response = await runAction(action, record)
        expect(response.error).toBeTruthy()
      })
    })
  })
})
