const crypto = require('crypto')
const { Initializer, api } = require('actionhero')
const { getTrustedClientIP } = require('../helpers/clientIp')
const { compileActionPatterns, resolveTier, buildKey } = require('../helpers/rateLimit')
const createStatsd = require('../helpers/statsd')
const createPeakTracker = require('../helpers/rateLimitPeaks')

/**
 * DogStatsD outcome for a decision (shared metric contract):
 *  allowed      — not over any ceiling
 *  would_block  — over a ceiling in monitor mode (still served)
 *  blocked      — over a ceiling in enforce mode (429'd)
 *
 * METRIC CONTRACT:
 *  ratelimit.decision      counter, one per request. Tags tier, action, outcome.
 *                          The source of truth for REQUEST VOLUME.
 *  ratelimit.identity_peak timer, one per ACTIVE IDENTITY per flush interval.
 *                          Tags tier, dimension. Value = that identity's peak
 *                          sliding-window count since the last flush.
 *  ratelimit.metrics.dropped counter, ONE increment per flush carrying the
 *                          number of records the identity cap rejected in that
 *                          interval (0 → no emission). Untagged.
 *
 * NOTE: `ratelimit.observed` (a timer emitted once per request per dimension)
 * was REMOVED. Its distribution was blended across identities, so its p99 could
 * not size a per-identity ceiling — see server/helpers/rateLimitPeaks.js.
 * Consequence: timer sample count now reflects ACTIVE IDENTITIES, not requests,
 * so the earlier "one observation per decision" reconciliation no longer holds
 * BY DESIGN. Read volume from ratelimit.decision.
 */
function decisionOutcome (decision) {
  if (!decision.blocked) return 'allowed'
  return decision.mode === 'monitor' ? 'would_block' : 'blocked'
}

/**
 * Atomic sliding-window-log limiter.
 *
 * One script evaluates EVERY dimension (per-IP, and per-user when
 * authenticated). It reports whether the request breaches any dimension's
 * ceiling, and records the request in Redis according to `mode`:
 *
 *  - ENFORCE (mode=0): record in ALL keys only when EVERY dimension is under
 *    its ceiling. Recording all-or-nothing prevents a request blocked on one
 *    dimension (e.g. a shared/NAT'd IP) from consuming a slot in another
 *    dimension's window (e.g. the legitimate user's budget).
 *  - MONITOR (mode=1): ALWAYS record, so the windows reflect true traffic
 *    volume for tuning. `blocked` still reports whether it WOULD have blocked;
 *    the caller logs it and lets the request through.
 *
 * KEYS = the bucket keys.
 * ARGV[1]=now(ms), ARGV[2]=window(ms), ARGV[3]=unique member,
 * ARGV[4]=mode (0 enforce | 1 monitor), ARGV[4+i]=the ceiling for KEYS[i].
 * Returns { blocked (0|1), retryAfterMs, observedCount, counts[] }.
 * observedCount = the highest pre-record window count across dimensions
 * (useful in monitor mode to see how far over the ceiling real traffic runs).
 * counts[] = the pre-record window count for EACH key, in KEYS order, so the
 * caller can attribute each count to its dimension (ip vs user) and record it
 * into the per-identity peak tracker, which is flushed as ratelimit.identity_peak.
 * Both saturate at the per-bucket cap (BUCKET_CAP_FACTOR × ceiling) because
 * every bucket is hard-capped to bound Redis memory — monitor's record-always
 * would otherwise let one flooding IP grow a ZSET without limit.
 */
const BUCKET_CAP_FACTOR = 10
const SLIDING_WINDOW_LUA = `
local now = tonumber(ARGV[1])
local window = tonumber(ARGV[2])
local member = ARGV[3]
local mode = tonumber(ARGV[4])
local capFactor = ${BUCKET_CAP_FACTOR}
local minScore = now - window
local blocked = 0
local retryAfter = 0
local observed = 0
local counts = {}
for i = 1, #KEYS do
  local key = KEYS[i]
  redis.call('ZREMRANGEBYSCORE', key, 0, minScore)
  local count = redis.call('ZCARD', key)
  counts[i] = count
  if count > observed then observed = count end
  local max = tonumber(ARGV[4 + i])
  if count >= max then
    blocked = 1
    local oldest = redis.call('ZRANGE', key, 0, 0, 'WITHSCORES')
    if oldest[2] then
      local wait = (tonumber(oldest[2]) + window) - now
      if wait > retryAfter then retryAfter = wait end
    end
  end
end
-- Enforce records all-or-nothing (a blocked request records nothing); monitor
-- always records so counts measure true traffic.
if blocked == 1 and mode == 0 then
  return {1, retryAfter, observed, counts}
end
for i = 1, #KEYS do
  redis.call('ZADD', KEYS[i], now, member)
  redis.call('PEXPIRE', KEYS[i], window)
  -- Hard cap the bucket so record-always (monitor) can't exhaust memory.
  local cap = tonumber(ARGV[4 + i]) * capFactor
  redis.call('ZREMRANGEBYRANK', KEYS[i], 0, -(cap + 1))
end
return {blocked, retryAfter, observed, counts}
`

module.exports = class RateLimiterInit extends Initializer {
  constructor () {
    super()
    this.name = 'rateLimiter'
    this.loadPriority = 625 // After session (500) and ipLogger (600)
  }

  async initialize () {
    const redis = api.redis.clients.client
    // Patterns are static config; compile once, not per request.
    const compiledPatterns = compileActionPatterns(api.config.rateLimit)

    // One fire-and-forget StatsD emitter for the initializer's lifetime. When
    // statsd is disabled (default) this is a complete no-op that opens no
    // socket. Closed in stop().
    const metrics = createStatsd(api.config.statsd || {})

    // Per-identity peak tracking. ALWAYS created, even when statsd is
    // disabled: createStatsd returns a no-op object rather than null, and the
    // tests spy on api.rateLimiter.metrics on a test-booted server — gating the
    // tracker on `enabled` would make flushPeaks() unavailable to them.
    const peaks = createPeakTracker({
      maxIdentities: api.config.rateLimit.metricsMaxIdentities,
      // Surfacing drops matters: silent truncation would read as clean data.
      // ONE packet carrying the count, not n packets: `dropped` counts rejected
      // record() calls, and an over-cap identity is re-rejected on EVERY
      // subsequent request, so n scales with attack volume rather than with the
      // number of new identities. A loop here would emit hundreds of thousands
      // of synchronous sends on the flush tick — stalling the event loop
      // precisely during the flood the metric exists to make visible.
      onDrop: (n) => metrics.increment('ratelimit.metrics.dropped', undefined, n)
    })

    const flushPeaks = () => {
      peaks.flush((tier, dimension, peak) => {
        // Tag insertion order is the wire order: tier, then dimension.
        metrics.timing('ratelimit.identity_peak', peak, { tier, dimension })
      })
    }

    api.rateLimiter = {
      metrics,
      peaks,
      flushPeaks,
      /**
       * Evaluate the request against its tier's per-user and per-IP windows.
       * `blocked` means "over a ceiling" regardless of mode — the middleware
       * decides whether to actually reject (enforce) or just log (monitor).
       * Never throws on Redis failure when failOpen (default) — returns
       * { blocked: false } so the caller lets the request through.
       * @returns {Promise<{blocked: boolean, retryAfterSec: number,
       *   observedCount: number, observedByDimension: Object<string, number>,
       *   tier: string, ip: *, userId: *, mode: string}>}
       */
      check: async (data) => {
        const cfg = api.config.rateLimit
        const tier = resolveTier(data.actionTemplate?.name, compiledPatterns)
        const limits = cfg.tiers[tier] || cfg.tiers.default

        const ip = getTrustedClientIP(data.connection, cfg)
        const userId = data.session && data.session.userId
        // Capture the mode once so check() and the middleware branch on a single
        // value even if api.config.rateLimit is swapped between the two reads.
        const mode = cfg.mode
        const base = { retryAfterSec: 1, observedCount: 0, observedByDimension: {}, tier, ip, userId, mode }

        // Keys, their aligned ceilings, and the dimension label for each — kept
        // in one order so the Lua counts[] (KEYS order) map back to dimensions:
        // [ip], then [user] when present.
        const keys = []
        const maxes = []
        const dimensions = []
        if (ip != null) {
          keys.push(buildKey(tier, 'ip', ip))
          maxes.push(limits.perIp)
          dimensions.push('ip')
        }
        if (userId != null) {
          keys.push(buildKey(tier, 'user', userId))
          maxes.push(limits.perUser)
          dimensions.push('user')
        }
        if (keys.length === 0) return { ...base, blocked: false }

        const now = Date.now()
        const member = `${now}:${crypto.randomBytes(6).toString('hex')}`
        const modeFlag = mode === 'monitor' ? 1 : 0

        try {
          const result = await redis.eval(
            SLIDING_WINDOW_LUA, keys.length, ...keys, now, cfg.windowMs, member, modeFlag, ...maxes
          )
          const blocked = Array.isArray(result) && Number(result[0]) === 1
          const retryAfterMs = Array.isArray(result) ? Number(result[1]) : 0
          const observedCount = Array.isArray(result) ? Number(result[2]) : 0
          const perKeyCounts = Array.isArray(result) && Array.isArray(result[3]) ? result[3] : []
          // Map each key's pre-record count back to its dimension (KEYS order).
          const observedByDimension = {}
          dimensions.forEach((dim, i) => { observedByDimension[dim] = Number(perKeyCounts[i]) || 0 })
          const retryAfterSec = Number.isFinite(retryAfterMs)
            ? Math.max(1, Math.ceil(retryAfterMs / 1000))
            : 1
          return { ...base, blocked, retryAfterSec, observedCount, observedByDimension }
        } catch (err) {
          if (cfg.failOpen === false) {
            // Explicit fail-closed: reject rather than allow unmetered.
            data.connection.rawConnection.responseHttpCode = 503
            throw new Error('Rate limiter unavailable')
          }
          api.log(`rateLimiter: redis error, allowing request: ${err.message}`, 'warning')
          return { ...base, blocked: false }
        }
      }
    }

    const rateLimiterMiddleware = {
      name: 'rateLimiter',
      global: true,
      priority: 26, // After session (20) and ipLogger (25): session is loaded.
      preProcessor: async (data) => {
        const cfg = api.config.rateLimit
        if (!cfg || !cfg.enabled) return

        const actionName = data.actionTemplate?.name
        if (!actionName || cfg.exempt.includes(actionName)) return

        const decision = await api.rateLimiter.check(data)

        // Observability: emit for EVERY checked request, before any
        // block/return branch, so allowed traffic is measured too. Best-effort
        // and fail-open — the emitter swallows all errors and never awaits; we
        // additionally guard against a missing emitter. NO PII in tags (identity
        // stays in the monitor log below); see the shared metric contract.
        const metrics = api.rateLimiter.metrics
        if (metrics) {
          const outcome = decisionOutcome(decision)
          // Record the per-identity window count; the flush timer emits the
          // PEAK per identity. Identity stays in-process as a Map key —
          // it is never tagged or logged from this path.
          const identityFor = { ip: decision.ip, user: decision.userId }
          for (const dimension of Object.keys(decision.observedByDimension || {})) {
            api.rateLimiter.peaks.record(
              decision.tier,
              dimension,
              identityFor[dimension],
              decision.observedByDimension[dimension]
            )
          }
          metrics.increment('ratelimit.decision', {
            tier: decision.tier,
            action: actionName,
            outcome
          })
        }

        if (!decision.blocked) return

        // Monitor mode: never block — just record what would have happened so
        // the ceilings can be tuned against real traffic. Structured so ops can
        // aggregate by action/tier/dimension. NOTE: this line carries client IP
        // and userId (PII) — treat monitor logs under the same retention/consent
        // policy as other request logs; see the GDPR follow-up.
        if (decision.mode === 'monitor') {
          api.log('rateLimiter monitor: would block', 'notice', {
            action: actionName,
            tier: decision.tier,
            ip: decision.ip,
            userId: decision.userId,
            observedCount: decision.observedCount,
            retryAfterSec: decision.retryAfterSec
          })
          return
        }

        // Enforce mode. The 429 throw is OUTSIDE check()'s Redis try/catch, so
        // a Redis error can never be mistaken for a breach (and vice versa).
        data.connection.rawConnection.responseHttpCode = 429
        const res = data.connection.rawConnection.res
        if (res && typeof res.setHeader === 'function') {
          res.setHeader('Retry-After', decision.retryAfterSec)
        }
        throw new Error('Rate limit exceeded')
      }
    }

    api.actions.addMiddleware(rateLimiterMiddleware)

    // The interval runs UNCONDITIONALLY, including when statsd is disabled (the
    // default). The tracker records on every request regardless — gating the
    // flush on `enabled` would leave up to metricsMaxIdentities client IPs and
    // user IDs resident in the Map for the whole process lifetime, turning an
    // interval-scoped aggregation buffer into indefinite PII retention.
    // With a no-op emitter the flush is a walk over an empty-or-small Map every
    // 10s, which is cheaper than the retention it removes.
    this.flushTimer = setInterval(flushPeaks, api.config.rateLimit.metricsFlushMs)
    // Never let observability hold the process open on shutdown.
    this.flushTimer.unref()
    // Exposed so tests can assert the flush is scheduled even with statsd off;
    // this.flushTimer stays the handle stop() clears.
    api.rateLimiter.flushTimer = this.flushTimer
  }

  async stop () {
    // Stop the flush timer, then flush ONE last time so the final interval's
    // peaks are not silently lost, and only then release the socket.
    if (this.flushTimer) {
      clearInterval(this.flushTimer)
      this.flushTimer = null
      if (api.rateLimiter) api.rateLimiter.flushTimer = null
    }
    if (api.rateLimiter && api.rateLimiter.flushPeaks) {
      api.rateLimiter.flushPeaks()
    }
    // Release the UDP socket (no-op when statsd is disabled).
    if (api.rateLimiter && api.rateLimiter.metrics) {
      api.rateLimiter.metrics.close()
    }
  }
}
