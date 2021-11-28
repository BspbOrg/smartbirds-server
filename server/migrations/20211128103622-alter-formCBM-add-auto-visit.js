module.exports = {
  up: async function (queryInterface, Sequelize) {
    await queryInterface.addColumn('FormCBM', 'auto_visit', { type: Sequelize.INTEGER })
    await queryInterface.addIndex('FormCBM', { fields: ['auto_visit', 'observationDateTime'] })
  },

  down: async function (queryInterface, Sequelize) {
    await queryInterface.removeColumn('FormCBM', 'auto_visit')
  }
}
