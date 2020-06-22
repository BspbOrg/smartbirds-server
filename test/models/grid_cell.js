/* global describe, before, after, it */

const setup = require('../_setup')
require('should')

before(async function () {
  await setup.init()
})

after(async function () {
  await setup.finish()
})

const defaultCoords = {
  lat1: 1,
  lon1: 2,
  lat2: 3,
  lon2: 4,
  lat3: 5,
  lon3: 6,
  lat4: 7,
  lon4: 8
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
