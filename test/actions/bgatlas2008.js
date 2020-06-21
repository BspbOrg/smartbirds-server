/* global after, before, describe, it */

const should = require('should')

const setup = require('../_setup')

function isDR (rec) { return rec.utm_code === 'DR' }

function isDL (rec) { return rec.utm_code === 'DL' }

function isUR (rec) { return rec.utm_code === 'UR' }

function isUL (rec) { return rec.utm_code === 'UL' }

describe('Action bgatlas2008_cells_list', () => {
  before(async () => {
    await setup.init()

    // 4 locations each within range with different vertex
    await setup.api.models.bgatlas2008_cells.create({ // eslint-disable-next-line object-property-newline
      utm_code: 'DR', // eslint-disable-next-line object-property-newline
      lat1: 1.01, lon1: 1.02, // eslint-disable-next-line object-property-newline
      lat2: 2.01, lon2: 1.02, // eslint-disable-next-line object-property-newline
      lat3: 2.01, lon3: 2.02, // eslint-disable-next-line object-property-newline
      lat4: 1.01, lon4: 2.02
    })
    await setup.api.models.bgatlas2008_cells.create({ // eslint-disable-next-line object-property-newline
      utm_code: 'DL', // eslint-disable-next-line object-property-newline
      lat1: 0.01, lon1: 1.02, // eslint-disable-next-line object-property-newline
      lat2: 1.01, lon2: 1.02, // eslint-disable-next-line object-property-newline
      lat3: 1.01, lon3: 2.02, // eslint-disable-next-line object-property-newline
      lat4: 0.01, lon4: 2.02
    })
    await setup.api.models.bgatlas2008_cells.create({ // eslint-disable-next-line object-property-newline
      utm_code: 'UR', // eslint-disable-next-line object-property-newline
      lat1: 1.01, lon1: 0.02, // eslint-disable-next-line object-property-newline
      lat2: 2.01, lon2: 0.02, // eslint-disable-next-line object-property-newline
      lat3: 2.01, lon3: 1.02, // eslint-disable-next-line object-property-newline
      lat4: 1.01, lon4: 1.02
    })
    await setup.api.models.bgatlas2008_cells.create({ // eslint-disable-next-line object-property-newline
      utm_code: 'UL', // eslint-disable-next-line object-property-newline
      lat1: 0.01, lon1: 0.02, // eslint-disable-next-line object-property-newline
      lat2: 1.01, lon2: 0.02, // eslint-disable-next-line object-property-newline
      lat3: 1.01, lon3: 1.02, // eslint-disable-next-line object-property-newline
      lat4: 0.01, lon4: 1.02
    })
  })

  after(async () => {
    await setup.finish()
  })

  it('lists locations within range', async () => {
    const response = await setup.runActionAsAdmin('bgatlas2008_cells_list', {
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
    const response = await setup.runActionAsAdmin('bgatlas2008_cells_list', {
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
    const response = await setup.runActionAsAdmin('bgatlas2008_cells_list', {
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
    const response = await setup.runActionAsAdmin('bgatlas2008_cells_list', {
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
    const response = await setup.runActionAsAdmin('bgatlas2008_cells_list', {
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
})
