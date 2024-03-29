/* eslint-env node, jest */
/* globals setup */

const bgatlasCellFactory = require('../../__utils__/factories/bgatlas2008CellsFactory')
const bgatlasSpeciesFactory = require('../../__utils__/factories/bgatlas2008SpeciesFactory')
const formCBMFactory = require('../../__utils__/factories/formCBMFactory')
const formBirdsFactory = require('../../__utils__/factories/formBirdsFactory')
const speciesFactory = require('../../__utils__/factories/speciesFactory')
const { getCenter } = require('geolib')

const run = async ({ id, form } = {}) => {
  await setup.api.tasks.tasks.forms_fill_bgatlas2008_utmcode.run({ id, form })
  await setup.api.tasks.tasks.birdsNewSpeciesModeratorReview.run({ id, form })
}

describe('birdsNewSpeciesModeratorReview task', function () {
  describe.each([
    { form: 'formCBM', factory: formCBMFactory },
    { form: 'formBirds', factory: formBirdsFactory }
  ])('form $form', ({ factory, form }) => {
    it.each([false, true])('does not change moderator review when species in bgatlas', async (newSpeciesModeratorReview) => {
      const cell = await bgatlasCellFactory(setup.api)
      const species = await speciesFactory(setup.api, 'birds')
      await bgatlasSpeciesFactory(setup.api, cell, species)
      const record = await factory(setup.api, {
        species,
        ...getCenter(cell.coordinates()),
        newSpeciesModeratorReview
      })

      await run({ form })

      await expect(record.reload()).resolves.toEqual(expect.objectContaining({
        newSpeciesModeratorReview
      }))
    })

    it('sets moderator review when species not in bgatlas', async () => {
      const cell = await bgatlasCellFactory(setup.api)
      const species = await speciesFactory(setup.api, 'birds')
      const record = await factory(setup.api, {
        species,
        ...getCenter(cell.coordinates())
      })

      await run({ form, id: record.id })

      await expect(record.reload()).resolves.toEqual(expect.objectContaining({
        newSpeciesModeratorReview: true
      }))
    })

    it('sets moderator review when species not in bgatlas and no pictures', async () => {
      const cell = await bgatlasCellFactory(setup.api)
      const species = await speciesFactory(setup.api, 'birds')
      const record = await factory(setup.api, {
        species,
        ...getCenter(cell.coordinates())
      })

      await run({ form, id: record.id })

      await expect(record.reload()).resolves.toEqual(expect.objectContaining({
        newSpeciesModeratorReview: true
      }))
    })

    it.each([false, true])('does not change moderator review when species not in bgatlas but already observed', async (newSpeciesModeratorReview) => {
      const cell = await bgatlasCellFactory(setup.api)
      const species = await speciesFactory(setup.api, 'birds')
      await factory(setup.api, { species, ...getCenter(cell.coordinates()) })
      const record = await factory(setup.api, {
        species,
        ...getCenter(cell.coordinates()),
        newSpeciesModeratorReview
      })

      await run({ form })

      await expect(record.reload()).resolves.toEqual(expect.objectContaining({
        newSpeciesModeratorReview
      }))
    })

    it('sets moderator review when species not in bgatlas but observed in different cell', async () => {
      const cell = await bgatlasCellFactory(setup.api)
      const cell2 = await bgatlasCellFactory(setup.api)
      const species = await speciesFactory(setup.api, 'birds')
      await factory(setup.api, { species, ...getCenter(cell2.coordinates()) })
      const record = await factory(setup.api, {
        species,
        ...getCenter(cell.coordinates())
      })

      await run({ form })

      await expect(record.reload()).resolves.toEqual(expect.objectContaining({
        newSpeciesModeratorReview: true
      }))
    })

    it('sets moderator review when species not in bgatlas and not observed before', async () => {
      const cell = await bgatlasCellFactory(setup.api)
      const species = await speciesFactory(setup.api, 'birds')
      await factory(setup.api, { species, ...getCenter(cell.coordinates()) })
      const record = await factory(setup.api, {
        species,
        ...getCenter(cell.coordinates())
      })

      await run({ form })

      await expect(record.reload()).resolves.toEqual(expect.objectContaining({
        newSpeciesModeratorReview: true
      }))
    })

    it('sets moderator review when species not in bgatlas and observed is pending auto moderator review', async () => {
      const cell = await bgatlasCellFactory(setup.api)
      const species = await speciesFactory(setup.api, 'birds')
      await factory(setup.api, {
        species,
        ...getCenter(cell.coordinates()),
        newSpeciesModeratorReview: true
      })
      const record = await factory(setup.api, {
        species,
        ...getCenter(cell.coordinates())
      })

      await run({ form })

      await expect(record.reload()).resolves.toEqual(expect.objectContaining({
        newSpeciesModeratorReview: true
      }))
    })
    it('sets moderator review when species not in bgatlas and observed is pending moderator review', async () => {
      const cell = await bgatlasCellFactory(setup.api)
      const species = await speciesFactory(setup.api, 'birds')
      await factory(setup.api, {
        species,
        ...getCenter(cell.coordinates()),
        moderatorReview: true,
        pictures: JSON.stringify([{}])
      })
      const record = await factory(setup.api, {
        species,
        ...getCenter(cell.coordinates())
      })

      await run({ form })

      await expect(record.reload()).resolves.toEqual(expect.objectContaining({
        newSpeciesModeratorReview: true
      }))
    })

    it('processes even if already requested review', async () => {
      const spy = jest.spyOn(setup.api.tasks.tasks.birdsNewSpeciesModeratorReview, 'processRecord')
      const cell = await bgatlasCellFactory(setup.api)
      const record = await factory(setup.api, {
        ...getCenter(cell.coordinates()),
        moderatorReview: true,
        pictures: JSON.stringify([{}])
      })

      expect(spy).toHaveBeenCalledTimes(0)

      await run({ form })

      expect(spy).toHaveBeenCalledWith(expect.objectContaining({ id: record.id }), form)
    })

    it('does not process a record second time', async () => {
      const spy = jest.spyOn(setup.api.tasks.tasks.birdsNewSpeciesModeratorReview, 'processRecord')
      const cell = await bgatlasCellFactory(setup.api)
      const species = await speciesFactory(setup.api, 'birds')
      await bgatlasSpeciesFactory(setup.api, cell, species)
      const record = await factory(setup.api, {
        species,
        ...getCenter(cell.coordinates())
      })

      expect(spy).toHaveBeenCalledTimes(0)

      await run({ form })

      expect(spy).toHaveBeenCalledWith(expect.objectContaining({ id: record.id }), form)
      await expect(record.reload()).resolves.toEqual(expect.objectContaining({ moderatorReview: false }))
      spy.mockClear()

      await run({ form })

      expect(spy).not.toHaveBeenCalledWith(expect.objectContaining({ id: record.id }), form)
    })

    it('does not process if no cell', async () => {
      const spy = jest.spyOn(setup.api.tasks.tasks.birdsNewSpeciesModeratorReview, 'processRecord')
      const record = await factory(setup.api, {})

      expect(spy).toHaveBeenCalledTimes(0)

      await run({ form })

      expect(spy).not.toHaveBeenCalledWith(expect.objectContaining({ id: record.id }), form)
    })

    it('does process after utm grid', async () => {
      const spy = jest.spyOn(setup.api.tasks.tasks.birdsNewSpeciesModeratorReview, 'processRecord')
      const cell = await bgatlasCellFactory(setup.api)
      const record = await factory(setup.api, {
        ...getCenter(cell.coordinates())
      })

      expect(spy).toHaveBeenCalledTimes(0)

      await setup.api.tasks.tasks.birdsNewSpeciesModeratorReview.run({ form })

      expect(spy).not.toHaveBeenCalledWith(expect.objectContaining({ id: record.id }), form)

      await setup.api.tasks.tasks.forms_fill_bgatlas2008_utmcode.run({ form })
      await setup.api.tasks.tasks.birdsNewSpeciesModeratorReview.run({ form })

      expect(spy).toHaveBeenCalledWith(expect.objectContaining({ id: record.id }), form)
    })
  })
})
