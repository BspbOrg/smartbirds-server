/* global describe, before, after, it */

const setup = require('../_setup')
const should = require('should')

const testModels = []

before(async function () {
  await setup.init()

  testModels.push(await setup.api.models.grid_cell.create({
    gridId: 'utmGridBg10km',
    cellId: 'test-cell',
    lat1: 1,
    lon1: 1,
    lat2: 2,
    lon2: 1,
    lat3: 2,
    lon3: 2,
    lat4: 1,
    lon4: 2
  }))
  testModels.push(await setup.api.models.species.create({
    type: 'birds',
    labelLa: 'test-bird-1',
    labelEn: 'Test bird'
  }))
  testModels.push(await setup.api.models.species.create({
    type: 'birds',
    labelLa: 'test-bird-2',
    labelEn: 'Test birdi'
  }))
  testModels.push(await setup.api.models.species.create({
    type: 'birds',
    labelLa: 'test-bird-3',
    labelEn: 'Test birdi'
  }))
  testModels.push(await setup.api.models.species.create({
    type: 'birds',
    labelLa: 'test-bird-4',
    labelEn: 'Test birdi'
  }))
})

after(async function () {
  await Promise.all(testModels.map((model) => model.destroy({ force: true })))

  await setup.finish()
})

describe('bg atlas 2008', () => {
  it('creates records', async () => {
    await setup.api.models.bgAtlas2008.create({
      cellId: 'test-cell',
      species: 'test-bird-1'
    }).should.be.resolved()
  })

  it('forbids same cellId and same species', async () => {
    await setup.api.models.bgAtlas2008.create({
      cellId: 'test-cell',
      species: 'test-bird-2'
    }).should.be.resolved()

    await setup.api.models.bgAtlas2008.create({
      cellId: 'test-cell',
      species: 'test-bird-2'
    }).should.rejected()
  })

  it('loads grid cell', async () => {
    const model = await setup.api.models.bgAtlas2008.create({
      cellId: 'test-cell',
      species: 'test-bird-3'
    })

    const cell = await model.getCell()
    should(cell).not.equal(null)
  })

  it('loads species info', async () => {
    const model = await setup.api.models.bgAtlas2008.create({
      cellId: 'test-cell',
      species: 'test-bird-4'
    })

    const speciesInfo = await model.getSpeciesInfo()
    should(speciesInfo).not.equal(null)
  })
})
