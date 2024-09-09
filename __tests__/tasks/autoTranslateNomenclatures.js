/* eslint-env node, jest */
/* globals setup */

const formBirdsFactory = require('../../__utils__/factories/formBirdsFactory')
const speciesFactory = require('../../__utils__/factories/speciesFactory')

const run = (...args) => setup.api.tasks.tasks.autoTranslateNomenclatures.run(...args)

beforeAll(async () => {
  await setup.api.models.nomenclature.create({
    type: 'birds_age',
    labelEn: 'adult',
    labelBg: 'възрастен'
  })

  await setup.api.models.nomenclature.create({
    type: 'birds_behaviour',
    labelEn: 'singing',
    labelBg: 'пеене'
  })

  await setup.api.models.nomenclature.create({
    type: 'birds_behaviour',
    labelEn: 'feeding',
    labelBg: 'хранене'
  })
})

describe('autoTranslateNomenclatures task', () => {
  it('populates *Local for single choice nomenclature fields when missing', async () => {
    const species = await speciesFactory(setup.api)
    const record = await formBirdsFactory(setup.api, {
      species,
      ageEn: 'adult'
    })

    await run({ form: 'formBirds', id: record.id })

    const reloaded = await record.reload()
    expect(reloaded.dataValues).toEqual(expect.objectContaining({
      ageLocal: 'възрастен'
    }))
  })

  it('populates *Local for multiple choice nomenclature fields when missing', async () => {
    const species = await speciesFactory(setup.api)
    const record = await formBirdsFactory(setup.api, {
      species,
      behaviourEn: 'singing | feeding'
    })

    await run({ form: 'formBirds', id: record.id })

    const reloaded = await record.reload()
    expect(reloaded.dataValues).toEqual(expect.objectContaining({
      behaviourLocal: 'пеене | хранене'
    }))
  })

  it('populates *Local for multiple choice nomenclature fields with single value', async () => {
    const species = await speciesFactory(setup.api)
    const record = await formBirdsFactory(setup.api, {
      species,
      behaviourEn: 'singing'
    })

    await run({ form: 'formBirds', id: record.id })

    const reloaded = await record.reload()
    expect(reloaded.dataValues).toEqual(expect.objectContaining({
      behaviourLocal: 'пеене'
    }))
  })

  it('populates *Lang form fields when add missing translations', async () => {
    const species = await speciesFactory(setup.api)
    const record = await formBirdsFactory(setup.api, {
      species,
      ageEn: 'adult'
    })

    await run({ form: 'formBirds', id: record.id })

    const reloaded = await record.reload()
    expect(reloaded.dataValues).toEqual(expect.objectContaining({
      ageLang: 'bg'
    }))
  })

  it('Set *Local to "|" when nomenclature is not found', async () => {
    const species = await speciesFactory(setup.api)
    const record = await formBirdsFactory(setup.api, {
      species,
      ageEn: 'missing-value'
    })

    await run({ form: 'formBirds', id: record.id })

    const reloaded = await record.reload()
    expect(reloaded.dataValues).toEqual(expect.objectContaining({
      ageLocal: '|'
    }))
  })
})
