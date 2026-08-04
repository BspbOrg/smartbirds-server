/* eslint-env node, jest */
const { getTrustedClientIP } = require('../../server/helpers/clientIp')
const rateLimitConfig = require('../../server/config/rateLimit')

// Build a fake connection with the given request headers (or none).
// Keys are lowercased to model Node: the HTTP parser normalises every incoming
// header name in req.headers, so a double that stored keys verbatim would let a
// case-mismatched lookup pass here and still miss in production.
const conn = (headers, remoteIP = '10.0.0.1') => ({
  remoteIP,
  rawConnection: headers
    ? { req: { headers: Object.fromEntries(Object.entries(headers).map(([k, v]) => [k.toLowerCase(), v])) } }
    : {}
})

describe('helpers/clientIp getTrustedClientIP', () => {
  test('honours the trusted header (cf-connecting-ip by default)', () => {
    // Prod/staging are behind Cloudflare, which sets cf-connecting-ip.
    expect(getTrustedClientIP(conn({ 'cf-connecting-ip': '1.2.3.4' }))).toBe('1.2.3.4')
  })

  test('trims whitespace / takes the first hop', () => {
    expect(getTrustedClientIP(conn({ 'cf-connecting-ip': '  1.2.3.4  ' }))).toBe('1.2.3.4')
  })

  test('IGNORES x-forwarded-for / x-real-ip (Cloudflare edge IPs / spoofable at origin)', () => {
    // At the origin these are Cloudflare's IP or attacker-controlled; never trusted.
    const c = conn({ 'x-forwarded-for': '9.9.9.9', 'x-real-ip': '8.8.8.8' })
    expect(getTrustedClientIP(c)).toBe('10.0.0.1')
  })

  test('falls back to remoteIP when the trusted header is absent', () => {
    expect(getTrustedClientIP(conn({}))).toBe('10.0.0.1')
  })

  test('falls back to remoteIP when there is no req (websocket/specHelper)', () => {
    expect(getTrustedClientIP(conn(null))).toBe('10.0.0.1')
  })

  test('respects a configured alternate trusted header (e.g. direct-serve deployment)', () => {
    const c = conn({ 'x-forwarded-for': '9.9.9.9' })
    expect(getTrustedClientIP(c, { trustedIpHeader: 'x-forwarded-for' })).toBe('9.9.9.9')
  })

  test('matches a mixed-case configured header (Cloudflare documents CF-Connecting-IP)', () => {
    // Node delivers the key lowercased; the lookup must normalise or it silently
    // falls back to remoteIP — behind Cloudflare that is the edge IP, which puts
    // every client into one rate-limit bucket.
    const c = conn({ 'CF-Connecting-IP': '1.2.3.4' })
    expect(getTrustedClientIP(c, { trustedIpHeader: 'CF-Connecting-IP' })).toBe('1.2.3.4')
  })
})

describe('config/rateLimit trustedIpHeader normalisation', () => {
  const buildConfig = () => rateLimitConfig.default.rateLimit({ env: 'test' })

  afterEach(() => { delete process.env.RATE_LIMIT_IP_HEADER })

  test('defaults to cf-connecting-ip', () => {
    expect(buildConfig().trustedIpHeader).toBe('cf-connecting-ip')
  })

  test('lowercases and trims RATE_LIMIT_IP_HEADER', () => {
    process.env.RATE_LIMIT_IP_HEADER = '  CF-Connecting-IP  '
    expect(buildConfig().trustedIpHeader).toBe('cf-connecting-ip')
  })

  test('the configured header resolves the client IP end to end', () => {
    // config → helper, the path the middleware actually takes.
    process.env.RATE_LIMIT_IP_HEADER = 'CF-Connecting-IP'
    const c = conn({ 'cf-connecting-ip': '1.2.3.4' })
    expect(getTrustedClientIP(c, buildConfig())).toBe('1.2.3.4')
  })
})
