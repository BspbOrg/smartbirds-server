/**
 * Created by groupsky on 20.11.15.
 */

/**
 * Created by groupsky on 19.11.15.
 */

var _ = require('lodash');
var should = require('should');
var setup = require('../_setup');
var Promise = require('bluebird');

describe('Zones:', function () {

  before(function () {
    return setup.init();
  });

  after(function () {
    return setup.finish();
  });

  var testZones = ['userZonePlovdiv', 'freeZonePlovdiv', 'adminZonePlovdiv'];

  describe('given some zones', function () {
    setup.describeAsGuest(function (runAction) {
      it('cannot list', function () {
        return runAction('zone:list', {}).then(function (response) {
          response.should.have.property('error').and.not.empty();
        });
      });
      testZones.forEach(function(zone) {
        it('cannot view '+zone, function () {
          return runAction('zone:view', {id: zone}).then(function (response) {
            response.should.have.property('error').and.not.empty();
          });
        });
      });
    }); // as guest

    setup.describeAsUser(function (runAction) {
      it('can list only own zones', function () {
        return runAction('zone:list', {}).then(function (response) {
          response.should.not.have.property('error');
          response.should.have.property('data').not.empty().instanceOf(Array);
          response.should.have.property('count').and.be.greaterThan(0);

          for (var i=0; i<response.data.length; i++) {
            response.data[i].should.have.property('ownerId').and.be.equal(1);
            response.data[i].should.have.property('location').not.empty();
          }
        });
      });
      testZones.slice(1).forEach(function(zone) {
        it('cannot view '+zone, function () {
          return runAction('zone:view', {id: zone}).then(function (response) {
            response.should.have.property('error').and.not.empty();
          });
        });
      });
      testZones.slice(0, 1).forEach(function(zone) {
        it('can view '+zone, function () {
          return runAction('zone:view', {id: zone}).then(function (response) {
            response.should.not.have.property('error');
            response.should.have.property('data');
          });
        });
      });
    }); // as user


    setup.describeAsAdmin(function (runAction) {
      it('can list all zones', function () {
        return runAction('zone:list', {}).then(function (response) {
          console.log(response.data);

          response.should.not.have.property('error');
          response.should.have.property('data').instanceof(Array).and.have.lengthOf(6);
          response.should.have.property('count').and.be.equal(6);
          response.data[0].should.have.property('owner');
          response.data[0].owner.should.have.property('email').and.be.equal("user@smartbirds.com");
        });
      });
      testZones.forEach(function(zone) {
        it('can view '+zone, function () {
          return runAction('zone:view', {id: zone}).then(function (response) {
            response.should.not.have.property('error');
            response.should.have.property('data');
          });
        });
      });
    }); // as admin

    // TODO user to list free zones for a location
    // TODO user to request free zone for ownership
    // TODO admin to filter zones with request for ownership
    // TODO admin to approve ownership of requested zone
    // TODO admin to reject ownership of requested zone
    // TODO admin to assign free zone to user
    // TODO admin to remove owner of zone

  }); // given some zones

});
