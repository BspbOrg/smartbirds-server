const { boolEnv, intEnv, enumEnv } = require('../helpers/envParse')

exports.default = {
  rateLimit: function (api) {
    return {
      // Off by default under test: every specHelper connection shares one
      // synthetic IP, so a globally-active limiter would throttle the suite.
      // Individual rate-limit tests opt in by flipping this in beforeEach.
      // RATE_LIMIT_ENABLED overrides in any environment.
      enabled: boolEnv('RATE_LIMIT_ENABLED', api.env !== 'test'),

      // 'enforce' — over-limit requests get 429.
      // 'monitor' — the limiter runs and records EVERY request (so counts
      //   reflect true traffic) and logs what it WOULD block, but never blocks.
      //   Use this to measure real traffic and tune the ceilings before
      //   enforcing. See api.log level 'notice', message 'rateLimiter monitor'.
      //
      // Defaults to 'monitor', NOT 'enforce'. The ceilings below are educated
      // guesses that have never been validated against production traffic, and
      // an unvalidated ceiling that blocks is a self-inflicted outage: the
      // sensitive tier (every *:list / *:export) at 60/window 429'd ordinary
      // use, because a paginated list UI spends one request per page and a user
      // scrolling a list trivially exceeds 60 pages in a window.
      //
      // So blocking is opt-in per deployment: run in monitor, size the tiers
      // from the p99/max of per-identity peaks (with 1.5–2x headroom) via
      // ratelimit.identity_peak and the 'would block' notices, then set
      // RATE_LIMIT_MODE=enforce. Do not flip this default
      // back without also raising the ceilings — the limiter is still a real
      // control in monitor mode (it records, logs, and reports), it just does
      // not reject.
      mode: enumEnv('RATE_LIMIT_MODE', ['enforce', 'monitor'], 'monitor'),

      // On a Redis error the limiter allows the request (fail-open by design):
      // a Redis hiccup must not take the API offline. Set RATE_LIMIT_FAIL_OPEN=false
      // to reject with 503 instead (couples API availability to Redis — only for
      // deployments that want that trade-off).
      failOpen: boolEnv('RATE_LIMIT_FAIL_OPEN', true),

      // Sliding-window length in milliseconds. Must be positive — a
      // non-positive window would evict everything every call (limiter off).
      windowMs: intEnv('RATE_LIMIT_WINDOW_MS', 60000, { min: 1 }),

      // How often the per-identity peak tracker flushes to StatsD.
      // Matched to Telegraf's 10s agent interval so each aggregation window
      // receives exactly one sample per active identity.
      //
      // Why 10s and not the 60s sliding window: the recorded value is ALREADY
      // Redis's 60s sliding-window count, so flushing at 10s does not shorten
      // the measured window — it samples that same trailing-60s quantity more
      // densely, which is what populates the percentile. Flushing at 60s would
      // land every sample in one of six Telegraf windows and leave five empty.
      // Min 1s guards against a hot timer.
      metricsFlushMs: intEnv('RATE_LIMIT_METRICS_FLUSH_MS', 10000, { min: 1000 }),

      // Cap on identities tracked per flush interval, bounding observability
      // memory under a flood. At the cap NEW identities are dropped (counted via
      // ratelimit.metrics.dropped so the truncation is visible rather than
      // looking like clean data) while EXISTING ones keep updating — a flood must
      // not evict the heavy users being measured.
      metricsMaxIdentities: intEnv('RATE_LIMIT_METRICS_MAX_IDENTITIES', 10000, { min: 1 }),

      // The single header trusted for the client IP. Prod and staging sit
      // behind Cloudflare, which sets cf-connecting-ip to the real client on
      // every proxied request; x-forwarded-for at the origin is Cloudflare's
      // edge IP. Nothing else is trusted. Override for a non-CF deployment.
      // Normalised to lowercase: Node lowercases every incoming header name in
      // req.headers, so a configured `CF-Connecting-IP` would match nothing and
      // silently fall back to the socket peer — behind Cloudflare that is the
      // edge IP, collapsing all traffic into one bucket.
      trustedIpHeader: (process.env.RATE_LIMIT_IP_HEADER || 'cf-connecting-ip').trim().toLowerCase(),

      // Per-window ceilings, evaluated independently per dimension (user + IP).
      tiers: {
        // Everything not matched below. Includes auth endpoints (login
        // hardening is tracked separately) and `downloader` (per-image
        // photo/track fetch — many per page, so it must NOT sit in the tight
        // sensitive tier or galleries break; bulk photo scraping is still
        // bounded here and by volume detection).
        // Ceilings must be >= 1 — a ceiling of 0 would block every request
        // (self-DoS). "Unlimited" is expressed by disabling the limiter, not 0.
        default: {
          perUser: intEnv('RATE_LIMIT_DEFAULT_PER_USER', 300, { min: 1 }),
          perIp: intEnv('RATE_LIMIT_DEFAULT_PER_IP', 300, { min: 1 })
        },
        // High-value BULK endpoints: list/export dumps (see actionPatterns).
        sensitive: {
          perUser: intEnv('RATE_LIMIT_SENSITIVE_PER_USER', 60, { min: 1 }),
          perIp: intEnv('RATE_LIMIT_SENSITIVE_PER_IP', 60, { min: 1 })
        }
      },

      // Action-name → tier. Patterns are strings compiled once at boot (keeps
      // resolveTier trivially unit-testable). First match wins; unmatched →
      // 'default'. `:(list|export)$` covers user:list and every generated
      // form*:list / form*:export.
      actionPatterns: [
        { pattern: ':(list|export)$', tier: 'sensitive' }
      ],

      // Actions never rate limited (metadata/liveness only).
      exempt: ['status', 'session:check']
    }
  }
}
