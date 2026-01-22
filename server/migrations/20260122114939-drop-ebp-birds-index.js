'use strict'

const tableName = 'ebp_birds'

module.exports = {
  async up (queryInterface) {
    await queryInterface.removeIndex(tableName, 'ebp_birds_ebp_id')
  },

  async down (queryInterface) {
    await queryInterface.addIndex(tableName, { unique: true, fields: ['ebpId'] })
  }
}
