/* eslint-env node, jest */
/* globals setup */

const bgatlasCellFactory = require('../../__utils__/factories/bgatlas2008CellsFactory')
const bgatlasSpeciesFactory = require('../../__utils__/factories/bgatlas2008SpeciesFactory')
const formCBMFactory = require('../../__utils__/factories/formCBMFactory')
const formBirdsFactory = require('../../__utils__/factories/formBirdsFactory')
const speciesFactory = require('../../__utils__/factories/speciesFactory')
const { getCenter } = require('geolib')

const run = async ({ id, form }) => {
  await setup.api.tasks.tasks.forms_fill_bgatlas2008_utmcode.run({ id, form })
  await setup.api.tasks.tasks.birdsNewSpeciesModeratorReview.run({ id, form })
}

describe('birdsNewSpeciesModeratorReview task', function () {
  describe.each([
    { form: 'formCBM', factory: formCBMFactory },
    { form: 'formBirds', factory: formBirdsFactory }
  ])('form $form', ({ factory, form }) => {
    it.each([false, true])('does not change moderator review when species in bgatlas', async (moderatorReview) => {
      const cell = await bgatlasCellFactory(setup.api)
      const species = await speciesFactory(setup.api, 'birds')
      await bgatlasSpeciesFactory(setup.api, cell, species)
      const record = await factory(setup.api, {
        species,
        ...getCenter(cell.coordinates()),
        moderatorReview,
        // moderator review requires pictures
        pictures: JSON.stringify([{}])
      })

      await run({ form })

      await expect(record.reload()).resolves.toEqual(expect.objectContaining({
        moderatorReview
      }))
    })

    it('sets moderator review when species not in bgatlas', async () => {
      const cell = await bgatlasCellFactory(setup.api)
      const species = await speciesFactory(setup.api, 'birds')
      const record = await factory(setup.api, {
        species,
        ...getCenter(cell.coordinates()),
        // moderator review requires pictures
        pictures: JSON.stringify([{}])
      })

      await run({ form, id: record.id })

      await expect(record.reload()).resolves.toEqual(expect.objectContaining({
        moderatorReview: true
      }))
    })

    it('does not set moderator review when species not in bgatlas but no pictures', async () => {
      const cell = await bgatlasCellFactory(setup.api)
      const species = await speciesFactory(setup.api, 'birds')
      const record = await factory(setup.api, {
        species,
        ...getCenter(cell.coordinates())
      })

      await run({ form, id: record.id })

      await expect(record.reload()).resolves.toEqual(expect.objectContaining({
        moderatorReview: false
      }))
    })

    it.each([false, true])('does not change moderator review when species not in bgatlas but already observed', async (moderatorReview) => {
      // trust all previous records
      setup.api.config.app.moderator.trustOldRecords = 0
      const cell = await bgatlasCellFactory(setup.api)
      const species = await speciesFactory(setup.api, 'birds')
      await factory(setup.api, { species, ...getCenter(cell.coordinates()) })
      const record = await factory(setup.api, {
        species,
        ...getCenter(cell.coordinates()),
        moderatorReview,
        // moderator review requires pictures
        pictures: JSON.stringify([{}])
      })

      await run({ form })

      await expect(record.reload()).resolves.toEqual(expect.objectContaining({
        moderatorReview
      }))
    })

    it('sets moderator review when species not in bgatlas and observed in different cell', async () => {
      const cell = await bgatlasCellFactory(setup.api)
      const cell2 = await bgatlasCellFactory(setup.api)
      const species = await speciesFactory(setup.api, 'birds')
      await factory(setup.api, { species, ...getCenter(cell2.coordinates()) })
      const record = await factory(setup.api, {
        species,
        ...getCenter(cell.coordinates()),
        // moderator review requires pictures
        pictures: JSON.stringify([{}])
      })

      await run({ form })

      await expect(record.reload()).resolves.toEqual(expect.objectContaining({
        moderatorReview: true
      }))
    })

    it('sets moderator review when species not in bgatlas and not observed 24h before', async () => {
      // trust only records made 24h or more
      setup.api.config.app.moderator.trustOldRecords = 24
      const cell = await bgatlasCellFactory(setup.api)
      const species = await speciesFactory(setup.api, 'birds')
      await factory(setup.api, { species, ...getCenter(cell.coordinates()) })
      const record = await factory(setup.api, {
        species,
        ...getCenter(cell.coordinates()),
        // moderator review requires pictures
        pictures: JSON.stringify([{}])
      })

      await run({ form })

      await expect(record.reload()).resolves.toEqual(expect.objectContaining({
        moderatorReview: true
      }))
    })

    it('sets moderator review when species not in bgatlas and observed is pending moderator review', async () => {
      // trust all previous records
      setup.api.config.app.moderator.trustOldRecords = 0
      const cell = await bgatlasCellFactory(setup.api)
      const species = await speciesFactory(setup.api, 'birds')
      await factory(setup.api, {
        species,
        ...getCenter(cell.coordinates()),
        moderatorReview: true,
        // moderator review requires pictures
        pictures: JSON.stringify([{}])
      })
      const record = await factory(setup.api, {
        species,
        ...getCenter(cell.coordinates()),
        // moderator review requires pictures
        pictures: JSON.stringify([{}])
      })

      await run({ form })

      await expect(record.reload()).resolves.toEqual(expect.objectContaining({
        moderatorReview: true
      }))
    })
  })
})
