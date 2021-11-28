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
        moderatorReview: true
      },
      {
        role: 'moderator',
        runAction: (action, params) => setup.runActionAsAdmin(action, params),
        moderatorReview: false
      }
    ])('when $role', ({ runAction, moderatorReview }) => {
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

          const model = await formFactory(setup.api, {
            species: species,
            user: user.email,
            ...getCenter(cell.coordinates()),
            pictures: JSON.stringify([{}])
          })

          await setup.api.tasks.tasks.forms_fill_bgatlas2008_utmcode.run({ form })
          await setup.api.tasks.tasks.birdsNewSpeciesModeratorReview.run({ form })

          await expect(model.reload()).resolves.toEqual(expect.objectContaining({
            // should not have resulted in moderator review
            moderatorReview: false
          }))

          await expect(runAction(`${form}:edit`, {
            id: model.id,
            ...await update()
          }, user.email)).resolves.toEqual(expect.objectContaining({ data: expect.objectContaining({ id: model.id }) }))
          await setup.api.tasks.tasks.forms_fill_bgatlas2008_utmcode.run({ form })
          await setup.api.tasks.tasks.birdsNewSpeciesModeratorReview.run({ form })

          await expect(model.reload()).resolves.toEqual(expect.objectContaining({
            // check based on params
            moderatorReview
          }))
        })
      })
    })
  })
})
