/* eslint-env node, jest */
/* globals api, setup */

describe('PG Tests', function () {
  it('should have booted into the test env', function () {
    expect(process.env.NODE_ENV).toEqual('test')
    expect(api.env).toEqual('test')
    expect(setup.api.id).toBeTruthy()
  })
})
