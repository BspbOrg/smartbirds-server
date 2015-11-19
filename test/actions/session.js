/**
 * Created by groupsky on 19.11.15.
 */

var _ = require('lodash');
//var request = require("request");
var should = require('should');
var setup = require('../_setup');

describe('Action: session', function () {

  var user = 'user@smartbirds.com';
  var admin = 'admin@smartbirds.com';
  var password = 'secret';

  before(function (done) {
    setup.init(function(){
      done();
    });
  });

  after(function (done) {
    setup.finish(done);
  });

  describe(':create', function () {
    it('logins user', function (done) {
      setup.api.specHelper.runAction('session:create', {
        email: user,
        password: password
      }, function (response) {
        should.not.exists(response.error);
        should.exists(response.csrfToken);
        should.exists(response.user);
        done();
      });
    });

    it('logins admin', function (done) {
      setup.api.specHelper.runAction('session:create', {
        email: admin,
        password: password
      }, function (response) {
        should.not.exists(response.error);
        should.exists(response.csrfToken);
        should.exists(response.user);
        response.user.isAdmin.should.be.true();
        done();
      });
    });
  });

});
