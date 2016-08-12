/**
 * Created by groupsky on 20.11.15.
 */

var _ = require('lodash');
var should = require('should');
var setup = require('../_setup');
var Promise = require('bluebird');

describe('Nomenclatures:', function () {

  before(function () {
    return setup.init();
  });

  after(function () {
    return setup.finish();
  });

  var testData = {
    species: {
      birds: 'Alle alle'
    },
    nomenclature: {
      main_wind_force: {
        bg: '2 - Лек бриз',
        en: '2 - Light breeze'
      },
      main_rain: {
        bg: 'Ръми',
        en: 'Drizzle'
      }
    }
  };

  describe('given', function () {

    _.forEach(testData, function (model, key) {
      describe(key, function () {

        describe('as', function () {
          // Guest
          setup.describeAsGuest(function (runAction) {

            it('cannot query types', function () {
              return runAction(key + ':types', {}).then(function (response) {
                response.should.have.property('error').and.not.empty();
              });
            });

          }); // end Guest
          // Logged User or Admin
          setup.describeAsAuth(function (runAction) {
            it('can query types', function () {
              return runAction(key + ':types', {}).then(function (response) {
                response.should.not.have.property('error');
                response.should.have.property('data').not.empty().instanceOf(Array);
                response.should.have.property('count').and.be.greaterThan(0);
              });
            });

            it('can limit', function () {
              return runAction(key + ':types', {limit: 1}).then(function(response) {
                response.should.have.property('data').with.lengthOf(1);
              });
            });
            it('can page', function () {
              return runAction(key + ':types', {limit: 1, offset: 0}).then(function(response0) {
                return runAction(key + ':types', {limit: 1, offset: 1}).then(function (response1) {
                  response0.data[0].should.not.deepEqual(response1.data[0]);
                });
              });
            });
            it('get total count', function () {
              return runAction(key + ':types', {limit: 1}).then(function(response) {
                response.should.have.property('count').greaterThan(1);
              });
            });
            it('get link to next page', function () {
              return runAction(key + ':types', {limit: 1}).then(function(response) {
                response.should.have.property('meta').with.property('nextPage').type('string').not.empty();
              });
            });
            it('no link on last page', function () {
              return runAction(key + ':types', {limit: 1, offset: 1000000}).then(function(response) {
                response.should.have.property('meta').not.with.property('nextPage');
              });
            });
            it('get update link', function () {
              return runAction(key + ':types', {limit: 1}).then(function(response) {
                response.should.have.property('meta').with.property('update').type('string').not.empty();
              });
            });
          }); // as user
        }); // describe as

        describe('and type', function () {
          _.forEach(model, function (values, type) {
            describe(type, function () {
              describe('as', function () {
                // Guest
                setup.describeAsGuest(function (runAction) {

                  it('cannot list', function () {
                    return runAction(key + ':typeList', {"type": type}).then(function (response) {
                      response.should.have.property('error').and.not.empty();
                    });
                  });
                }); // end Guest
                // Logged User or Admin
                setup.describeAsAuth(function (runAction) {

                  it('can list', function () {
                    return runAction(key + ':typeList', {"type": type}).then(function (response) {
                      response.should.not.have.property('error');
                      response.should.have.property('data').not.empty().instanceOf(Array);
                      response.should.have.property('count').and.be.greaterThan(0);
                    });
                  });
                }); // as user
              }); // describe as

              function testValues(action, value) {
                // Guest
                setup.describeAsGuest(function (runAction) {
                  it('cannot get', function () {
                    return runAction(action, {
                      type: type,
                      value: value
                    }).then(function (response) {
                      response.should.have.property('error').and.not.empty();
                    });
                  });
                }); // end Guest
                // Logged User or Admin
                setup.describeAsAuth(function (runAction) {

                  it('can list', function () {
                    return runAction(action, {
                      type: type,
                      value: value
                    }).then(function (response) {
                      response.should.not.have.property('error');
                      response.should.have.property('data').instanceOf(Object);
                      response.data.should.have.property('label').instanceOf(Object);
                    });
                  });
                }); // as user
              }

              if (key !== 'species') {
                describe('and value', function () {
                  _.forEach(values, function (value, index) {
                    describe(index, function () {
                      testValues(key+':'+index+':'+'view', value);
                    }); // describe key
                  }); // foreach values
                }); // describe and value
              } else {
                testValues(key+':'+'view', values);
              } //
            }); // describe type
          }); // foreach type
        }); // describe and type

      }); // describe model
    }); // foreach model

  }); // describe given

});
