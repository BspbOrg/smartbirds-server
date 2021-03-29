const fields = [
  'plot',
  'visit',
  'primaryHabitat'
]

module.exports = {
  up: async function (queryInterface) {
    if (queryInterface.sequelize.options.dialect !== 'postgres') return
    for (const field of fields) {
      await queryInterface.sequelize.query(`ALTER TABLE "FormCBM" ALTER COLUMN "${field}En" DROP NOT NULL;`)
    }
  },

  down: async function (queryInterface) {
    if (queryInterface.sequelize.options.dialect !== 'postgres') return
    for (const field of fields) {
      await queryInterface.sequelize.query(`ALTER TABLE "FormCBM" ALTER COLUMN "${field}En" SET NOT NULL;`)
    }
  }
}
