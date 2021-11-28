/* eslint-env node, jest */
/* globals setup */

const formCBMFactory = require('../../__utils__/factories/formCBMFactory')
const visitFactory = require('../../__utils__/factories/visitFactory')

const run = (...args) => setup.api.tasks.tasks.autoVisit.run(...args)

const YEAR = 2021
const date = (day) => new Date(YEAR, 2, day)
const tz = (day) => date(day).getTime()

describe('autoVisit task', function () {
  it('sets auto_visit to -1 when no visits', async () => {
    await setup.api.models.visit.destroy({ where: { year: YEAR }, force: true })
    const record = await formCBMFactory(setup.api)

    await run({ form: 'formCBM', id: record.id })

    await expect(record.reload()).resolves.toEqual(expect.objectContaining({
      auto_visit: -1
    }))
  })

  it('can be forced to update specific year', async () => {
    await setup.api.models.visit.destroy({ where: { year: YEAR }, force: true })
    await setup.api.models.visit.destroy({ where: { year: YEAR + 1 }, force: true })
    const record1 = await formCBMFactory(setup.api, {
      observationDateTime: new Date(YEAR, 1, 10)
    })
    const record2 = await formCBMFactory(setup.api, {
      observationDateTime: new Date(YEAR + 1, 1, 10)
    })

    await run({ form: 'formCBM' })

    await expect(record1.reload()).resolves.toEqual(expect.objectContaining({ auto_visit: -1 }))
    await expect(record2.reload()).resolves.toEqual(expect.objectContaining({ auto_visit: -1 }))

    await visitFactory(setup.api, { year: YEAR })
    await visitFactory(setup.api, { year: YEAR + 1 })

    await run({ form: 'formCBM', force: YEAR })

    await expect(record1.reload()).resolves.toEqual(expect.objectContaining({ auto_visit: 0 }))
    await expect(record2.reload()).resolves.toEqual(expect.objectContaining({ auto_visit: -1 }))
  })

  describe('with visit', () => {
    beforeAll(async () => {
      await setup.api.models.visit.destroy({ where: { year: YEAR }, force: true })
      await visitFactory(setup.api, {
        year: YEAR,
        earlyStart: tz(3),
        earlyEnd: tz(5),
        lateStart: tz(7),
        lateEnd: tz(9)
      })
    })
    it.each([
      { name: 'before early start', visit: 0, observation: 2 },
      { name: 'at early start', visit: 1, observation: 3 },
      { name: 'in early', visit: 1, observation: 4 },
      { name: 'at early end', visit: 1, observation: 5 },
      { name: 'between early and late', visit: 0, observation: 6 },
      { name: 'at late start', visit: 2, observation: 7 },
      { name: 'in late', visit: 2, observation: 8 },
      { name: 'at late end', visit: 2, observation: 9 },
      { name: 'after late end', visit: 0, observation: 10 }
    ])('sets auto_visit to $visit when $name', async ({
      visit,
      observation
    }) => {
      const record = await formCBMFactory(setup.api, {
        observationDateTime: date(observation)
      })

      await run({ form: 'formCBM', id: record.id })

      await expect(record.reload()).resolves.toEqual(expect.objectContaining({
        auto_visit: visit
      }))
    })
  })

  it('rejects on wrong form and prints available ones', async () => {
    await expect(run({ form: 'invalid' })).rejects.toEqual(expect.objectContaining({
      message: expect.stringContaining('formCBM')
    }))
  })
})
