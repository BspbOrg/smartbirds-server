/* eslint-env mocha */

const assert = require('assert')
const sinon = require('sinon')

const promiseCallback = require('../../server/helpers/promiseCallback')

describe('Promise calback helper:', () => {
  describe('when callback is provided', () => {
    it('returns next callback', () => {
      const { next } = promiseCallback(() => {})

      assert(next != null)
    })

    it('calling returned callback calls the provided', () => {
      const cb = sinon.spy()
      const { next } = promiseCallback(cb)

      next()

      assert(cb.calledOnce)
    })

    it('propagates all params to provided callback', () => {
      const cb = sinon.spy()
      const params = []
      for (let i = 0; i < 1000; i++) {
        params.push(i)
      }
      const { next } = promiseCallback(cb)

      next(...params)

      assert(cb.calledWith(...params))
    })

    it('does not call mapper', async () => {
      const mapper = sinon.spy()
      const { next } = promiseCallback(() => {}, mapper)

      next()

      assert(!mapper.called)
    })

    it('does not call mapper on error', async () => {
      const mapper = sinon.spy()
      const { next } = promiseCallback(() => {}, mapper)

      next(new Error())

      assert(!mapper.called)
    })
  })

  describe('when callback is not provided', () => {
    it('returns next callback', () => {
      const { next } = promiseCallback()

      assert(next != null)
    })

    it('returns result promise', () => {
      const { result } = promiseCallback()

      assert(result instanceof Promise)
    })

    it('calling returned callback with error rejects the promise', async () => {
      const { result, next } = promiseCallback()
      const error = new Error()

      next(error)

      try {
        await result
        assert(false)
      } catch (e) {
        assert(e === error)
      }
    })

    it('calling returned callback with result resolves the promise', async () => {
      const { result, next } = promiseCallback()
      const returnedResult = {}

      next(null, returnedResult)

      const promiseResult = await result
      assert(promiseResult === returnedResult)
    })

    it('promise resolves with the first param', async () => {
      const param1 = {}
      const param2 = {}
      assert(param1 !== param2)
      const { result, next } = promiseCallback()

      next(null, param1, param2)

      const promiseResult = await result
      assert(promiseResult === param1)
    })

    it('calls mapper to generate promise result', async () => {
      const params = []
      for (let i = 0; i < 1000; i++) {
        params.push(i)
      }
      const mapper = sinon.spy()
      const { next } = promiseCallback(null, mapper)

      next(null, ...params)

      assert(mapper.calledWith(...params))
    })

    it('resolves promise with mapper result', async () => {
      const mapperResult = {}
      const mapper = sinon.stub().returns(mapperResult)
      const { result, next } = promiseCallback(null, mapper)

      next()

      const promiseResult = await result

      assert(promiseResult === mapperResult)
    })

    it('rejects promise if mapper throws', async () => {
      const error = new Error()
      const mapper = sinon.stub().throws(error)
      const { result, next } = promiseCallback(null, mapper)

      next()

      try {
        await result
        assert(false)
      } catch (thrownError) {
        assert(thrownError === error)
      }
    })

    it('does not call mapper on error', async () => {
      const mapper = sinon.spy(() => new Error('where are you'))
      const { result, next } = promiseCallback(null, mapper)

      next(new Error())
      try { await result } catch (e) {
        // just silent the error about unhandled promise rejection
      }

      assert(!mapper.called)
    })
  })
})
