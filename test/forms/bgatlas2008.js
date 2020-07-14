/* eslint-env mocha */

const setup = require('../_setup')
const should = require('should')
const { getBoundsOfDistance, getCenter } = require('geolib')

const bgatlas2008 = require('../../server/forms/_fields/bgatlas2008')
const latitudeField = require('../../server/forms/_fields/latitude')
const longitudeField = require('../../server/forms/_fields/longitude')
const observationDateTime = require('../../server/forms/_fields/observationDateTime')

const modelName = 'formTestBgAtlas2008'
const tableName = 'testBgAtlas2008'

const center = {
  latitude: 43,
  longitude: 25
}
let bounds
let centerCell

describe('Forms:bgatlas2008', () => {
  before(async function () {
    await setup.init()
    bounds = getBoundsOfDistance(center, setup.api.config.app.bgatlas2008.gridSize * 0.5)
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
      ...bgatlas2008.fields,
      ...observationDateTime.fields
    }
  }

  before(async function () {
    setup.api.forms.register(form)
    await form.model.sync()

    centerCell = await setup.api.models.bgatlas2008_cells.create({
      utm_code: 'CNTR',
      lat1: bounds[0].latitude,
      lon1: bounds[0].longitude,
      lat2: bounds[1].latitude,
      lon2: bounds[0].longitude,
      lat3: bounds[1].latitude,
      lon3: bounds[1].longitude,
      lat4: bounds[0].latitude,
      lon4: bounds[1].longitude
    })
    await setup.api.models.bgatlas2008_cells.create({
      utm_code: 'BTM',
      lat1: bounds[0].latitude - (bounds[1].latitude - bounds[0].latitude),
      lon1: bounds[0].longitude,
      lat2: bounds[0].latitude,
      lon2: bounds[0].longitude,
      lat3: bounds[0].latitude,
      lon3: bounds[1].longitude,
      lat4: bounds[0].latitude - (bounds[1].latitude - bounds[0].latitude),
      lon4: bounds[1].longitude
    })
    await setup.api.models.bgatlas2008_cells.create({
      utm_code: 'TOP',
      lat1: bounds[1].latitude + (bounds[1].latitude - bounds[0].latitude),
      lon1: bounds[0].longitude,
      lat2: bounds[1].latitude,
      lon2: bounds[0].longitude,
      lat3: bounds[1].latitude,
      lon3: bounds[1].longitude,
      lat4: bounds[1].latitude + (bounds[1].latitude - bounds[0].latitude),
      lon4: bounds[1].longitude
    })
    await setup.api.models.bgatlas2008_cells.create({
      utm_code: 'LEFT',
      lat1: bounds[0].latitude,
      lon1: bounds[0].longitude - (bounds[1].longitude - bounds[0].longitude),
      lat2: bounds[0].latitude,
      lon2: bounds[0].longitude - (bounds[1].longitude - bounds[0].longitude),
      lat3: bounds[0].latitude,
      lon3: bounds[0].longitude,
      lat4: bounds[0].latitude,
      lon4: bounds[0].longitude
    })
    await setup.api.models.bgatlas2008_cells.create({
      utm_code: 'RGHT',
      lat1: bounds[0].latitude,
      lon1: bounds[1].longitude,
      lat2: bounds[0].latitude,
      lon2: bounds[1].longitude,
      lat3: bounds[0].latitude,
      lon3: bounds[1].longitude + (bounds[1].longitude - bounds[0].longitude),
      lat4: bounds[0].latitude,
      lon4: bounds[1].longitude + (bounds[1].longitude - bounds[0].longitude)
    })
  }) // before

  beforeEach(async () => {
    setup.api.models[modelName].destroy({ truncate: true, force: true })
  })

  it('form is initialized', async function () {
    should.exists(form)
  })

  it('form.model is initialized', async function () {
    should.exists(form.model)
  })

  it('can create', async function () {
    const response = await setup.runActionAsAdmin(`${modelName}:create`, {
      observationDateTime: Date.now(),
      latitude: 1.23,
      longitude: 2.34
    })
    should.exists(response)
    response.should.not.have.property('error')
    response.should.have.property('data')
  })

  it('task fills utm code when observation is newer', async function () {
    const { data: { id, bgatlas2008UtmCode: initialUtmCode } } = await setup.runActionAsAdmin(`${modelName}:create`, {
      observationDateTime: setup.api.config.app.bgatlas2008.startTimestamp + 1,
      ...center
    })
    should(initialUtmCode).equalOneOf([null, undefined])

    await setup.api.tasks.tasks.forms_fill_bgatlas2008_utmcode.run({ form: modelName })
    const { data: { bgatlas2008UtmCode: utmCode } } = await setup.runActionAsAdmin(`${modelName}:view`, { id })

    should(utmCode).not.equal(null)
  })

  it('task skips when observation is older', async function () {
    const { data: { id, bgatlas2008UtmCode: initialUtmCode } } = await setup.runActionAsAdmin(`${modelName}:create`, {
      observationDateTime: setup.api.config.app.bgatlas2008.startTimestamp - 1,
      ...center
    })
    should(initialUtmCode).equalOneOf([null, undefined])

    await setup.api.tasks.tasks.forms_fill_bgatlas2008_utmcode.run({ form: modelName })
    const { data: { bgatlas2008UtmCode: utmCode } } = await setup.runActionAsAdmin(`${modelName}:view`, { id })

    should(utmCode).equal(null)
  })

  it('task updates utm code when observation is older but forced by id', async function () {
    const { data: { id, bgatlas2008UtmCode: initialUtmCode } } = await setup.runActionAsAdmin(`${modelName}:create`, {
      observationDateTime: setup.api.config.app.bgatlas2008.startTimestamp - 1,
      ...center
    })
    should(initialUtmCode).equalOneOf([null, undefined])

    await setup.api.tasks.tasks.forms_fill_bgatlas2008_utmcode.run({ form: modelName, id })
    const { data: { bgatlas2008UtmCode: utmCode } } = await setup.runActionAsAdmin(`${modelName}:view`, { id })

    should(utmCode).not.equal(null)
  })

  it('resets utm code when latitude changes', async function () {
    const { data: { id } } = await setup.runActionAsAdmin(`${modelName}:create`, {
      observationDateTime: Date.now(),
      ...center
    })
    await setup.api.tasks.tasks.forms_fill_bgatlas2008_utmcode.run({ form: modelName, id })
    const { data: { bgatlas2008UtmCode: utmCode } } = await setup.runActionAsAdmin(`${modelName}:edit`, {
      id,
      latitude: center.latitude + 0.00001
    })
    should(utmCode).equal(null)
  })

  it('resets utm code when longitude changes', async function () {
    const { data: { id } } = await setup.runActionAsAdmin(`${modelName}:create`, {
      observationDateTime: Date.now(),
      ...center
    })
    await setup.api.tasks.tasks.forms_fill_bgatlas2008_utmcode.run({ form: modelName, id })
    const { data: { bgatlas2008UtmCode: utmCode } } = await setup.runActionAsAdmin(`${modelName}:edit`, {
      id,
      longitude: center.longitude + 0.00001
    })
    should(utmCode).equal(null)
  })

  it('resets utm code when observation timestamp changes', async function () {
    const { data: { id } } = await setup.runActionAsAdmin(`${modelName}:create`, {
      observationDateTime: Date.now(),
      ...center
    })
    await setup.api.tasks.tasks.forms_fill_bgatlas2008_utmcode.run({ form: modelName, id })
    const { data: { bgatlas2008UtmCode: utmCode } } = await setup.runActionAsAdmin(`${modelName}:edit`, {
      id,
      observationDateTime: Date.now()
    })
    should(utmCode).equal(null)
  })

  it('task fills utm code after reset', async function () {
    const { data: { id } } = await setup.runActionAsAdmin(`${modelName}:create`, {
      observationDateTime: Date.now(),
      ...center
    })
    await setup.api.tasks.tasks.forms_fill_bgatlas2008_utmcode.run({ form: modelName, id })
    await setup.runActionAsAdmin(`${modelName}:edit`, {
      id,
      observationDateTime: Date.now(),
      latitude: center.latitude + 0.00001,
      longitude: center.longitude + 0.00001
    })
    await setup.api.tasks.tasks.forms_fill_bgatlas2008_utmcode.run({ form: modelName, id })

    const { data: { bgatlas2008UtmCode: utmCode } } = await setup.runActionAsAdmin(`${modelName}:view`, { id })
    should(utmCode).not.equal(null)
  })

  describe('task map utm code', () => {
    it('center point', async function () {
      const { data: { id } } = await setup.runActionAsAdmin(`${modelName}:create`, {
        observationDateTime: Date.now(),
        ...center })

      await setup.api.tasks.tasks.forms_fill_bgatlas2008_utmcode.run({ form: modelName, id })
      const { data: { bgatlas2008UtmCode: utmCode } } = await setup.runActionAsAdmin(`${modelName}:view`, { id })

      should(utmCode).equal('CNTR')
    })

    it('top geo center point', async function () {
      const { data: { id } } = await setup.runActionAsAdmin(`${modelName}:create`, {
        observationDateTime: Date.now(),
        ...getCenter([centerCell.coordinates()[1], centerCell.coordinates()[2]])
      })

      await setup.api.tasks.tasks.forms_fill_bgatlas2008_utmcode.run({ form: modelName, id })
      const { data: { bgatlas2008UtmCode: utmCode } } = await setup.runActionAsAdmin(`${modelName}:view`, { id })

      should(utmCode).equal('TOP')
    })

    it('top center point', async function () {
      const { data: { id } } = await setup.runActionAsAdmin(`${modelName}:create`, {
        observationDateTime: Date.now(),
        latitude: bounds[1].latitude,
        longitude: center.longitude
      })

      await setup.api.tasks.tasks.forms_fill_bgatlas2008_utmcode.run({ form: modelName, id })
      const { data: { bgatlas2008UtmCode: utmCode } } = await setup.runActionAsAdmin(`${modelName}:view`, { id })

      should(utmCode).equal('TOP')
    })

    it('bottom geo center point', async function () {
      const { data: { id } } = await setup.runActionAsAdmin(`${modelName}:create`, {
        observationDateTime: Date.now(),
        ...getCenter([centerCell.coordinates()[3], centerCell.coordinates()[0]])
      })

      await setup.api.tasks.tasks.forms_fill_bgatlas2008_utmcode.run({ form: modelName, id })
      const { data: { bgatlas2008UtmCode: utmCode } } = await setup.runActionAsAdmin(`${modelName}:view`, { id })

      should(utmCode).equal('CNTR')
    })

    it('bottom center point', async function () {
      const { data: { id } } = await setup.runActionAsAdmin(`${modelName}:create`, {
        observationDateTime: Date.now(),
        latitude: bounds[0].latitude,
        longitude: center.longitude
      })

      await setup.api.tasks.tasks.forms_fill_bgatlas2008_utmcode.run({ form: modelName, id })
      const { data: { bgatlas2008UtmCode: utmCode } } = await setup.runActionAsAdmin(`${modelName}:view`, { id })

      should(utmCode).equal('CNTR')
    })

    it('left geo center point', async function () {
      const { data: { id } } = await setup.runActionAsAdmin(`${modelName}:create`, {
        observationDateTime: Date.now(),
        ...getCenter([centerCell.coordinates()[0], centerCell.coordinates()[1]])
      })

      await setup.api.tasks.tasks.forms_fill_bgatlas2008_utmcode.run({ form: modelName, id })
      const { data: { bgatlas2008UtmCode: utmCode } } = await setup.runActionAsAdmin(`${modelName}:view`, { id })

      should(utmCode).equal('CNTR')
    })

    it('left center point', async function () {
      const { data: { id } } = await setup.runActionAsAdmin(`${modelName}:create`, {
        observationDateTime: Date.now(),
        latitude: center.latitude,
        longitude: bounds[0].longitude
      })

      await setup.api.tasks.tasks.forms_fill_bgatlas2008_utmcode.run({ form: modelName, id })
      const { data: { bgatlas2008UtmCode: utmCode } } = await setup.runActionAsAdmin(`${modelName}:view`, { id })

      should(utmCode).equal('CNTR')
    })

    it('right geo center point', async function () {
      const { data: { id } } = await setup.runActionAsAdmin(`${modelName}:create`, {
        observationDateTime: Date.now(),
        ...getCenter([centerCell.coordinates()[2], centerCell.coordinates()[3]])
      })

      await setup.api.tasks.tasks.forms_fill_bgatlas2008_utmcode.run({ form: modelName, id })
      const { data: { bgatlas2008UtmCode: utmCode } } = await setup.runActionAsAdmin(`${modelName}:view`, { id })

      should(utmCode).equal('CNTR')
    })

    it('right center point', async function () {
      const { data: { id } } = await setup.runActionAsAdmin(`${modelName}:create`, {
        observationDateTime: Date.now(),
        latitude: center.latitude,
        longitude: bounds[1].longitude
      })

      await setup.api.tasks.tasks.forms_fill_bgatlas2008_utmcode.run({ form: modelName, id })
      const { data: { bgatlas2008UtmCode: utmCode } } = await setup.runActionAsAdmin(`${modelName}:view`, { id })

      should(utmCode).equal('CNTR')
    })

    it('top left point', async function () {
      const { data: { id } } = await setup.runActionAsAdmin(`${modelName}:create`, {
        observationDateTime: Date.now(),
        ...centerCell.coordinates()[1]
      })

      await setup.api.tasks.tasks.forms_fill_bgatlas2008_utmcode.run({ form: modelName, id })
      const { data: { bgatlas2008UtmCode: utmCode } } = await setup.runActionAsAdmin(`${modelName}:view`, { id })

      should(utmCode).equal('CNTR')
    })

    it('top right point', async function () {
      const { data: { id } } = await setup.runActionAsAdmin(`${modelName}:create`, {
        observationDateTime: Date.now(),
        ...centerCell.coordinates()[2]
      })

      await setup.api.tasks.tasks.forms_fill_bgatlas2008_utmcode.run({ form: modelName, id })
      const { data: { bgatlas2008UtmCode: utmCode } } = await setup.runActionAsAdmin(`${modelName}:view`, { id })

      should(utmCode).equal('CNTR')
    })

    it('bottom left point', async function () {
      const { data: { id } } = await setup.runActionAsAdmin(`${modelName}:create`, {
        observationDateTime: Date.now(),
        ...centerCell.coordinates()[0]
      })

      await setup.api.tasks.tasks.forms_fill_bgatlas2008_utmcode.run({ form: modelName, id })
      const { data: { bgatlas2008UtmCode: utmCode } } = await setup.runActionAsAdmin(`${modelName}:view`, { id })

      should(utmCode).equal('BTM')
    })

    it('bottom right point', async function () {
      const { data: { id } } = await setup.runActionAsAdmin(`${modelName}:create`, {
        observationDateTime: Date.now(),
        ...centerCell.coordinates()[3]
      })

      await setup.api.tasks.tasks.forms_fill_bgatlas2008_utmcode.run({ form: modelName, id })
      const { data: { bgatlas2008UtmCode: utmCode } } = await setup.runActionAsAdmin(`${modelName}:view`, { id })

      should(utmCode).equal('BTM')
    })
  })
})
