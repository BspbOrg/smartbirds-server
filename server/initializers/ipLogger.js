const { Initializer, api } = require('actionhero')
const Sentry = require('@sentry/node')

module.exports = class IpLoggerInit extends Initializer {
  constructor () {
    super()
    this.name = 'ipLogger'
    this.loadPriority = 600 // After session (500)
  }

  async initialize () {
    // Endpoints excluded from IP logging (metadata-only, no data access)
    const EXCLUDED_ENDPOINTS = new Set([
      'i18n', // Translations
      'nomenclature:types', // Type lists (not actual data)
      'species:types',
      'poi:types',
      'map_layer:types',
      'session:check' // Session validation only
    ])

    /**
     * Extract real client IP address from connection, handling proxy headers
     * Priority: CF-Connecting-IP (Cloudflare) > X-Real-IP > X-Forwarded-For > connection.remoteIP
     */
    const getRealClientIP = (connection) => {
      const headers = connection.rawConnection.req?.headers || {}

      // Cloudflare's most reliable header (can't be spoofed by client)
      if (headers['cf-connecting-ip']) {
        return headers['cf-connecting-ip']
      }

      // Standard proxy headers
      if (headers['x-real-ip']) {
        return headers['x-real-ip']
      }

      if (headers['x-forwarded-for']) {
        // Take first IP in the chain (original client)
        return headers['x-forwarded-for'].split(',')[0].trim()
      }

      // Fallback to direct connection IP
      return connection.remoteIP
    }

    api.ipLogger = {
      logRequest: async (userId, connection, endpoint) => {
        // Only log to PostgreSQL
        if (api.sequelize.sequelize.options.dialect !== 'postgres') {
          return
        }

        if (!userId) {
          return
        }

        // Skip excluded endpoints
        if (EXCLUDED_ENDPOINTS.has(endpoint)) {
          return
        }

        // Extract request metadata
        const ipAddress = getRealClientIP(connection)
        const sessionFingerprint = connection.fingerprint
        const httpMethod = connection.rawConnection.req?.method
        const userAgent = connection.rawConnection.req?.headers['user-agent']

        try {
          await api.models.request_ip_log.create({
            userId,
            ipAddress,
            sessionFingerprint,
            endpoint,
            httpMethod,
            occurredAt: new Date(),
            userAgent
          })
        } catch (error) {
          api.log(`IP logging error: ${error.message}`, 'error')
          Sentry.captureException(error)
        }
      }
    }

    const ipLoggerMiddleware = {
      name: 'ipLogger',
      global: true,
      priority: 25, // After session middleware
      preProcessor: async (data) => {
        // Only log authenticated requests
        if (data.session && data.session.userId) {
          const endpoint = data.actionTemplate?.name

          // Skip form list count queries (return only counts, not data)
          // Restricted to form*:list endpoints to prevent bypass attacks
          if (data.params?.context === 'count') {
            const isFormListEndpoint = endpoint?.match(/^form[A-Z][a-zA-Z]+:list$/)
            if (isFormListEndpoint) {
              return
            }
          }

          api.ipLogger.logRequest(
            data.session.userId,
            data.connection,
            endpoint
          ).catch(err => {
            api.log(`IP log error: ${err.message}`, 'error')
            Sentry.captureException(err)
          })
        }
      }
    }

    api.actions.addMiddleware(ipLoggerMiddleware)
  }
}
