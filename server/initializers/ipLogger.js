const { Initializer, api } = require('actionhero')

module.exports = class IpLoggerInit extends Initializer {
  constructor () {
    super()
    this.name = 'ipLogger'
    this.loadPriority = 600 // After session (500)
  }

  async initialize () {
    api.ipLogger = {
      logRequest: async (userId, connection, endpoint) => {
        // Only PostgreSQL
        if (api.sequelize.sequelize.options.dialect !== 'postgres') {
          return
        }

        if (!userId) {
          return
        }

        // Get IP address - ActionHero connection provides this
        // Note: connection.remoteIP handles X-Forwarded-For automatically
        const ipAddress = connection.remoteIP
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
          // Log errors but don't break requests (non-blocking)
          api.log(`IP logging error: ${error.message}`, 'error')
        }
      }
    }

    // Add middleware
    const ipLoggerMiddleware = {
      name: 'ipLogger',
      global: true,
      priority: 25, // After session middleware (20)
      preProcessor: async (data) => {
        // Only log authenticated requests
        if (data.session && data.session.userId) {
          await api.ipLogger.logRequest(
            data.session.userId,
            data.connection,
            data.actionTemplate?.name
          )
        }
      }
    }

    api.actions.addMiddleware(ipLoggerMiddleware)
  }
}
