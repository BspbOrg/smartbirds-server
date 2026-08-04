/* eslint-env node, jest */
const dgram = require('dgram')
const createStatsd = require('../../server/helpers/statsd')

// Deterministic tag ordering: tags are emitted in the INSERTION order of the
// provided object (DogStatsD `#k:v,k:v`), matching the shared metric contract
// wire examples (tier first, then dimension / action,outcome). No sorting.

describe('helpers/statsd', () => {
  let sent
  let fakeSocket
  let sendImpl

  beforeEach(() => {
    sent = []
    sendImpl = (buf, port, host, cb) => { if (cb) cb() }
    fakeSocket = {
      on: jest.fn(),
      send: jest.fn((buf, port, host, cb) => {
        sent.push({ msg: buf.toString(), port, host })
        return sendImpl(buf, port, host, cb)
      }),
      close: jest.fn()
    }
    jest.spyOn(dgram, 'createSocket').mockReturnValue(fakeSocket)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('enabled emitter', () => {
    let statsd
    beforeEach(() => {
      statsd = createStatsd({ enabled: true, host: 'telegraf', port: 8125 })
    })
    afterEach(() => statsd.close())

    test('timing sends the exact DogStatsD timer packet with ordered tags', () => {
      statsd.timing('ratelimit.observed', 37, { tier: 'sensitive', dimension: 'ip' })
      expect(sent).toHaveLength(1)
      expect(sent[0].msg).toBe('ratelimit.observed:37|ms|#tier:sensitive,dimension:ip')
      expect(sent[0].port).toBe(8125)
      expect(sent[0].host).toBe('telegraf')
    })

    test('increment sends the exact DogStatsD counter packet with ordered tags', () => {
      statsd.increment('ratelimit.decision', { tier: 'default', action: 'formBears:list', outcome: 'allowed' })
      expect(sent).toHaveLength(1)
      expect(sent[0].msg).toBe('ratelimit.decision:1|c|#tier:default,action:formBears:list,outcome:allowed')
    })

    test('increment carries an explicit count in ONE packet', () => {
      // The drop path aggregates in-process and reports a total; emitting it as
      // n separate packets would put an attack-volume loop on the flush tick.
      statsd.increment('ratelimit.metrics.dropped', undefined, 4213)
      expect(sent).toHaveLength(1)
      expect(sent[0].msg).toBe('ratelimit.metrics.dropped:4213|c')
    })

    test('omits the #tags suffix entirely when there are no tags', () => {
      statsd.timing('ratelimit.observed', 5)
      statsd.increment('ratelimit.decision')
      expect(sent[0].msg).toBe('ratelimit.observed:5|ms')
      expect(sent[1].msg).toBe('ratelimit.decision:1|c')
    })

    test('reuses a single socket across calls', () => {
      statsd.timing('a', 1, { x: '1' })
      statsd.increment('b', { y: '2' })
      expect(dgram.createSocket).toHaveBeenCalledTimes(1)
    })

    test('a socket.send error never throws out of timing/increment', () => {
      sendImpl = (buf, port, host, cb) => { if (cb) cb(new Error('boom')) }
      expect(() => statsd.timing('ratelimit.observed', 1, { tier: 'default', dimension: 'ip' })).not.toThrow()
      expect(() => statsd.increment('ratelimit.decision', { tier: 'default', action: 'x', outcome: 'allowed' })).not.toThrow()
    })
  })

  describe('disabled emitter', () => {
    test('creates no socket and sends nothing', () => {
      const statsd = createStatsd({ enabled: false, host: 'telegraf', port: 8125 })
      statsd.timing('ratelimit.observed', 37, { tier: 'sensitive', dimension: 'ip' })
      statsd.increment('ratelimit.decision', { tier: 'default', action: 'x', outcome: 'allowed' })
      statsd.close()
      expect(dgram.createSocket).not.toHaveBeenCalled()
      expect(sent).toHaveLength(0)
    })
  })
})
