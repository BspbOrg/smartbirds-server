'use strict'

const nomenclatures = [
  {
    name: 'main_threats',
    values: [
      { bg: 'Пожари', en: 'Fires' },
      { bg: 'Сечи', en: 'Logging' },
      { bg: 'Строежи', en: 'Construction / development' },
      { bg: 'Замърсяване', en: 'Pollution' },
      { bg: 'Кариери', en: 'Quarries' },
      { bg: 'Разораване на пасища и мери', en: 'Plowing of pastures' },
      { bg: 'Зарибяване', en: 'Stocking with fish' },
      { bg: 'Бракониери', en: 'Poachers' },
      { bg: 'Залесяване с нетипични видове', en: 'Planting with non-typical species' },
      { bg: 'Пътища', en: 'Roads' },
      { bg: 'Мъртъв екземпляр', en: 'Dead individual' },
      { bg: 'Ветропарк', en: 'Wind park' },
      { bg: 'Прекомерно обрастване на пасища', en: 'Excessive overgrowth of pastures' },
      { bg: 'Други', en: 'Other' },
      { bg: 'Соларен парк', en: 'Solar park' },
      { bg: 'Инвазивни видове', en: 'Invasive species' },
      { bg: 'Премахване на храсти', en: 'Removal of shrubs' },
      { bg: 'Мини ВЕЦ', en: 'Small hydroelectric' },
      { bg: 'Пресъхващи водни тела', en: 'Dried up waterbodies' },
      { bg: 'Убит на пътя', en: 'Dead on road' },
      { bg: 'Ловна преса', en: 'Hunting' },
      { bg: 'Тровене', en: 'Poisoning' },
      { bg: 'Безпокойство', en: 'Disturbance' },
      { bg: 'Иманярство', en: 'Treasure hunting' },
      { bg: 'Екстремни спортове', en: 'Extreme sports' },
      { bg: 'Туристическа дейност', en: 'Touristic activities' }
    ]
  },
  {
    name: 'mammals_findings',
    values: [
      { bg: 'Строежи', en: 'Construction / development' },
      { bg: 'Други', en: 'Other' },
      { bg: 'Изпражнения', en: 'Feces' },
      { bg: 'Дупка', en: 'Hole' },
      { bg: 'Капан', en: 'Trap' },
      { bg: 'Къртичина', en: 'Molehill' },
      { bg: 'Стъпка(и)', en: 'Footprint(s)' },
      { bg: 'Колония', en: 'Colony' }
    ]
  },
  {
    name: 'herptiles_findings',
    values: [
      { bg: 'Строежи', en: 'Construction / development' },
      { bg: 'Съблекло', en: 'Moult' },
      { bg: 'Други', en: 'Other' },
      { bg: 'Изпражнения', en: 'Feces' },
      { bg: 'Пеещ мъжки', en: 'Singing male' },
      { bg: 'Дупка', en: 'Hole' },
      { bg: 'Капан', en: 'Trap' },
      { bg: 'Къртичина', en: 'Molehill' },
      { bg: 'Стъпка(и)', en: 'Footprint(s)' },
      { bg: 'Колония', en: 'Colony' }
    ]
  },
  {
    name: 'invertebrates_findings',
    values: [
      { bg: 'Строежи', en: 'Construction / development' },
      { bg: 'Съблекло', en: 'Moult' },
      { bg: 'Други', en: 'Other' },
      { bg: 'Изпражнения', en: 'Feces' },
      { bg: 'Пеещ мъжки', en: 'Singing male' },
      { bg: 'Дупка', en: 'Hole' },
      { bg: 'Капан', en: 'Trap' },
      { bg: 'Къртичина', en: 'Molehill' },
      { bg: 'Колония', en: 'Colony' }
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
    // we use hard-coded IDs for the nomenclatures in test fixtures and fixtures cannot be applied if the migration is executed
    if (queryInterface.sequelize.options.dialect !== 'postgres') return new Promise(resolve => resolve())

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
    if (queryInterface.sequelize.options.dialect !== 'postgres') return new Promise(resolve => resolve())

    await deleteExistingValues(queryInterface, Sequelize)
  }
}
