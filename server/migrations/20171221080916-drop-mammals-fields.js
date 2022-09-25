'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('FormMammals', 'L', Sequelize.FLOAT)
    await queryInterface.addColumn('FormMammals', 'C', Sequelize.FLOAT)
    await queryInterface.addColumn('FormMammals', 'A', Sequelize.FLOAT)
    await queryInterface.addColumn('FormMammals', 'Pl', Sequelize.FLOAT)

    if (queryInterface.sequelize.options.dialect !== 'postgres') return
    await queryInterface.sequelize.query('UPDATE "FormMammals" SET "L"="sCLL", "C"="mPLLcdC", "A"="mCWA", "Pl"="hLcapPl"')

    await queryInterface.removeColumn('FormMammals', 'sCLL')
    await queryInterface.removeColumn('FormMammals', 'mPLLcdC')
    await queryInterface.removeColumn('FormMammals', 'mCWA')
    await queryInterface.removeColumn('FormMammals', 'hLcapPl')
    await queryInterface.removeColumn('FormMammals', 'sqVentr')
    await queryInterface.removeColumn('FormMammals', 'sqCaud')
    await queryInterface.removeColumn('FormMammals', 'sqDors')
    await queryInterface.removeColumn('FormMammals', 'tempCloaca')
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('FormMammals', 'sCLL', Sequelize.FLOAT)
    await queryInterface.addColumn('FormMammals', 'mPLLcdC', Sequelize.FLOAT)
    await queryInterface.addColumn('FormMammals', 'mCWA', Sequelize.FLOAT)
    await queryInterface.addColumn('FormMammals', 'hLcapPl', Sequelize.FLOAT)
    await queryInterface.addColumn('FormMammals', 'sqVentr', Sequelize.FLOAT)
    await queryInterface.addColumn('FormMammals', 'sqCaud', Sequelize.FLOAT)
    await queryInterface.addColumn('FormMammals', 'sqDors', Sequelize.FLOAT)
    await queryInterface.addColumn('FormMammals', 'tempCloaca', Sequelize.FLOAT)

    if (queryInterface.sequelize.options.dialect !== 'postgres') return
    await queryInterface.sequelize.query('UPDATE "FormMammals" SET "sCLL"="L", "mPLLcdC"="C", "mCWA"="A", "hLcapPl"="Pl"')

    await queryInterface.removeColumn('FormMammals', 'L')
    await queryInterface.removeColumn('FormMammals', 'C')
    await queryInterface.removeColumn('FormMammals', 'A')
    await queryInterface.removeColumn('FormMammals', 'Pl')
  }
}
