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

describe('bg atlas 2008 cells', () => {
  it('creates records', async () => {
    await setup.api.models.bgatlas2008_cells.create({
      utm_code: 'AA01',
      ...defaultCoords
    }).should.be.resolved()
  })

  it('allows different utm_code', async () => {
    await setup.api.models.bgatlas2008_cells.create({
      utm_code: 'AB01',
      ...defaultCoords
    }).should.be.resolved()
    await setup.api.models.bgatlas2008_cells.create({
      utm_code: 'AB02',
      ...defaultCoords
    }).should.be.resolved()
  })

  it('forbids same same utm_code', async () => {
    await setup.api.models.bgatlas2008_cells.create({
      utm_code: 'AC01',
      ...defaultCoords
    }).should.be.resolved()

    await setup.api.models.bgatlas2008_cells.create({
      utm_code: 'AC01',
      ...defaultCoords
    }).should.rejected()
  })
})
