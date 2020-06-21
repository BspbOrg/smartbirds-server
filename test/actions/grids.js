/* global after, before, describe, it */

const should = require('should')

const setup = require('../_setup')

const gridId = 'testGrid'

function isDR (rec) { return rec.cellId === 'DR' }

function isDL (rec) { return rec.cellId === 'DL' }

function isUR (rec) { return rec.cellId === 'UR' }

function isUL (rec) { return rec.cellId === 'UL' }

describe('Action grids:cells:list', () => {
  before(async () => {
    await setup.init()

    // 4 locations each within range with different vertex
    await setup.api.models.grid_cell.create({ // eslint-disable-next-line object-property-newline
      gridId, cellId: 'DR', // eslint-disable-next-line object-property-newline
      v1Latitude: 1.01, v1Longitude: 1.02, // eslint-disable-next-line object-property-newline
      v2Latitude: 2.01, v2Longitude: 1.02, // eslint-disable-next-line object-property-newline
      v3Latitude: 2.01, v3Longitude: 2.02, // eslint-disable-next-line object-property-newline
      v4Latitude: 1.01, v4Longitude: 2.02
    })
    await setup.api.models.grid_cell.create({ // eslint-disable-next-line object-property-newline
      gridId, cellId: 'DL', // eslint-disable-next-line object-property-newline
      v1Latitude: 0.01, v1Longitude: 1.02, // eslint-disable-next-line object-property-newline
      v2Latitude: 1.01, v2Longitude: 1.02, // eslint-disable-next-line object-property-newline
      v3Latitude: 1.01, v3Longitude: 2.02, // eslint-disable-next-line object-property-newline
      v4Latitude: 0.01, v4Longitude: 2.02
    })
    await setup.api.models.grid_cell.create({ // eslint-disable-next-line object-property-newline
      gridId, cellId: 'UR', // eslint-disable-next-line object-property-newline
      v1Latitude: 1.01, v1Longitude: 0.02, // eslint-disable-next-line object-property-newline
      v2Latitude: 2.01, v2Longitude: 0.02, // eslint-disable-next-line object-property-newline
      v3Latitude: 2.01, v3Longitude: 1.02, // eslint-disable-next-line object-property-newline
      v4Latitude: 1.01, v4Longitude: 1.02
    })
    await setup.api.models.grid_cell.create({ // eslint-disable-next-line object-property-newline
      gridId, cellId: 'UL', // eslint-disable-next-line object-property-newline
      v1Latitude: 0.01, v1Longitude: 0.02, // eslint-disable-next-line object-property-newline
      v2Latitude: 1.01, v2Longitude: 0.02, // eslint-disable-next-line object-property-newline
      v3Latitude: 1.01, v3Longitude: 1.02, // eslint-disable-next-line object-property-newline
      v4Latitude: 0.01, v4Longitude: 1.02
    })
  })

  after(async () => {
    await setup.finish()
  })

  it('lists locations within range', async () => {
    const response = await setup.runActionAsAdmin('grids:cells:list', {
      gridId,
      fromLat: '-10',
      toLat: '10',
      fromLon: '-10',
      toLon: '10'
    })

    response.should.not.have.property('error')
    response.should.have.property('data').which.is.an.Array().and.is.not.empty()
    response.data.should.matchAny(isDR)
    response.data.should.matchAny(isDL)
    response.data.should.matchAny(isUR)
    response.data.should.matchAny(isUL)
  })

  it('excludes locations above range', async () => {
    const response = await setup.runActionAsAdmin('grids:cells:list', {
      gridId,
      fromLat: '0.5',
      toLat: '1.5',
      fromLon: '1.75',
      toLon: '2.12'
    })

    response.should.not.have.property('error')
    response.should.have.property('data').which.is.an.Array().and.is.not.empty()
    response.data.should.matchAny(isDR)
    response.data.should.matchAny(isDL)
    response.data.should.not.matchAny(isUR)
    response.data.should.not.matchAny(isUL)
  })

  it('excludes locations bellow range', async () => {
    const response = await setup.runActionAsAdmin('grids:cells:list', {
      gridId,
      fromLat: '0.5',
      toLat: '1.5',
      fromLon: '-0.75',
      toLon: '0.12'
    })

    response.should.not.have.property('error')
    response.should.have.property('data').which.is.an.Array().and.is.not.empty()
    response.data.should.not.matchAny(isDR)
    response.data.should.not.matchAny(isDL)
    response.data.should.matchAny(isUR)
    response.data.should.matchAny(isUL)
  })

  it('excludes locations left of range', async () => {
    const response = await setup.runActionAsAdmin('grids:cells:list', {
      gridId,
      fromLat: '1.5',
      toLat: '2.5',
      fromLon: '0.75',
      toLon: '1.12'
    })

    response.should.not.have.property('error')
    response.should.have.property('data').which.is.an.Array().and.is.not.empty()
    response.data.should.matchAny(isDR)
    response.data.should.not.matchAny(isDL)
    response.data.should.matchAny(isUR)
    response.data.should.not.matchAny(isUL)
  })

  it('excludes locations right of range', async () => {
    const response = await setup.runActionAsAdmin('grids:cells:list', {
      gridId,
      fromLat: '-0.5',
      toLat: '0.5',
      fromLon: '0.75',
      toLon: '1.12'
    })

    response.should.not.have.property('error')
    response.should.have.property('data').which.is.an.Array().and.is.not.empty()
    response.data.should.not.matchAny(isDR)
    response.data.should.matchAny(isDL)
    response.data.should.not.matchAny(isUR)
    response.data.should.matchAny(isUL)
  })

  it('excludes locations from different grid', async () => {
    const response = await setup.runActionAsAdmin('grids:cells:list', {
      gridId: `not-${gridId}`,
      fromLat: '-0.5',
      toLat: '0.5',
      fromLon: '0.75',
      toLon: '1.12'
    })

    response.should.not.have.property('error')
    response.should.have.property('data').which.is.an.Array().and.is.empty()
  })
})
