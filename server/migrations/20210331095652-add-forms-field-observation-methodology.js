const tables = [
  'FormBirds',
  'FormCBM',
  'FormCiconia',
  'FormHerptiles',
  'FormInvertebrates',
  'FormMammals',
  'FormPlants',
  'FormThreats'
]

const nomenclatures = [
  {
    name: 'main_observation_methodology',
    values: [
      { bg: 'Интересни', en: 'Interesting' },
      { bg: 'Всички', en: 'Complete' }
    ]
  }
]

function deleteExistingValues (queryInterface, Sequelize) {
  return queryInterface.bulkDelete('Nomenclatures', {
    type: {
      [Sequelize.Op.in]: nomenclatures.map(function (nomenclature) { return nomenclature.name })
    }
  })
}

module.exports = {
  up: async function (queryInterface, Sequelize) {
    await Promise.all(tables.map(async (table) => {
      await queryInterface.addColumn(table, 'observationMethodologyEn', { type: Sequelize.TEXT })
      await queryInterface.addColumn(table, 'observationMethodologyLocal', { type: Sequelize.TEXT })
      await queryInterface.addColumn(table, 'observationMethodologyLang', { type: Sequelize.STRING(3) })
    }))

    // we use hard-coded IDs for the nomenclatures in test fixtures and fixtures cannot be applied if the migration is executed
    if (queryInterface.sequelize.options.dialect !== 'postgres') return

    await deleteExistingValues(queryInterface, Sequelize)

    const nomenclatureValues = nomenclatures
      .map(function (nomenclature) {
        return nomenclature.values
          .map(function (value) {
            return {
              type: nomenclature.name,
              labelBg: value.bg,
              labelEn: value.en,
              createdAt: new Date(),
              updatedAt: new Date()
            }
          })
      })
      .reduce(function (res, current) {
        return res.concat(current)
      })

    await queryInterface.bulkInsert('Nomenclatures', nomenclatureValues)
  },

  down: async function (queryInterface, Sequelize) {
    await Promise.all(tables.map(async (table) => {
      await queryInterface.removeColumn(table, 'observationMethodologyEn')
      await queryInterface.removeColumn(table, 'observationMethodologyLocal')
      await queryInterface.removeColumn(table, 'observationMethodologyLang')
    }))

    if (queryInterface.sequelize.options.dialect !== 'postgres') return

    await deleteExistingValues(queryInterface, Sequelize)
  }
}
