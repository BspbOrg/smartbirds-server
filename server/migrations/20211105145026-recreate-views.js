const views = require('./views')

module.exports = {
  up: async (queryInterface) => {
    if (queryInterface.sequelize.options.dialect !== 'postgres') return
    await views.down(queryInterface)
    await views.up(queryInterface)
  },
  down: async () => {
    // nothing to do
  }
}
