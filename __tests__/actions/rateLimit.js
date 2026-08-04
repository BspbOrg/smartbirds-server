/* eslint-env node, jest */
/* globals setup */

const { api } = setup

// All specHelper connections share one synthetic IP ('testServer'), and each
// runActionAs* fires session:create (a guest hit) then the target action on the
// same connection. Tests account for both: they flush limiter keys per test,
// keep the untested dimension's ceiling high, and drive the specific dimension
// under test. __tests__/** runs only under jest.pg.config.js.

describe('rate limiting', () => {
  // The peak-flush interval runs unconditionally in production (see the PII
  // note in the initializer), but a background firing here would clear the
  // tracker mid-test and inject timing calls into the spies — the emission
  // tests hold a live spy across awaited actions for ~50-150ms each. Every test
  // drives flushPeaks() explicitly, so stop the interval and assert separately
  // that boot scheduled it. clearInterval on an already-cleared handle in
  // stop() is a no-op.
  let flushScheduledAtBoot
  beforeAll(() => {
    flushScheduledAtBoot = Boolean(api.rateLimiter.flushTimer)
    clearInterval(api.rateLimiter.flushTimer)
  })

  describe('config auto-load', () => {
    test('rateLimit config is present after boot with no manual assignment', () => {
      // Guards against a filename/key mismatch silently disabling the limiter.
      expect(api.config.rateLimit).toBeDefined()
      expect(api.config.rateLimit.tiers).toBeDefined()
      expect(api.config.rateLimit.tiers.default).toEqual(
        expect.objectContaining({ perUser: expect.any(Number), perIp: expect.any(Number) })
      )
      expect(api.config.rateLimit.tiers.sensitive).toEqual(
        expect.objectContaining({ perUser: expect.any(Number), perIp: expect.any(Number) })
      )
    })

    test('mode defaults to monitor, so an unvalidated ceiling never blocks', () => {
      // Deliberate: the tier ceilings have not been validated against real
      // traffic, and enforcing them 429s ordinary use. Blocking is opt-in via
      // RATE_LIMIT_MODE=enforce. If this fails because the default was changed
      // back, the ceilings must have been resized from observed traffic first.
      delete process.env.RATE_LIMIT_MODE
      const fresh = require('../../server/config/rateLimit').default.rateLimit(api)
      expect(fresh.mode).toBe('monitor')
    })

    test('metrics tuning config is present with documented defaults', () => {
      delete process.env.RATE_LIMIT_METRICS_FLUSH_MS
      delete process.env.RATE_LIMIT_METRICS_MAX_IDENTITIES
      const fresh = require('../../server/config/rateLimit').default.rateLimit(api)
      // 10s matches Telegraf's agent interval: one sample per active identity
      // per aggregation window.
      expect(fresh.metricsFlushMs).toBe(10000)
      expect(fresh.metricsMaxIdentities).toBe(10000)
    })

    test('a sub-second flush interval is rejected at boot (hot timer guard)', () => {
      process.env.RATE_LIMIT_METRICS_FLUSH_MS = '999'
      try {
        expect(() => require('../../server/config/rateLimit').default.rateLimit(api)).toThrow(/>= 1000/)
      } finally {
        delete process.env.RATE_LIMIT_METRICS_FLUSH_MS
      }
    })
  })

  describe('enforcement', () => {
    let redis
    let savedConfig

    const flush = async () => {
      const keys = await redis.keys('rl:*')
      if (keys.length) await redis.del(...keys)
    }

    beforeEach(async () => {
      redis = api.redis.clients.client
      await flush()
      savedConfig = api.config.rateLimit
      // Fresh, permissive clone; each test tightens the dimension it exercises.
      // mode is pinned to 'enforce': the config default is 'monitor' (which
      // never 429s), so this suite must opt in to blocking explicitly. The
      // monitor-mode tests below override it back.
      api.config.rateLimit = {
        ...savedConfig,
        enabled: true,
        mode: 'enforce',
        windowMs: 60000,
        tiers: {
          default: { perUser: 1000, perIp: 1000 },
          sensitive: { perUser: 1000, perIp: 1000 }
        }
      }
    })

    afterEach(async () => {
      api.config.rateLimit = savedConfig
      await flush()
    })

    test('guest requests are limited per-IP (default tier)', async () => {
      api.config.rateLimit.tiers.default.perIp = 3
      const responses = []
      for (let i = 0; i < 4; i++) {
        responses.push(await setup.runActionAsGuest('session:create', {}))
      }
      expect(responses.slice(0, 3).every(r => r.responseHttpCode !== 429)).toBe(true)
      expect(responses[3].responseHttpCode).toBe(429)
      expect(responses[3].error).toBeTruthy()
    })

    test('a sensitive action is limited per-user', async () => {
      api.config.rateLimit.tiers.sensitive.perUser = 3
      api.config.rateLimit.tiers.sensitive.perIp = 1000
      const responses = []
      for (let i = 0; i < 4; i++) {
        responses.push(await setup.runActionAsAdmin('formBears:list', {}))
      }
      expect(responses.slice(0, 3).every(r => r.responseHttpCode !== 429)).toBe(true)
      expect(responses[3].responseHttpCode).toBe(429)
      expect(responses[3].error).toBeTruthy()
    })

    test('a blocked IP dimension does not consume the user window (M2)', async () => {
      const admin = await api.models.user.findOne({ where: { email: 'admin@smartbirds.com' } })
      api.config.rateLimit.tiers.sensitive.perIp = 2
      api.config.rateLimit.tiers.sensitive.perUser = 10

      const r1 = await setup.runActionAsAdmin('formBears:list', {})
      const r2 = await setup.runActionAsAdmin('formBears:list', {})
      const r3 = await setup.runActionAsAdmin('formBears:list', {}) // blocked on IP

      expect(r1.responseHttpCode).not.toBe(429)
      expect(r2.responseHttpCode).not.toBe(429)
      expect(r3.responseHttpCode).toBe(429)

      // The blocked request must not have recorded in the user window.
      const userCount = await redis.zcard(`rl:sensitive:user:${admin.id}`)
      expect(userCount).toBe(2)
    })

    test('exempt actions are never limited', async () => {
      api.config.rateLimit.tiers.default.perIp = 1
      const responses = []
      for (let i = 0; i < 4; i++) {
        responses.push(await setup.runActionAsGuest('session:check', {}))
      }
      expect(responses.every(r => r.responseHttpCode !== 429)).toBe(true)
    })

    test('fails open when Redis errors (request actually served, not 429 nor 500)', async () => {
      api.config.rateLimit.tiers.sensitive.perUser = 1 // would block after the 1st
      const origEval = redis.eval
      redis.eval = jest.fn().mockRejectedValue(new Error('redis down'))
      try {
        const r1 = await setup.runActionAsAdmin('formBears:list', {})
        const r2 = await setup.runActionAsAdmin('formBears:list', {})
        // Not blocked...
        expect(r1.responseHttpCode).not.toBe(429)
        expect(r2.responseHttpCode).not.toBe(429)
        // ...and genuinely served (a fail-CLOSED 500 would also be !== 429).
        expect(r1.error).toBeFalsy()
        expect(r2.error).toBeFalsy()
        expect(Array.isArray(r1.data)).toBe(true)
      } finally {
        redis.eval = origEval
      }
    })

    test('does nothing when disabled', async () => {
      api.config.rateLimit.enabled = false
      api.config.rateLimit.tiers.sensitive.perUser = 1 // would block after the 1st if enabled
      const responses = []
      for (let i = 0; i < 3; i++) {
        responses.push(await setup.runActionAsAdmin('formBears:list', {}))
      }
      expect(responses.every(r => r.responseHttpCode !== 429)).toBe(true)
    })

    test('a blocked user dimension does not consume the IP window (symmetric to M2)', async () => {
      api.config.rateLimit.tiers.sensitive.perUser = 2
      api.config.rateLimit.tiers.sensitive.perIp = 10

      await setup.runActionAsAdmin('formBears:list', {})
      await setup.runActionAsAdmin('formBears:list', {})
      const r3 = await setup.runActionAsAdmin('formBears:list', {}) // blocked on user

      expect(r3.responseHttpCode).toBe(429)
      const ipCount = await redis.zcard('rl:sensitive:ip:testServer')
      expect(ipCount).toBe(2) // blocked request did not record in the IP window
    })

    test('check() reports a positive Retry-After on a breach', async () => {
      api.config.rateLimit.tiers.sensitive.perIp = 1
      const data = {
        actionTemplate: { name: 'formBears:list' },
        connection: { remoteIP: '203.0.113.7', rawConnection: {} },
        session: { userId: 987654 }
      }
      const first = await api.rateLimiter.check(data)
      const second = await api.rateLimiter.check(data)
      expect(first.blocked).toBe(false)
      expect(second.blocked).toBe(true)
      expect(second.retryAfterSec).toBeGreaterThanOrEqual(1)
    })

    test('the sliding window recovers after windowMs (entries evicted)', async () => {
      api.config.rateLimit.windowMs = 300
      api.config.rateLimit.tiers.sensitive.perIp = 1
      const data = {
        actionTemplate: { name: 'formBears:list' },
        connection: { remoteIP: '198.51.100.5', rawConnection: {} }
      }
      expect((await api.rateLimiter.check(data)).blocked).toBe(false) // 1st ok
      expect((await api.rateLimiter.check(data)).blocked).toBe(true) // 2nd over
      await new Promise(resolve => setTimeout(resolve, 400)) // window elapses
      expect((await api.rateLimiter.check(data)).blocked).toBe(false) // evicted → ok
    })

    describe('monitor mode', () => {
      test('never blocks, but records every request and reports would-block', async () => {
        api.config.rateLimit.mode = 'monitor'
        api.config.rateLimit.tiers.sensitive.perUser = 1
        api.config.rateLimit.tiers.sensitive.perIp = 1000

        const responses = []
        for (let i = 0; i < 4; i++) {
          responses.push(await setup.runActionAsAdmin('formBears:list', {}))
        }
        // Nothing is blocked...
        expect(responses.every(r => r.responseHttpCode !== 429)).toBe(true)
        expect(responses.every(r => !r.error)).toBe(true)

        // ...but the user window recorded ALL of them (record-always), so it
        // sits well over the ceiling — that's what makes it measurable.
        const admin = await api.models.user.findOne({ where: { email: 'admin@smartbirds.com' } })
        const userCount = await redis.zcard(`rl:sensitive:user:${admin.id}`)
        expect(userCount).toBe(4)
      })

      test('check() reports blocked=true (would-block) in monitor mode', async () => {
        api.config.rateLimit.mode = 'monitor'
        api.config.rateLimit.tiers.sensitive.perIp = 1
        const data = {
          actionTemplate: { name: 'formBears:list' },
          connection: { remoteIP: '203.0.113.9', rawConnection: {} }
        }
        expect((await api.rateLimiter.check(data)).blocked).toBe(false)
        const second = await api.rateLimiter.check(data)
        expect(second.blocked).toBe(true) // WOULD block
        expect(second.observedCount).toBeGreaterThanOrEqual(1)
      })

      test('emits a would-block notice log (the measurement signal)', async () => {
        api.config.rateLimit.mode = 'monitor'
        api.config.rateLimit.tiers.sensitive.perUser = 1
        const spy = jest.spyOn(api, 'log')
        try {
          await setup.runActionAsAdmin('formBears:list', {})
          await setup.runActionAsAdmin('formBears:list', {}) // over ceiling → would block
          const logged = spy.mock.calls.some(
            ([msg, level]) => msg === 'rateLimiter monitor: would block' && level === 'notice'
          )
          expect(logged).toBe(true)
        } finally {
          spy.mockRestore()
        }
      })
    })

    describe('check() observedByDimension', () => {
      test('reports the per-dimension pre-record window count for ip and user', async () => {
        api.config.rateLimit.tiers.sensitive.perIp = 1000
        api.config.rateLimit.tiers.sensitive.perUser = 1000
        const data = {
          actionTemplate: { name: 'formBears:list' },
          connection: { remoteIP: '203.0.113.20', rawConnection: {} },
          session: { userId: 424242 }
        }
        const first = await api.rateLimiter.check(data)
        expect(first.observedByDimension).toEqual({ ip: 0, user: 0 })
        const second = await api.rateLimiter.check(data)
        expect(second.observedByDimension).toEqual({ ip: 1, user: 1 })
        // The legacy max field stays consistent (additive change).
        expect(second.observedCount).toBe(1)
      })

      test('reports only the ip dimension for a guest (no userId)', async () => {
        api.config.rateLimit.tiers.default.perIp = 1000
        const data = {
          actionTemplate: { name: 'session:create' },
          connection: { remoteIP: '203.0.113.21', rawConnection: {} }
        }
        const decision = await api.rateLimiter.check(data)
        expect(decision.observedByDimension).toEqual({ ip: 0 })
        expect(decision.observedByDimension.user).toBeUndefined()
      })
    })

    describe('statsd emission', () => {
      const decisionsFor = (spy, action) => spy.mock.calls.filter(
        ([name, tags]) => name === 'ratelimit.decision' && tags.action === action
      )
      const peaksSensitive = (spy) => spy.mock.calls.filter(
        ([name, , tags]) => name === 'ratelimit.identity_peak' && tags.tier === 'sensitive'
      )

      test('allowed request: decision=allowed + identity_peak per dimension (ip+user)', async () => {
        api.config.rateLimit.tiers.sensitive.perIp = 1000
        api.config.rateLimit.tiers.sensitive.perUser = 1000
        const spyI = jest.spyOn(api.rateLimiter.metrics, 'increment')
        const spyT = jest.spyOn(api.rateLimiter.metrics, 'timing')
        try {
          await setup.runActionAsAdmin('formBears:list', {})
          const decisions = decisionsFor(spyI, 'formBears:list')
          expect(decisions).toHaveLength(1)
          expect(decisions[0][1]).toEqual({ tier: 'sensitive', action: 'formBears:list', outcome: 'allowed' })
          // Timers are deferred to the flush now, so drive it explicitly.
          api.rateLimiter.flushPeaks()
          const dims = peaksSensitive(spyT).map(([, , tags]) => tags.dimension).sort()
          expect(dims).toEqual(['ip', 'user'])
          peaksSensitive(spyT).forEach(([, , tags]) => expect(tags.tier).toBe('sensitive'))
        } finally {
          spyI.mockRestore()
          spyT.mockRestore()
        }
      })

      test('guest (unauthenticated) emits identity_peak for the ip dimension only', async () => {
        api.config.rateLimit.tiers.default.perIp = 1000
        const spyT = jest.spyOn(api.rateLimiter.metrics, 'timing')
        try {
          await setup.runActionAsGuest('session:create', {
            email: 'user@smartbirds.com', password: 'secret'
          })
          api.rateLimiter.flushPeaks()
          const peaks = spyT.mock.calls.filter(([name]) => name === 'ratelimit.identity_peak')
          const dims = peaks.map(([, , tags]) => tags.dimension)
          expect(dims).toContain('ip')
          expect(dims).not.toContain('user')
        } finally {
          spyT.mockRestore()
        }
      })

      test('enforce over ceiling: decision outcome is blocked', async () => {
        api.config.rateLimit.tiers.sensitive.perUser = 1
        const spyI = jest.spyOn(api.rateLimiter.metrics, 'increment')
        try {
          await setup.runActionAsAdmin('formBears:list', {})
          await setup.runActionAsAdmin('formBears:list', {}) // over ceiling → 429
          const decisions = decisionsFor(spyI, 'formBears:list')
          expect(decisions.map(([, tags]) => tags.outcome)).toEqual(['allowed', 'blocked'])
        } finally {
          spyI.mockRestore()
        }
      })

      test('monitor over ceiling: decision outcome is would_block', async () => {
        api.config.rateLimit.mode = 'monitor'
        api.config.rateLimit.tiers.sensitive.perUser = 1
        const spyI = jest.spyOn(api.rateLimiter.metrics, 'increment')
        try {
          await setup.runActionAsAdmin('formBears:list', {})
          await setup.runActionAsAdmin('formBears:list', {}) // over ceiling → would_block
          const decisions = decisionsFor(spyI, 'formBears:list')
          expect(decisions.map(([, tags]) => tags.outcome)).toEqual(['allowed', 'would_block'])
        } finally {
          spyI.mockRestore()
        }
      })

      test('exempt actions emit no metrics (no decision → no emission)', async () => {
        const spyI = jest.spyOn(api.rateLimiter.metrics, 'increment')
        const spyT = jest.spyOn(api.rateLimiter.metrics, 'timing')
        try {
          // runActionAsGuest fires session:create (NOT exempt) before the
          // target action, so isolate the exempt action itself: flush and
          // clear anything carried over from prior tests / session:create,
          // then prove session:check adds nothing new.
          api.rateLimiter.flushPeaks()
          spyT.mockClear()
          const before = api.rateLimiter.peaks.size
          await setup.runActionAsGuest('session:check', {})
          expect(decisionsFor(spyI, 'session:check')).toHaveLength(0)
          // An exempt action must not even be tracked — nothing to flush.
          expect(api.rateLimiter.peaks.size).toBe(before)
          api.rateLimiter.flushPeaks()
          expect(spyT.mock.calls.filter(([name]) => name === 'ratelimit.identity_peak')).toHaveLength(0)
        } finally {
          spyI.mockRestore()
          spyT.mockRestore()
        }
      })
    })

    describe('identity_peak emission', () => {
      const peaksFrom = (spy) => spy.mock.calls.filter(
        ([name]) => name === 'ratelimit.identity_peak'
      )

      test('exposes a tracker and a directly callable flush', () => {
        // Tests must never depend on the flush interval's wall clock.
        expect(api.rateLimiter.peaks).toBeDefined()
        expect(typeof api.rateLimiter.flushPeaks).toBe('function')
      })

      test('records instead of emitting a timer per request', async () => {
        const spyT = jest.spyOn(api.rateLimiter.metrics, 'timing')
        try {
          await setup.runActionAsAdmin('formBears:list', {})
          // Nothing emitted yet — emission is deferred to the flush.
          expect(peaksFrom(spyT)).toHaveLength(0)
          expect(api.rateLimiter.peaks.size).toBeGreaterThan(0)
        } finally {
          spyT.mockRestore()
        }
      })

      test('flush emits one timer per identity+dimension, tagged tier+dimension only', async () => {
        api.config.rateLimit.tiers.sensitive.perIp = 1000
        api.config.rateLimit.tiers.sensitive.perUser = 1000
        const spyT = jest.spyOn(api.rateLimiter.metrics, 'timing')
        try {
          await setup.runActionAsAdmin('formBears:list', {})
          api.rateLimiter.flushPeaks()
          const emitted = peaksFrom(spyT).filter(([, , tags]) => tags.tier === 'sensitive')
          const dims = emitted.map(([, , tags]) => tags.dimension).sort()
          expect(dims).toEqual(['ip', 'user'])
          // Tags carry NO identity — that is the whole PII contract.
          emitted.forEach(([, , tags]) => {
            expect(Object.keys(tags)).toEqual(['tier', 'dimension'])
          })
        } finally {
          spyT.mockRestore()
        }
      })

      test('emits the MAX window count across several requests, not one per request', async () => {
        api.config.rateLimit.tiers.sensitive.perUser = 1000
        api.config.rateLimit.tiers.sensitive.perIp = 1000
        const spyT = jest.spyOn(api.rateLimiter.metrics, 'timing')
        try {
          await setup.runActionAsAdmin('formBears:list', {})
          await setup.runActionAsAdmin('formBears:list', {})
          await setup.runActionAsAdmin('formBears:list', {})
          api.rateLimiter.flushPeaks()
          const userPeaks = peaksFrom(spyT).filter(
            ([, , tags]) => tags.dimension === 'user' && tags.tier === 'sensitive'
          )
          // One sample for the identity, not one per request.
          expect(userPeaks).toHaveLength(1)
          // Value is the highest pre-record count seen, so it grows with volume.
          expect(userPeaks[0][1]).toBeGreaterThanOrEqual(1)
        } finally {
          spyT.mockRestore()
        }
      })

      test('the removed per-request observed timer is gone', async () => {
        const spyT = jest.spyOn(api.rateLimiter.metrics, 'timing')
        try {
          await setup.runActionAsAdmin('formBears:list', {})
          api.rateLimiter.flushPeaks()
          expect(spyT.mock.calls.filter(([name]) => name === 'ratelimit.observed')).toHaveLength(0)
        } finally {
          spyT.mockRestore()
        }
      })

      test('nothing is recorded on the Redis fail-open path', async () => {
        // Fail-open returns observedByDimension {} — there is no count to track.
        // (Making the outage itself visible is tracked separately.)
        const spyEval = jest.spyOn(api.redis.clients.client, 'eval')
          .mockRejectedValue(new Error('redis down'))
        const spyT = jest.spyOn(api.rateLimiter.metrics, 'timing')
        try {
          await setup.runActionAsAdmin('formBears:list', {})
          const before = api.rateLimiter.peaks.size
          api.rateLimiter.flushPeaks()
          expect(before).toBe(0)
          expect(peaksFrom(spyT)).toHaveLength(0)
        } finally {
          spyEval.mockRestore()
          spyT.mockRestore()
        }
      })

      // Verifies the WIRING rather than the tracker: that the onDrop callback
      // built in initialize() is what increments the real emitter's
      // 'ratelimit.metrics.dropped'. Driven through api.rateLimiter.peaks (not a
      // standalone createPeakTracker) via the same record() path the middleware
      // uses, with more distinct identities than the configured cap.
      test('the configured onDrop wiring reports drops as ONE counted increment', () => {
        // Start from a known-empty tracker so the drop count is exact.
        api.rateLimiter.flushPeaks()
        const spyI = jest.spyOn(api.rateLimiter.metrics, 'increment')
        try {
          const cap = api.config.rateLimit.metricsMaxIdentities
          // Fill the tracker to the cap with distinct identities.
          for (let i = 0; i < cap; i++) {
            api.rateLimiter.peaks.record('default', 'ip', `wiring-test-${i}`, 1)
          }
          // Over-cap identities are re-rejected on every record, so the drop
          // count tracks request volume, not distinct identities. It must be
          // reported as a single counter increment carrying that total — a
          // packet-per-drop loop would stall the event loop under a flood.
          const overflow = 50
          for (let i = 0; i < overflow; i++) {
            api.rateLimiter.peaks.record('default', 'ip', 'wiring-test-overflow', 1)
          }
          api.rateLimiter.flushPeaks()
          const dropped = spyI.mock.calls.filter(([name]) => name === 'ratelimit.metrics.dropped')
          expect(dropped).toHaveLength(1)
          expect(dropped[0][2]).toBe(overflow)
        } finally {
          spyI.mockRestore()
        }
      })

      test('the flush is scheduled at boot even when statsd is disabled', () => {
        // Gating the interval on statsd.enabled (off by default) would leave up
        // to metricsMaxIdentities IPs/userIds resident for the process lifetime.
        // Read from the boot snapshot: beforeAll stops the live interval so it
        // cannot fire mid-test.
        expect(api.config.statsd.enabled).toBe(false)
        expect(flushScheduledAtBoot).toBe(true)
      })
    })
  })
})
