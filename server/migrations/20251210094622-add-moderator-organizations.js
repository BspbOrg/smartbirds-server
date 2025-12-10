'use strict'
const Sequelize = require('sequelize')

module.exports = {
  async up (queryInterface) {
    await queryInterface.addColumn('Users', 'moderatorOrganizations', {
      type: Sequelize.ARRAY(Sequelize.STRING),
      allowNull: true
    })

    await queryInterface.addIndex('Users', {
      fields: ['moderatorOrganizations'],
      using: 'GIN',
      name: 'users_moderator_organizations_gin'
    })
  },

  async down (queryInterface) {
    await queryInterface.removeColumn('Users', 'moderatorOrganizations')
    await queryInterface.removeIndex('Users', 'users_moderator_organizations_gin')
  }
}
