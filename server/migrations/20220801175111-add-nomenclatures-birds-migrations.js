'use strict'

const Sequelize = require('sequelize')

const nomenclatures = [
  {
    name: 'main_geo_direction',
    values: [
      { bg: 'NNE', en: 'NNE' },
      { bg: 'S', en: 'S' },
      { bg: 'E', en: 'E' },
      { bg: 'ENE', en: 'ENE' },
      { bg: 'ESE', en: 'ESE' },
      { bg: 'N', en: 'N' },
      { bg: 'NE', en: 'NE' },
      { bg: 'NNW', en: 'NNW' },
      { bg: 'NW', en: 'NW' },
      { bg: 'SE', en: 'SE' },
      { bg: 'SSE', en: 'SSE' },
      { bg: 'WSW', en: 'WSW' },
      { bg: 'SSW', en: 'SSW' },
      { bg: 'SW', en: 'SW' },
      { bg: 'W', en: 'W' },
      { bg: 'WNW', en: 'WNW' }
    ]
  },
  {
    name: 'birds_migration_pulmage',
    values: [
      { bg: 'Тъмна', en: 'Dark' },
      { bg: 'Светла', en: 'Light' }
    ]
  },
  {
    name: 'birds_migration_type_flight',
    values: [
      { bg: 'АП', en: 'AF' },
      { bg: 'ПП', en: 'GF' },
      { bg: 'РП', en: 'SF' }
    ]
  }
]

const deleteExistingValues = (queryInterface) =>
  queryInterface.bulkDelete('Nomenclatures', {
    type: {
      [Sequelize.Op.in]: nomenclatures.map(nomenclature => nomenclature.name)
    }
  })

module.exports = {
  async up (queryInterface) {
    // we use hard-coded IDs for the nomenclatures in test fixtures and fixtures cannot be applied if the migration is executed
    if (queryInterface.sequelize.options.dialect !== 'postgres') {
      return
    }

    await deleteExistingValues(queryInterface)

    const nomenclatureValues = nomenclatures
      .flatMap((nomenclature) =>
        nomenclature.values.map((value) => ({
          type: nomenclature.name,
          labelBg: value.bg,
          labelEn: value.en,
          createdAt: new Date(),
          updatedAt: new Date()
        })))

    await queryInterface.bulkInsert('Nomenclatures', nomenclatureValues)
  },

  async down (queryInterface) {
    if (queryInterface.sequelize.options.dialect !== 'postgres') {
      return
    }

    await deleteExistingValues(queryInterface)
  }
}
