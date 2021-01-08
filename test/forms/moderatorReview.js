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
    modelName: 'formTestModeratorReview',
    tableName: 'testModeratorReview',
    fields: {
      observationDateTime: {
        type: 'text',
        uniqueHash: true
      },
      moderatorReview: 'boolean'
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

  it('field persists and restores', async function () {
    let response

    response = await setup.runActionAsAdmin('formTestModeratorReview:create', {
      moderatorReview: true
    })
    should.exists(response)
    response.should.not.have.property('error')
    response.should.have.property('data')
    response.data.should.have.property('moderatorReview').and.it.is.equal(true)

    response = await setup.runActionAsAdmin('formTestModeratorReview:create', {
      moderatorReview: false
    })
    should.exists(response)
    response.should.not.have.property('error')
    response.should.have.property('data')
    response.data.should.have.property('moderatorReview').and.it.is.equal(false)

    response = await setup.runActionAsAdmin('formTestModeratorReview:create', {})
    should.exists(response)
    response.should.not.have.property('error')
    response.should.have.property('data')
    response.data.should.have.property('moderatorReview').and.it.is.equal(false)
  })

  it('filters', async function () {
    const falseResponse = await setup.runActionAsAdmin('formTestModeratorReview:create', {
      observationDateTime: '1',
      moderatorReview: false
    })
    falseResponse.should.not.have.property('error')
    const falseRecord = falseResponse.data
    const trueResponse = await setup.runActionAsAdmin('formTestModeratorReview:create', {
      observationDateTime: '2',
      moderatorReview: true
    })
    trueResponse.should.not.have.property('error')
    const trueRecord = trueResponse.data

    const response = await setup.runActionAsAdmin('formTestModeratorReview:list', { moderatorReview: '1' })
    should.exists(response)
    response.should.not.have.property('error')
    response.should.have.property('data')
    response.data.should.matchAny(function matchFieldTrueId (rec) { return rec.id === trueRecord.id })
    response.data.should.not.matchAny((rec) => rec.id === falseRecord.id)
  })
})
