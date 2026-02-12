const { Action, api } = require('actionhero')

module.exports.suspiciousActivityDetect = class SuspiciousActivityDetect extends Action {
  constructor () {
    super()
    this.name = 'suspiciousActivity:detect'
    this.description = 'Detect suspicious activity patterns (admin only)'
    this.middleware = ['admin']
    this.inputs = {
      saveAlerts: { required: false, default: false } // Option to save results as alerts
    }
  }

  async run ({ params, response }) {
    // Run all detection patterns
    const results = await api.suspiciousActivityDetector.detectAll()

    // Optionally save as alerts
    if (params.saveAlerts) {
      const alerts = await api.suspiciousActivityDetector.processDetectionResults(results)
      results.alertsCreated = alerts.length
    }

    response.data = results
  }
}
