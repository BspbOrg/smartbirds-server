/* eslint-env node, jest */
/* globals setup */

const { omit } = require('lodash')

describe('Action: formFishes.create', () => {
  const action = 'formFishes:create'

  const bareRecord = {
    species: 'Eudontomyzon mariae',
    count: 1,
    startDateTime: '2022-02-08T08:10Z',
    endDateTime: '2022-02-08T10:15Z',
    latitude: 42.1463749,
    longitude: 24.7492006,
    monitoringCode: 'fishes_mon_code',
    observationDateTime: '2022-02-08T10:15Z',

    nameWaterBody: 'Плаваща вода',
    age: { label: { en: 'Adult' } },
    sex: { label: { en: 'male' } }
  }

  afterEach(async () => {
    await setup.api.models.formFishes.destroy({
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

    test.each(['species', 'count'])('cannot create without %s', async (field) => {
      const response = await runAction(action, omit(bareRecord, field))
      expect(response.error).toMatchSnapshot('Missing param')
    })

    test.each(['nameWaterBody', 'age', 'sex'])('can create without %s', async (field) => {
      const response = await runAction(action, omit(bareRecord, field))
      expect(response.error).toBeFalsy()
      expect(response.data).toEqual(expect.objectContaining({
        id: expect.any(Number)
      }))
    })
  })
})
