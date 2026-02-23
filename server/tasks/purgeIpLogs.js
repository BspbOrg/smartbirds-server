const { Task, api } = require('actionhero')

module.exports = class PurgeIpLogs extends Task {
  constructor () {
    super()
    this.name = 'ipLogs:purge'
    this.description = 'Delete request_ip_log records older than the configured retention period'
    this.frequency = 0
    this.queue = 'default'
    this.middleware = []
  }

  async run () {
    if (api.sequelize.sequelize.options.dialect !== 'postgres') {
      api.log('IP log purge requires PostgreSQL', 'warning')
      return
    }

    const retentionDays = parseInt(api.config.suspiciousActivity.retentionDays, 10)
    if (!Number.isFinite(retentionDays) || retentionDays <= 0) {
      api.log('IP log purge skipped: invalid retentionDays config', 'warning')
      return
    }

    api.log(`Purging request_ip_log records older than ${retentionDays} days...`, 'info')

    try {
      const [, result] = await api.sequelize.sequelize.query(
        'DELETE FROM request_ip_log WHERE "occurredAt" < NOW() - (:retentionDays * INTERVAL \'1 day\')',
        { replacements: { retentionDays } }
      )

      const deleted = result ? result.rowCount : 0
      api.log(`IP log purge complete: ${deleted} records deleted`, 'info')

      return { success: true, deleted }
    } catch (error) {
      api.log(`Error purging IP logs: ${error.message}`, 'error')
      throw error
    }
  }
}
