/* eslint-env node, jest */
/* globals setup */

const { omit } = require('lodash')

describe('Action: fromPylonsCasualties.create', () => {
  const action = 'formPylonsCasualties:create'

  const bareRecord = {
    species: 'acepiter',
    count: 1,
    age: {
      label: {
        en: 'Ad.',
        bg: 'Ad.'
      }
    },
    sex: {
      label: {
        en: 'Male',
        bg: 'Мъжки'
      }
    },
    causeOfDeath: {
      label: {
        en: 'Electrocution',
        bg: 'Токов удар'
      }
    },
    bodyCondition: {
      label: {
        en: 'Fresh corpse',
        bg: 'Свеж труп'
      }
    },
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
    await setup.api.models.formPylonsCasualties.destroy({
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

    test.each(['species', 'count', 'causeOfDeath'])('cannot create without %s', async (field) => {
      const response = await runAction(action, omit(bareRecord, field))
      expect(response.error).toMatchSnapshot('Missing param')
    })

    test.each(['age', 'sex', 'bodyCondition', 'habitat100mPrime', 'habitat100mSecond'])('can create without %s', async (field) => {
      const response = await runAction(action, omit(bareRecord, field))
      expect(response.error).toBeFalsy()
      expect(response.data).toEqual(expect.objectContaining({
        id: expect.any(Number)
      }))
    })
  })
})
