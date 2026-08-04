/**
 * Pure rate-limit helpers (no Redis, no ActionHero) so tier resolution and key
 * construction are unit-testable in isolation. The Redis sliding-window itself
 * lives in the rateLimiter initializer.
 */

/**
 * Compile the config's string action patterns into a matcher list once, so the
 * per-request hot path does not recompile regexes.
 * @param {{actionPatterns?: Array<{pattern: string, tier: string}>}} config
 * @returns {Array<{re: RegExp, tier: string}>}
 */
function compileActionPatterns (config) {
  return (config.actionPatterns || []).map(({ pattern, tier }) => ({
    re: new RegExp(pattern),
    tier
  }))
}

/**
 * Resolve the tier for an action name against compiled patterns. First match
 * wins; anything unmatched (including a missing name) falls to 'default'.
 * @param {string|undefined} actionName
 * @param {Array<{re: RegExp, tier: string}>} compiledPatterns
 * @returns {string}
 */
function resolveTier (actionName, compiledPatterns) {
  if (!actionName) return 'default'
  for (const { re, tier } of compiledPatterns) {
    if (re.test(actionName)) return tier
  }
  return 'default'
}

/**
 * Build the Redis key for one (tier, dimension, identity) bucket.
 * @param {string} tier
 * @param {'user'|'ip'} dimension
 * @param {string|number} id
 * @returns {string}
 */
function buildKey (tier, dimension, id) {
  return `rl:${tier}:${dimension}:${id}`
}

module.exports = { compileActionPatterns, resolveTier, buildKey }
