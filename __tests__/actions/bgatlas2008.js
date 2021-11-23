/* eslint-env node, jest */
/* globals setup */

const { getCenter } = require('geolib')

const bgatlas2008CellsFactory = require('../../__utils__/factories/bgatlas2008CellsFactory')
const bgatlas2008CellStatusFactory = require('../../__utils__/factories/bgatlas2008CellStatusFactory')
const bgatlas2008SpeciesFactory = require('../../__utils__/factories/bgatlas2008SpeciesFactory')
const formBirdsFactory = require('../../__utils__/factories/formBirdsFactory')
const speciesFactory = require('../../__utils__/factories/speciesFactory')
const userFactory = require('../../__utils__/factories/userFactory')

describe('Action: bgatlas2008_cell_info', () => {
  const action = 'bgatlas2008_cell_info'
  let cell

  beforeEach(async () => {
    cell = await bgatlas2008CellsFactory(setup.api)
  })

  it('atlas species not observed by user', async () => {
    const species = await bgatlas2008SpeciesFactory(setup.api, cell)
    await setup.api.tasks.tasks.bgatlas2008_refresh.run()

    const response = await setup.runActionAsUser(action, { utm_code: cell.utm_code })

    expect(response.data).toEqual(expect.arrayContaining([
      {
        species: species.species,
        known: true,
        observed: false,
        other: false
      }
    ]))
  })

  it('observed by user but not in atlas', async () => {
    const species = await speciesFactory(setup.api)
    const observation = await formBirdsFactory(setup.api, {
      ...getCenter(cell.coordinates()),
      species
    })
    await setup.api.tasks.tasks.forms_fill_bgatlas2008_utmcode.run({
      form: 'formBirds',
      id: observation.id
    })
    await setup.api.tasks.tasks.bgatlas2008_refresh.run()

    const response = await setup.runActionAsUser(action, { utm_code: cell.utm_code })

    expect(response.data).toEqual(expect.arrayContaining([
      {
        species: species.labelLa,
        known: false,
        observed: true,
        other: true
      }
    ]))
  })

  it('observed by user and in atlas', async () => {
    const species = await speciesFactory(setup.api)
    await bgatlas2008SpeciesFactory(setup.api, cell, species)
    const observation = await formBirdsFactory(setup.api, {
      ...getCenter(cell.coordinates()),
      species
    })
    await setup.api.tasks.tasks.forms_fill_bgatlas2008_utmcode.run({
      form: 'formBirds',
      id: observation.id
    })
    await setup.api.tasks.tasks.bgatlas2008_refresh.run()

    const response = await setup.runActionAsUser(action, { utm_code: cell.utm_code })

    expect(response.data).toEqual(expect.arrayContaining([
      {
        species: species.labelLa,
        known: true,
        observed: true,
        other: true
      }
    ]))
  })

  it('observed by another user and not in atlas', async () => {
    const species = await speciesFactory(setup.api)
    const observation = await formBirdsFactory(setup.api, {
      ...getCenter(cell.coordinates()),
      species
    })
    await setup.api.tasks.tasks.forms_fill_bgatlas2008_utmcode.run({
      form: 'formBirds',
      id: observation.id
    })
    await setup.api.tasks.tasks.bgatlas2008_refresh.run()

    const response = await setup.runActionAsUser2(action, { utm_code: cell.utm_code })

    expect(response.data).toEqual(expect.arrayContaining([
      { species: species.labelLa, known: false, observed: false, other: true }
    ]))
  })

  it('observed by another user and in atlas', async () => {
    const species = await speciesFactory(setup.api)
    await bgatlas2008SpeciesFactory(setup.api, cell, species)
    const observation = await formBirdsFactory(setup.api, {
      ...getCenter(cell.coordinates()),
      species
    })
    await setup.api.tasks.tasks.forms_fill_bgatlas2008_utmcode.run({
      form: 'formBirds',
      id: observation.id
    })
    await setup.api.tasks.tasks.bgatlas2008_refresh.run()

    const response = await setup.runActionAsUser2(action, { utm_code: cell.utm_code })

    expect(response.data).toEqual(expect.arrayContaining([
      {
        species: species.labelLa,
        known: true,
        observed: false,
        other: true
      }
    ]))
  })

  it('atlas species in another cell', async () => {
    const cell2 = await bgatlas2008CellsFactory(setup.api)
    const species = await bgatlas2008SpeciesFactory(setup.api, cell2)
    await setup.api.tasks.tasks.bgatlas2008_refresh.run()

    const response = await setup.runActionAsUser(action, { utm_code: cell.utm_code })

    expect(response.data).not.toEqual(expect.arrayContaining([
      expect.objectContaining({ species: species.species })
    ]))
  })

  it('observed by user in another cell', async () => {
    const cell2 = await bgatlas2008CellsFactory(setup.api)
    const species = await speciesFactory(setup.api)
    const observation = await formBirdsFactory(setup.api, {
      ...getCenter(cell2.coordinates()),
      species
    })
    await setup.api.tasks.tasks.forms_fill_bgatlas2008_utmcode.run({
      form: 'formBirds',
      id: observation.id
    })
    await setup.api.tasks.tasks.bgatlas2008_refresh.run()

    const response = await setup.runActionAsUser(action, { utm_code: cell.utm_code })

    expect(response.data).not.toEqual(expect.arrayContaining([
      expect.objectContaining({ species: species.labelLa })
    ]))
  })

  it('requires authenticated user', async () => {
    const response = await setup.runActionAsGuest(action, { utm_code: cell.utm_code })

    expect(response).toEqual(expect.objectContaining({
      error: expect.any(String)
    }))
    expect(response.responseHttpCode).toEqual(401)
  })

  it('unknown utm_code results in 404', async () => {
    const response = await setup.runActionAsUser(action, { utm_code: 'NONE' })

    expect(response).toEqual(expect.objectContaining({
      error: expect.any(String)
    }))
    expect(response.responseHttpCode).toEqual(404)
  })
})

describe('Action: bgatlas2008_cell_stats', () => {
  const action = 'bgatlas2008_cell_stats'
  let cell

  beforeEach(async () => {
    cell = await bgatlas2008CellsFactory(setup.api)
  })

  it('cell with no observations and no species', async () => {
    const response = await setup.runActionAsUser(action, { utm_code: cell.utm_code })

    expect(response).toEqual(expect.objectContaining({
      count: 0,
      data: []
    }))
  })

  it('cell with no observation and one species', async () => {
    await bgatlas2008SpeciesFactory(setup.api, cell)
    await setup.api.tasks.tasks.bgatlas2008_refresh.run()

    const response = await setup.runActionAsUser(action, { utm_code: cell.utm_code })

    expect(response).toEqual(expect.objectContaining({
      count: 1,
      data: []
    }))
  })

  it('cell with one observation and no species', async () => {
    const user = await userFactory(setup.api)
    const observation = await formBirdsFactory(setup.api, {
      ...getCenter(cell.coordinates()),
      user: user.email
    })
    await setup.api.tasks.tasks.forms_fill_bgatlas2008_utmcode.run({
      form: 'formBirds',
      id: observation.id
    })
    await setup.api.tasks.tasks.bgatlas2008_refresh.run()

    const response = await setup.runActionAsUser(action, { utm_code: cell.utm_code })

    expect(response).toEqual(expect.objectContaining({
      count: 1,
      data: [
        {
          species: 1,
          user: expect.objectContaining({
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName
          })
        }
      ]
    }))
  })

  it('cell with two users each having one observation on the same species and no species', async () => {
    const species = await speciesFactory(setup.api, 'birds')
    const user1 = await userFactory(setup.api)
    const user2 = await userFactory(setup.api)
    await formBirdsFactory(setup.api, {
      ...getCenter(cell.coordinates()),
      species,
      user: user1.email
    })
    await formBirdsFactory(setup.api, {
      ...getCenter(cell.coordinates()),
      species,
      user: user2.email
    })
    await setup.api.tasks.tasks.forms_fill_bgatlas2008_utmcode.run({ form: 'formBirds' })
    await setup.api.tasks.tasks.bgatlas2008_refresh.run()

    const response = await setup.runActionAsUser(action, { utm_code: cell.utm_code })

    expect(response).toEqual(expect.objectContaining({
      count: 1,
      data: expect.arrayContaining([
        {
          species: 1,
          user: expect.objectContaining({
            id: user1.id,
            firstName: user1.firstName,
            lastName: user1.lastName
          })
        },
        {
          species: 1,
          user: expect.objectContaining({
            id: user2.id,
            firstName: user2.firstName,
            lastName: user2.lastName
          })
        }
      ])
    }))
    // only the 2 records
    expect(response.data).toHaveLength(2)
  })

  it('cell with one observation and the same species', async () => {
    const species = await speciesFactory(setup.api, 'birds')
    const user = await userFactory(setup.api)
    const observation = await formBirdsFactory(setup.api, {
      ...getCenter(cell.coordinates()),
      species,
      user: user.email
    })
    await bgatlas2008SpeciesFactory(setup.api, cell, species)
    await setup.api.tasks.tasks.forms_fill_bgatlas2008_utmcode.run({
      form: 'formBirds',
      id: observation.id
    })
    await setup.api.tasks.tasks.bgatlas2008_refresh.run()

    const response = await setup.runActionAsUser(action, { utm_code: cell.utm_code })

    expect(response).toEqual(expect.objectContaining({
      count: 1,
      data: [
        {
          species: 1,
          user: expect.objectContaining({
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName
          })
        }
      ]
    }))
  })

  it('cell with one observation and a different species', async () => {
    const user = await userFactory(setup.api)
    const observation = await formBirdsFactory(setup.api, {
      ...getCenter(cell.coordinates()),
      user: user.email
    })
    await bgatlas2008SpeciesFactory(setup.api, cell)
    await setup.api.tasks.tasks.forms_fill_bgatlas2008_utmcode.run({
      form: 'formBirds',
      id: observation.id
    })
    await setup.api.tasks.tasks.bgatlas2008_refresh.run()

    const response = await setup.runActionAsUser(action, { utm_code: cell.utm_code })

    expect(response).toEqual(expect.objectContaining({
      count: 2,
      data: [
        {
          species: 1,
          user: expect.objectContaining({
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName
          })
        }
      ]
    }))
  })

  it('cell with two users each having one observation on different species and a third species', async () => {
    const user1 = await userFactory(setup.api)
    const user2 = await userFactory(setup.api)
    await formBirdsFactory(setup.api, {
      ...getCenter(cell.coordinates()),
      user: user1.email
    })
    await formBirdsFactory(setup.api, {
      ...getCenter(cell.coordinates()),
      user: user2.email
    })
    await bgatlas2008SpeciesFactory(setup.api, cell)
    await setup.api.tasks.tasks.forms_fill_bgatlas2008_utmcode.run({ form: 'formBirds' })
    await setup.api.tasks.tasks.bgatlas2008_refresh.run()

    const response = await setup.runActionAsUser(action, { utm_code: cell.utm_code })

    expect(response).toEqual(expect.objectContaining({
      count: 3,
      data: expect.arrayContaining([
        {
          species: 1,
          user: expect.objectContaining({
            id: user1.id,
            firstName: user1.firstName,
            lastName: user1.lastName
          })
        },
        {
          species: 1,
          user: expect.objectContaining({
            id: user2.id,
            firstName: user2.firstName,
            lastName: user2.lastName
          })
        }
      ])
    }))
    // only the 2 records
    expect(response.data).toHaveLength(2)
  })

  it('cell with four users each having one observation', async () => {
    for (let i = 0; i < 4; i++) {
      await formBirdsFactory(setup.api, {
        ...getCenter(cell.coordinates()),
        user: (await userFactory(setup.api)).email
      })
    }
    await setup.api.tasks.tasks.forms_fill_bgatlas2008_utmcode.run({ form: 'formBirds' })
    await setup.api.tasks.tasks.bgatlas2008_refresh.run()

    const response = await setup.runActionAsUser(action, { utm_code: cell.utm_code })

    expect(response.data).toHaveLength(3)
  })

  it('observation in a different cell', async () => {
    const cell2 = await bgatlas2008CellsFactory(setup.api)
    await formBirdsFactory(setup.api, {
      ...getCenter(cell2.coordinates())
    })
    await setup.api.tasks.tasks.forms_fill_bgatlas2008_utmcode.run({ form: 'formBirds' })
    await setup.api.tasks.tasks.bgatlas2008_refresh.run()

    const response = await setup.runActionAsUser(action, { utm_code: cell.utm_code })

    expect(response).toEqual(expect.objectContaining({
      count: 0,
      data: []
    }))
  })

  it('does not include observer with privacy', async () => {
    const user = await userFactory(setup.api, { privacy: 'private' })
    const observation = await formBirdsFactory(setup.api, {
      ...getCenter(cell.coordinates()),
      user: user.email
    })
    await setup.api.tasks.tasks.forms_fill_bgatlas2008_utmcode.run({
      form: 'formBirds',
      id: observation.id
    })
    await setup.api.tasks.tasks.bgatlas2008_refresh.run()

    const response = await setup.runActionAsUser(action, { utm_code: cell.utm_code })

    expect(response).toEqual(expect.objectContaining({
      count: 1,
      data: []
    }))
  })

  it('requires authenticated user', async () => {
    const response = await setup.runActionAsGuest(action, { utm_code: cell.utm_code })

    expect(response).toEqual(expect.objectContaining({
      error: expect.any(String)
    }))
    expect(response.responseHttpCode).toEqual(401)
  })

  it('unknown utm_code results in 404', async () => {
    const response = await setup.runActionAsUser(action, { utm_code: 'NONE' })

    expect(response).toEqual(expect.objectContaining({
      error: expect.any(String)
    }))
    expect(response.responseHttpCode).toEqual(404)
  })
})

describe('Action: bgatlas2008_mod_cell_methodology_stats', () => {
  const action = 'bgatlas2008_mod_cell_methodology_stats'
  let cell

  beforeEach(async () => {
    cell = await bgatlas2008CellsFactory(setup.api)
  })

  it('cell with no observations', async () => {
    const response = await setup.runActionAsBirds(action, { utm_code: cell.utm_code })

    expect(response).toEqual(expect.objectContaining({
      count: 0,
      data: []
    }))
  })

  it('cell with observation without methodology', async () => {
    await formBirdsFactory(setup.api, {
      ...getCenter(cell.coordinates()),
      observationMethodologyEn: null
    })
    await formBirdsFactory(setup.api, {
      ...getCenter(cell.coordinates()),
      observationMethodologyEn: ''
    })

    await setup.api.tasks.tasks.forms_fill_bgatlas2008_utmcode.run({ form: 'formBirds' })
    const response = await setup.runActionAsBirds(action, { utm_code: cell.utm_code })

    expect(response).toEqual(expect.objectContaining({
      count: 1,
      data: [{ observation_methodology: '', records_count: 2, utm_code: cell.utm_code }]
    }))
  })

  it('cell with different methodologies', async () => {
    await formBirdsFactory(setup.api, {
      ...getCenter(cell.coordinates()),
      observationMethodologyEn: 'meth1'
    })
    await formBirdsFactory(setup.api, {
      ...getCenter(cell.coordinates()),
      observationMethodologyEn: 'meth2'
    })
    await formBirdsFactory(setup.api, {
      ...getCenter(cell.coordinates()),
      observationMethodologyEn: 'meth2'
    })

    await setup.api.tasks.tasks.forms_fill_bgatlas2008_utmcode.run({ form: 'formBirds' })
    const response = await setup.runActionAsBirds(action, { utm_code: cell.utm_code })

    expect(response).toEqual(expect.objectContaining({
      count: 2,
      data: expect.arrayContaining([
        { observation_methodology: 'meth1', records_count: 1, utm_code: cell.utm_code },
        { observation_methodology: 'meth2', records_count: 2, utm_code: cell.utm_code }
      ])
    }))
  })

  it('returns only from the selected cell', async () => {
    await formBirdsFactory(setup.api, {
      ...getCenter(cell.coordinates())
    })
    const cell2 = await bgatlas2008CellsFactory(setup.api)
    await formBirdsFactory(setup.api, {
      ...getCenter(cell2.coordinates())
    })

    await setup.api.tasks.tasks.forms_fill_bgatlas2008_utmcode.run({ form: 'formBirds' })
    const response = await setup.runActionAsBirds(action, { utm_code: cell.utm_code })

    expect(response).toEqual(expect.objectContaining({
      count: 1,
      data: [{ observation_methodology: '', records_count: 1, utm_code: cell.utm_code }]
    }))
  })

  it('requires authentication', async () => {
    const response = await setup.runActionAsGuest(action, { utm_code: cell.utm_code })

    expect(response).toEqual(expect.objectContaining({
      error: expect.any(String)
    }))
    expect(response.responseHttpCode).toEqual(401)
  })

  it('forbidden for regular user', async () => {
    const response = await setup.runActionAsUser(action, { utm_code: cell.utm_code })

    expect(response).toEqual(expect.objectContaining({
      error: expect.any(String)
    }))
    expect(response.responseHttpCode).toEqual(403)
  })

  it('forbidden for cbm moderator', async () => {
    const response = await setup.runActionAsCbm(action, { utm_code: cell.utm_code })

    expect(response).toEqual(expect.objectContaining({
      error: expect.any(String)
    }))
    expect(response.responseHttpCode).toEqual(403)
  })

  it('unknown utm_code results in 404', async () => {
    const response = await setup.runActionAsBirds(action, { utm_code: 'NONE' })

    expect(response).toEqual(expect.objectContaining({
      error: expect.any(String)
    }))
    expect(response.responseHttpCode).toEqual(404)
  })
})

describe('Action: bgatlas2008_mod_cell_user_stats', () => {
  const action = 'bgatlas2008_mod_cell_user_stats'
  let cell

  beforeEach(async () => {
    cell = await bgatlas2008CellsFactory(setup.api)
  })

  it('cell with no observations', async () => {
    const response = await setup.runActionAsBirds(action, { utm_code: cell.utm_code })

    expect(response).toEqual(expect.objectContaining({
      count: 0,
      data: []
    }))
  })

  it('cell with observation', async () => {
    const user = await userFactory(setup.api)
    const observation = await formBirdsFactory(setup.api, {
      ...getCenter(cell.coordinates()),
      user: user.email
    })
    await setup.api.tasks.tasks.forms_fill_bgatlas2008_utmcode.run({
      form: 'formBirds',
      id: observation.id
    })
    await setup.api.tasks.tasks.bgatlas2008_refresh.run()

    const response = await setup.runActionAsBirds(action, { utm_code: cell.utm_code })

    expect(response).toEqual(expect.objectContaining({
      count: 1,
      data: [
        expect.objectContaining({
          records_count: 1,
          user: expect.objectContaining({
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName
          })
        })
      ]
    }))
  })

  it('two observation one user', async () => {
    const species = await speciesFactory(setup.api, 'birds')
    const user = await userFactory(setup.api)
    await formBirdsFactory(setup.api, {
      ...getCenter(cell.coordinates()),
      species,
      user: user.email
    })
    await formBirdsFactory(setup.api, {
      ...getCenter(cell.coordinates()),
      species,
      user: user.email
    })
    await bgatlas2008SpeciesFactory(setup.api, cell, species)
    await setup.api.tasks.tasks.forms_fill_bgatlas2008_utmcode.run({ form: 'formBirds' })
    await setup.api.tasks.tasks.bgatlas2008_refresh.run()

    const response = await setup.runActionAsBirds(action, { utm_code: cell.utm_code })

    expect(response).toEqual(expect.objectContaining({
      count: 1,
      data: [
        expect.objectContaining({
          records_count: 2,
          user: expect.objectContaining({
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName
          })
        })
      ]
    }))
  })

  it('cell with four users each having one observation', async () => {
    const users = []
    for (let i = 0; i < 4; i++) {
      const user = await userFactory(setup.api)
      users.push(user)
      await formBirdsFactory(setup.api, {
        ...getCenter(cell.coordinates()),
        user: user.email
      })
    }
    await setup.api.tasks.tasks.forms_fill_bgatlas2008_utmcode.run({ form: 'formBirds' })
    await setup.api.tasks.tasks.bgatlas2008_refresh.run()

    const response = await setup.runActionAsBirds(action, { utm_code: cell.utm_code })

    expect(response).toEqual(expect.objectContaining({
      count: 4,
      data: expect.arrayContaining(users.map(user => (
        expect.objectContaining({
          records_count: 1,
          user: expect.objectContaining({ id: user.id })
        })
      )))
    }))
    expect(response.data).toHaveLength(4)
  })

  it('includes observer with privacy', async () => {
    const user = await userFactory(setup.api, { privacy: 'private' })
    const observation = await formBirdsFactory(setup.api, {
      ...getCenter(cell.coordinates()),
      user: user.email
    })
    await setup.api.tasks.tasks.forms_fill_bgatlas2008_utmcode.run({
      form: 'formBirds',
      id: observation.id
    })
    await setup.api.tasks.tasks.bgatlas2008_refresh.run()

    const response = await setup.runActionAsBirds(action, { utm_code: cell.utm_code })

    expect(response).toEqual(expect.objectContaining({
      count: 1,
      data: [
        expect.objectContaining({
          records_count: 1,
          user: expect.objectContaining({ id: user.id })
        })
      ]
    }))
  })

  it('requires authenticated user', async () => {
    const response = await setup.runActionAsGuest(action, { utm_code: cell.utm_code })

    expect(response).toEqual(expect.objectContaining({
      error: expect.any(String)
    }))
    expect(response.responseHttpCode).toEqual(401)
  })

  it('forbidden for regular user', async () => {
    const response = await setup.runActionAsUser(action, { utm_code: cell.utm_code })

    expect(response).toEqual(expect.objectContaining({
      error: expect.any(String)
    }))
    expect(response.responseHttpCode).toEqual(403)
  })

  it('forbidden for cbm moderator', async () => {
    const response = await setup.runActionAsCbm(action, { utm_code: cell.utm_code })

    expect(response).toEqual(expect.objectContaining({
      error: expect.any(String)
    }))
    expect(response.responseHttpCode).toEqual(403)
  })

  it('unknown utm_code results in 404', async () => {
    const response = await setup.runActionAsBirds(action, { utm_code: 'NONE' })

    expect(response).toEqual(expect.objectContaining({
      error: expect.any(String)
    }))
    expect(response.responseHttpCode).toEqual(404)
  })
})

describe('Action: bgatlas2008_cells_list', () => {
  const action = 'bgatlas2008_cells_list'

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

      await setup.api.tasks.tasks.forms_fill_bgatlas2008_utmcode.run({
        form: 'formBirds',
        id: observation.id
      })
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

      await setup.api.tasks.tasks.forms_fill_bgatlas2008_utmcode.run({
        form: 'formBirds',
        id: observation.id
      })
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

      await setup.api.tasks.tasks.forms_fill_bgatlas2008_utmcode.run({
        form: 'formBirds',
        id: observation.id
      })
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

  describe('cell with user selected it', () => {
    let cell
    let response

    beforeAll(async () => {
      cell = await bgatlas2008CellsFactory(setup.api)

      await setup.runActionAsUser('bgatlas2008_set_user_selection', { cells: [cell.utm_code] })

      response = await setup.runActionAsUser(action, {})
    })

    it('includes the cell', () => {
      expect(response).toEqual(expect.objectContaining({
        data: expect.arrayContaining([
          expect.objectContaining({
            utm_code: cell.utm_code
          })
        ])
      }))
    })

    it('count of selected users', () => {
      expect(response).toEqual(expect.objectContaining({
        data: expect.arrayContaining([
          expect.objectContaining({
            utm_code: cell.utm_code,
            selected: 1
          })
        ])
      }))
    })
  })
})

describe('Action: bgatlas2008_set_user_selection', () => {
  const actionGet = 'bgatlas2008_get_user_selection'
  const actionSet = 'bgatlas2008_set_user_selection'

  describe('setting new cell on empty selection', () => {
    const utmCode = 'test'
    const userEmail = 'test@test.test'

    beforeAll(async () => {
      await bgatlas2008CellsFactory(setup.api, { utm_code: utmCode })
      await userFactory(setup.api, { email: userEmail })
    })

    it('set returns provided cell', async () => {
      const response = await setup.runActionAs(actionSet, { cells: [utmCode] }, userEmail)

      expect(response).toEqual(expect.objectContaining({
        data: [utmCode]
      }))
    })

    it('set returns provided cell when no change', async () => {
      await setup.runActionAs(actionSet, { cells: [utmCode] }, userEmail)
      const response = await setup.runActionAs(actionSet, { cells: [utmCode] }, userEmail)

      expect(response).toEqual(expect.objectContaining({
        data: [utmCode]
      }))
    })

    it('saves provided cell', async () => {
      await setup.runActionAs(actionSet, { cells: [utmCode] }, userEmail)
      const response = await setup.runActionAs(actionGet, {}, userEmail)

      expect(response).toEqual(expect.objectContaining({
        data: [utmCode]
      }))
    })

    it('set fails on invalid cell', async () => {
      const response = await setup.runActionAs(actionSet, { cells: [{}] }, userEmail)

      expect(response).toEqual(expect.objectContaining({
        error: expect.any(String)
      }))
    })

    it('set fails on unknown cell id', async () => {
      const response = await setup.runActionAs(actionSet, { cells: ['----'] }, userEmail)

      expect(response).toEqual(expect.objectContaining({
        error: expect.any(String)
      }))
    })

    it('clears cells', async () => {
      await setup.runActionAs(actionSet, { cells: [utmCode] }, userEmail)
      await setup.runActionAs(actionSet, { cells: [] }, userEmail)
      const response = await setup.runActionAs(actionGet, {}, userEmail)

      expect(response).toEqual(expect.objectContaining({
        data: []
      }))
    })
  })
})

describe('Action: bgatlas2008_user_rank_stats', () => {
  const action = 'bgatlas2008_user_rank_stats'

  beforeEach(async () => {
    // clean all observations
    await setup.api.models.formBirds.destroy({
      where: {},
      force: true
    })
    // reset the materialized view
    await setup.api.tasks.tasks.bgatlas2008_refresh.run()
  })

  it('no observations', async () => {
    const response = await setup.runActionAsUser(action, {})

    expect(response).toEqual(expect.objectContaining({
      count: 0,
      data: []
    }))
  })

  it('user with one observations', async () => {
    const cell = await bgatlas2008CellsFactory(setup.api)
    const user = await userFactory(setup.api)
    const observation = await formBirdsFactory(setup.api, {
      ...getCenter(cell.coordinates()),
      user: user.email
    })
    await setup.api.tasks.tasks.forms_fill_bgatlas2008_utmcode.run({
      form: 'formBirds',
      id: observation.id
    })
    await setup.api.tasks.tasks.bgatlas2008_refresh.run()

    const response = await setup.runActionAsUser(action, {})

    expect(response).toEqual(expect.objectContaining({
      count: 1,
      data: [
        {
          count: 1,
          position: 1,
          user: {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName
          }
        }
      ]
    }))
  })

  it('two users with different score', async () => {
    const cell1 = await bgatlas2008CellsFactory(setup.api)
    const cell2 = await bgatlas2008CellsFactory(setup.api)
    const user1 = await userFactory(setup.api)
    const user2 = await userFactory(setup.api)
    await formBirdsFactory(setup.api, {
      ...getCenter(cell1.coordinates()),
      user: user1.email
    })
    await formBirdsFactory(setup.api, {
      ...getCenter(cell2.coordinates()),
      user: user1.email
    })
    await formBirdsFactory(setup.api, {
      ...getCenter(cell1.coordinates()),
      user: user2.email
    })
    await setup.api.tasks.tasks.forms_fill_bgatlas2008_utmcode.run({ form: 'formBirds' })
    await setup.api.tasks.tasks.bgatlas2008_refresh.run()

    const response = await setup.runActionAsUser(action, {})

    expect(response).toEqual(expect.objectContaining({
      count: 2,
      data: [
        {
          count: 2,
          position: 1,
          user: {
            id: user1.id,
            firstName: user1.firstName,
            lastName: user1.lastName
          }
        },
        {
          count: 1,
          position: 2,
          user: {
            id: user2.id,
            firstName: user2.firstName,
            lastName: user2.lastName
          }
        }
      ]
    }))
  })

  it('two users with same score have different ranking', async () => {
    const cell = await bgatlas2008CellsFactory(setup.api)
    const user1 = await userFactory(setup.api)
    const user2 = await userFactory(setup.api)
    await formBirdsFactory(setup.api, {
      ...getCenter(cell.coordinates()),
      user: user1.email
    })
    await formBirdsFactory(setup.api, {
      ...getCenter(cell.coordinates()),
      user: user2.email
    })
    await setup.api.tasks.tasks.forms_fill_bgatlas2008_utmcode.run({ form: 'formBirds' })
    await setup.api.tasks.tasks.bgatlas2008_refresh.run()

    const response = await setup.runActionAsUser(action, {})

    expect(response).toEqual(expect.objectContaining({
      count: 2,
      data: [
        expect.objectContaining({
          count: 1,
          position: 1
        }),
        expect.objectContaining({
          count: 1,
          position: 2
        })
      ]
    }))
  })

  it('shows top 10 users', async () => {
    const cell = await bgatlas2008CellsFactory(setup.api)
    const users = []
    for (let i = 0; i < 11; i++) {
      const user = await userFactory(setup.api)
      users.push(user)
      await formBirdsFactory(setup.api, {
        ...getCenter(cell.coordinates()),
        user: user.email
      })
    }
    await setup.api.tasks.tasks.forms_fill_bgatlas2008_utmcode.run({ form: 'formBirds' })
    await setup.api.tasks.tasks.bgatlas2008_refresh.run()

    const response = await setup.runActionAsUser(action, {})

    expect(response.count).toEqual(users.length)
    expect(response.data).toHaveLength(10)
  })

  it('includes current user even if outside top 10', async () => {
    const cell1 = await bgatlas2008CellsFactory(setup.api)
    const cell2 = await bgatlas2008CellsFactory(setup.api)
    const users = []
    for (let i = 0; i < 11; i++) {
      const user = await userFactory(setup.api)
      users.push(user)
      await formBirdsFactory(setup.api, {
        ...getCenter(cell1.coordinates()),
        user: user.email
      })
      await formBirdsFactory(setup.api, {
        ...getCenter(cell2.coordinates()),
        user: user.email
      })
    }
    const user = await userFactory(setup.api)
    await formBirdsFactory(setup.api, {
      ...getCenter(cell1.coordinates()),
      user: user.email
    })
    await setup.api.tasks.tasks.forms_fill_bgatlas2008_utmcode.run({ form: 'formBirds' })
    await setup.api.tasks.tasks.bgatlas2008_refresh.run()

    const response = await setup.runActionAs(action, {}, user.email)

    expect(response.count).toEqual(users.length + 1)
    expect(response.data).toHaveLength(11)
    expect(response.data).toEqual(expect.arrayContaining([
      {
        count: 1,
        position: users.length + 1,
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName
        }
      }
    ]))
  })

  it('results are ordered by position', async () => {
    const cell1 = await bgatlas2008CellsFactory(setup.api)
    const cell2 = await bgatlas2008CellsFactory(setup.api)

    const user1 = await userFactory(setup.api)
    const user2 = await userFactory(setup.api)
    const user3 = await userFactory(setup.api)

    await formBirdsFactory(setup.api, {
      ...getCenter(cell1.coordinates()),
      user: user1.email
    })

    await formBirdsFactory(setup.api, {
      ...getCenter(cell1.coordinates()),
      user: user2.email
    })
    await formBirdsFactory(setup.api, {
      ...getCenter(cell2.coordinates()),
      user: user2.email
    })

    await formBirdsFactory(setup.api, {
      ...getCenter(cell1.coordinates()),
      user: user3.email
    })

    await setup.api.tasks.tasks.forms_fill_bgatlas2008_utmcode.run({ form: 'formBirds' })
    await setup.api.tasks.tasks.bgatlas2008_refresh.run()

    const response = await setup.runActionAsUser(action, {})

    expect(response).toEqual(expect.objectContaining({
      count: 3,
      data: [
        expect.objectContaining({ position: 1 }),
        expect.objectContaining({ position: 2 }),
        expect.objectContaining({ position: 3 })
      ]
    }))
  })

  it('does not include observer with privacy', async () => {
    const cell = await bgatlas2008CellsFactory(setup.api)
    const user = await userFactory(setup.api, { privacy: 'private' })
    await formBirdsFactory(setup.api, {
      ...getCenter(cell.coordinates()),
      user: user.email
    })
    await setup.api.tasks.tasks.forms_fill_bgatlas2008_utmcode.run({ form: 'formBirds' })
    await setup.api.tasks.tasks.bgatlas2008_refresh.run()

    const response = await setup.runActionAsUser(action, {})

    expect(response).toEqual(expect.objectContaining({
      count: 0,
      data: []
    }))
  })
})

describe('Action: bgatlas2008_update_cell_status', () => {
  const action = 'bgatlas2008_update_cell_status'

  it.each([true, false])('admin can set completed to %s', async (completed) => {
    const cell = await bgatlas2008CellsFactory(setup.api)
    await bgatlas2008CellStatusFactory(setup.api, cell, { completed: !completed })

    const response = await setup.runActionAsAdmin(action, { utm_code: cell.utm_code, completed })

    expect(response).not.toEqual(expect.objectContaining({ error: expect.anything() }))
    expect(response).toEqual(expect.objectContaining({
      data: {
        utm_code: cell.utm_code,
        completed
      }
    }))
  })

  it('birds moderator can set completed to true', async () => {
    const cell = await bgatlas2008CellsFactory(setup.api)
    const response = await setup.runActionAsBirds(action, { utm_code: cell.utm_code, completed: true })

    expect(response).not.toEqual(expect.objectContaining({ error: expect.anything() }))
    expect(response).toEqual(expect.objectContaining({
      data: {
        utm_code: cell.utm_code,
        completed: true
      }
    }))
  })

  it('birds moderator can not set completed to false', async () => {
    const cell = await bgatlas2008CellsFactory(setup.api)
    await bgatlas2008CellStatusFactory(setup.api, cell, { completed: true })

    const response = await setup.runActionAsBirds(action, { utm_code: cell.utm_code, completed: false })

    expect(response).toEqual(expect.objectContaining({
      error: expect.any(String)
    }))
    expect(response.responseHttpCode).toEqual(403)
  })

  it.each([true, false])('user can not set completed to %s', async (completed) => {
    const cell = await bgatlas2008CellsFactory(setup.api)
    await bgatlas2008CellStatusFactory(setup.api, cell, { completed: !completed })

    const response = await setup.runActionAsUser(action, { utm_code: cell.utm_code, completed })

    expect(response).toEqual(expect.objectContaining({
      error: expect.any(String)
    }))
    expect(response.responseHttpCode).toEqual(403)
  })

  it.each([true, false])('guest can not set completed to %s', async (completed) => {
    const cell = await bgatlas2008CellsFactory(setup.api)
    await bgatlas2008CellStatusFactory(setup.api, cell, { completed: !completed })

    const response = await setup.runActionAsGuest(action, { utm_code: cell.utm_code, completed })

    expect(response).toEqual(expect.objectContaining({
      error: expect.any(String)
    }))
    expect(response.responseHttpCode).toEqual(401)
  })
})
