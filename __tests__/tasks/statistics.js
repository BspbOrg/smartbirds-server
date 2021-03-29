/* eslint-env node, jest */
/* globals setup */

const { promisify } = require('util')
const readFile = promisify(require('fs').readFile)

const bgatlas2008CellsFactory = require('../../__utils__/factories/bgatlas2008CellsFactory')
const bgatlas2008SpeciesFactory = require('../../__utils__/factories/bgatlas2008SpeciesFactory')
const formBirdsFactory = require('../../__utils__/factories/formBirdsFactory')
const speciesFactory = require('../../__utils__/factories/speciesFactory')

const run = () => setup.api.tasks.tasks['stats:generate'].run()
const readStatFile = async (name) => {
  const content = await readFile(setup.api.config.general.paths.public[0] + '/' + name + '.json')
  return JSON.parse(content)
}

describe('Statistics task', function () {
  describe('bgatlas2008_stats_global', () => {
    const runLocal = async () => {
      await setup.api.tasks.tasks.forms_fill_bgatlas2008_utmcode.run({ form: 'formBirds' })
      await setup.api.tasks.tasks.bgatlas2008_refresh.run()
      await run()
      return readStatFile('bgatlas2008_global_stats')
    }

    it('includes cell outside atlas without observation', async () => {
      const cell = await bgatlas2008CellsFactory(setup.api)
      const result = await runLocal()

      expect(result).toEqual(expect.arrayContaining([
        { utm_code: cell.utm_code, spec_known: 0, spec_unknown: 0, spec_old: 0, coordinates: cell.coordinates() }
      ]))
    })

    it('includes cell from atlas without observation', async () => {
      const cell = await bgatlas2008CellsFactory(setup.api)
      await bgatlas2008SpeciesFactory(setup.api, cell)

      const result = await runLocal()

      expect(result).toEqual(expect.arrayContaining([
        { utm_code: cell.utm_code, spec_known: 0, spec_unknown: 0, spec_old: 1, coordinates: cell.coordinates() }
      ]))
    })

    it('includes cell outside atlas with observation', async () => {
      const cell = await bgatlas2008CellsFactory(setup.api)
      await formBirdsFactory(setup.api, {
        latitude: (cell.lat1 + cell.lat2 + cell.lat3 + cell.lat4) / 4,
        longitude: (cell.lon1 + cell.lon2 + cell.lon3 + cell.lon4) / 4
      })

      const result = await runLocal()

      expect(result).toEqual(expect.arrayContaining([
        { utm_code: cell.utm_code, spec_known: 0, spec_unknown: 1, spec_old: 0, coordinates: cell.coordinates() }
      ]))
    })

    it('includes cell from atlas with observation', async () => {
      const cell = await bgatlas2008CellsFactory(setup.api)
      const species = await speciesFactory(setup.api)
      await bgatlas2008SpeciesFactory(setup.api, cell, species)
      await formBirdsFactory(setup.api, {
        species,
        latitude: (cell.lat1 + cell.lat2 + cell.lat3 + cell.lat4) / 4,
        longitude: (cell.lon1 + cell.lon2 + cell.lon3 + cell.lon4) / 4
      })

      const result = await runLocal()

      expect(result).toEqual(expect.arrayContaining([
        { utm_code: cell.utm_code, spec_known: 1, spec_unknown: 0, spec_old: 1, coordinates: cell.coordinates() }
      ]))
    })
  })

  describe('atlas live species', () => {
    let cell
    let latitude
    let longitude

    const runLocal = async ({
      date,
      sensitive = false,
      filename
    }) => {
      const species = await speciesFactory(setup.api, 'bird', undefined, { sensitive })
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
          utmSq: cell.utm_code,
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

    describe('atlas_live_summer_species', () => {
      const filename = 'atlas_live_summer_species'
      describe.each([
        '2016-04-01',
        '2018-05-23',
        '2020-07-15'
      ])('record at %s', (date) => {
        test('includes regular species', async () => {
          const { result, record } = await runLocal({ date, filename })

          expect(result).toEqual(expect.arrayContaining([record]))
        })

        test('does not include sensitive species', async () => {
          const { result, record } = await runLocal({ date, senstitive: true, filename })

          expect(result).not.toEqual(expect.arrayContaining([record]))
        })
      })

      describe.each([
        '2015-04-01',
        '2015-05-23',
        '2015-07-15',
        '2016-04-14',
        '2016-07-16',
        '2020-10-10'
      ])('record at %s', (date) => {
        test.each([
          ['regular', false],
          ['sensitive', true]
        ])('does not include %s species', async (_, sensitive) => {
          const { result, record } = await runLocal({ date, sensitive, filename })

          expect(result).not.toEqual(expect.arrayContaining([record]))
        })
      })
    })
  })
})
