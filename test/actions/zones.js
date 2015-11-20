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

  describe('given some zones', function () {
    setup.describeAsGuest(function (runAction) {
      it('cannot list', function () {
        return runAction('zone:list', {}).then(function (response) {
          response.should.have.property('error').and.not.empty();
        });
      });
    }); // as guest

    setup.describeAsUser(function (runAction) {
      it('can list only own zones', function () {
        return runAction('zone:list', {}).then(function (response) {
          response.should.not.have.property('error');
          response.should.have.property('data').and.be.instanceof(Array).and.have.lengthOf(1);
          response.should.have.property('count').and.be.equal(1);
          response.data[0].should.have.property('owner');
          response.data[0].owner.should.have.property('id').and.be.equal(1);
        });
      });
    }); // as user


    setup.describeAsAdmin(function (runAction) {
      it('can list all zones', function () {
        return runAction('zone:list', {}).then(function (response) {
          response.should.not.have.property('error');
          response.should.have.property('data').and.be.instanceof(Array).and.have.lengthOf(3);
          response.should.have.property('count').and.be.equal(3);
          response.data[0].should.have.property('owner');
          response.data[0].owner.should.have.property('email').and.be.equal("user@smartbirds.com");
        });
      });
    }); // as admin

  }); // given some zones

});
