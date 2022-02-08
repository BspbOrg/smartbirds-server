/* eslint-env node, jest */
/* globals setup */

const { omit } = require('lodash')

describe('Action: fromPylons.create', () => {
  const action = 'formPylons:create'

  const bareRecord = {
    pylonType: {
      label: {
        bg: 'Тип 1',
        en: 'Type 1'
      }
    },
    speciesNestOnPylon: 'acepiter',
    typeNest: {
      label: {
        en: 'Nest box',
        bg: 'Гнездилка'
      }
    },
    pylonInsulated: true,
    habitat100mPrime: {
      label: {
        en: 'Arable land',
        bg: 'Обработваеми площи'
      }
    },
    habitat100mSecond: {
      label: {
        en: 'Grassland',
        bg: 'Открити затревени площи'
      }
    },
    startDateTime: '2022-02-08T08:10Z',
    endDateTime: '2022-02-08T10:15Z',
    latitude: 42.1463749,
    longitude: 24.7492006,
    monitoringCode: 'pylon_mon_code',
    observationDateTime: '2022-02-08T10:15Z'
  }

  afterEach(async () => {
    await setup.api.models.formPylons.destroy({
      force: true,
      where: {}
    })
  })

  setup.describeAsAuth((runAction) => {
    test('can create with default values', async () => {
      const response = await runAction(action, bareRecord)
      expect(response.error).toBeFalsy()
      expect(response.data).toEqual(expect.objectContaining({
        id: expect.any(Number)
      }))
    })

    test.each(['pylonType'])('cannot create without %s', async (field) => {
      const response = await runAction(action, omit(bareRecord, field))
      expect(response.error).toMatchSnapshot('Missing param')
    })

    test.each(['speciesNestOnPylon', 'typeNest', 'pylonInsulated', 'habitat100mPrime', 'habitat100mSecond'])('can create without %s', async (field) => {
      const response = await runAction(action, omit(bareRecord, field))
      expect(response.error).toBeFalsy()
      expect(response.data).toEqual(expect.objectContaining({
        id: expect.any(Number)
      }))
    })
  })
})
