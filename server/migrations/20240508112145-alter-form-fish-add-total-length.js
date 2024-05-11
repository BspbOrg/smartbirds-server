'use strict'
const { DataTypes } = require('sequelize')

module.exports = {
  async up (queryInterface) {
    await queryInterface.addColumn('FormFishes', 'totalLengthEn', {
      type: DataTypes.TEXT,
      allowNull: true
    })
    await queryInterface.addColumn('FormFishes', 'totalLengthLocal', {
      type: DataTypes.TEXT,
      allowNull: true
    })
    await queryInterface.addColumn('FormFishes', 'totalLengthLang', {
      type: DataTypes.STRING(3),
      allowNull: true
    })
  },

  async down (queryInterface) {
    await queryInterface.removeColumn('FormFishes', 'totalLengthEn')
    await queryInterface.removeColumn('FormFishes', 'totalLengthLocal')
    await queryInterface.removeColumn('FormFishes', 'totalLengthLang')
  }
}
