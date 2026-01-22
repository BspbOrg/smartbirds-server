'use strict'

const Sequelize = require('sequelize')
const capitalizeFirstLetter = require('../utils/capitalizeFirstLetter')

const nomenclatures = {
  ebp_source: [
    {
      label: {
        en: 'Atlas birds 1 km',
        bg: 'Атлас птици 1 km'
      }
    },
    {
      label: {
        en: 'Atlas-breeding birds',
        bg: 'Атлас-гнездящи птици'
      }
    },
    {
      label: {
        en: 'Bear Project',
        bg: 'Проект мечка'
      }
    },
    {
      label: {
        en: 'Belozem Storks',
        bg: 'Белоземски щъркели'
      }
    },
    {
      label: {
        en: 'Common Bird Monitoring',
        bg: 'МОВП'
      }
    },
    {
      label: {
        en: 'Complete list',
        bg: 'Пълен списък'
      }
    },
    {
      label: {
        en: 'Darwin Project',
        bg: 'Проект Дарвин'
      }
    },
    {
      label: {
        en: 'Eagles forests',
        bg: 'Горите на орела'
      }
    },
    {
      label: {
        en: 'Egyptian vultures monitoring',
        bg: 'Мониторинг на египетски лешояд'
      }
    },
    {
      label: {
        en: 'Herp and mammal observations',
        bg: 'Наблюдения на земноводни, влечуги и бозайници'
      }
    },
    {
      label: {
        en: 'Herp observations',
        bg: 'Наблюдения на земноводни и влечуги'
      }
    },
    {
      label: {
        en: 'International White Stork Census 2024/2025',
        bg: 'Преброяване на белия щъркел 2024/2025'
      }
    },
    {
      label: {
        en: 'LIFE for Falcons',
        bg: 'Живот за сокола'
      }
    },
    {
      label: {
        en: 'Literature data',
        bg: 'Литературни данни'
      }
    },
    {
      label: {
        en: 'Mammals observations',
        bg: 'Наблюдения на бозайници'
      }
    },
    {
      label: {
        en: 'Mid-winter Bird Count',
        bg: 'Средно зимно преброяване'
      }
    },
    {
      label: {
        en: 'Migration',
        bg: 'Миграция'
      }
    },
    {
      label: {
        en: 'Monitoring wetlands',
        bg: 'Мониторинг влажни зони'
      }
    },
    {
      label: {
        en: 'Project NMNH-BAS & MOEW',
        bg: 'Проект НПМ-БАН и МОСВ'
      }
    },
    {
      label: {
        en: 'Research of breeding birds, BSPB-NMNH',
        bg: 'Проучвания на гнездящи видове птици, БДЗП-НПМ'
      }
    },
    {
      label: {
        en: 'Single observations',
        bg: 'Единични наблюдения'
      }
    },
    {
      label: {
        en: 'Study of raptors',
        bg: 'Проучване на грабливи птици'
      }
    },
    {
      label: {
        en: 'urbanBirding',
        bg: 'urbanBirding'
      }
    },
    {
      label: {
        en: 'Wind Energy Project',
        bg: 'Проект на вятърна енергия'
      }
    },
    {
      label: {
        en: 'Wintering Geese Monitoring',
        bg: 'Мониторинг на зимуващи гъски'
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
