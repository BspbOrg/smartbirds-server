'use strict'

const Sequelize = require('sequelize')
const capitalizeFirstLetter = require('../utils/capitalizeFirstLetter')

const nomenclatures = {
  fishes_total_length: [
    {
      label: {
        bg: '0 - 5 cm',
        en: '0 - 5 cm'
      }
    },
    {
      label: {
        bg: '5 - 10 cm',
        en: '5 - 10 cm'
      }
    },
    {
      label: {
        bg: '10 - 15 cm',
        en: '10 - 15 cm'
      }
    },
    {
      label: {
        bg: '15 - 20 cm',
        en: '15 - 20 cm'
      }
    },
    {
      label: {
        bg: '20 - 25 cm',
        en: '20 - 25 cm'
      }
    },
    {
      label: {
        bg: '25 - 30 cm',
        en: '25 - 30 cm'
      }
    },
    {
      label: {
        bg: '30 - 35 cm',
        en: '30 - 35 cm'
      }
    },
    {
      label: {
        bg: '35 - 40 cm',
        en: '35 - 40 cm'
      }
    },
    {
      label: {
        bg: '40 - 45 cm',
        en: '40 - 45 cm'
      }
    },
    {
      label: {
        bg: '45 - 50 cm',
        en: '45 - 50 cm'
      }
    },
    {
      label: {
        bg: '50 - 55 cm',
        en: '50 - 55 cm'
      }
    },
    {
      label: {
        bg: '55 - 60 cm',
        en: '55 - 60 cm'
      }
    },
    {
      label: {
        bg: '60 - 65 cm',
        en: '60 - 65 cm'
      }
    },
    {
      label: {
        bg: '65 - 70 cm',
        en: '65 - 70 cm'
      }
    },
    {
      label: {
        bg: '70 - 75 cm',
        en: '70 - 75 cm'
      }
    },
    {
      label: {
        bg: '75 - 80 cm',
        en: '75 - 80 cm'
      }
    },
    {
      label: {
        bg: '80 - 85 cm',
        en: '80 - 85 cm'
      }
    },
    {
      label: {
        bg: '85 - 90 cm',
        en: '85 - 90 cm'
      }
    },
    {
      label: {
        bg: '90 - 95 cm',
        en: '90 - 95 cm'
      }
    },
    {
      label: {
        bg: '95 - 100 cm',
        en: '95 - 100 cm'
      }
    },
    {
      label: {
        bg: '> 100 cm',
        en: '> 100 cm'
      }
    }
  ]
}

const nomenclatureValues = Object.entries(nomenclatures).flatMap(([type, values]) => values.map((value) => ({
  createdAt: new Date(),
  updatedAt: new Date(),
  type,
  ...Object.fromEntries(Object.keys(value.label).map(lang => [`label${capitalizeFirstLetter(lang)}`, value.label[lang]]))
})))

const deleteExistingValues = (queryInterface) =>
  queryInterface.bulkDelete('Nomenclatures', {
    type: {
      [Sequelize.Op.in]: Object.keys(nomenclatures)
    }
  })

module.exports = {
  async up (queryInterface) {
    // we use hard-coded IDs for the nomenclatures in test fixtures and fixtures cannot be applied if the migration is executed
    if (queryInterface.sequelize.options.dialect !== 'postgres') {
      return
    }
    await deleteExistingValues(queryInterface)
    await Promise.all([
      queryInterface.bulkInsert('Nomenclatures', nomenclatureValues)
    ])
  },

  async down (queryInterface) {
    // we use hard-coded IDs for the nomenclatures in test fixtures and fixtures cannot be applied if the migration is executed
    if (queryInterface.sequelize.options.dialect !== 'postgres') {
      return
    }
    await deleteExistingValues(queryInterface)
  }
}
