/* global describe, before, after, it, beforeEach */

require('should')
var setup = require('../_setup')

describe('Zone ownership:', function () {
  var testZone = 'freePlov'

  before(function () {
    return setup.init()
  })

  after(function () {
    return setup.finish()
  })

  beforeEach(function () {
    return setup.api.models.zone.findByPk(testZone).then(function (zone) {
      return zone.update({
        ownerId: null,
        status: 'free'
      })
    })
  })

  describe('given some zones', function () {
    setup.describeAsGuest(function (runAction) {
      it('cannot request ownership on free zone', function () {
        return runAction('zone:requestOwnership', {id: testZone}).then(function (response) {
          response.should.have.property('error').not.empty()
        })
      })
    }) // as guest

    setup.describeAsAuth(function (runAction) {
      it('can request ownership on free zone', function () {
        return runAction('zone:requestOwnership', {id: testZone}).then(function (response) {
          response.should.not.have.property('error')
        })
      })
    }) // as user, admin

    describe('and a requested zone', function () {
      beforeEach(function () {
        return setup.runActionAsUser2('zone:requestOwnership', {id: testZone})
      })

      setup.describeAllRoles(function (runAction) {
        it('cannot request ownership on requested zone', function () {
          return runAction('zone:requestOwnership', {id: testZone}).then(function (response) {
            response.should.have.property('error').not.empty()
          })
        })
      }) // as all roles

      setup.describeAsRoles(['admin', 'cbm'], function (runAction) {
        it('can list requested zone', function () {
          return runAction('zone:list', {}).then(function (response) {
            response.should.not.have.property('error')
            response.should.have.property('data').not.empty().instanceOf(Array)
            response.should.have.property('count').and.be.equal(6)

            var counts = {}
            for (var i = 0; i < response.data.length; i++) {
              response.data[i].should.have.property('status').not.empty()
              var status = response.data[i].status
              counts[status] = (counts[status] || 0) + 1
            }

            counts.should.have.property('owned').and.be.greaterThan(0)
            counts.should.have.property('requested').and.be.equal(1)
          })
        })

        it('can approve zone ownership', function () {
          return runAction('zone:respondOwnershipRequest', {id: testZone, response: true}).then(function (response) {
            response.should.not.have.property('error')
          })
        })

        it('can reject zone ownership', function () {
          return runAction('zone:respondOwnershipRequest', {id: testZone, response: false}).then(function (response) {
            response.should.not.have.property('error')
          })
        })

        it('can assign zone ownership', function () {
          return runAction('zone:setOwner', {id: testZone, owner: 1}).then(function (response) {
            response.should.not.have.property('error')
          })
        })

        it('can clear zone ownership', function () {
          return runAction('zone:clearOwner', {id: testZone}).then(function (response) {
            response.should.not.have.property('error')
          })
        })
      }) // as admin, cbm moderator

      setup.describeAsRoles(['guest', 'user'], function (runAction) {
        it('cannot approve zone ownership', function () {
          return runAction('zone:respondOwnershipRequest', {id: testZone, response: true}).then(function (response) {
            response.should.have.property('error').not.empty()
          })
        })
        it('cannot reject zone ownership', function () {
          return runAction('zone:respondOwnershipRequest', {id: testZone, response: false}).then(function (response) {
            response.should.have.property('error').not.empty()
          })
        })
        it('cannot assign zone ownership', function () {
          return runAction('zone:setOwner', {id: testZone, owner: 1}).then(function (response) {
            response.should.have.property('error').not.empty()
          })
        })

        it('cannot clear zone ownership', function () {
          return runAction('zone:clearOwner', {id: testZone}).then(function (response) {
            response.should.have.property('error').not.empty()
          })
        })
      }) // as guest,user
    }) // a requested zone

    describe('and', function () {
      setup.describeAsUser(function (runAction) {
        var ownedZonesCount
        beforeEach(function () {
          return runAction('zone:list', {}).then(function (response) {
            ownedZonesCount = response.count
          })
        })
        describe('requested zone', function () {
          beforeEach(function () {
            return runAction('zone:requestOwnership', {id: testZone})
          })

          it('can list own requested zone', function () {
            return runAction('zone:list', {}).then(function (response) {
              response.should.not.have.property('error')
              response.should.have.property('data').not.empty().instanceOf(Array)
              response.should.have.property('count').and.be.equal(ownedZonesCount + 1)

              var counts = {}
              for (var i = 0; i < response.data.length; i++) {
                response.data[i].should.have.property('ownerId').and.be.equal(1)
                response.data[i].should.have.property('location').not.empty()
                response.data[i].should.have.property('status').not.empty()
                var status = response.data[i].status
                counts[status] = (counts[status] || 0) + 1
              }

              counts.should.have.property('owned').and.be.equal(ownedZonesCount)
              counts.should.have.property('requested').and.be.equal(1)
            })
          })

          it('cannot approve zone ownership', function () {
            return runAction('zone:respondOwnershipRequest', {id: testZone, response: true}).then(function (response) {
              response.should.have.property('error').not.empty()
            })
          })
          it('cannot reject zone ownership', function () {
            return runAction('zone:respondOwnershipRequest', {id: testZone, response: false}).then(function (response) {
              response.should.have.property('error').not.empty()
            })
          })
          it('cannot assign zone ownership', function () {
            return runAction('zone:setOwner', {id: testZone, owner: 1}).then(function (response) {
              response.should.have.property('error').not.empty()
            })
          })
          it('cannot clear zone ownership', function () {
            return runAction('zone:clearOwner', {id: testZone}).then(function (response) {
              response.should.have.property('error').not.empty()
            })
          })
        }) // requested zone
      }) // as user
    }) // and
  }) // given some zones
})
