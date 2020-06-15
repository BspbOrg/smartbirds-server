module.exports = {
  up: async function (queryInterface, Sequelize) {
    await queryInterface.addColumn('FormCiconia', 'sourceLocal', Sequelize.TEXT)
    await queryInterface.addColumn('FormCiconia', 'sourceLang', Sequelize.STRING(3))
    await queryInterface.addColumn('FormCiconia', 'sourceEn', Sequelize.TEXT)
  },

  down: async function (queryInterface, Sequelize) {
    await queryInterface.removeColumn('FormCiconia', 'sourceLocal')
    await queryInterface.removeColumn('FormCiconia', 'sourceLang')
    await queryInterface.removeColumn('FormCiconia', 'sourceEn')
  }
}
