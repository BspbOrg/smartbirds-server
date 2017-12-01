'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.addColumn('Users', 'language', {type: Sequelize.STRING, defaultValue: 'bg'});
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.removeColumn('Users', 'language');
  }
};
