/**
 * Trusted client-IP resolution for security controls (rate limiting).
 *
 * Production `smartbirds.org` is proxied through Cloudflare, so the real client
 * IP arrives in a single Cloudflare-set header (`cf-connecting-ip` by default);
 * at the origin the TCP peer and any Traefik-rewritten `x-forwarded-for` are
 * Cloudflare's edge IPs, not the client. We therefore trust ONLY the one
 * configured header and otherwise the direct socket IP. We do NOT fall back to
 * `x-forwarded-for`/`x-real-ip`: those are not set by Cloudflare here and would
 * be attacker-controlled on any request that reaches the origin directly.
 *
 * Cloudflare overwrites `cf-connecting-ip` on every proxied request, so it
 * can't be spoofed *through* Cloudflare. It IS spoofable by a client that
 * reaches the origin directly — so per-IP integrity additionally requires the
 * origin to refuse non-Cloudflare connections (Cloudflare-IP allowlist / host
 * firewall; tracked separately).
 */

/**
 * @param {object} connection - ActionHero connection
 * @param {{trustedIpHeader?: string}} [config]
 * @returns {string|undefined} client IP to key rate limits on
 */
function getTrustedClientIP (connection, config) {
  // Lowercased defensively: Node normalises incoming header names to lowercase
  // in req.headers, so a mixed-case configured name (`CF-Connecting-IP`) would
  // never match and we would silently fall back to remoteIP. The config
  // normalises too; this keeps direct callers safe.
  const headerName = ((config && config.trustedIpHeader) || 'cf-connecting-ip').toLowerCase()
  // rawConnection.req is absent for websocket/specHelper connections.
  const headers = connection.rawConnection && connection.rawConnection.req
    ? connection.rawConnection.req.headers || {}
    : {}

  const forwarded = headers[headerName]
  if (forwarded) {
    // cf-connecting-ip is a single IP; the split is harmless defence if a
    // list-style header is ever configured.
    return String(forwarded).split(',')[0].trim()
  }

  return connection.remoteIP
}

module.exports = { getTrustedClientIP }
