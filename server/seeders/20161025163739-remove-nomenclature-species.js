'use strict'

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.bulkDelete('Nomenclatures', {
      type: {
        $in: [
          'birds_name',
          'herp_name'
        ]
      }
    })
  },

  down: function (queryInterface, Sequelize) {
    // nothing to perform here
  }
}
