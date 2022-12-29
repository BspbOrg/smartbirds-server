'use strict'

module.exports = {
  async up (queryInterface) {
    await queryInterface.sequelize.query('ALTER TABLE "Nomenclatures" ALTER COLUMN "labelBg" DROP NOT NULL;')
  },

  async down (queryInterface) {
    await queryInterface.sequelize.query('ALTER TABLE "Nomenclatures" ALTER COLUMN "labelBg" SET NOT NULL;')
  }
}
