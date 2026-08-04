/**
 * Strict environment-variable parsers.
 *
 * Each returns the fallback ONLY when the variable is unset or blank, accepts a
 * fixed, documented set of valid inputs, and THROWS on anything else — so a
 * misconfigured deploy fails loudly at boot instead of silently running with
 * unintended behavior (e.g. an unrecognised value quietly enabling a limiter,
 * or a non-positive limit silently disabling a security control).
 */

const TRUE = new Set(['true', '1', 'yes', 'on'])
const FALSE = new Set(['false', '0', 'no', 'off'])

const isBlank = (raw) => raw == null || raw.trim() === ''

/**
 * @param {string} name - env var name
 * @param {boolean} def - value when unset/blank
 * @returns {boolean}
 */
function boolEnv (name, def) {
  const raw = process.env[name]
  if (isBlank(raw)) return def
  const v = raw.trim().toLowerCase()
  if (TRUE.has(v)) return true
  if (FALSE.has(v)) return false
  throw new Error(`${name} must be a boolean (true/false/1/0/yes/no/on/off), got "${raw}"`)
}

/**
 * @param {string} name - env var name
 * @param {number} def - value when unset/blank
 * @param {{min?: number, max?: number}} [bounds] - inclusive range; throws if outside
 * @returns {number} - integer (0 and negatives allowed unless bounded)
 */
function intEnv (name, def, { min, max } = {}) {
  const raw = process.env[name]
  if (isBlank(raw)) return def
  if (!/^-?\d+$/.test(raw.trim())) {
    throw new Error(`${name} must be an integer, got "${raw}"`)
  }
  const n = parseInt(raw.trim(), 10)
  if (min != null && n < min) throw new Error(`${name} must be >= ${min}, got ${n}`)
  if (max != null && n > max) throw new Error(`${name} must be <= ${max}, got ${n}`)
  return n
}

/**
 * @param {string} name - env var name
 * @param {string[]} allowed - permitted lowercase values
 * @param {string} def - value when unset/blank
 * @returns {string}
 */
function enumEnv (name, allowed, def) {
  const raw = process.env[name]
  if (isBlank(raw)) return def
  const v = raw.trim().toLowerCase()
  if (allowed.includes(v)) return v
  throw new Error(`${name} must be one of ${allowed.join('/')}, got "${raw}"`)
}

module.exports = { boolEnv, intEnv, enumEnv }
