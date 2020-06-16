/* global describe, before, after, it */

const setup = require('../_setup')
const should = require('should')

describe('Forms:moderatorReview', function () {
  before(async function () {
    await setup.init()
  })

  after(async function () {
    await setup.finish()
  })

  const form = {
    modelName: 'formTestCounts',
    tableName: 'testCounts',
    fields: {
      observationDateTime: {
        type: 'text',
        uniqueHash: true
      }
    }
  }

  before(async function () {
    setup.api.forms.register(form)

    await form.model.sync()
  }) // before

  it('form is initialized', async function () {
    should.exists(form)
  })

  it('form.model is initialized', async function () {
    should.exists(form.model)
  })

  it('can create', async function () {
    const response = await setup.runActionAsAdmin('formTestCounts:create', {})
    should.exists(response)
    response.should.not.have.property('error')
    response.should.have.property('data')
  })

  it('returns only count', async function () {
    await setup.runActionAsAdmin('formTestCounts:create', {})

    const response = await setup.runActionAsAdmin('formTestCounts:list', { context: 'count' })
    should.exists(response)
    response.should.not.have.property('error')
    response.should.not.have.property('data')
    response.should.have.property('count').and.it.is.equal(1)
  })
})
