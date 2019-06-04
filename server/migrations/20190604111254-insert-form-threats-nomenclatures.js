'use strict'

var nomenclatures = [
  {
    name: 'threats_category',
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
    name: 'threats_estimate',
    values: [
      { bg: 'Ниско', en: 'Low' },
      { bg: 'Средно', en: 'Average' },
      { bg: 'Високо', en: 'High' }
    ]
  },
  {
    name: 'threats_state_carcass',
    values: [
      { bg: 'свежо/ново', en: 'Fresh' },
      { bg: 'подуто', en: 'Bloat' },
      { bg: 'активно разлагане', en: 'Active decay' },
      { bg: 'напреднало разлагане', en: 'Advanced decay' },
      { bg: 'сухо/останки', en: 'Dry/remains' },
      { bg: 'неизвестно/няма', en: 'Unknown/Not available' }
    ]
  },
  {
    name: 'threats_sample_taken',
    values: [
      { bg: 'Цял труп', en: 'Whole body' },
      { bg: 'Стомах', en: 'Stomach' },
      { bg: 'Гуша', en: 'Crop' },
      { bg: 'Черен дроб', en: 'Liver' },
      { bg: 'Мозък', en: 'Brain' },
      { bg: 'Нокти', en: 'Talons/ Claws' },
      { bg: 'Други', en: 'Other' },
      { bg: 'Не', en: 'None' },
      { bg: 'Няма', en: 'Unknown/Not available' },
      { bg: 'Бъбреци', en: 'Kidney' },
      { bg: 'Далак', en: 'Spleen' },
      { bg: 'Кости', en: 'Bones' },
      { bg: 'Жлъчка', en: 'Gall' },
      { bg: 'Бял дроб', en: 'Lungs' },
      { bg: 'Сърце', en: 'Heart' },
      { bg: 'Пера', en: 'Feathers' }
    ]
  }
]

module.exports = {
  up: async function (queryInterface, Sequelize) {
    var nomenclatureValues = nomenclatures
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
    await queryInterface.bulkDelete('Nomenclatures', {
      type: {
        $in: nomenclatures.map(function (nomenclature) { return nomenclature.name })
      }
    })
  }
}
