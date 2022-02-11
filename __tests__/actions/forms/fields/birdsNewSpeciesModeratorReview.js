/* eslint-env node, jest */
/* globals setup */

const bgatlasCellFactory = require('../../../../__utils__/factories/bgatlas2008CellsFactory')
const bgatlasSpeciesFactory = require('../../../../__utils__/factories/bgatlas2008SpeciesFactory')
const formCBMFactory = require('../../../../__utils__/factories/formCBMFactory')
const formBirdsFactory = require('../../../../__utils__/factories/formBirdsFactory')
const speciesFactory = require('../../../../__utils__/factories/speciesFactory')
const userFactory = require('../../../../__utils__/factories/userFactory')
const { getCenter } = require('geolib')

describe('birdsNewSpeciesModeratorReview', () => {
  describe.each([
    { form: 'formCBM', factory: formCBMFactory },
    { form: 'formBirds', factory: formBirdsFactory }
  ])('on $form', ({ form, factory: formFactory }) => {
    describe.each([
      {
        role: 'user',
        runAction: (action, params, user) => setup.runActionAs(action, params, user),
        newSpeciesModeratorReview: true
      },
      {
        role: 'moderator',
        runAction: (action, params) => setup.runActionAsAdmin(action, params),
        newSpeciesModeratorReview: false
      }
    ])('when $role', ({ runAction, newSpeciesModeratorReview }) => {
      describe.each([
        {
          field: 'species',
          update: async () => ({ species: (await speciesFactory(setup.api, 'birds')).labelLa })
        },
        {
          field: 'coordinates',
          update: async () => getCenter((await bgatlasCellFactory(setup.api)).coordinates())
        }
      ])('updates $field', ({ update }) => {
        it('is rechecked', async () => {
          const cell = await bgatlasCellFactory(setup.api)
          const user = await userFactory(setup.api)
          const species = await speciesFactory(setup.api, 'birds')
          await bgatlasSpeciesFactory(setup.api, cell, species)

          const { id } = await formFactory(setup.api, {
            species: species,
            user: user.email,
            ...getCenter(cell.coordinates())
          })

          await setup.api.tasks.tasks.forms_fill_bgatlas2008_utmcode.run({ form })
          await setup.api.tasks.tasks.birdsNewSpeciesModeratorReview.run({ form })

          await expect(runAction(`${form}:view`, { id }, user.email)).resolves.toEqual(expect.objectContaining({
            data: expect.objectContaining({
              // should not have resulted in moderator review
              newSpeciesModeratorReview: false
            })
          }))

          await expect(runAction(`${form}:edit`, {
            id,
            ...await update()
          }, user.email)).resolves.toEqual(expect.objectContaining({ data: expect.objectContaining({ id }) }))
          await setup.api.tasks.tasks.forms_fill_bgatlas2008_utmcode.run({ form })
          await setup.api.tasks.tasks.birdsNewSpeciesModeratorReview.run({ form })

          await expect(runAction(`${form}:view`, { id }, user.email)).resolves.toEqual(expect.objectContaining({
            data: expect.objectContaining({
              // check based on params
              newSpeciesModeratorReview
            })
          }))
        })
      })
    })

    describe.each([
      {
        role: 'moderator',
        runAction: (action, params) => setup.runActionAsAdmin(action, params)
      }
    ])('when $role', ({ runAction }) => {
      it('confirm forces recheck of records in same grid', async () => {
        jest.spyOn(setup.api.tasks, 'enqueue')

        const cell = await bgatlasCellFactory(setup.api)
        const user = await userFactory(setup.api)
        const species = await speciesFactory(setup.api, 'birds')

        const { id: record1 } = await formFactory(setup.api, {
          species: species,
          user: user.email,
          ...getCenter(cell.coordinates())
        })

        const { id: record2 } = await formFactory(setup.api, {
          species: species,
          user: user.email,
          ...getCenter(cell.coordinates())
        })

        await setup.api.tasks.tasks.forms_fill_bgatlas2008_utmcode.run({ form })
        await setup.api.tasks.tasks.birdsNewSpeciesModeratorReview.run({ form })

        await expect(runAction(`${form}:view`, { id: record1 }, user.email)).resolves.toEqual(expect.objectContaining({
          data: expect.objectContaining({
            newSpeciesModeratorReview: true
          })
        }))
        await expect(runAction(`${form}:view`, { id: record2 }, user.email)).resolves.toEqual(expect.objectContaining({
          data: expect.objectContaining({
            newSpeciesModeratorReview: true
          })
        }))

        // directly execute any enqueued tasks
        setup.api.tasks.enqueue.mockImplementation((taskName, params) => setup.api.tasks.tasks[taskName].run(params))

        // confirm the first record
        await expect(runAction(`${form}:edit`, { id: record1, newSpeciesModeratorReview: false })).resolves.toEqual(expect.objectContaining({
          data: expect.objectContaining({
            newSpeciesModeratorReview: false
          })
        }))

        // both records should be confirmed
        await expect(runAction(`${form}:view`, { id: record1 }, user.email)).resolves.toEqual(expect.objectContaining({
          data: expect.objectContaining({
            newSpeciesModeratorReview: false
          })
        }))
        // both records should be confirmed
        await expect(runAction(`${form}:view`, { id: record2 }, user.email)).resolves.toEqual(expect.objectContaining({
          data: expect.objectContaining({
            newSpeciesModeratorReview: false
          })
        }))
      })
    })
  })
})
