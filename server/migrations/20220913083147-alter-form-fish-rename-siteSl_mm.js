'use strict'

module.exports = {
  async up (queryInterface) {
    await queryInterface.renameColumn('FormFishes', 'siteSL_mm', 'sizeSL_mm')
  },

  async down (queryInterface) {
    await queryInterface.renameColumn('FormFishes', 'sizeSL_mm', 'siteSL_mm')
  }
}
