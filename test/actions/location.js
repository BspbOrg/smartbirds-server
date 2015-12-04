/**
 * Created by groupsky on 04.12.15.
 */

var _ = require('lodash');
var should = require('should');
var setup = require("../_setup");

describe.skip('Action location:', function () {

  before(function () {
    return setup.init();
  });

  after(function () {
    return setup.finish();
  });

  var testLocations = ['Plovdiv', 'Sofia'];
  var zoneFilters = ['free'];

  describe('given some locations', function () {
    setup.describeAsGuest(function (runAction) {
      it('cannot list', function () {
        return runAction('location:list', {}).then(function (response) {
          response.should.have.property('error').and.not.empty();
        });
      });
      testLocations.forEach(function (location) {
        zoneFilters.forEach(function (filter) {
          it('cannot list ' + filter + ' zones at ' + location, function () {
            return runAction('location:listZones', {id: location, filter: filter}).then(function (response) {
              response.should.have.property('error').and.not.empty();
            });
          });

        }); // forEach zoneFilter
      }); // foreach testLocations
    }); // as guest

    setup.describeAsRoles(['User', 'Admin'], function(runAction) {

      it('can list', function () {
        return runAction('location:list', {}).then(function (response) {
          response.should.not.have.property('error');
          response.should.have.property('data').which.is.not.empty().Array;
        });
      });
      testLocations.forEach(function (location) {
        zoneFilters.forEach(function (filter) {
          it('can list ' + filter + ' zones at ' + location, function () {
            return runAction('location:listZones', {id: location, filter: filter}).then(function (response) {
              response.should.not.have.property('error');
              response.should.have.property('data').which.is.not.empty().Array;
            });
          });

        }); // forEach zoneFilter
      }); // foreach testLocations

    }); // as user,admin

  }); // given some locations
}); // Action location
