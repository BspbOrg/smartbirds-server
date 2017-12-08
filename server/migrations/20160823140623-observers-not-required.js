'use strict'

module.exports = {
  up: function (queryInterface, Sequelize) {
    if (queryInterface.sequelize.options.dialect !== 'postgres') return
    return queryInterface.sequelize.query('ALTER TABLE "FormBirds" ALTER COLUMN observers DROP NOT NULL;')
    .then(function () {
      return queryInterface.sequelize.query('ALTER TABLE "FormHerps" ALTER COLUMN observers DROP NOT NULL;')
      .then(function () {
        return queryInterface.sequelize.query('ALTER TABLE "FormCiconia" ALTER COLUMN observers DROP NOT NULL;')
      })
    })
  },

  down: function (queryInterface, Sequelize) {
    if (queryInterface.sequelize.options.dialect !== 'postgres') return
    return queryInterface.sequelize.query('ALTER TABLE "FormBirds" ALTER COLUMN observers SET NOT NULL;')
    .then(function () {
      return queryInterface.sequelize.query('ALTER TABLE "FormHerps" ALTER COLUMN observers SET NOT NULL;')
      .then(function () {
        return queryInterface.sequelize.query('ALTER TABLE "FormCiconia" ALTER COLUMN observers SET NOT NULL;')
      })
    })
  }
}
