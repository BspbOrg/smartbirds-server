/* eslint-env jest */
/* global setup */

const formBirdsFactory = require('../../__utils__/factories/formBirdsFactory')
const formCbmFactory = require('../../__utils__/factories/formCBMFactory')
const formCiconiaFactory = require('../../__utils__/factories/formCiconiaFactory')
const formHerptilesFactory = require('../../__utils__/factories/formHerptilesFactory')
const formInvertebratesFactory = require('../../__utils__/factories/formInvertebratesFactory')
const formMammalsFactory = require('../../__utils__/factories/formMammalsFactory')
const formPlantsFactory = require('../../__utils__/factories/formPlantsFactory')
const settlementFactory = require('../../__utils__/factories/settlementFactory')
const speciesFactory = require('../../__utils__/factories/speciesFactory')
const userFactory = require('../../__utils__/factories/userFactory')

const {
  api,
  runActionAs
} = setup

describe('Action: daily_report', () => {
  describe.each([
    {
      form: 'birds',
      factory: formBirdsFactory
    },
    {
      form: 'cbm',
      factory: formCbmFactory
    },
    {
      form: 'ciconia',
      factory: formCiconiaFactory,
      count: null,
      hasSpecies: false
    },
    {
      form: 'herptiles',
      factory: formHerptilesFactory
    },
    {
      form: 'invertebrates',
      factory: formInvertebratesFactory
    },
    {
      form: 'mammals',
      factory: formMammalsFactory
    },
    {
      form: 'plants',
      factory: formPlantsFactory
    }
  ])('$form', ({
    form,
    factory,
    count: defaultCount = 1,
    hasSpecies = true
  }) => {
    test('includes record', async () => {
      const user = await userFactory(api)
      const observationDateTime = new Date(2022, 3, 20)
      const record = await factory(api, {
        observationDateTime,
        user
      })

      await api.tasks.tasks.autoLocation.run({ limit: -1 })

      const response = await runActionAs('daily_report', {
        date: observationDateTime
      }, user)

      expect(response.error).toBeFalsy()
      expect(response.count).toEqual(1)
      expect(response.data).toEqual([
        {
          date: observationDateTime,
          form,
          location: null,
          species: hasSpecies ? record.species : null,
          count: defaultCount,
          records: 1
        }
      ])
    })

    test('groups matching record', async () => {
      const settlement = await settlementFactory(api)
      const user = await userFactory(api)
      const species = await speciesFactory(api)
      const observationDateTime = new Date(2022, 3, 20)
      await factory(api, {
        latitude: settlement.latitude,
        longitude: settlement.longitude,
        observationDateTime,
        species,
        user
      })
      await factory(api, {
        latitude: settlement.latitude,
        longitude: settlement.longitude,
        observationDateTime,
        species,
        user
      })

      await api.tasks.tasks.autoLocation.run({ limit: -1 })

      const response = await runActionAs('daily_report', {
        date: observationDateTime
      }, user)

      expect(response.count).toEqual(1)
      expect(response.data).toEqual([
        {
          date: observationDateTime,
          form,
          location: null,
          species: hasSpecies ? species.labelLa : null,
          count: defaultCount != null ? defaultCount * 2 : null,
          records: 2
        }
      ])
    })
  })

  test('includes different forms', async () => {
    const observationDateTime = new Date(2022, 3, 3)
    const user = await userFactory(api)
    const birdsRecord = await formBirdsFactory(api, {
      observationDateTime,
      user
    })
    const cbmRecord = await formCbmFactory(api, {
      observationDateTime,
      user
    })
    await formCiconiaFactory(api, {
      observationDateTime,
      user
    })
    const herptilesRecord = await formHerptilesFactory(api, {
      observationDateTime,
      user
    })
    const invertebratesRecord = await formInvertebratesFactory(api, {
      observationDateTime,
      user
    })
    const mammalsRecord = await formMammalsFactory(api, {
      observationDateTime,
      user
    })
    const plantsRecord = await formPlantsFactory(api, {
      observationDateTime,
      user
    })

    await api.tasks.tasks.autoLocation.run({ limit: -1 })

    const response = await runActionAs('daily_report', {
      date: observationDateTime
    }, user)

    const expected = [
      {
        date: observationDateTime,
        form: 'cbm',
        location: null,
        species: cbmRecord.species,
        count: 1,
        records: 1
      },
      {
        date: observationDateTime,
        form: 'birds',
        location: null,
        species: birdsRecord.species,
        count: 1,
        records: 1
      },
      {
        date: observationDateTime,
        form: 'ciconia',
        location: null,
        species: null,
        count: null,
        records: 1
      },
      {
        date: observationDateTime,
        form: 'herptiles',
        location: null,
        species: herptilesRecord.species,
        count: 1,
        records: 1
      },
      {
        date: observationDateTime,
        form: 'invertebrates',
        location: null,
        species: invertebratesRecord.species,
        count: 1,
        records: 1
      },
      {
        date: observationDateTime,
        form: 'mammals',
        location: null,
        species: mammalsRecord.species,
        count: 1,
        records: 1
      },
      {
        date: observationDateTime,
        form: 'plants',
        location: null,
        species: plantsRecord.species,
        count: 1,
        records: 1
      }
    ]

    expect(response.count).toEqual(expected.length)
    for (const rec of expected) {
      expect(response.data).toEqual(expect.arrayContaining([rec]))
    }
    expect(expected).toEqual(expect.arrayContaining(response.data))
  })
})
