'use strict'

const crypto = require('crypto')
const { upgradeInitializer, upgradeMiddleware } = require('../utils/upgrade')

function isJsonRenderable (data) {
  // If ActionHero is not going to render, or we already sent a file/stream, skip
  if (data.toRender === false) return false
  // Sending file via web server usually handled with sendFile and sets toRender=false
  // If response is a stream or buffer, skip
  if (!data || !data.response) return false
  return true
}

function shouldEncrypt (api, data) {
  const cfg = api.config.encryption
  if (!cfg || !cfg.enabled) return false

  // Require client header when configured
  if (cfg.requireClientHeader) {
    const req = data.connection?.rawConnection?.req
    const hasHeader = !!(req && (req.headers[cfg.acceptHeader.toLowerCase()] || req.headers[cfg.acceptHeader]))
    if (!hasHeader) return false
  }

  // Only for matching actions
  const actionName = data.action
  if (!cfg.actionNameRegex.test(actionName)) return false

  // Do not encrypt when there is an error
  if (data.error) return false

  // Only JSON-like responses
  if (!isJsonRenderable(data)) return false

  return true
}

function encryptEnvelope (api, payloadBuffer) {
  const { key, kid, algorithm } = api.config.encryption
  const iv = crypto.randomBytes(12)
  const cipher = crypto.createCipheriv(algorithm, key, iv)
  const ciphertext = Buffer.concat([cipher.update(payloadBuffer), cipher.final()])
  const tag = cipher.getAuthTag()

  return {
    __enc: true,
    alg: 'A256GCM',
    kid,
    iv: iv.toString('base64'),
    tag: tag.toString('base64'),
    data: ciphertext.toString('base64')
  }
}

module.exports = upgradeInitializer('ah17', {
  name: 'responseEncryption',
  loadPriority: 9500,
  initialize: function (api, next) {
    try {
      const middleware = upgradeMiddleware('ah17', {
        name: 'responseEncryption',
        global: true,
        priority: 9000,
        postProcessor: function (data, done) {
          try {
            if (!shouldEncrypt(api, data)) return done()

            const cfg = api.config.encryption
            const plaintext = JSON.stringify(data.response)
            const envelope = encryptEnvelope(api, Buffer.from(plaintext, 'utf8'))

            // replace response and mark header
            data.response = envelope
            data.connection.rawConnection.responseHeaders.push([
              cfg.responseHeader,
              `${envelope.alg}; kid=${envelope.kid}`
            ])
          } catch (e) {
            api.log(`responseEncryption error: ${e.message}`, 'error', e)
          }
          done()
        }
      })

      api.actions.addMiddleware(middleware)
      next()
    } catch (e) {
      next(e)
    }
  }
})
