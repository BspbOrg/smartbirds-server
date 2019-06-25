/* global describe, before, after, it */

var _ = require('lodash')
var should = require('should')
var setup = require('../_setup')
require('should-sinon')

describe('Action formThreats:', function () {
  var threatsRecord = {
    latitude: 42.1463749,
    longitude: 24.7492006,
    observationDateTime: '2015-12-10T10:15Z',
    monitoringCode: 'random_threats_1234',
    primaryType: 'poison',
    species: 'Accipiter nisus',
    category: {
      type: 'threats_category',
      id: 50,
      label: {
        bg: 'Пожари',
        en: 'Fires'
      }
    },
    estimate: {
      type: 'threats_estimate',
      id: 70,
      label: {
        bg: 'Високо',
        en: 'High'
      }
    },
    poisonedType: 'dead',
    stateCarcass: {
      type: 'threats_state_carcass',
      id: 80,
      label: {
        bg: 'Подуто',
        en: 'Bloat'
      }
    },
    sampleTaken1: {
      type: 'threats_sample',
      id: 90,
      label: {
        bg: 'СЪрце',
        en: 'Heart'
      }
    },
    sampleCode1: 'random_code_1234',
    location: 'some location',
    class: 'birds',
    count: 5,
    threatsNotes: 'some notes',

    endDateTime: '10/12/2015 10:15',
    startDateTime: '09/12/2015 08:10',
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
      it('fails to create threats record', function () {
        return runAction('formThreats:create', threatsRecord).then(function (response) {
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
          var reqThreatObj = _.cloneDeep(threatsRecord)
          delete reqThreatObj[property]
          return runAction('formThreats:create', reqThreatObj).then(function (response) {
            response.error.should.be.equal('Error: actionhero.errors.missingParams')
          })
        })
      })
    }) // fails to create without

    describe('CREATE', function () {
      it('creates threats record', function () {
        return runAction('formThreats:create', threatsRecord).then(function (response) {
          should.not.exist(response.error)
          response.data.id.should.be.greaterThan(0)
        })
      })

      it('attaches the user created the record', function () {
        return runAction('formThreats:create', threatsRecord).then(function (response) {
          should.not.exist(response.error)
          response.data.user.should.be.equal(response.requesterUser.id)
        })
      })
    })
  }) // describeAsAuth

  describe('Get threats record by id', function () {
    var threatsId

    before(function () {
      return setup.runActionAsUser2('formThreats:create', threatsRecord).then(function (response) {
        threatsId = response.data.id
      })
    })

    it('is allowed if the requester user is the submitter', function () {
      return setup.runActionAsUser2('formThreats:view', {id: threatsId}).then(function (response) {
        response.should.not.have.property('error')
        response.should.have.property('data')
      })
    })

    it('should return the correct row', function () {
      return setup.runActionAsUser2('formThreats:view', {id: threatsId}).then(function (response) {
        response.should.not.have.property('error')
        response.data.id.should.be.equal(threatsId)
      })
    })

    setup.describeAsAdmin(function (runAction) {
      it('is allowed if the requester user is admin', function () {
        return runAction('formThreats:view', {id: threatsId}).then(function (response) {
          response.should.not.have.property('error')
          response.should.have.property('data')
        })
      })
    })

    setup.describeAsUser(function (runAction) {
      it('is not allowed if the requester user is not the submitter', function () {
        return runAction('formThreats:view', {id: threatsId}).then(function (response) {
          response.should.have.property('error').and.not.empty()
        })
      })
    })

    setup.describeAsGuest(function (runAction) {
      it('is not allowed if the requester is guest  user', function () {
        return runAction('formThreats:view', {id: threatsId}).then(function (response) {
          response.should.have.property('error').and.not.empty()
        })
      })
    })
  }) // Get threats record by id

  describe('given some threats rows:', function () {
    setup.describeAsUser(function (runAction) {
      it('is allowed to list only his records', function () {
        return runAction('formThreats:list', {}).then(function (response) {
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
        return runAction('formThreats:list', {}).then(function (response) {
          response.should.not.have.property('error')
          response.should.have.property('data').not.empty().instanceOf(Array)
          response.should.have.property('count').and.be.greaterThan(3)
        })
      })
    })

    setup.describeAsGuest(function (runAction) {
      it('guest is not allowed to list any records', function () {
        return runAction('formThreats:list', {}).then(function (response) {
          response.should.have.property('error').not.empty()
          response.should.not.have.property('data')
          response.should.not.have.property('count')
        })
      })
    })

    setup.describeAsAdmin(function (runAction) {
      it('filter user', function () {
        // Depends on users fixture third record AND formThreats fixture
        return runAction('formThreats:create', _.assign(threatsRecord, {user: 3})).then(function (response) {
          return runAction('formThreats:list', {user: 3}).then(function (response) {
            response.should.not.have.property('error')
            for (var i = 0; i < response.data.length; i++) {
              response.data[i].user.should.be.equal(3)
            }
          })
        })
      })
    })

    setup.describeAsUser(function (runAction) {
      it('filter species', function () {
        return runAction('formThreats:create', _.assign(threatsRecord, {species: 'Anas acuta'})).then(function (response) {
          return runAction('formThreats:list', {species: 'Anas acuta'}).then(function (response) {
            response.should.not.have.property('error')
            for (var i = 0; i < response.data.length; i++) {
              response.data[i].species.should.be.equal('Anas acuta')
            }
          })
        })
      })
    })

    setup.describeAsUser(function (runAction) {
      it('filter location', function () {
        return runAction('formThreats:create', _.assign(threatsRecord, {location: 'some_unq_location'})).then(function (response) {
          return runAction('formThreats:list', {location: 'some_unq_location'}).then(function (response) {
            response.should.not.have.property('error')
            response.data.length.should.be.equal(1)
            response.data[0].location.should.be.equal('some_unq_location')
          })
        })
      })
    })

    setup.describeAsUser(function (runAction) {
      it('filter from_date', function () {
        return runAction('formThreats:list', {from_date: '2016-12-20T10:15Z'}).then(function (response) {
          response.should.not.have.property('error')
          response.data.length.should.be.equal(2)
        })
      })
      it('filter to_date', function () {
        return runAction('formThreats:list', {to_date: '2016-12-20T10:16Z'}).then(function (response) {
          response.should.not.have.property('error')
          response.data.length.should.be.within(2, 4)// 3 records from fixtures
        })
      })
      it('filter from_date and to_date', function () {
        return runAction('formThreats:list', {from_date: '2016-12-20T10:15Z', to_date: '2016-12-20T10:16Z'}).then(function (response) {
          response.should.not.have.property('error')
          response.data.length.should.be.equal(1)
        })
      })
    })
  }) // given some threats rows

  describe('Edit threats row', function () {
    var threatsId

    before(function () {
      return setup.runActionAsUser2('formThreats:create', threatsRecord).then(function (response) {
        threatsId = response.data.id
      })
    })

    it('is allowed if the requester is the submitter', function () {
      return setup.runActionAsUser2('formThreats:edit', {id: threatsId, notes: 'some new notes'}).then(function (response) {
        response.should.not.have.property('error')
        return setup.api.models.formThreats.findOne({where: {id: threatsId}}).then(function (threat) {
          threat.notes.should.be.equal('some new notes')
        })
      })
    })

    setup.describeAsGuest(function (runAction) {
      it('is not allowed if the requester is guest  user', function () {
        return runAction('formThreats:edit', {id: threatsId}).then(function (response) {
          response.should.have.property('error').and.not.empty()
        })
      })
    })

    setup.describeAsUser(function (runAction) {
      it('is not allowed if the requester user is not the submitter', function () {
        return runAction('formThreats:edit', {id: threatsId}).then(function (response) {
          response.should.have.property('error').and.not.empty()
        })
      })
    })

    setup.describeAsAdmin(function (runAction) {
      it('is allowed if the requester user is admin', function () {
        return runAction('formThreats:edit', {id: threatsId, notes: 'some new notes'}).then(function (response) {
          response.should.not.have.property('error')
          return setup.api.models.formThreats.findOne({where: {id: threatsId}}).then(function (threat) {
            threat.notes.should.be.equal('some new notes')
          })
        })
      })
    })
  }) // Edit threats row
})
