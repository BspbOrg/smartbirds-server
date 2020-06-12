/* global describe, before, after, it */

var _ = require('lodash')
var should = require('should')
var setup = require('../_setup')
require('should-sinon')

describe('Action formInvertebrates:', function () {
  var invertebratesRecord = {
    latitude: 42.1463749,
    longitude: 24.7492006,
    observationDateTime: '2015-12-10T10:15Z',
    monitoringCode: 'random_invertebrates_1234',
    species: 'Lucanus cervus',
    sex: {
      type: 'invertebrates_gender',
      id: 33,
      label: {
        bg: 'Женски',
        en: 'Female'
      }
    },
    age: {
      type: 'invertebrates_age',
      id: 11,
      label: {
        bg: 'Imm.',
        en: 'Imm.'
      }
    },
    habitat: {
      type: 'invertebrates_habitat',
      id: 102,
      label: {
        bg: 'Диапазон',
        en: 'Range'
      }
    },
    findings: {
      type: 'invertebrates_findings',
      id: 32,
      label: {
        bg: 'invertebrates_findings',
        en: 'invertebrates_findings'
      }
    },
    count: 10,
    marking: 'some marking',
    speciesNotes: 'some notes text',
    location: 'location somewhere',

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
      it('fails to create invertebrate record', function () {
        return runAction('formInvertebrates:create', invertebratesRecord).then(function (response) {
          response.error.should.be.equal('Error: Please log in to continue')
        })
      })
    })
  }) // Guest user

  setup.describeAsAuth(function (runAction) {
    describe('fails to create without', function () {
      var required = ['latitude', 'longitude', 'observationDateTime', 'monitoringCode',
        'species', 'count', 'endDateTime', 'startDateTime']

      required.forEach(function (property) {
        it(property, function () {
          var reqBirdObj = _.cloneDeep(invertebratesRecord)
          delete reqBirdObj[property]
          return runAction('formInvertebrates:create', reqBirdObj).then(function (response) {
            response.error.should.be.equal('Error: actionhero.errors.missingParams')
          })
        })
      })
    }) // fails to create without

    describe('CREATE', function () {
      it('creates invertebrates record', function () {
        return runAction('formInvertebrates:create', invertebratesRecord).then(function (response) {
          should.not.exist(response.error)
          response.data.id.should.be.greaterThan(0)
        })
      })

      it('attaches the user created the record', function () {
        return runAction('formInvertebrates:create', invertebratesRecord).then(function (response) {
          should.not.exist(response.error)
          response.data.user.should.be.equal(response.requesterUser.id)
        })
      })
    })
  }) // describeAsAuth

  describe('Get invertebrates record by id', function () {
    var invertebratesId

    before(function () {
      return setup.runActionAsUser2('formInvertebrates:create', invertebratesRecord).then(function (response) {
        invertebratesId = response.data.id
      })
    })

    it('is allowed if the requester user is the submitter', function () {
      return setup.runActionAsUser2('formInvertebrates:view', {id: invertebratesId}).then(function (response) {
        response.should.not.have.property('error')
        response.should.have.property('data')
      })
    })

    it('should return the correct row', function () {
      return setup.runActionAsUser2('formInvertebrates:view', {id: invertebratesId}).then(function (response) {
        response.should.not.have.property('error')
        response.data.id.should.be.equal(invertebratesId)
      })
    })

    setup.describeAsAdmin(function (runAction) {
      it('is allowed if the requester user is admin', function () {
        return runAction('formInvertebrates:view', {id: invertebratesId}).then(function (response) {
          response.should.not.have.property('error')
          response.should.have.property('data')
        })
      })
    })

    setup.describeAsUser(function (runAction) {
      it('is not allowed if the requester user is not the submitter', function () {
        return runAction('formInvertebrates:view', {id: invertebratesId}).then(function (response) {
          response.should.have.property('error').and.not.empty()
        })
      })
    })

    setup.describeAsGuest(function (runAction) {
      it('is not allowed if the requester is guest  user', function () {
        return runAction('formInvertebrates:view', {id: invertebratesId}).then(function (response) {
          response.should.have.property('error').and.not.empty()
        })
      })
    })
  }) // Get invertebrates record by id

  describe('given some invertebrates rows:', function () {
    setup.describeAsUser(function (runAction) {
      it('is allowed to list only his records', function () {
        return runAction('formInvertebrates:list', {}).then(function (response) {
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
        return runAction('formInvertebrates:list', {}).then(function (response) {
          response.should.not.have.property('error')
          response.should.have.property('data').not.empty().instanceOf(Array)
          response.should.have.property('count').and.be.greaterThan(3)
        })
      })
    })

    setup.describeAsGuest(function (runAction) {
      it('guest is not allowed to list any records', function () {
        return runAction('formInvertebrates:list', {}).then(function (response) {
          response.should.have.property('error').not.empty()
          response.should.not.have.property('data')
          response.should.not.have.property('count')
        })
      })
    })

    setup.describeAsAdmin(function (runAction) {
      it('filter user', function () {
        // Depends on users fixture third record AND formInvertebrates fixture
        return runAction('formInvertebrates:create', _.assign(invertebratesRecord, {user: 3})).then(function (response) {
          return runAction('formInvertebrates:list', {user: 3}).then(function (response) {
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
        return runAction('formInvertebrates:create', _.assign(invertebratesRecord, {species: 'Hydrous piceus'})).then(function (response) {
          return runAction('formInvertebrates:list', {species: 'Hydrous piceus'}).then(function (response) {
            response.should.not.have.property('error')
            for (var i = 0; i < response.data.length; i++) {
              response.data[i].species.should.be.equal('Hydrous piceus')
            }
          })
        })
      })
    })

    setup.describeAsUser(function (runAction) {
      it('filter location', function () {
        return runAction('formInvertebrates:create', _.assign(invertebratesRecord, {location: 'some_unq_location'})).then(function (response) {
          return runAction('formInvertebrates:list', {location: 'some_unq_location'}).then(function (response) {
            response.should.not.have.property('error')
            response.data.length.should.be.equal(1)
            response.data[0].location.should.be.equal('some_unq_location')
          })
        })
      })
    })

    setup.describeAsUser(function (runAction) {
      it('filter from_date', function () {
        return runAction('formInvertebrates:list', {from_date: '2016-12-20T10:15Z'}).then(function (response) {
          response.should.not.have.property('error')
          response.data.length.should.be.equal(2)
        })
      })
      it('filter to_date', function () {
        return runAction('formInvertebrates:list', {to_date: '2016-12-20T10:16Z'}).then(function (response) {
          response.should.not.have.property('error')
          response.data.length.should.be.within(2, 4)// 3 records from fixtures
        })
      })
      it('filter from_date and to_date', function () {
        return runAction('formInvertebrates:list', {from_date: '2016-12-20T10:15Z', to_date: '2016-12-20T10:16Z'}).then(function (response) {
          response.should.not.have.property('error')
          response.data.length.should.be.equal(1)
        })
      })
    })
  }) // given some invertebrates rows

  describe('Edit invertebrates row', function () {
    var invertebratesId

    before(function () {
      return setup.runActionAsUser2('formInvertebrates:create', invertebratesRecord).then(function (response) {
        invertebratesId = response.data.id
      })
    })

    it('is allowed if the requester is the submitter', function () {
      return setup.runActionAsUser2('formInvertebrates:edit', {id: invertebratesId, notes: 'some new notes'}).then(function (response) {
        response.should.not.have.property('error')
        return setup.api.models.formInvertebrates.findOne({where: {id: invertebratesId}}).then(function (invertebrate) {
          invertebrate.notes.should.be.equal('some new notes')
        })
      })
    })

    setup.describeAsGuest(function (runAction) {
      it('is not allowed if the requester is guest  user', function () {
        return runAction('formInvertebrates:edit', {id: invertebratesId}).then(function (response) {
          response.should.have.property('error').and.not.empty()
        })
      })
    })

    setup.describeAsUser(function (runAction) {
      it('is not allowed if the requester user is not the submitter', function () {
        return runAction('formInvertebrates:edit', {id: invertebratesId}).then(function (response) {
          response.should.have.property('error').and.not.empty()
        })
      })
    })

    setup.describeAsAdmin(function (runAction) {
      it('is allowed if the requester user is admin', function () {
        return runAction('formInvertebrates:edit', {id: invertebratesId, notes: 'some new notes'}).then(function (response) {
          response.should.not.have.property('error')
          return setup.api.models.formInvertebrates.findOne({where: {id: invertebratesId}}).then(function (invertebrate) {
          })
        })
      })
    })
  }) // Edit invertebrates row
})
