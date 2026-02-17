'use strict'

module.exports = {
  async up (queryInterface) {
    await queryInterface.addIndex('access_audit', {
      fields: ['ownerUserId', 'occurredAt'],
      name: 'access_audit_owner_occurred_idx'
    })
  },

  async down (queryInterface) {
    await queryInterface.removeIndex(
      'access_audit',
      'access_audit_owner_occurred_idx'
    )
  }
}
