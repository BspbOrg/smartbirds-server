/* global describe, before, after, it */

const setup = require('../_setup')
const should = require('should')

before(async function () {
  await setup.init()
  await setup.api.models.bgatlas2008_observed.destroy({ force: true, truncate: true })
})

after(async function () {
  await setup.api.models.bgatlas2008_observed.destroy({ force: true, truncate: true })
  await setup.finish()
})

describe('bg atlas 2008 observed', () => {
  it.only('creates records', async () => {
    await setup.api.models.bgatlas2008_observed.create({
      utm_code: 'TEST',
      species: 'test-bird-1',
      user_id: 1
    }).should.be.resolved()
  })

  it('forbids same utm_code, same species and same user', async () => {
    await setup.api.models.bgatlas2008_observed.create({
      utm_code: 'TEST',
      species: 'test-bird-1',
      user_id: 1
    }).should.be.resolved()

    await setup.api.models.bgatlas2008_observed.create({
      utm_code: 'TEST',
      species: 'test-bird-1',
      user_id: 1
    }).should.rejected()
  })
})
