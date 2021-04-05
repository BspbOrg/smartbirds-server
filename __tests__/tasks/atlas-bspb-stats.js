/* eslint-env node, jest */
/* globals setup */

const { promisify } = require('util')
const readFile = promisify(require('fs').readFile)

const bgatlas2008CellsFactory = require('../../__utils__/factories/bgatlas2008CellsFactory')
const formBirdsFactory = require('../../__utils__/factories/formBirdsFactory')
const speciesFactory = require('../../__utils__/factories/speciesFactory')

const run = () => setup.api.tasks.tasks.AtlasBspbStats.run()
const readStatFile = async (name) => {
  const content = await readFile(setup.api.config.general.paths.public[0] + '/' + name + '.json')
  return JSON.parse(content)
}

describe('atlas bspb stats', () => {
  let cell
  let latitude
  let longitude

  const runLocal = async ({
    date,
    sensitive = false,
    filename
  }) => {
    const species = await speciesFactory(setup.api, 'birds', undefined, { sensitive })
    await formBirdsFactory(setup.api, {
      species,
      latitude,
      longitude,
      observationDateTime: Date.parse(date)
    })

    await setup.api.tasks.tasks.forms_fill_bgatlas2008_utmcode.run({ form: 'formBirds' })
    await setup.api.tasks.tasks.bgatlas2008_refresh.run()
    await run()
    return {
      result: await readStatFile(filename),
      record: {
        specBG: species.labelBg,
        specLat: species.labelLa,
        specEN: species.labelEn,
        utmCode: cell.utm_code
      }
    }
  }

  beforeAll(async () => {
    cell = await bgatlas2008CellsFactory(setup.api)
    latitude = (cell.lat1 + cell.lat2 + cell.lat3 + cell.lat4) / 4
    longitude = (cell.lon1 + cell.lon2 + cell.lon3 + cell.lon4) / 4
  })

  describe('atlas_bspb_summer_species', () => {
    const filename = 'atlas_bspb_summer_species'

    describe.each([
      '2016-04-01',
      '2018-05-23',
      '2020-07-15'
    ])('record at %s', (date) => {
      test('includes regular species', async () => {
        const { result, record } = await runLocal({ date, filename })

        expect(result).toEqual(expect.arrayContaining([expect.objectContaining(record)]))
      })

      test('does not include sensitive species', async () => {
        const { result, record } = await runLocal({ date, sensitive: true, filename })

        expect(result).not.toEqual(expect.arrayContaining([expect.objectContaining(record)]))
      })
    })

    describe.each([
      '2015-04-01',
      '2015-05-23',
      '2015-07-15',
      '2016-03-31',
      '2016-07-16',
      '2020-10-10'
    ])('record at %s', (date) => {
      test.each([
        ['regular', false],
        ['sensitive', true]
      ])('does not include %s species', async (_, sensitive) => {
        const { result, record } = await runLocal({ date, sensitive, filename })

        expect(result).not.toEqual(expect.arrayContaining([expect.objectContaining(record)]))
      })
    })
  })

  describe('atlas_bspb_winter_species', () => {
    const filename = 'atlas_bspb_winter_species'

    describe.each([
      '2016-01-01',
      '2016-12-01',
      '2017-02-28',
      '2020-02-29'
    ])('record at %s', (date) => {
      test('includes regular species', async () => {
        const { result, record } = await runLocal({ date, filename })

        expect(result).toEqual(expect.arrayContaining([expect.objectContaining(record)]))
      })

      test('does not include sensitive species', async () => {
        const { result, record } = await runLocal({ date, sensitive: true, filename })

        expect(result).not.toEqual(expect.arrayContaining([expect.objectContaining(record)]))
      })
    })

    describe.each([
      '2015-12-31',
      '2016-11-30',
      '2016-03-01',
      '2017-03-01',
      '2018-05-15',
      '2019-11-30'
    ])('record at %s', (date) => {
      test.each([
        ['regular', false],
        ['sensitive', true]
      ])('does not include %s species', async (_, sensitive) => {
        const { result, record } = await runLocal({ date, sensitive, filename })

        expect(result).not.toEqual(expect.arrayContaining([expect.objectContaining(record)]))
      })
    })
  })
})
