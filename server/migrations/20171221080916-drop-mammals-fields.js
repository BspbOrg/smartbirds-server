'use strict'

const Promise = require('bluebird')

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise
      .all([
        queryInterface.addColumn('FormMammals', 'L', Sequelize.FLOAT),
        queryInterface.addColumn('FormMammals', 'C', Sequelize.FLOAT),
        queryInterface.addColumn('FormMammals', 'A', Sequelize.FLOAT),
        queryInterface.addColumn('FormMammals', 'Pl', Sequelize.FLOAT)
      ])
      .then(function () {
        if (queryInterface.sequelize.options.dialect !== 'postgres') return
        return queryInterface.sequelize.query('UPDATE "FormMammals" SET "L"="sCLL", "C"="mPLLcdC", "A"="mCWA", "Pl"="hLcapPl"')
      })
      .then(function () {
        return Promise.all([
          queryInterface.removeColumn('FormMammals', 'sCLL'),
          queryInterface.removeColumn('FormMammals', 'mPLLcdC'),
          queryInterface.removeColumn('FormMammals', 'mCWA'),
          queryInterface.removeColumn('FormMammals', 'hLcapPl'),
          queryInterface.removeColumn('FormMammals', 'sqVentr'),
          queryInterface.removeColumn('FormMammals', 'sqCaud'),
          queryInterface.removeColumn('FormMammals', 'sqDors'),
          queryInterface.removeColumn('FormMammals', 'tempCloaca')
        ])
      })
  },

  down: (queryInterface, Sequelize) => {
    return Promise
      .all([
        queryInterface.addColumn('FormMammals', 'sCLL', Sequelize.FLOAT),
        queryInterface.addColumn('FormMammals', 'mPLLcdC', Sequelize.FLOAT),
        queryInterface.addColumn('FormMammals', 'mCWA', Sequelize.FLOAT),
        queryInterface.addColumn('FormMammals', 'hLcapPl', Sequelize.FLOAT),
        queryInterface.addColumn('FormMammals', 'sqVentr', Sequelize.FLOAT),
        queryInterface.addColumn('FormMammals', 'sqCaud', Sequelize.FLOAT),
        queryInterface.addColumn('FormMammals', 'sqDors', Sequelize.FLOAT),
        queryInterface.addColumn('FormMammals', 'tempCloaca', Sequelize.FLOAT)
      ])
      .then(function () {
        if (queryInterface.sequelize.options.dialect !== 'postgres') return
        return queryInterface.sequelize.query('UPDATE "FormMammals" SET "sCLL"="L", "mPLLcdC"="C", "mCWA"="A", "hLcapPl"="Pl"')
      })
      .then(function () {
        return Promise.all([
          queryInterface.removeColumn('FormMammals', 'L'),
          queryInterface.removeColumn('FormMammals', 'C'),
          queryInterface.removeColumn('FormMammals', 'A'),
          queryInterface.removeColumn('FormMammals', 'Pl')
        ])
      })
  }
}
