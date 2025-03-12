/* eslint-env node, jest */
/* globals setup */

const formBirdsFactory = require('../../__utils__/factories/formBirdsFactory')
const fromCbmFactory = require('../../__utils__/factories/formCBMFactory')
const prepareEbpData = (...args) => setup.api.tasks.tasks.ebpUpload.prepareEbpData(...args)

const startDate = new Date('2025-03-01')
const endDate = new Date('2025-03-31')

const baseBirdsRecord = {
  species: 'Accipiter nisus',
  organization: 'bspb',
  sourceEn: 'testSource',
  etrs89GridCode: '10kmE531N239',
  observationDateTime: new Date('2025-03-15T10:15:01Z')
}

describe('upload to EBP task', () => {
  beforeEach(async () => {
    // clean all observations
    await setup.api.models.formBirds.destroy({
      where: {},
      force: true
    })

    await setup.api.models.formCBM.destroy({
      where: {},
      force: true
    })
  })

  it('should upload records from allowed organizations', async () => {
    await formBirdsFactory(setup.api, {
      ...baseBirdsRecord,
      organization: 'bspb'
    })

    await formBirdsFactory(setup.api, {
      ...baseBirdsRecord,
      organization: 'bspb'
    })

    await formBirdsFactory(setup.api, {
      ...baseBirdsRecord,
      organization: 'notAllowedOrg'
    })
    const result = await prepareEbpData(startDate, endDate, 'insert', false)

    expect(result.records).toHaveLength(1)
    expect(result.records[0].count).toBe(2)
  })

  it('should upload records from allowed sources', async () => {
    await formBirdsFactory(setup.api, {
      ...baseBirdsRecord,
      sourceEn: 'testSource'
    })

    await formBirdsFactory(setup.api, {
      ...baseBirdsRecord,
      sourceEn: 'testSource'
    })

    await formBirdsFactory(setup.api, {
      ...baseBirdsRecord,
      sourceEn: 'notAllowedSource'
    })
    const result = await prepareEbpData(startDate, endDate, 'insert', false)

    expect(result.records).toHaveLength(1)
    expect(result.records[0].count).toBe(2)
  })

  it('should not upload records with sensitive species', async () => {
    await formBirdsFactory(setup.api, {
      ...baseBirdsRecord
    })

    await formBirdsFactory(setup.api, {
      ...baseBirdsRecord,
      species: 'Aix sponsa'
    })

    // make species sensitive
    const species = await setup.api.models.species.findOne({
      where: {
        labelLa: 'Aix sponsa'
      }
    })
    species.sensitive = true
    await species.save()

    const result = await prepareEbpData(startDate, endDate, 'insert', false)
    expect(result.records).toHaveLength(1)
  })

  it('should not upload records with missing ebp species code', async () => {
    await formBirdsFactory(setup.api, {
      ...baseBirdsRecord,
      species: 'Acrocephalus agricola'
    })

    const result = await prepareEbpData(startDate, endDate, 'insert', false)
    expect(result.records).toHaveLength(0)
  })

  it('should use ebp species codes', async () => {
    await formBirdsFactory(setup.api, {
      ...baseBirdsRecord,
      species: 'Alle alle'
    })

    const result = await prepareEbpData(startDate, endDate, 'insert', false)
    expect(result.records[0].species_code).toBe(2)
  })

  it('should use ebp status codes', async () => {
    await formBirdsFactory(setup.api, {
      ...baseBirdsRecord,
      speciesStatusEn: '1. Species in nesting habitat'
    })

    const result = await prepareEbpData(startDate, endDate, 'insert', false)
    expect(result.records[0].breeding_code).toBe(1)
  })

  it('should use birds protocol from the settings', async () => {
    await formBirdsFactory(setup.api, {
      ...baseBirdsRecord
    })

    const result = await prepareEbpData(startDate, endDate, 'insert', false)
    expect(result.events[0].protocol_id).toBe('EBP_BIRDS')
  })

  it('should use CBM protocol from the settings', async () => {
    await fromCbmFactory(setup.api, {
      ...baseBirdsRecord
    })

    const result = await prepareEbpData(startDate, endDate, 'insert', false)
    expect(result.events[0].protocol_id).toBe('EBP_CBM')
  })

  it('should not upload records withoud ETRS89 grid code', async () => {
    await formBirdsFactory(setup.api, {
      ...baseBirdsRecord
    })
    await formBirdsFactory(setup.api, {
      ...baseBirdsRecord,
      etrs89GridCode: null
    })

    const result = await prepareEbpData(startDate, endDate, 'insert', false)
    expect(result.records[0].count).toBe(1)
  })

  it('should aggregate events by date', async () => {
    await formBirdsFactory(setup.api, {
      ...baseBirdsRecord,
      observationDateTime: new Date('2025-03-15T10:15:01Z')
    })

    await formBirdsFactory(setup.api, {
      ...baseBirdsRecord,
      observationDateTime: new Date('2025-03-15T10:20:01Z')
    })

    await formBirdsFactory(setup.api, {
      ...baseBirdsRecord,
      observationDateTime: new Date('2025-03-16T10:15:01Z')
    })

    const result = await prepareEbpData(startDate, endDate, 'insert', false)
    expect(result.events).toHaveLength(2)
  })

  it('should aggregate events by etrs89 grid code', async () => {
    await formBirdsFactory(setup.api, {
      ...baseBirdsRecord,
      etrs89GridCode: '1'
    })

    await formBirdsFactory(setup.api, {
      ...baseBirdsRecord,
      etrs89GridCode: '1'
    })

    await formBirdsFactory(setup.api, {
      ...baseBirdsRecord,
      etrs89GridCode: '2'
    })
    const result = await prepareEbpData(startDate, endDate, 'insert', false)
    expect(result.events).toHaveLength(2)
  })

  it('should aggregate records by species ', async () => {
    await formBirdsFactory(setup.api, {
      ...baseBirdsRecord,
      species: 'Accipiter nisus'
    })

    await formBirdsFactory(setup.api, {
      ...baseBirdsRecord,
      species: 'Accipiter nisus'
    })

    await formBirdsFactory(setup.api, {
      ...baseBirdsRecord,
      species: 'Alle alle'
    })

    const result = await prepareEbpData(startDate, endDate, 'insert', false)
    expect(result.records).toHaveLength(2)
  })

  it('should use separate events for CBM and regular birds', async () => {
    await formBirdsFactory(setup.api, {
      ...baseBirdsRecord
    })
    await fromCbmFactory(setup.api, {
      ...baseBirdsRecord
    })

    const result = await prepareEbpData(startDate, endDate, 'insert', false)
    expect(result.events).toHaveLength(2)
  })
})
