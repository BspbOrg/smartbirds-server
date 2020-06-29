/* eslint-env mocha */

const setup = require('../_setup')
const should = require('should')

const autoLocationField = require('../../server/forms/_fields/autoLocation')
const latitudeField = require('../../server/forms/_fields/latitude')
const longitudeField = require('../../server/forms/_fields/longitude')

const modelName = 'formTestAutoLocation'
const tableName = 'testAutoLocation'

describe('Forms:autoLocation', function () {
  before(async function () {
    await setup.init()
  })

  after(async function () {
    await setup.finish()
  })

  const form = {
    modelName,
    tableName,
    fields: {
      ...latitudeField.fields,
      ...longitudeField.fields,
      ...autoLocationField.fields
    }
  }

  before(async function () {
    setup.api.forms.register(form)
    setup.api.models.settlement.create({
      latitude: 1,
      longitude: 1,
      nameEn: 'Settlement 1',
      nameLocal: 'Селище 1',
      nameLang: 'bg'
    })

    await form.model.sync()
  }) // before

  it('form is initialized', async function () {
    should.exists(form)
  })

  it('form.model is initialized', async function () {
    should.exists(form.model)
  })

  it('can create', async function () {
    const response = await setup.runActionAsAdmin(`${modelName}:create`, {
      latitude: 1.23,
      longitude: 2.34
    })
    should.exists(response)
    response.should.not.have.property('error')
    response.should.have.property('data')
  })

  it('task fills autoLocation', async function () {
    const { data: { id, autoLocation: initialAutoLocation } } = await setup.runActionAsAdmin(`${modelName}:create`, {
      latitude: 1,
      longitude: 1
    })
    should(initialAutoLocation).equal(null)

    await setup.api.tasks.tasks.autoLocation.run({ form: modelName, id })

    const { data: { autoLocation } } = await setup.runActionAsAdmin(`${modelName}:view`, { id })
    should(autoLocation).not.equal(null)
  })

  it('resets autoLocation when latitude changes', async function () {
    const { data: { id } } = await setup.runActionAsAdmin(`${modelName}:create`, {
      latitude: 1,
      longitude: 1
    })
    await setup.api.tasks.tasks.autoLocation.run({ form: modelName, id })
    const { data: { autoLocation } } = await setup.runActionAsAdmin(`${modelName}:edit`, { id, latitude: 1.00001 })
    should(autoLocation).equal(null)
  })

  it('resets autoLocation when longitude changes', async function () {
    const { data: { id } } = await setup.runActionAsAdmin(`${modelName}:create`, {
      latitude: 1,
      longitude: 1
    })
    await setup.api.tasks.tasks.autoLocation.run({ form: modelName, id })
    const { data: { autoLocation } } = await setup.runActionAsAdmin(`${modelName}:edit`, { id, longitude: 1.00001 })
    should(autoLocation).equal(null)
  })

  it('task fills autoLocation after reset', async function () {
    const { data: { id } } = await setup.runActionAsAdmin(`${modelName}:create`, {
      latitude: 1,
      longitude: 1
    })
    await setup.api.tasks.tasks.autoLocation.run({ form: modelName, id })
    await setup.runActionAsAdmin(`${modelName}:edit`, { id, latitude: 1.00001, longitude: 1.00001 })
    await setup.api.tasks.tasks.autoLocation.run({ form: modelName, id })

    const { data: { autoLocation } } = await setup.runActionAsAdmin(`${modelName}:view`, { id })
    should(autoLocation).not.equal(null)
  })
})
