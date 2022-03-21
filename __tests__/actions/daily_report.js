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

const observationDateTime = new Date(2022, 3, 3).getTime()

beforeAll(() => {
  api.tasks.enqueue = jest.fn((taskName, params) => setup.api.tasks.tasks[taskName].run(params)).mockName('enqueue')
})

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
      const settlement = await settlementFactory(api)
      const record = await factory(api, {
        latitude: settlement.latitude,
        longitude: settlement.longitude,
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
          location: settlement.nameEn,
          species: hasSpecies ? record.species : null,
          count: defaultCount,
          records: 1
        }
      ])
    })

    test('includes record without settlement', async () => {
      const user = await userFactory(api)
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
          location: '',
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
          location: settlement.nameEn,
          species: hasSpecies ? species.labelLa : null,
          count: defaultCount != null ? defaultCount * 2 : null,
          records: 2
        }
      ])
    })

    test('splits by settlement', async () => {
      const settlement1 = await settlementFactory(api)
      const settlement2 = await settlementFactory(api)
      const user = await userFactory(api)
      const species = await speciesFactory(api)
      await factory(api, {
        latitude: settlement1.latitude,
        longitude: settlement1.longitude,
        observationDateTime,
        species,
        user
      })
      await factory(api, {
        latitude: settlement2.latitude,
        longitude: settlement2.longitude,
        observationDateTime,
        species,
        user
      })

      await api.tasks.tasks.autoLocation.run({ limit: -1 })

      const response = await runActionAs('daily_report', {
        date: observationDateTime
      }, user)

      expect(response.data).toEqual(expect.arrayContaining([
        {
          date: observationDateTime,
          form,
          location: settlement1.nameEn,
          species: hasSpecies ? species.labelLa : null,
          count: defaultCount != null ? defaultCount : null,
          records: 1
        },
        {
          date: observationDateTime,
          form,
          location: settlement2.nameEn,
          species: hasSpecies ? species.labelLa : null,
          count: defaultCount != null ? defaultCount : null,
          records: 1
        }
      ]))
      expect(response.count).toEqual(2)
    })

    if (hasSpecies) {
      test('splits by species', async () => {
        const settlement = await settlementFactory(api)
        const user = await userFactory(api)
        const species1 = await speciesFactory(api)
        const species2 = await speciesFactory(api)
        await factory(api, {
          latitude: settlement.latitude,
          longitude: settlement.longitude,
          observationDateTime,
          species: species1,
          user
        })
        await factory(api, {
          latitude: settlement.latitude,
          longitude: settlement.longitude,
          observationDateTime,
          species: species2,
          user
        })

        await api.tasks.tasks.autoLocation.run({ limit: -1 })

        const response = await runActionAs('daily_report', {
          date: observationDateTime
        }, user)

        expect(response.data).toEqual(expect.arrayContaining([
          {
            date: observationDateTime,
            form,
            location: settlement.nameEn,
            species: species1.labelLa,
            count: defaultCount != null ? defaultCount : null,
            records: 1
          },
          {
            date: observationDateTime,
            form,
            location: settlement.nameEn,
            species: species2.labelLa,
            count: defaultCount != null ? defaultCount : null,
            records: 1
          }
        ]))
        expect(response.count).toEqual(2)
      })
    }
  })

  test('splits by form', async () => {
    const settlement = await settlementFactory(api)
    const species = await speciesFactory(api)
    const user = await userFactory(api)
    const birdsRecord = await formBirdsFactory(api, {
      latitude: settlement.latitude,
      longitude: settlement.longitude,
      observationDateTime,
      species,
      user
    })
    const cbmRecord = await formCbmFactory(api, {
      latitude: settlement.latitude,
      longitude: settlement.longitude,
      observationDateTime,
      species,
      user
    })
    await formCiconiaFactory(api, {
      latitude: settlement.latitude,
      longitude: settlement.longitude,
      observationDateTime,
      species,
      user
    })
    const herptilesRecord = await formHerptilesFactory(api, {
      latitude: settlement.latitude,
      longitude: settlement.longitude,
      observationDateTime,
      species,
      user
    })
    const invertebratesRecord = await formInvertebratesFactory(api, {
      latitude: settlement.latitude,
      longitude: settlement.longitude,
      observationDateTime,
      species,
      user
    })
    const mammalsRecord = await formMammalsFactory(api, {
      latitude: settlement.latitude,
      longitude: settlement.longitude,
      observationDateTime,
      species,
      user
    })
    const plantsRecord = await formPlantsFactory(api, {
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

    const expected = [
      {
        date: observationDateTime,
        form: 'cbm',
        location: settlement.nameEn,
        species: cbmRecord.species,
        count: 1,
        records: 1
      },
      {
        date: observationDateTime,
        form: 'birds',
        location: settlement.nameEn,
        species: birdsRecord.species,
        count: 1,
        records: 1
      },
      {
        date: observationDateTime,
        form: 'ciconia',
        location: settlement.nameEn,
        species: null,
        count: null,
        records: 1
      },
      {
        date: observationDateTime,
        form: 'herptiles',
        location: settlement.nameEn,
        species: herptilesRecord.species,
        count: 1,
        records: 1
      },
      {
        date: observationDateTime,
        form: 'invertebrates',
        location: settlement.nameEn,
        species: invertebratesRecord.species,
        count: 1,
        records: 1
      },
      {
        date: observationDateTime,
        form: 'mammals',
        location: settlement.nameEn,
        species: mammalsRecord.species,
        count: 1,
        records: 1
      },
      {
        date: observationDateTime,
        form: 'plants',
        location: settlement.nameEn,
        species: plantsRecord.species,
        count: 1,
        records: 1
      }
    ]

    for (const rec of expected) {
      expect(response.data).toEqual(expect.arrayContaining([rec]))
    }
    expect(expected).toEqual(expect.arrayContaining(response.data))
    expect(response.count).toEqual(expected.length)

    // does not include from other user
    await expect(runActionAs('daily_report', {
      date: observationDateTime
    }, await userFactory(api))).resolves.toEqual(expect.objectContaining({
      data: [],
      count: 0
    }))
  })
})
