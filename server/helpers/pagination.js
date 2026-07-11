/**
 * Shared pagination bounding helpers.
 *
 * Two limit semantics coexist deliberately:
 *
 *  - clampLimit: floor-then-cap. Negatives and non-numeric values become at
 *    least 1. A caller that does not treat -1 as "unlimited" uses this so a
 *    hostile -1 yields a single row.
 *
 *  - resolveLimit: -1 (and any negative) is the "give me everything" sentinel;
 *    it maps to the caller's `max` ceiling, so the result is always bounded.
 *    Positive values are capped at `max`; absent or zero falls back to
 *    `defaultLimit`.
 */

/**
 * Floor-then-cap. Negatives and non-numeric values become at least 1.
 * @param {*} value
 * @param {number} max - maximum allowed page size
 * @param {{defaultLimit?: number}} [opts]
 * @returns {number}
 */
function clampLimit (value, max, { defaultLimit = 20 } = {}) {
  return Math.min(max, Math.max(1, parseInt(value, 10) || defaultLimit))
}

/**
 * Resolve a client limit where -1/negative means "all, up to `max`".
 * Never returns an unbounded/negative limit.
 * @param {*} value
 * @param {number} max - hard ceiling applied to every result
 * @param {{defaultLimit?: number}} [opts]
 * @returns {number}
 */
function resolveLimit (value, max, { defaultLimit = 20 } = {}) {
  const parsed = parseInt(value, 10)
  if (isNaN(parsed) || parsed === 0) return Math.min(max, defaultLimit)
  if (parsed < 0) return max
  return Math.min(max, parsed)
}

/**
 * Floor an offset at 0.
 * @param {*} value
 * @returns {number}
 */
function clampOffset (value) {
  return Math.max(0, parseInt(value, 10) || 0)
}

module.exports = { clampLimit, resolveLimit, clampOffset }
