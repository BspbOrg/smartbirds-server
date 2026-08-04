/**
 * Per-identity peak tracker for rate-limiter observability.
 *
 * WHY THIS EXISTS: `ratelimit.observed` used to emit one timer sample per
 * request, tagged only tier+dimension. Telegraf therefore blended every user's
 * and every IP's window count into ONE distribution per tier+dimension — but the
 * value being sized from it (RATE_LIMIT_*_PER_USER) is a PER-IDENTITY ceiling. A
 * long tail of light users drags that blended p99 down, so a ceiling read off it
 * would be too low and would 429 the heaviest legitimate users. More data does
 * not fix it; the shape of the metric was wrong.
 *
 * Instead we keep the MAX window count seen per identity and flush those peaks
 * periodically, so the resulting p99 is "the heaviest single user".
 *
 * PII: identity is used ONLY as a Map key. It is never passed to `emit`, never
 * becomes a tag, and is never logged from here — so the emitted tag set and
 * series count are identical to before and the GDPR posture is unchanged.
 *
 * Totality: `record` is called on the request path, so it never throws and
 * never blocks. Malformed input is silently ignored — observability must not be
 * able to affect request handling.
 *
 * @param {{maxIdentities: number, onDrop?: (n: number) => void}} options
 * @returns {{record: Function, flush: Function, size: number}}
 */
module.exports = function createPeakTracker ({ maxIdentities, onDrop } = {}) {
  // key = JSON.stringify([tier, dimension, identity]) → highest count since last flush.
  const peaks = new Map()
  const cap = Number.isFinite(maxIdentities) && maxIdentities > 0 ? maxIdentities : Infinity
  let dropped = 0

  return {
    /**
     * Record one observation. Keeps the maximum per identity.
     * At the cap, NEW identities are dropped but EXISTING ones keep updating —
     * a flood of new identities must not evict the heavy users being measured.
     */
    record (tier, dimension, identity, count) {
      if (identity == null || tier == null || dimension == null) return
      // Reject non-numbers (including numeric strings) and non-finite/negative
      // values outright: a bad sample is worse than a missing one here.
      if (typeof count !== 'number' || !Number.isFinite(count) || count < 0) return
      // Identity LAST so an identity containing the separator cannot collide
      // across tiers/dimensions. Use JSON to preserve structure even if fields
      // contain separator characters.
      const key = JSON.stringify([tier, dimension, identity])
      const current = peaks.get(key)
      if (current === undefined) {
        if (peaks.size >= cap) {
          dropped++
          return
        }
        peaks.set(key, count)
        return
      }
      if (count > current) peaks.set(key, count)
    },

    /**
     * Emit one sample per tracked identity, then CLEAR. Clearing is what makes
     * each interval a fresh sample of currently-active identities; an identity
     * that goes idle simply contributes no sample, which is correct — it has no
     * peak to report.
     * Always clears, even if `emit` throws, so a bad emitter cannot make the
     * Map grow without bound.
     */
    flush (emit) {
      try {
        for (const [key, peak] of peaks) {
          // Extract tier and dimension from JSON key, discarding identity
          // so it is never passed to emit (no PII in the metric path).
          const [tier, dimension] = JSON.parse(key)
          try {
            emit(tier, dimension, peak)
          } catch (err) {
            // Emit threw; swallow it to prevent corrupting the tracker.
            // A bad emitter must not be able to affect request handling.
          }
        }
      } finally {
        peaks.clear()
        if (dropped > 0) {
          const n = dropped
          dropped = 0
          if (typeof onDrop === 'function') onDrop(n)
        }
      }
    },

    get size () {
      return peaks.size
    }
  }
}
