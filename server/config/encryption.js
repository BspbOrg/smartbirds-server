'use strict'

const { boolean } = require('boolean')

function parseKey (input) {
  if (!input) return null
  // try base64, then hex
  try {
    const b64 = Buffer.from(input, 'base64')
    if (b64.length === 32) return b64
  } catch (e) {}
  try {
    const hex = Buffer.from(input, 'hex')
    if (hex.length === 32) return hex
  } catch (e) {}
  return null
}

exports.default = {
  encryption: function (api) {
    const enabled = boolean(process.env.API_ENCRYPTION_ENABLED || false)
    const requireHeader = boolean(process.env.API_ENCRYPTION_REQUIRE_HEADER || false)
    const key = parseKey(process.env.API_ENCRYPTION_KEY)
    const kid = process.env.API_ENCRYPTION_KID || '1'

    if (enabled && !key) {
      throw new Error('API_ENCRYPTION_ENABLED is true but API_ENCRYPTION_KEY is missing or invalid (need 32-byte key in hex or base64)')
    }

    return {
      enabled,
      requireClientHeader: requireHeader,
      key,
      kid,
      algorithm: 'aes-256-gcm',
      actionNameRegex: /^form[A-Z]\w+:(list|view)$/,
      responseHeader: 'X-SB-Encrypted',
      acceptHeader: 'X-SB-Accept-Encrypted'
    }
  }
}
