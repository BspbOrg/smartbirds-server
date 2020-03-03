/* global describe, before, after, it */

var _ = require('lodash')
var should = require('should')
var setup = require('../_setup')
require('should-sinon')

describe('plants', function () {
  var plantsRecord = {
    latitude: 42.1463749,
    longitude: 24.7492006,
    observationDateTime: new Date('2015-12-10T10:15Z'),
    monitoringCode: 'random_plant_1234',
    species: 'Seseli bulgaricum',
    elevation: 123.45,
    habitat: { label: { local: 'Смесен храсталак', en: 'Mixed shrubs' } },
    accompanyingSpecies: [ 'Scandix australis', 'Rumex acetosa' ],
    reportingUnit: { label: { local: 'Туфа', en: 'Tufa' } },
    phenologicalPhase: { label: { local: 'Развитие на листа', en: 'Leaf development' } },
    count: 123,
    density: 234.56,
    cover: 345.67,
    speciesNotes: 'plants species notes',
    location: 'plants location',

    endDateTime: new Date('2015-12-10T10:15Z'),
    startDateTime: new Date('2015-12-09T08:10Z'),
    observers: 'PLants observers',
    rain: { label: { local: 'Ръми', en: 'Drizzle' } },
    temperature: 24.3,
    windDirection: { label: { local: 'ENE', en: 'ENE' } },
    windSpeed: { label: { local: '2 - Лек бриз', en: '2 - Light breeze' } },
    cloudiness: { label: { local: '33-66%', en: '33-66%' } },
    cloudsType: 'Light grey clouds',
    visibility: 5.5,
    mto: 'pretty nice weather',
    threats: [
      { label: { local: 'Култивация', en: 'Cultivation' } },
      { label: { local: 'Наторяване', en: 'Mulching' } }
    ],
    notes: 'some notes'
  }

  before(async function () {
    await setup.init()
  })

  after(async function () {
    await setup.finish()
  })

  it('can be created', async function () {
    const response = await setup.runActionAsAdmin('formPlants:create', plantsRecord)
    should.exists(response)
    response.should.not.have.property('error')
    response.should.have.property('data')
    response.data.should.have.property('id').not.equal(0)
    response.data.should.containDeepOrdered(plantsRecord)
  })

  it('can be retrieved', async function () {
    const { data: { id } } = await setup.runActionAsAdmin('formPlants:create', plantsRecord)
    response = await setup.runActionAsAdmin('formPlants:view', { id })
    response.should.not.have.property('error')
    response.should.have.property('data')
    response.data.should.containDeepOrdered(plantsRecord)
  })
})
