/* eslint-env node, jest */
/* globals setup */

const { getCenter } = require('geolib')

const bgatlas2008CellsFactory = require('../../__utils__/factories/bgatlas2008CellsFactory')
const bgatlas2008SpeciesFactory = require('../../__utils__/factories/bgatlas2008SpeciesFactory')
const formBirdsFactory = require('../../__utils__/factories/formBirdsFactory')
const speciesFactory = require('../../__utils__/factories/speciesFactory')

const action = 'bgatlas2008_cells_list'
describe('Action: bgatlas2008_cells_list', () => {
  describe('cell without species from atlas and no observations', () => {
    let cell
    let response
    beforeAll(async () => {
      cell = await bgatlas2008CellsFactory(setup.api)

      response = await setup.runActionAsUser(action, {})
    })

    it('includes the cell', async () => {
      expect(response).toEqual(expect.objectContaining({
        data: expect.arrayContaining([
          expect.objectContaining({
            utm_code: cell.utm_code
          })
        ])
      }))
    })

    it('old count defaults to 0', async () => {
      expect(response).toEqual(expect.objectContaining({
        data: expect.arrayContaining([
          expect.objectContaining({
            utm_code: cell.utm_code,
            spec_old: 0
          })
        ])
      }))
    })

    it('known count defaults to 0', async () => {
      expect(response).toEqual(expect.objectContaining({
        data: expect.arrayContaining([
          expect.objectContaining({
            utm_code: cell.utm_code,
            spec_known: 0
          })
        ])
      }))
    })

    it('unknown count defaults to 0', async () => {
      expect(response).toEqual(expect.objectContaining({
        data: expect.arrayContaining([
          expect.objectContaining({
            utm_code: cell.utm_code,
            spec_unknown: 0
          })
        ])
      }))
    })
  })

  describe('cell with species from atlas but without observations', () => {
    let cell
    let response
    beforeAll(async () => {
      cell = await bgatlas2008CellsFactory(setup.api)
      await bgatlas2008SpeciesFactory(setup.api, cell)

      response = await setup.runActionAsUser(action, {})
    })

    it('includes the cell', async () => {
      expect(response).toEqual(expect.objectContaining({
        data: expect.arrayContaining([
          expect.objectContaining({
            utm_code: cell.utm_code
          })
        ])
      }))
    })

    it('old count is 1', async () => {
      expect(response).toEqual(expect.objectContaining({
        data: expect.arrayContaining([
          expect.objectContaining({
            utm_code: cell.utm_code,
            spec_old: 1
          })
        ])
      }))
    })

    it('known count defaults to 0', async () => {
      expect(response).toEqual(expect.objectContaining({
        data: expect.arrayContaining([
          expect.objectContaining({
            utm_code: cell.utm_code,
            spec_known: 0
          })
        ])
      }))
    })

    it('unknown count defaults to 0', async () => {
      expect(response).toEqual(expect.objectContaining({
        data: expect.arrayContaining([
          expect.objectContaining({
            utm_code: cell.utm_code,
            spec_unknown: 0
          })
        ])
      }))
    })
  })

  describe('cell without species from atlas and an observation', () => {
    let cell
    let observation
    let response
    beforeAll(async () => {
      cell = await bgatlas2008CellsFactory(setup.api)
      observation = await formBirdsFactory(setup.api, {
        ...getCenter(cell.coordinates())
      })

      await setup.api.tasks.tasks.forms_fill_bgatlas2008_utmcode.run({ form: 'formBirds', id: observation.id })
      await setup.api.tasks.tasks.bgatlas2008_refresh.run()
      response = await setup.runActionAsUser(action, {})
    })

    it('includes the cell', async () => {
      expect(response).toEqual(expect.objectContaining({
        data: expect.arrayContaining([
          expect.objectContaining({
            utm_code: cell.utm_code
          })
        ])
      }))
    })

    it('old count defaults to 0', async () => {
      expect(response).toEqual(expect.objectContaining({
        data: expect.arrayContaining([
          expect.objectContaining({
            utm_code: cell.utm_code,
            spec_old: 0
          })
        ])
      }))
    })

    it('known count is 0', async () => {
      expect(response).toEqual(expect.objectContaining({
        data: expect.arrayContaining([
          expect.objectContaining({
            utm_code: cell.utm_code,
            spec_known: 0
          })
        ])
      }))
    })

    it('unknown count is 1', async () => {
      expect(response).toEqual(expect.objectContaining({
        data: expect.arrayContaining([
          expect.objectContaining({
            utm_code: cell.utm_code,
            spec_unknown: 1
          })
        ])
      }))
    })
  })

  describe('cell with species from atlas and an unknown observation', () => {
    let cell
    let observation
    let response
    beforeAll(async () => {
      cell = await bgatlas2008CellsFactory(setup.api)
      await bgatlas2008SpeciesFactory(setup.api, cell)
      observation = await formBirdsFactory(setup.api, {
        ...getCenter(cell.coordinates())
      })

      await setup.api.tasks.tasks.forms_fill_bgatlas2008_utmcode.run({ form: 'formBirds', id: observation.id })
      await setup.api.tasks.tasks.bgatlas2008_refresh.run()
      response = await setup.runActionAsUser(action, {})
    })

    it('includes the cell', async () => {
      expect(response).toEqual(expect.objectContaining({
        data: expect.arrayContaining([
          expect.objectContaining({
            utm_code: cell.utm_code
          })
        ])
      }))
    })

    it('old count is 1', async () => {
      expect(response).toEqual(expect.objectContaining({
        data: expect.arrayContaining([
          expect.objectContaining({
            utm_code: cell.utm_code,
            spec_old: 1
          })
        ])
      }))
    })

    it('known count is 0', async () => {
      expect(response).toEqual(expect.objectContaining({
        data: expect.arrayContaining([
          expect.objectContaining({
            utm_code: cell.utm_code,
            spec_known: 0
          })
        ])
      }))
    })

    it('unknown count is 1', async () => {
      expect(response).toEqual(expect.objectContaining({
        data: expect.arrayContaining([
          expect.objectContaining({
            utm_code: cell.utm_code,
            spec_unknown: 1
          })
        ])
      }))
    })
  })

  describe('cell with species from atlas and a known observation', () => {
    let cell
    let species
    let observation
    let response
    beforeAll(async () => {
      cell = await bgatlas2008CellsFactory(setup.api)
      species = await speciesFactory(setup.api, 'birds')
      await bgatlas2008SpeciesFactory(setup.api, cell, species)
      observation = await formBirdsFactory(setup.api, {
        ...getCenter(cell.coordinates()),
        species
      })

      await setup.api.tasks.tasks.forms_fill_bgatlas2008_utmcode.run({ form: 'formBirds', id: observation.id })
      await setup.api.tasks.tasks.bgatlas2008_refresh.run()
      response = await setup.runActionAsUser(action, {})
    })

    it('includes the cell', async () => {
      expect(response).toEqual(expect.objectContaining({
        data: expect.arrayContaining([
          expect.objectContaining({
            utm_code: cell.utm_code
          })
        ])
      }))
    })

    it('old count is 1', async () => {
      expect(response).toEqual(expect.objectContaining({
        data: expect.arrayContaining([
          expect.objectContaining({
            utm_code: cell.utm_code,
            spec_old: 1
          })
        ])
      }))
    })

    it('known count is 1', async () => {
      expect(response).toEqual(expect.objectContaining({
        data: expect.arrayContaining([
          expect.objectContaining({
            utm_code: cell.utm_code,
            spec_known: 1
          })
        ])
      }))
    })

    it('unknown count is 0', async () => {
      expect(response).toEqual(expect.objectContaining({
        data: expect.arrayContaining([
          expect.objectContaining({
            utm_code: cell.utm_code,
            spec_unknown: 0
          })
        ])
      }))
    })
  })
})