require('sinon')
require('should-sinon')
const assert = require('assert')
const should = require('should')
const {parseUrl} = require('../../server/utils/urlParser')

describe("Urls parser:", () => {
  it('should parse DB url', () => {
    const dbUrl = 'postgres://dummyuser:dummypass@localhost:1000/dummydb'
    const expectedResult = {
      protocol: 'postgres',
      host: 'localhost',
      port: 1000,
      username: 'dummyuser',
      password: 'dummypass',
      database: 'dummydb'
    }

    const parsedUrl = parseUrl(dbUrl)
    parsedUrl.should.be.containEql(expectedResult)
  })

  it('should parse redis url', () => {
    const dbUrl = 'redis://dummyuser:dummypass@localhost:1000/3'
    const expectedResult = {
      host: 'localhost',
      port: 1000,
      password: 'dummypass',
      database: '3'
    }

    const parsedUrl = parseUrl(dbUrl)
    parsedUrl.should.be.containEql(expectedResult)
  })
})
