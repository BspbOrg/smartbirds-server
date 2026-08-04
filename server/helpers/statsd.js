/**
 * Minimal, dependency-free DogStatsD emitter over UDP.
 *
 * Fire-and-forget by design: timing/increment build a packet and hand it to a
 * single reused UDP socket with an error callback that swallows everything.
 * They NEVER throw and NEVER await, so metric emission can never affect request
 * handling. When `enabled` is false no socket is created and every method is a
 * complete no-op.
 *
 * Wire format (DogStatsD): `name:value|<type>[|#k:v,k:v]`
 *  - timer:   `name:value|ms`
 *  - counter: `name:<n>|c` (n defaults to 1)
 * A counter carries its own value, so a caller that has already aggregated N
 * events sends ONE packet rather than N — see the identity-drop path in
 * server/initializers/rateLimiter.js, where N scales with attack volume.
 * Tags are appended in the INSERTION order of the provided object (no sorting),
 * so callers control ordering and packets are deterministic for tests.
 *
 * @param {{enabled: boolean, host: string, port: number}} options
 * @returns {{timing: Function, increment: Function, close: Function}}
 */
const dgram = require('dgram')

module.exports = function createStatsd ({ enabled, host, port } = {}) {
  if (!enabled) {
    return { timing: () => {}, increment: () => {}, close: () => {} }
  }

  const socket = dgram.createSocket('udp4')
  // The socket must never crash the process on an async send error.
  socket.on('error', () => {})

  const formatTags = (tags) => {
    if (!tags) return ''
    const parts = []
    for (const key of Object.keys(tags)) {
      parts.push(`${key}:${tags[key]}`)
    }
    return parts.length ? `|#${parts.join(',')}` : ''
  }

  const send = (packet) => {
    // errCb swallows errors: fire-and-forget, fail-open.
    socket.send(Buffer.from(packet), port, host, () => {})
  }

  return {
    timing (name, value, tags) {
      try {
        send(`${name}:${value}|ms${formatTags(tags)}`)
      } catch (_) { /* never throw out of emission */ }
    },
    increment (name, tags, value = 1) {
      try {
        send(`${name}:${value}|c${formatTags(tags)}`)
      } catch (_) { /* never throw out of emission */ }
    },
    close () {
      try {
        socket.close()
      } catch (_) { /* already closed / never throw */ }
    }
  }
}
