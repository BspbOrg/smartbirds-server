'use strict'

const getColumns = function (Sequelize) {
  return {
    regionEn: Sequelize.TEXT,
    regionBg: Sequelize.TEXT,
    longitude: Sequelize.FLOAT,
    latitude: Sequelize.FLOAT,
    imported: Sequelize.INTEGER,
    ekatte: Sequelize.TEXT
  }
}

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const columns = getColumns(Sequelize)
    for (const columnName in columns) {
      await queryInterface.addColumn('Locations', columnName, columns[columnName])
    }
  },

  down: async (queryInterface, Sequelize) => {
    const columns = getColumns(Sequelize)
    for (const columnName in columns) {
      await queryInterface.removeColumn('Locations', columnName)
    }
  }
}
