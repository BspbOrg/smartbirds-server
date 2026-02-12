const { Task, api } = require('actionhero')

module.exports = class DetectSuspiciousActivity extends Task {
  constructor () {
    super()
    this.name = 'suspiciousActivity:detect'
    this.description = 'Detect suspicious activity patterns and create alerts'
    this.frequency = 0
    this.queue = 'default'
    this.middleware = []
  }

  async run (params) {
    // Only PostgreSQL
    if (api.sequelize.sequelize.options.dialect !== 'postgres') {
      api.log('Suspicious activity detection requires PostgreSQL', 'warning')
      return
    }

    // Check if auto-detection is enabled
    if (!api.config.suspiciousActivity.autoDetect) {
      api.log('Auto-detection disabled, skipping', 'debug')
      return
    }

    api.log('Running suspicious activity detection...', 'info')

    try {
      // Run detection
      const detectionResults = await api.suspiciousActivityDetector.detectAll()

      // Process results and create alerts
      const alerts = await api.suspiciousActivityDetector.processDetectionResults(detectionResults)

      api.log(`Detection complete: ${alerts.length} new alerts`, 'info')

      return {
        success: true,
        alertsCreated: alerts.length,
        summary: detectionResults.summary
      }
    } catch (error) {
      api.log(`Error in suspicious activity detection: ${error.message}`, 'error')
      throw error
    }
  }
}
