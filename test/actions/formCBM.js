/* global describe, before, after, it */

var _ = require('lodash')
var should = require('should')
var setup = require('../_setup')
require('should-sinon')

describe('Action formCBM:', function () {
  var cbmRecord = {
    plot: {
      type: 'cbm_sector',
      slug: '1',
      label: {
        local: '1',
        en: '1'
      }
    },
    visit: {
      type: 'cbm_visit_number',
      slug: 'e-early-visit',
      label: {
        local: 'E - първо посещение',
        en: 'E - early visit'
      }
    },
    secondaryHabitat: {
      type: 'cbm_habitat',
      slug: 'a-1-broadleaved-woodland',
      label: {
        local: 'A.1 - Широколистни гори',
        en: 'A.1 Broadleaved woodland'
      }
    },
    primaryHabitat: {
      type: 'cbm_habitat',
      slug: 'a-2-coniferous-woodland',
      label: {
        local: 'A.2 - Иглолистни гори',
        en: 'A.2 Coniferous woodland'
      }
    },
    count: 10,
    distance: {
      type: 'cbm_distance',
      slug: '3-over-100-m',
      label: {
        local: '3 - (над 100 m)',
        en: '3 - (over 100 m)'
      }
    },
    species: 'Accipiter nisus',
    notes: 'Some test notes',
    threats: [
      {
        type: 'main_threats',
        slug: 'cultivation',
        label: {
          local: 'Култивация',
          en: 'Cultivation'
        }
      },
      {
        type: 'main_threats',
        slug: 'mulching',
        label: {
          local: 'Наторяване',
          en: 'Mulching'
        }
      }
    ],
    visibility: 5.5,
    mto: 'pretty nice weather',
    cloudiness: {
      type: 'main_cloud_level',
      slug: '33-66',
      label: {
        local: '33-66%',
        en: '33-66%'
      }
    },
    cloudsType: 'Light grey clouds',
    windDirection: {
      type: 'main_wind_direction',
      slug: 'ene',
      label: {
        local: 'ENE',
        en: 'ENE'
      }
    },
    windSpeed: {
      type: 'main_wind_force',
      slug: '2-light-breeze',
      label: {
        local: '2 - Лек бриз',
        en: '2 - Light breeze'
      }
    },
    temperature: 24.3,
    rain: {
      type: 'main_rain',
      slug: 'drizzle',
      label: {
        local: 'Ръми',
        en: 'Drizzle'
      }
    },
    observers: 'Some test observers',
    endDateTime: '2015-12-10T10:15Z',
    startDateTime: '2015-12-09T08:10Z',
    zone: 'userZonePlovdiv',
    latitude: 42.1463749,
    longitude: 24.7492006,
    monitoringCode: 'formCBM_mon_code',
    observationDateTime: '2016-12-30T10:15Z'
  }

  before(function () {
    return setup.init()
  })

  after(function () {
    return setup.finish()
  })

  describe('Guest user', function () {
    setup.describeAsGuest(function (runAction) {
      it('fails to create cbm record', function () {
        return runAction('formCBM:create', cbmRecord).then(function (response) {
          response.error.should.be.equal('Error: Please log in to continue')
        })
      })
    })
  }) // Guest user

  setup.describeAsAuth(function (runAction) {
    describe('fails to create without', function () {
      it('plot', function () {
        return runAction('formCBM:create', _.omit(cbmRecord, 'plot')).then(function (response) {
          response.error.should.be.equal('Error: actionhero.errors.missingParams')
        })
      })

      it('visit', function () {
        return runAction('formCBM:create', _.omit(cbmRecord, 'visit')).then(function (response) {
          response.error.should.be.equal('Error: actionhero.errors.missingParams')
        })
      })

      it('primaryHabitat', function () {
        return runAction('formCBM:create', _.omit(cbmRecord, 'primaryHabitat')).then(function (response) {
          response.error.should.be.equal('Error: actionhero.errors.missingParams')
        })
      })

      it('count', function () {
        return runAction('formCBM:create', _.omit(cbmRecord, 'count')).then(function (response) {
          response.error.should.be.equal('Error: actionhero.errors.missingParams')
        })
      })

      it('distance', function () {
        return runAction('formCBM:create', _.omit(cbmRecord, 'distance')).then(function (response) {
          response.error.should.be.equal('Error: actionhero.errors.missingParams')
        })
      })

      it('species', function () {
        return runAction('formCBM:create', _.omit(cbmRecord, 'species')).then(function (response) {
          response.error.should.be.equal('Error: actionhero.errors.missingParams')
        })
      })

      it('observers - NEGATIVE', function () {
        return runAction('formCBM:create', _.omit(cbmRecord, 'observers')).then(function (response) {
          response.should.not.have.property('error')
        })
      })

      it('endDateTime', function () {
        return runAction('formCBM:create', _.omit(cbmRecord, 'endDateTime')).then(function (response) {
          response.error.should.be.equal('Error: actionhero.errors.missingParams')
        })
      })

      it('startDateTime', function () {
        return runAction('formCBM:create', _.omit(cbmRecord, 'startDateTime')).then(function (response) {
          response.error.should.be.equal('Error: actionhero.errors.missingParams')
        })
      })

      it('zone', function () {
        return runAction('formCBM:create', _.omit(cbmRecord, 'zone')).then(function (response) {
          response.error.should.be.equal('Error: actionhero.errors.missingParams')
        })
      })
    }) // fails to create without

    describe('CREATE', function () {
      it('creates cbm record', function () {
        return runAction('formCBM:create', cbmRecord).then(function (response) {
          should.not.exist(response.error)
          response.data.id.should.be.greaterThan(0)
        })
      })

      it('attaches the user created the record', function () {
        return runAction('formCBM:create', cbmRecord).then(function (response) {
          should.not.exist(response.error)
          response.data.user.should.be.equal(response.requesterUser.id)
        })
      })
    })
  }) // describeAsAuth

  describe('Get CBM record by id', function () {
    var cbmId

    before(function () {
      return setup.runActionAsUser2('formCBM:create', cbmRecord).then(function (response) {
        cbmId = response.data.id
      })
    })

    it('is allowed if the requester user is the submitter', function () {
      return setup.runActionAsUser2('formCBM:view', {id: cbmId}).then(function (response) {
        response.should.not.have.property('error')
        response.should.have.property('data')
      })
    })

    it('should return the correct row', function () {
      return setup.runActionAsUser2('formCBM:view', {id: cbmId}).then(function (response) {
        response.should.not.have.property('error')
        response.data.id.should.be.equal(cbmId)
      })
    })

    setup.describeAsAdmin(function (runAction) {
      it('is allowed if the requester user is admin', function () {
        return runAction('formCBM:view', {id: cbmId}).then(function (response) {
          response.should.not.have.property('error')
          response.should.have.property('data')
        })
      })
    })

    setup.describeAsUser(function (runAction) {
      it('is not allowed if the requester user is not the submitter', function () {
        return runAction('formCBM:view', {id: cbmId}).then(function (response) {
          response.should.have.property('error').and.not.empty()
        })
      })
    })

    setup.describeAsGuest(function (runAction) {
      it('is not allowed if the requester is guest  user', function () {
        return runAction('formCBM:view', {id: cbmId}).then(function (response) {
          response.should.have.property('error').and.not.empty()
        })
      })
    })
  }) // Get CBM record by id

  describe('given some cbm rows:', function () {
    setup.describeAsUser(function (runAction) {
      it('is allowed to list only his records', function () {
        return runAction('formCBM:list', {}).then(function (response) {
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
        return runAction('formCBM:list', {}).then(function (response) {
          response.should.not.have.property('error')
          response.should.have.property('data').not.empty().instanceOf(Array)
          response.should.have.property('count').and.be.greaterThan(3)
        })
      })
    })

    setup.describeAsGuest(function (runAction) {
      it('guest is not allowed to list any records', function () {
        return runAction('formCBM:list', {}).then(function (response) {
          response.should.have.property('error').not.empty()
          response.should.not.have.property('data')
          response.should.not.have.property('count')
        })
      })
    })
  }) // given some cbm rows

  describe('Edit cbm row', function () {
    var cbmId

    before(function () {
      return setup.runActionAsUser2('formCBM:create', cbmRecord).then(function (response) {
        cbmId = response.data.id
      })
    })

    it('is allowed if the requester is the submitter', function () {
      return setup.runActionAsUser2('formCBM:edit', {id: cbmId, notes: 'some new notes'}).then(function (response) {
        response.should.not.have.property('error')
        return setup.api.models.formCBM.findOne({where: {id: cbmId}}).then(function (cbm) {
          cbm.notes.should.be.equal('some new notes')
        })
      })
    })

    setup.describeAsGuest(function (runAction) {
      it('is not allowed if the requester is guest  user', function () {
        return runAction('formCBM:edit', {id: cbmId}).then(function (response) {
          response.should.have.property('error').and.not.empty()
        })
      })
    })

    setup.describeAsUser(function (runAction) {
      it('is not allowed if the requester user is not the submitter', function () {
        return runAction('formCBM:edit', {id: cbmId}).then(function (response) {
          response.should.have.property('error').and.not.empty()
        })
      })
    })

    setup.describeAsAdmin(function (runAction) {
      it('is allowed if the requester user is admin', function () {
        return runAction('formCBM:edit', {id: cbmId, notes: 'some new notes', user: 3}).then(function (response) {
          response.should.not.have.property('error')
          return setup.api.models.formCBM.findOne({where: {id: cbmId}}).then(function (cbm) {
            cbm.notes.should.be.equal('some new notes')
          })
        })
      })
    })
  }) // Edit cbm row
}) // Action: formCBM
