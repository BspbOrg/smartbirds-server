const { Action, api } = require('actionhero')

module.exports.suspiciousActivityDetect = class SuspiciousActivityDetect extends Action {
  constructor () {
    super()
    this.name = 'suspiciousActivity:detect'
    this.description = 'Detect suspicious activity patterns (admin only)'
    this.middleware = ['admin']
    this.inputs = {}
  }

  async run ({ response }) {
    // Run all detection patterns
    const results = await api.suspiciousActivityDetector.detectAll()

    response.data = results
  }
}
