const { DataTypes } = require('sequelize')

module.exports = {
  async up (queryInterface) {
    await queryInterface.addColumn('Users', 'allowDataMosv', DataTypes.BOOLEAN)
    await queryInterface.addColumn('Users', 'allowDataSciencePublications', DataTypes.BOOLEAN)
  },

  async down (queryInterface) {
    await queryInterface.removeColumn('Users', 'allowDataMosv')
    await queryInterface.removeColumn('Users', 'allowDataSciencePublications')
  }
}
