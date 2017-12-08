/* global describe, beforeEach, it */

var _ = require('lodash')
var should = require('should')
var setup = require('../_setup')

describe('Action location:', function () {
  before(function () {
    return setup.init()
  })

  after(function () {
    return setup.finish()
  })

  var testLocations = [{name: 'Plovdiv', id: 1}, {name: 'Sofia', id: 2}]
  var zoneFilters = ['free']

  describe('given some locations', function () {
    setup.describeAsGuest(function (runAction) {
      it('cannot list', function () {
        return runAction('location:list', {}).then(function (response) {
          response.should.have.property('error').and.not.empty()
        })
      })
      testLocations.forEach(function (location) {
        zoneFilters.forEach(function (filter) {
          it('cannot list ' + filter + ' zones at ' + location.name, function () {
            return runAction('location:listZones', {id: location.id, filter: filter}).then(function (response) {
              response.should.have.property('error').and.not.empty()
            })
          })
        }) // forEach zoneFilter
      }) // foreach testLocations
    }) // as guest

    setup.describeAsRoles(['User', 'Admin'], function (runAction) {
      it('can list', function () {
        return runAction('location:list', {}).then(function (response) {
          response.should.not.have.property('error')
          response.should.have.property('data').which.is.not.empty().instanceof(Array)
        })
      })

      it('can list incremental sync since', function () {
        return runAction('location:list', {since: (new Date()).getTime()}).then(function (response) {
          response.should.not.have.property('error')
          response.should.have.property('data').which.is.empty().instanceof(Array)
        })
      })

      it('can list incremental sync until', function () {
        return runAction('location:list', {until: (new Date()).getTime()}).then(function (response) {
          response.should.not.have.property('error')
          response.should.have.property('data').which.is.not.empty().instanceof(Array)
        })
      })

      it('can list with paging', function () {
        return runAction('location:list', {limit: 1, offset: 1}).then(function (response) {
          response.should.not.have.property('error')
          response.should.have.property('data').which.is.not.empty().instanceof(Array)
          response.data.length.should.be.equal(1)
          response.should.have.property('meta').which.is.not.empty()
        })
      })

      testLocations.forEach(function (location) {
        zoneFilters.forEach(function (filter) {
          it('can list ' + filter + ' zones at ' + location.name, function () {
            return runAction('location:listZones', {id: location.id, filter: filter}).then(function (response) {
              response.should.not.have.property('error')
              response.should.have.property('data').which.is.not.empty().instanceof(Array)
              for (var i = 0; i < response.data.length; i++) {
                response.data[i].should.have.property('ownerId').which.is.null()
              }
            })
          })

          it('can list ' + filter + ' zones at ' + location.name + ' updated since now', function () {
            return runAction('location:listZones', {id: location.id, filter: filter, since: new Date().getTime()}).then(function (response) {
              response.should.not.have.property('error')
              response.should.have.property('data').which.is.empty().instanceof(Array)
            })
          })

          it('can list ' + filter + ' zones at ' + location.name + ' updated until now', function () {
            return runAction('location:listZones', {id: location.id, filter: filter, until: new Date().getTime()}).then(function (response) {
              response.should.not.have.property('error')
              response.should.have.property('data').which.is.not.empty().instanceof(Array)
            })
          })

          it('can list ' + filter + ' zones at ' + location.name + ' with paging', function () {
            return runAction('location:listZones', {id: location.id, filter: filter, limit: 1, offset: 0}).then(function (response) {
              response.should.not.have.property('error')
              response.should.have.property('data').which.is.not.empty().instanceof(Array)
              response.should.have.property('meta').which.is.not.empty()
              response.data.length.should.be.equal(1)
            })
          })
        }) // forEach zoneFilter
      }) // foreach testLocations
    }) // as user,admin
  }) // given some locations
}) // Action location
