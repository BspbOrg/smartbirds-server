/* global describe, before, after, it */

var _ = require('lodash')
var should = require('should')
var setup = require('../_setup')
require('should-sinon')

describe('Action formCiconia:', function () {
  var ciconiaRecord = {
    latitude: 42.1463749,
    longitude: 24.7492006,
    observationDateTime: '2016-12-20T12:15Z',
    monitoringCode: 'random_ciconia_1234',
    primarySubstrateType: {
      type: 'ciconia_substratum',
      label: {
        bg: 'ciconia_substratum',
        en: 'ciconia_substratum'
      }

    },
    electricityPole: {
      type: 'ciconia_column',
      label: {
        bg: 'Imm.',
        en: 'Imm.'
      }
    },
    typeElectricityPole: {
      type: 'ciconia_column_type',
      label: {
        bg: 'ciconia_column_type',
        en: 'ciconia_column_type'
      }
    },
    nestOnArtificialHumanMadePlatform: true,
    nestIsOnAnotherTypeOfSubstrate: 'blah blah',
    nestThisYearNotUtilizedByWhiteStorks: {
      type: 'ciconia_not_occupied',
      label: {
        bg: 'ciconia_not_occupied',
        en: 'ciconia_not_occupied'
      }
    },
    approximateDateStorksAppeared: '2015-03-10T12:15Z',
    approximateDateDisappearanceWhiteStorks: '2015-08-10T12:15Z',
    countJuvenilesInNest: 3,
    nestNotUsedForOverOneYear: 1,
    dataOnJuvenileMortalityFromElectrocutions: 1,
    dataOnJuvenilesExpelledFromParents: 1,
    diedOtherReasons: 23,
    reason: 'some reason',
    speciesNotes: 'some notes text',
    location: 'location somewhere',

    endDateTime: '2015-12-10T10:15Z',
    startDateTime: '2015-12-09T08:10Z',
    observers: 'Some test observers',
    rain: {
      type: 'main_rain',
      label: {
        bg: 'Ръми',
        en: 'Drizzle'
      }
    },
    temperature: 24.3,
    windDirection: {
      type: 'main_wind_direction',
      label: {
        bg: 'ENE',
        en: 'ENE'
      }
    },
    windSpeed: {
      type: 'main_wind_force',
      label: {
        bg: '2 - Лек бриз',
        en: '2 - Light breeze'
      }
    },
    cloudiness: {
      type: 'main_cloud_level',
      label: {
        bg: '33-66%',
        en: '33-66%'
      }
    },
    cloudsType: 'Light grey clouds',
    visibility: 5.5,
    mto: 'pretty nice weather',
    threats: [
      {
        type: 'main_threats',
        label: {
          bg: 'Култивация',
          en: 'Cultivation'
        }
      },
      {
        type: 'main_threats',
        label: {
          bg: 'Наторяване',
          en: 'Mulching'
        }
      }
    ],
    notes: 'some notes'
  }

  before(function () {
    return setup.init()
  })

  after(function () {
    return setup.finish()
  })

  describe('Guest user', function () {
    setup.describeAsGuest(function (runAction) {
      it('fails to create Ciconia record', function () {
        return runAction('formCiconia:create', ciconiaRecord).then(function (response) {
          response.error.should.be.equal('Error: Please log in to continue')
        })
      })
    })
  }) // Guest user

  setup.describeAsAuth(function (runAction) {
    describe('fails to create without', function () {
      var required = ['latitude', 'longitude', 'observationDateTime', 'monitoringCode',
        'endDateTime', 'startDateTime', 'location']

      required.forEach(function (property) {
        it(property, function () {
          var reqCiconiaObj = _.cloneDeep(ciconiaRecord)
          delete reqCiconiaObj[property]
          return runAction('formCiconia:create', reqCiconiaObj).then(function (response) {
            response.error.should.be.equal('Error: actionhero.errors.missingParams')
          })
        })
      })
    }) // fails to create without

    describe('CREATE', function () {
      it('creates Ciconia record', function () {
        return runAction('formCiconia:create', ciconiaRecord).then(function (response) {
          should.not.exist(response.error)
          response.data.id.should.be.greaterThan(0)
        })
      })

      it('attaches the user created the record', function () {
        return runAction('formCiconia:create', ciconiaRecord).then(function (response) {
          should.not.exist(response.error)
          response.data.user.should.be.equal(response.requesterUser.id)
        })
      })
    })
  }) // describeAsAuth

  describe('Get Ciconia record by id', function () {
    var ciconiaId

    before(function () {
      return setup.runActionAsUser2('formCiconia:create', ciconiaRecord).then(function (response) {
        ciconiaId = response.data.id
      })
    })

    it('is allowed if the requester user is the submitter', function () {
      return setup.runActionAsUser2('formCiconia:view', {id: ciconiaId}).then(function (response) {
        response.should.not.have.property('error')
        response.should.have.property('data')
      })
    })

    it('should return the correct row', function () {
      return setup.runActionAsUser2('formCiconia:view', {id: ciconiaId}).then(function (response) {
        response.should.not.have.property('error')
        response.data.id.should.be.equal(ciconiaId)
      })
    })

    setup.describeAsAdmin(function (runAction) {
      it('is allowed if the requester user is admin', function () {
        return runAction('formCiconia:view', {id: ciconiaId}).then(function (response) {
          response.should.not.have.property('error')
          response.should.have.property('data')
        })
      })
    })

    setup.describeAsUser(function (runAction) {
      it('is not allowed if the requester user is not the submitter', function () {
        return runAction('formCiconia:view', {id: ciconiaId}).then(function (response) {
          response.should.have.property('error').and.not.empty()
        })
      })
    })

    setup.describeAsGuest(function (runAction) {
      it('is not allowed if the requester is guest  user', function () {
        return runAction('formCiconia:view', {id: ciconiaId}).then(function (response) {
          response.should.have.property('error').and.not.empty()
        })
      })
    })
  }) // Get ciconia record by id

  describe('given some ciconia rows:', function () {
    setup.describeAsUser(function (runAction) {
      it('is allowed to list only his records', function () {
        return runAction('formCiconia:list', {}).then(function (response) {
          response.should.not.have.property('error')
          response.should.have.property('data').not.empty().instanceOf(Array)
          response.should.have.property('count').and.be.greaterThan(0)

          for (var i = 0; i < response.data.length; i++) {
            response.data[i].should.have.property('user')
            response.data[i].should.not.be.empty()
            response.data[i].user.should.be.equal(1)
          }
        })
      })
    })

    setup.describeAsAdmin(function (runAction) {
      it('admin is allowed to list all records', function () {
        return runAction('formCiconia:list', {}).then(function (response) {
          response.should.not.have.property('error')
          response.should.have.property('data').not.empty().instanceOf(Array)
          response.should.have.property('count').and.be.greaterThan(3)
        })
      })
    })

    setup.describeAsGuest(function (runAction) {
      it('guest is not allowed to list any records', function () {
        return runAction('formCiconia:list', {}).then(function (response) {
          response.should.have.property('error').not.empty()
          response.should.not.have.property('data')
          response.should.not.have.property('count')
        })
      })
    })

    setup.describeAsAdmin(function (runAction) {
      it('filter user', function () {
        // Depends on users fixture third record AND formCiconia fixture
        return runAction('formCiconia:create', _.assign(ciconiaRecord, {user: 3})).then(function (response) {
          return runAction('formCiconia:list', {user: 3}).then(function (response) {
            response.should.not.have.property('error')
            for (var i = 0; i < response.data.length; i++) {
              response.data[i].user.should.be.equal(3)
            }
          })
        })
      })
    })

    setup.describeAsUser(function (runAction) {
      it('filter location', function () {
        return runAction('formCiconia:create', _.assign(ciconiaRecord, {location: 'some_unq_location'})).then(function (response) {
          return runAction('formCiconia:list', {location: 'some_unq_location'}).then(function (response) {
            response.should.not.have.property('error')
            response.data.length.should.be.equal(1)
            response.data[0].location.should.be.equal('some_unq_location')
          })
        })
      })
    })

    setup.describeAsUser(function (runAction) {
      it('filter from_date', function () {
        return runAction('formCiconia:list', {from_date: '2016-12-20T10:15Z'}).then(function (response) {
          response.should.not.have.property('error')
          response.data.length.should.be.within(3, 5)
        })
      })
      it('filter to_date', function () {
        return runAction('formCiconia:list', {to_date: '2016-12-20T10:16Z'}).then(function (response) {
          response.should.not.have.property('error')
          response.data.length.should.be.equal(2)
        })
      })
      it('filter from_date and to_date', function () {
        return runAction('formCiconia:list', {from_date: '2016-12-20T10:15Z', to_date: '2016-12-20T10:16Z'}).then(function (response) {
          response.should.not.have.property('error')
          response.data.length.should.be.equal(1)
        })
      })
    })
  }) // given some Ciconia rows

  describe('Edit ciconia row', function () {
    var ciconiaId

    before(function () {
      return setup.runActionAsUser2('formCiconia:create', ciconiaRecord).then(function (response) {
        ciconiaId = response.data.id
      })
    })

    it('is allowed if the requester is the submitter', function () {
      return setup.runActionAsUser2('formCiconia:edit', {id: ciconiaId, notes: 'some new notes'}).then(function (response) {
        response.should.not.have.property('error')
        return setup.api.models.formCiconia.findOne({where: {id: ciconiaId}}).then(function (ciconia) {
          ciconia.notes.should.be.equal('some new notes')
        })
      })
    })

    setup.describeAsGuest(function (runAction) {
      it('is not allowed if the requester is guest  user', function () {
        return runAction('formCiconia:edit', {id: ciconiaId}).then(function (response) {
          response.should.have.property('error').and.not.empty()
        })
      })
    })

    setup.describeAsUser(function (runAction) {
      it('is not allowed if the requester user is not the submitter', function () {
        return runAction('formCiconia:edit', {id: ciconiaId}).then(function (response) {
          response.should.have.property('error').and.not.empty()
        })
      })
    })

    setup.describeAsAdmin(function (runAction) {
      it('is allowed if the requester user is admin', function () {
        return runAction('formCiconia:edit', {id: ciconiaId, notes: 'some new notes', user: 3}).then(function (response) {
          response.should.not.have.property('error')
          return setup.api.models.formCiconia.findOne({where: {id: ciconiaId}}).then(function (ciconia) {
            ciconia.notes.should.be.equal('some new notes')
          })
        })
      })
    })
  }) // Edit ciconia row
})
