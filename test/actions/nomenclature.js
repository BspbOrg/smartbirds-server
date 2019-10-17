/* global describe, beforeEach, it */

var _ = require('lodash')
var should = require('should')
var setup = require('../_setup')

describe('Nomenclatures:', function () {
  before(function () {
    return setup.init()
  })

  after(function () {
    return setup.finish()
  })

  var testData = {
    species: {
      birds: 'Alle alle'
    },
    nomenclature: {
      main_threats: {
        bg: 'Култивация',
        en: 'Cultivation'
      },
      birds_nest_success: {
        bg: 'Заето гнездо',
        en: 'Occupied nest'
      }
    }
  }

  describe('given', function () {
    _.forEach(testData, function (model, key) {
      describe(key, function () {
        describe('as', function () {
          // Guest
          setup.describeAsGuest(function (runAction) {
            it('cannot query types', function () {
              return runAction(key + ':types', {}).then(function (response) {
                response.should.have.property('error').and.not.empty()
              })
            })
          }) // end Guest
          // Logged User or Admin
          setup.describeAsAuth(function (runAction) {
            it('can query types', function () {
              return runAction(key + ':types', {}).then(function (response) {
                response.should.not.have.property('error')
                response.should.have.property('data').not.empty().instanceOf(Array)
                response.should.have.property('count').and.be.greaterThan(0)
              })
            })

            itSupportsPaging(runAction, key + ':types')
            itSupportsUpdate(runAction, key + ':types')
          }) // as user
        }) // describe as

        describe('and type', function () {
          _.forEach(model, function (values, type) {
            describe(type, function () {
              describe('as', function () {
                // Guest
                setup.describeAsGuest(function (runAction) {
                  it('cannot list', function () {
                    return runAction(key + ':typeList', {'type': type}).then(function (response) {
                      response.should.have.property('error').and.not.empty()
                    })
                  })
                }) // end Guest
                // Logged User or Admin
                setup.describeAsAuth(function (runAction) {
                  it('can list', function () {
                    return runAction(key + ':typeList', {'type': type}).then(function (response) {
                      response.should.not.have.property('error')
                      response.should.have.property('data').not.empty().instanceOf(Array)
                      response.should.have.property('count').and.be.greaterThan(0)
                    })
                  })

                  itSupportsPaging(runAction, key + ':typeList', {'type': type})
                  itSupportsUpdate(runAction, key + ':typeList', {'type': type})
                }) // as user
              }) // describe as

              function testValues (action, value) {
                // Guest
                setup.describeAsGuest(function (runAction) {
                  it('cannot get', function () {
                    return runAction(action, {
                      type: type,
                      value: value
                    }).then(function (response) {
                      response.should.have.property('error').and.not.empty()
                    })
                  })
                }) // end Guest
                // Logged User or Admin
                setup.describeAsAuth(function (runAction) {
                  it('can get', function () {
                    return runAction(action, {
                      type: type,
                      value: value
                    }).then(function (response) {
                      response.should.not.have.property('error')
                      response.should.have.property('data').instanceOf(Object)
                      response.data.should.have.property('label').instanceOf(Object)
                    })
                  })
                }) // as user
              }

              if (key !== 'species') {
                describe('and value', function () {
                  _.forEach(values, function (value, index) {
                    describe(index, function () {
                      testValues(key + ':' + index + ':' + 'view', value)
                    }) // describe key
                  }) // foreach values
                }) // describe and value
              } else {
                testValues(key + ':' + 'view', values)
              } //
            }) // describe type
          }) // foreach type
        }) // describe and type
      }) // describe model
    }) // foreach model
  }) // describe given
})

function itSupportsPaging (runAction, action, params) {
  params = params || {}
  it('can limit', function () {
    return runAction(action, _.extend({limit: 1}, params)).then(function (response) {
      response.should.have.property('data').with.lengthOf(1)
    })
  })
  it('can page', function () {
    return runAction(action, _.extend({limit: 1}, params)).then(function (response0) {
      response0.should.have.property('data').with.lengthOf(1)
      return runAction(action, _.extend({limit: 1, offset: 1}, params)).then(function (response1) {
        response1.should.have.property('data').with.lengthOf(1)
        response0.data[0].should.not.deepEqual(response1.data[0])
      })
    })
  })
  it('get total count', function () {
    return runAction(action, _.extend({limit: 1}, params)).then(function (response) {
      response.should.have.property('count').greaterThan(1)
    })
  })
  it('get link to next page', function () {
    return runAction(action, _.extend({limit: 1}, params)).then(function (response) {
      response.should.have.property('meta').with.property('nextPage').type('string').not.empty()
    })
  })
  it('no link on last page', function () {
    return runAction(action, _.extend({limit: 1, offset: 1000000}, params)).then(function (response) {
      response.should.have.property('meta').not.with.property('nextPage')
    })
  })
}

function itSupportsUpdate (runAction, action, params) {
  params = params || {}
  it('get update link', function () {
    return runAction(action, _.extend({limit: 1}, params)).then(function (response) {
      response.should.have.property('meta').with.property('update').type('string').not.empty()
    })
  })
}
