'use strict'

const Sequelize = require('sequelize')
const capitalizeFirstLetter = require('../utils/capitalizeFirstLetter')
const { DataTypes } = require('sequelize')
const tableName = 'FormBears'

const nomenclatures = {
  bears_gender: [
    { label: { bg: 'Размножаващисе индивиди', en: 'Mating individuals' } },
    { label: { bg: 'F (женски)', en: 'F (Female)' } },
    { label: { bg: 'M (мъжки)', en: 'M (Male)' } }
  ],

  bears_age: [
    { label: { bg: 'Ad (Възрастен)', en: 'Ad' } },
    { label: { bg: 'Juv (ювенилен)', en: 'Juv' } },
    { label: { bg: 'Sub (млад, неполовозрял)', en: 'Sub' } }
  ],

  bears_excrement_content: [
    { label: { bg: 'Плодове', en: 'Fruit particles' } },
    { label: { bg: 'Косми', en: 'Fur' } },
    { label: { bg: 'Кости', en: 'Bone fragments' } },
    { label: { bg: 'Букови жълъди', en: 'Beechnuts' } },
    { label: { bg: 'Дъбови жълъди', en: 'Acorns' } },
    { label: { bg: 'Трева', en: 'Grass' } },
    { label: { bg: 'Друго', en: 'Other' } }
  ],

  bears_excrement_consistence: [
    { label: { bg: 'Плътно', en: 'Thick' } },
    { label: { bg: 'Рядко', en: 'Loose' } }
  ],

  bears_den: [
    { label: { bg: 'Скална ниша', en: 'Rock crevices' } },
    { label: { bg: 'Под дърво', en: 'Under a tree' } },
    { label: { bg: 'Изкопана бърлога в земята', en: 'Den in the ground' } },
    { label: { bg: 'Друго', en: 'Other' } }
  ],

  bears_habitat: [
    { label: { bg: '10. Скални местообитания', en: '10. Rock habitats' } },
    { label: { bg: '11.1. Лонгозни гори', en: '11.1 Longose forests' } },
    { label: { bg: '1.1. Гъсти иглолистни гори - култури и други', en: '1.1. Dense coniferous forests - crops and others' } },
    { label: { bg: '11. Дюни обрасли с храстова растителност', en: '11. Dunes overgrown with bushes' } },
    { label: { bg: '12.1. Дерета', en: '12.1. Ravines' } },
    { label: { bg: '12. Галерийните гори край реките', en: '12. Gallery forests along rivers' } },
    { label: { bg: '13. Влажни зони - крайбрежия обрасли с тръстика', en: '13. Wetlands - Shores overgrown with reeds' } },
    { label: { bg: '14.11. Мочур', en: '14.11. Marsh' } },
    { label: { bg: '14.12. Малко езеро (до 30 кв. м)', en: '14.12. Small lake (up to 30 sq. m)' } },
    { label: { bg: '14.13. Шахта', en: '14.13. Shaft' } },
    { label: { bg: '14.14. Калище', en: '14.14. Mud hole' } },
    { label: { bg: '14.1 Рекa', en: '14.1 River' } },
    { label: { bg: '14.2 Езера', en: '14.2 Lake' } },
    { label: { bg: '14.3 Язовир', en: '14.3 Reservoir' } },
    { label: { bg: '14.4 Микроязовир', en: '14.4 Micro-reservoir' } },
    { label: { bg: '14.5. Канал', en: '14.5 Canal' } },
    { label: { bg: '14.6 Други', en: '14.6 Other' } },
    { label: { bg: '16.1. Угар', en: '16.1. Fallow' } },
    { label: { bg: '16.2. Зеленчукови градини', en: '16.2. Vegetable gardens' } },
    { label: { bg: '16.3. Зърнени култури', en: '16.3. Grain cultures' } },
    { label: { bg: '16.4. Люцерни', en: '16.4. Alfalfa' } },
    { label: { bg: '16. Обработваеми земи', en: '16. Farmland' } },
    { label: { bg: '17. Черен път', en: '17. Dirt road' } },
    { label: { bg: '18. Асфалтов път', en: '18. Asphalt road' } },
    { label: { bg: '19. Постройки (извън населени места)', en: '19. Buildings (outside settlements)' } },
    { label: { bg: '1. Светли иглолистни гори с храсталаци', en: '1. Bright coniferous forests with undergrowth' } },
    { label: { bg: '20. Селищни територии', en: '20. Settlement territories' } },
    { label: { bg: '2.1. Разредени смесени гори', en: '2.1. Sparse mixed forests' } },
    { label: { bg: '21. Градски територии', en: '21. Urban territories' } },
    { label: { bg: '2.2. Гъсти смесени гори', en: '2.2. Dense mixed forests' } },
    { label: { bg: '22. Сечище', en: '22. Woodcutting area' } },
    { label: { bg: '2. Смесени гори', en: '2. Mixed forests' } },
    { label: { bg: '3.1. Поляни, пасища, ливади с разпръснати храсти', en: '3.1. Meadows, pastures, meadows with scattered shrubs' } },
    { label: { bg: '3.2. Храстови формации', en: '3.2. Bush formations' } },
    { label: { bg: '3. Силно разредени иглолистни гори с храсталаци', en: '3. Very sparse coniferous forests with undergrowth' } },
    { label: { bg: '4.1. Гъсти широколистни гори', en: '4.1. Dense deciduous forests' } },
    { label: { bg: '4. Светли широколистни гори с храсталаци', en: '4. Bright deciduous forests with undergrowth' } },
    { label: { bg: '5. Силно разредени широколистни гори с храсталаци', en: '5. Very sparse deciduous forests with undergrowth' } },
    { label: { bg: '6.1. Група от храсти (храсталак)', en: '6.1. A cluster of bushes' } },
    { label: { bg: '6.2. Група от храсти (храсталак) и струпани камъни', en: '6.2. A cluster of bushes with a rock pile' } },
    { label: { bg: '6.3. Група дървета (до 20)', en: '6.3. A cluster of trees (up to 20)' } },
    { label: { bg: '6.4. Група дървета (до 20) и струпани камъни', en: '6.4. A cluster of trees (up to 20) with a rock pile' } },
    { label: { bg: '6. Екотон дървесно-храстова, тревна растителност', en: '6. Borderline trees, bushes, grass' } },
    { label: { bg: '7. Пасища и ливади без да има наблизо гори или храсти или само с единични такива', en: '7. Grassland without nearby forests or shrubs or only single ones' } },
    { label: { bg: '8. Смесица от градини, лозя, пасища, ливади, синури, горички или храсти', en: '8. Mix of gardens, vineyards, pastures, meadows, field borders, groves or bushes' } },
    { label: { bg: '99. Други', en: '99. Other' } },
    { label: { bg: '9. Интензивни овощни градини и лозя - лишени от тревно покритие', en: '9. Intensive orchards and vineyards - No grass cover' } }
  ],

  bears_threats: [
    { label: { bg: 'Строежи', en: 'Construction / development' } },
    { label: { bg: 'Опасен път', en: 'Dangerous road' } },
    { label: { bg: 'Пресъхващи водни тела', en: 'Dried up waterbodies' } },
    { label: { bg: 'Прекомерно обрастване на пасища', en: 'Excessive overgrowth of pastures' } },
    { label: { bg: 'Екстремни спортове', en: 'Extreme sports' } },
    { label: { bg: 'Пожари', en: 'Fires' } },
    { label: { bg: 'Ловна преса', en: 'Hunting' } },
    { label: { bg: 'Сечи', en: 'Logging' } },
    { label: { bg: 'Други', en: 'Other' } },
    { label: { bg: 'Тровене', en: 'Poisoning' } },
    { label: { bg: 'Замърсяване', en: 'Pollution' } },
    { label: { bg: 'Кариери', en: 'Quarries' } },
    { label: { bg: 'Премахване на храсти', en: 'Removal of shrubs' } },
    { label: { bg: 'Пътища', en: 'Roads' } },
    { label: { bg: 'Соларен парк', en: 'Solar park' } },
    { label: { bg: 'Туристическа дейност', en: 'Touristic activities' } }
  ],

  bears_findings: [
    { label: { bg: 'Мечка в пчелин', en: 'Bear in an apiary' } },
    { label: { bg: 'Мечка в овощна градина', en: 'Bear in an orchard' } },
    { label: { bg: 'Мечка в двор', en: 'Bear in a yard' } },
    { label: { bg: 'Мечка в кошара', en: 'Bear in a henhouse' } },
    { label: { bg: 'Мечка на ловна хранилка', en: 'Bear at a hunting feeder' } },
    { label: { bg: 'Само мече/мечета', en: 'Bear cub alone' } },
    { label: { bg: 'Бедстващ индивид', en: 'Individual in distress' } },
    { label: { bg: 'Друго', en: 'Other' } },
    { label: { bg: 'Мъртъв екземпляр', en: 'Dead individual' } },
    { label: { bg: 'Убит на пътя', en: 'Dead on road' } },
    { label: { bg: 'Бракониери - примамки', en: 'Poachers - baits' } },
    { label: { bg: 'Бракониери - капани', en: 'Poachers - snares' } }
  ]
}

const nomenclatureValues = Object.entries(nomenclatures).flatMap(([type, values]) => values.map((value) => ({
  createdAt: new Date(),
  updatedAt: new Date(),
  type,
  ...Object.fromEntries(Object.keys(value.label).map(lang => [`label${capitalizeFirstLetter(lang)}`, value.label[lang]]))
})))

const deleteExistingValues = (queryInterface) => Promise.all([
  queryInterface.bulkDelete('Nomenclatures', {
    type: {
      [Sequelize.Op.in]: Object.keys(nomenclatures)
    }
  })
])

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable(tableName, {
      // base
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        ...(queryInterface.sequelize.options.dialect === 'postgres'
          ? {
              defaultValue: Sequelize.literal('nextval(\'"FormBirds_id_seq"\')')
            }
          : {
              autoIncrement: true
            })
      },
      hash: Sequelize.STRING(64),

      // from bears.js form
      species: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      count: Sequelize.INTEGER,
      sexEn: Sequelize.TEXT,
      sexLocal: Sequelize.TEXT,
      sexLang: Sequelize.STRING(3),
      ageEn: Sequelize.TEXT,
      ageLocal: Sequelize.TEXT,
      ageLang: Sequelize.STRING(3),
      excrementContentEn: Sequelize.TEXT,
      excrementContentLocal: Sequelize.TEXT,
      excrementContentLang: Sequelize.STRING(3),
      excrementConsistenceEn: Sequelize.TEXT,
      excrementConsistenceLocal: Sequelize.TEXT,
      excrementConsistenceLang: Sequelize.STRING(3),
      denEn: Sequelize.TEXT,
      denLocal: Sequelize.TEXT,
      denLang: Sequelize.STRING(3),
      habitatEn: Sequelize.TEXT,
      habitatLocal: Sequelize.TEXT,
      habitatLang: Sequelize.STRING(3),
      threatsBearsEn: Sequelize.TEXT,
      threatsBearsLocal: Sequelize.TEXT,
      threatsBearsLang: Sequelize.STRING(3),
      findingsEn: Sequelize.TEXT,
      findingsLocal: Sequelize.TEXT,
      findingsLang: Sequelize.STRING(3),
      markingHeight: Sequelize.FLOAT,
      footprintFrontPawWidth: Sequelize.FLOAT,
      footprintFrontPawLength: Sequelize.FLOAT,
      footprintHindPawWidth: Sequelize.FLOAT,
      footprintHindPawLength: Sequelize.FLOAT,
      speciesNotes: DataTypes.TEXT,

      // common fields
      autoLocationEn: DataTypes.TEXT,
      autoLocationLocal: DataTypes.TEXT,
      autoLocationLang: Sequelize.STRING(3),
      observationMethodologyEn: DataTypes.TEXT,
      observationMethodologyLocal: DataTypes.TEXT,
      observationMethodologyLang: Sequelize.STRING(3),
      moderatorReview: DataTypes.BOOLEAN,
      sourceEn: DataTypes.TEXT,
      sourceLocal: DataTypes.TEXT,
      sourceLang: DataTypes.STRING(3),
      latitude: DataTypes.FLOAT,
      longitude: DataTypes.FLOAT,
      observationDateTime: DataTypes.DATE,
      monitoringCode: DataTypes.TEXT,
      endDateTime: DataTypes.DATE,
      startDateTime: DataTypes.DATE,
      observers: DataTypes.TEXT,
      rainEn: DataTypes.TEXT,
      rainLocal: DataTypes.TEXT,
      rainLang: DataTypes.STRING(3),
      temperature: DataTypes.FLOAT,
      windDirectionEn: DataTypes.TEXT,
      windDirectionLocal: DataTypes.TEXT,
      windDirectionLang: DataTypes.STRING(3),
      windSpeedEn: DataTypes.TEXT,
      windSpeedLocal: DataTypes.TEXT,
      windSpeedLang: DataTypes.STRING(3),
      cloudinessEn: DataTypes.TEXT,
      cloudinessLocal: DataTypes.TEXT,
      cloudinessLang: DataTypes.STRING(3),
      cloudsType: DataTypes.TEXT,
      visibility: DataTypes.FLOAT,
      mto: DataTypes.TEXT,
      notes: DataTypes.TEXT,
      threatsEn: DataTypes.TEXT,
      threatsLocal: DataTypes.TEXT,
      threatsLang: DataTypes.STRING(3),
      pictures: DataTypes.TEXT,
      track: DataTypes.TEXT,
      confidential: DataTypes.BOOLEAN,
      geolocationAccuracy: DataTypes.FLOAT,
      location: DataTypes.TEXT,
      userId: DataTypes.INTEGER,
      organization: DataTypes.TEXT,
      imported: DataTypes.INTEGER,
      createdAt: DataTypes.DATE,
      updatedAt: DataTypes.DATE
    })

    // we use hard-coded IDs for the nomenclatures in test fixtures and fixtures cannot be applied if the migration is executed
    if (queryInterface.sequelize.options.dialect !== 'postgres') {
      return
    }
    await deleteExistingValues(queryInterface)
    await Promise.all([
      queryInterface.bulkInsert('Nomenclatures', nomenclatureValues)
    ])
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable(tableName)

    // we use hard-coded IDs for the nomenclatures in test fixtures and fixtures cannot be applied if the migration is executed
    if (queryInterface.sequelize.options.dialect !== 'postgres') {
      return
    }
    await deleteExistingValues(queryInterface)
  }
}
