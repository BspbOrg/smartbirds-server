'use strict'

module.exports = {
  async up (queryInterface) {
    // sqlite doesn't support altering columns
    if (queryInterface.sequelize.options.dialect !== 'sqlite') {
      await queryInterface.sequelize.query('ALTER TABLE "Nomenclatures" ALTER COLUMN "labelBg" DROP NOT NULL;')
    }
  },

  async down (queryInterface) {
    // sqlite doesn't support altering columns
    if (queryInterface.sequelize.options.dialect !== 'sqlite') {
      await queryInterface.sequelize.query('ALTER TABLE "Nomenclatures" ALTER COLUMN "labelBg" SET NOT NULL;')
    }
  }
}
