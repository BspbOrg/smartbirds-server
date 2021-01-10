/* eslint-env node, jest */
/* globals setup */

const { getCenter } = require('geolib')

const bgatlas2008CellsFactory = require('../__utils__/factories/bgatlas2008CellsFactory')

describe('Test duplicates', () => {
  const baseBirdsRecord = {
    latitude: '42.15363691135553',
    longitude: '24.749765843153003',
    observationDateTime: '2021-01-08T08:13:11.000Z',
    monitoringCode: '20210108-063548-1d266a5125d1',
    startDateTime: '2021-01-08T06:35:49.000Z',
    endDateTime: '2021-01-08T08:13:21.000Z',
    threats: [],
    source: {
      label: {
        en: 'Single observations'
      }
    },
    species: 'Alectoris graeca',
    confidential: false,
    countUnit: {
      label: {
        en: 'Individuals'
      }
    },
    typeUnit: {
      label: {
        en: 'Exact number'
      }
    },
    count: '3',
    countMin: '0',
    countMax: '0',
    behaviour: [],
    brooding: false,
    nestProtected: false,
    moderatorReview: false,
    pictures: []
  }

  beforeEach(async () => {
    setup.api.models.formBirds.destroy({ where: {}, force: true })
  })

  it('should not duplicate simple birds record before bgatlas task', async () => {
    const birdsRecord = {
      ...baseBirdsRecord
    }

    const response1 = await setup.runActionAsUser('formBirds:create', birdsRecord)
    expect(response1.existing).toBeFalsy()
    expect(response1.error).toBeFalsy()

    const response2 = await setup.runActionAsUser('formBirds:create', birdsRecord)
    expect(response2.data.id).toEqual(response1.data.id)
    expect(response2.existing).toBeTruthy()
  })

  it('should not duplicate simple birds record after saving', async () => {
    const birdsRecord = {
      ...baseBirdsRecord
    }

    const response1 = await setup.runActionAsUser('formBirds:create', birdsRecord)
    expect(response1.existing).toBeFalsy()
    expect(response1.error).toBeFalsy()

    const response2 = await setup.runActionAsUser('formBirds:edit', response1.data)
    expect(response2.error).toBeFalsy()

    const response3 = await setup.runActionAsUser('formBirds:create', birdsRecord)
    expect(response3.data.id).toEqual(response1.data.id)
    expect(response3.existing).toBeTruthy()
  })

  it('should not duplicate simple birds record after loading and saving', async () => {
    const birdsRecord = {
      ...baseBirdsRecord
    }

    const response1 = await setup.runActionAsUser('formBirds:create', birdsRecord)
    expect(response1.existing).toBeFalsy()
    expect(response1.error).toBeFalsy()

    const response2 = await setup.runActionAsUser('formBirds:view', { id: response1.data.id })
    expect(response2.data).toBeTruthy()
    expect(response2.error).toBeFalsy()

    const response3 = await setup.runActionAsUser('formBirds:edit', response2.data)
    expect(response3.error).toBeFalsy()

    const response4 = await setup.runActionAsUser('formBirds:create', birdsRecord)
    expect(response4.data.id).toEqual(response1.data.id)
    expect(response4.existing).toBeTruthy()
  })

  it('should not duplicate simple birds record after bgatlas task', async () => {
    const cell = await bgatlas2008CellsFactory(setup.api)
    const birdsRecord = {
      ...baseBirdsRecord,
      ...getCenter(cell.coordinates())
    }

    const response1 = await setup.runActionAsUser('formBirds:create', birdsRecord)
    expect(response1.existing).toBeFalsy()
    expect(response1.error).toBeFalsy()

    await setup.api.tasks.tasks.forms_fill_bgatlas2008_utmcode.run({ form: 'formBirds' })
    await setup.api.tasks.tasks.bgatlas2008_refresh.run()

    const response2 = await setup.runActionAsUser('formBirds:create', birdsRecord)
    expect(response2.data.id).toEqual(response1.data.id)
    expect(response2.existing).toBeTruthy()
  })

  it('should not duplicate simple birds record after autolocation task', async () => {
    const birdsRecord = {
      ...baseBirdsRecord
    }

    const response1 = await setup.runActionAsUser('formBirds:create', birdsRecord)
    expect(response1.existing).toBeFalsy()
    expect(response1.error).toBeFalsy()

    await setup.api.tasks.tasks.autoLocation.run({ form: 'formBirds' })

    const response2 = await setup.runActionAsUser('formBirds:create', birdsRecord)
    expect(response2.data.id).toEqual(response1.data.id)
    expect(response2.existing).toBeTruthy()
  })
})
