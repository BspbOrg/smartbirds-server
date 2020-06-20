/* global describe, before, after, it */

const setup = require('./_setup')
const should = require('should')

before(async function () {
  await setup.init()
})

after(async function () {
  await setup.finish()
})

const defaultCoords = {
  v1Latitude: 1,
  v1Longitude: 2,
  v2Latitude: 3,
  v2Longitude: 4,
  v3Latitude: 5,
  v3Longitude: 6,
  v4Latitude: 7,
  v4Longitude: 8
}

describe('grid cells', () => {
  it('creates records', async () => {
    await setup.api.models.grid_cell.create({
      gridId: 'grid1',
      cellId: 'cell1',
      ...defaultCoords
    }).should.be.resolved()
  })

  it('allows same gridId different cellId', async () => {
    await setup.api.models.grid_cell.create({
      gridId: 'grid2',
      cellId: 'cell1',
      ...defaultCoords
    }).should.be.resolved()
    await setup.api.models.grid_cell.create({
      gridId: 'grid2',
      cellId: 'cell2',
      ...defaultCoords
    }).should.be.resolved()
  })

  it('allows different gridId same cellId', async () => {
    await setup.api.models.grid_cell.create({
      gridId: 'grid3',
      cellId: 'cell1',
      ...defaultCoords
    }).should.be.resolved()
    await setup.api.models.grid_cell.create({
      gridId: 'grid4',
      cellId: 'cell1',
      ...defaultCoords
    }).should.be.resolved()
  })

  it('forbids same gridId and same cellId', async () => {
    await setup.api.models.grid_cell.create({
      gridId: 'grid5',
      cellId: 'cell1',
      ...defaultCoords
    }).should.be.resolved()

    await setup.api.models.grid_cell.create({
      gridId: 'grid5',
      cellId: 'cell1',
      ...defaultCoords
    }).should.rejected()
  })
})
