'use strict'

module.exports = {
  async up (queryInterface) {
    // Composite index for rapidFire detection query.
    // occurredAt first (range filter), remaining columns are the GROUP BY dimensions
    // enabling index-only scans for that query.
    await queryInterface.addIndex('request_ip_log', {
      fields: ['occurredAt', 'userId', 'ipAddress', 'endpoint', 'httpMethod'],
      name: 'request_ip_log_rapid_fire_idx'
    })
  },

  async down (queryInterface) {
    await queryInterface.removeIndex(
      'request_ip_log',
      'request_ip_log_rapid_fire_idx'
    )
  }
}
