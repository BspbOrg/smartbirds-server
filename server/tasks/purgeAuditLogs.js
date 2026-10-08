const { Task, api } = require('actionhero')

module.exports = class PurgeAuditLogs extends Task {
  constructor () {
    super()
    this.name = 'auditLogs:purge'
    this.description = 'Delete access_audit records older than the configured retention period'
    this.frequency = 0
    this.queue = 'default'
    this.middleware = []
  }

  async run () {
    if (api.sequelize.sequelize.options.dialect !== 'postgres') {
      api.log('Audit log purge requires PostgreSQL', 'warning')
      return
    }

    const retentionDays = parseInt(api.config.audit.retentionDays, 10)
    if (!Number.isFinite(retentionDays) || retentionDays <= 0) {
      api.log('Audit log purge skipped: invalid retentionDays config', 'warning')
      return
    }

    api.log(`Purging access_audit records older than ${retentionDays} days...`, 'info')

    try {
      const [, result] = await api.sequelize.sequelize.query(
        'DELETE FROM access_audit WHERE "occurredAt" < NOW() - (:retentionDays * INTERVAL \'1 day\')',
        { replacements: { retentionDays } }
      )

      const deleted = result ? result.rowCount : 0
      api.log(`Audit log purge complete: ${deleted} records deleted`, 'info')

      return { success: true, deleted }
    } catch (error) {
      api.log(`Error purging audit logs: ${error.message}`, 'error')
      throw error
    }
  }
}
