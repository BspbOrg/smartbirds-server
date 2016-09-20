'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.addColumn('FormBirds', 'sourceBg', Sequelize.TEXT)
      .then(function () {
        return queryInterface.addColumn('FormBirds', 'sourceEn', Sequelize.TEXT)
      });
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.removeColumn('FormBirds', 'sourceBg')
      .then(function () {
        queryInterface.removeColumn('FormBirds', 'sourceEn')
      });
  }
};
