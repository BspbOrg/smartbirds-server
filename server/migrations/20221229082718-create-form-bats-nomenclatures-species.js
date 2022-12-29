'use strict'

const Sequelize = require('sequelize')
const capitalizeFirstLetter = require('../utils/capitalizeFirstLetter')
const { DataTypes } = require('sequelize')
const tableName = 'FormBats'

const nomenclatures = {
  bats_methodology: [
    { label: { bg: 'капан на Тътел', en: 'Tuttle trap' } },
    { label: { bg: 'мрежа за прилепи', en: 'Mist net' } },
    { label: { bg: 'ултразвуков детектор', en: 'bat detector' } },
    { label: { bg: 'визуално наблюдение', en: 'visual observation' } }
  ],
  bats_type_location: [
    { label: { bg: 'пещера', en: 'cave' } },
    { label: { bg: 'мина', en: 'gallery' } },
    { label: { bg: 'хралупа на дърво', en: 'tree' } },
    { label: { bg: 'река', en: 'river' } },
    { label: { bg: 'скална цепнатина', en: 'rock crevices' } },
    { label: { bg: 'постройка', en: 'building' } },
    { label: { bg: 'прилепна къщичка', en: 'bat house' } },
    { label: { bg: 'тунел', en: 'tunnel' } },
    { label: { bg: 'умрял на пътя', en: 'Killed on the road' } },
    { label: { bg: 'Намерен на улицата', en: 'Found on the street' } }
  ],
  bats_sex: [
    {
      label: {
        bg: 'Женски',
        en: 'Female',
        sq: 'Femra',
        mk: 'Женка'
      }
    },
    {
      label: {
        bg: 'Мъжки',
        en: 'Male',
        sq: 'Mashkull',
        mk: 'Машко'
      }
    },
    {
      label: {
        bg: 'Неопределен',
        en: 'Undefined',
        sq: 'E papërcaktuar',
        mk: 'Недефинирано'
      }
    }
  ],
  bats_age: [
    {
      label: {
        bg: 'Ad',
        en: 'Ad',
        sq: 'Ad',
        mk: 'Возрасно'
      }
    },
    {
      label: {
        bg: 'Juv',
        en: 'Juv',
        sq: 'Juvenil',
        mk: 'Млад.'
      }
    },
    {
      label: {
        bg: 'Sub',
        en: 'Sub'
      }
    },
    {
      label: {
        bg: 'Неопределен',
        en: 'Undefined',
        sq: 'E papërcaktuar',
        mk: 'Недефинирано'
      }
    }
  ],
  bats_habitat: [
    {
      label: {
        bg: 'Крайбрежен участък на езеро',
        en: 'Coastal area of a lake'
      }
    },
    {
      label: {
        bg: 'Крайбрежен участък на река',
        en: 'Coastal area of a river',
        sq: 'Zona e bregdetare e një lumi'
      }
    },
    {
      label: {
        bg: 'Иглолистна гора',
        en: 'Coniferous forest',
        sq: 'Pyje halorë',
        mk: 'Иглолистна шума'
      }
    },
    {
      label: {
        bg: 'Листопаден храсталак',
        en: 'Deciduous bushes',
        sq: 'Shkurre gjetherënëse',
        mk: 'Листопадни грмушки'
      }
    },
    {
      label: {
        bg: 'Широколистна гора',
        en: 'Deciduous forest',
        sq: 'Pyll gjetherënës',
        mk: 'Листопадна шума'
      }
    },
    {
      label: {
        bg: 'Вечнозелен храсталак',
        en: 'Evergreen bushes',
        sq: 'Shkurre përherë të gjelbërta'
      }
    },
    {
      label: {
        bg: 'Мочурище',
        en: 'Fen',
        sq: 'Kënetë',
        mk: 'Поплавено живеалиште'
      }
    },
    {
      label: {
        bg: 'Езеро',
        en: 'Lake',
        sq: 'Liqen'
      }
    },
    {
      label: {
        bg: 'Ливада',
        en: 'Meadow',
        sq: 'Livadhe',
        mk: 'Ливада'
      }
    },
    {
      label: {
        bg: 'Смесен храсталак',
        en: 'Mixed bushes',
        sq: 'Shkorreta të përziera',
        mk: 'Мешани грмушки'
      }
    },
    {
      label: {
        bg: 'Смесена гора',
        en: 'Mixed forest',
        sq: 'Pyje të përzier'
      }
    },
    {
      label: {
        bg: 'Пасище',
        en: 'Pasture',
        sq: 'Kullota',
        mk: 'Пасиште'
      }
    },
    {
      label: {
        bg: 'Торфище',
        en: 'Peatland',
        sq: 'Peatlands'
      }
    },
    {
      label: {
        bg: 'Тресавище',
        en: 'Quagmire',
        sq: 'Baltovinë'
      }
    },
    {
      label: {
        bg: 'Река',
        en: 'River',
        sq: 'Lumi',
        mk: 'Река'
      }
    },
    {
      label: {
        bg: 'Крайречни пясъци',
        en: 'Riverside sands',
        mk: 'Песочни речни брегови'
      }
    },
    {
      label: {
        bg: 'Сипеи - карбонат',
        en: 'Scree – carbonate',
        sq: 'Shkëmbinj karbonatikë'
      }
    },
    {
      label: {
        bg: 'Сипеи - силикат',
        en: 'Scree – silicate',
        mk: 'Сипар - силикатен'
      }
    },
    {
      label: {
        bg: 'Крайморски пясъци',
        en: 'Seaside sands',
        sq: 'Rëra bregdetare'
      }
    },
    {
      label: {
        bg: 'Комплекс храсталак-пасище',
        en: 'Shrub-pasture complex',
        sq: 'Grupim shkurre-kullota',
        mk: 'Грмушки со тревник'
      }
    },
    {
      label: {
        bg: 'Отделна скала – карбонат',
        en: 'Single rock – carbonate',
        sq: 'Një lloj i vetëm shkëmbi - karbonatik'
      }
    },
    {
      label: {
        bg: 'Отделна скала – силикат',
        en: 'Single rock – silicate',
        sq: 'Shkëmb i vetëm - silicor'
      }
    },
    {
      label: {
        bg: 'Блато',
        en: 'Swamp',
        sq: 'Moçal'
      }
    },
    {
      label: {
        bg: 'Отвесна скала – карбонат',
        en: 'Vertical rock – carbonate',
        sq: 'Shkëmb karbonatik',
        mk: 'Вертикална карпа - карбонат'
      }
    },
    {
      label: {
        bg: 'Отвесна скала – силикат',
        en: 'Vertical rock – silicate',
        sq: 'Shkëmb silicor',
        mk: 'Ветрикална карпа - силикат'
      }
    }
  ],
  bats_condition: [
    { label: { bg: 'активен', en: 'active /but still hanging' } },
    { label: { bg: 'торпиден извън зимния сезон (ниска температура на тялото)', en: 'torpid /out of the winter' } },
    { label: { bg: 'хиберниращ през зимата', en: 'hibernating/winter' } },
    { label: { bg: 'летящ', en: 'volant' } },
    { label: { bg: 'мъртъв', en: 'dead' } }
  ],
  bats_type_condition: [
    { label: { bg: 'точен', en: 'exact' } },
    { label: { bg: 'приблизително', en: 'approximately' } }
  ],
  bats_reproductive_status: [
    { label: { en: 'not registered' } },
    { label: { bg: 'бременна', en: 'pregnant female' } },
    { label: { bg: 'кърмеща женска', en: 'lactating female' } },
    { label: { bg: 'lactating female - жена след лактация', en: 'post' } },
    { label: { bg: 'женска, която не е нито бременна, нито кърмеща', en: 'female that is nor pregnant, nor lactating' } },
    { label: { bg: 'descent testes - мъжки без изразени тестиси', en: 'male with non' } },
    { label: { bg: 'мъжки с изразени тестиси', en: 'male with descent testes' } }
  ],
  bats_ring: [
    { label: { en: 'not ringed' } },
    { label: { en: 'ringed for first time' } },
    { label: { en: 'recapture of ringed bat' } }
  ]
}

const species = {
  bats: [
    { label: { la: 'Barbastella barbastellus', bg: 'Широкоух прилеп', en: 'Western barbastelle' } },
    { label: { la: 'Eptesicus serotinus', bg: 'Полунощен прилеп', en: 'Serotine bat' } },
    { label: { la: 'Eptesicus nilssonii', bg: 'Северeн прилеп', en: 'Northern bat' } },
    { label: { la: 'Hypsugo savii', bg: 'Прилепче на Сави', en: 'Savi\'s pipistrelle bat' } },
    { label: { la: 'Miniopterus schreibersii', bg: 'Пещерен дългокрил', en: 'Schreiber\'s bent-winged bat' } },
    { label: { la: 'Myotis alcathoe', bg: 'Нощник на Алкатое', en: 'Alcathoe bat' } },
    { label: { la: 'Myotis sp.', bg: 'Нощници', en: 'mouse-eared bat' } },
    { label: { la: 'Myotis blythii', bg: 'Остроух нощник', en: 'Lesser mouse-eared bat' } },
    { label: { la: 'Myotis bechsteinii', bg: 'Нощник на Бехщайн', en: 'Bechstein\'s bat' } },
    { label: { la: 'Myotis brandtii', bg: 'Нощник на Брандт', en: 'Brandt\'s bat' } },
    { label: { la: 'Myotis capaccinii', bg: 'Дългопръст нощник', en: 'Long-fingered bat' } },
    { label: { la: 'Myotis daubentonii', bg: 'Воден нощник', en: 'Daubenton\'s bat' } },
    { label: { la: 'Myotis emarginatus', bg: 'Трицветен нощник', en: 'Geoffroy\'s bat' } },
    { label: { la: 'Myotis dasycneme', bg: 'Езерен нощник', en: 'Pond bat' } },
    { label: { la: 'Myotis escalerai', bg: 'Прилепът на Ескалера', en: 'Escalera\'s bat' } },
    { label: { la: 'Myotis myotis', bg: 'Голям нощник', en: 'Greater mouse-eared bat' } },
    { label: { la: 'Myotis mystacinus', bg: 'Мустакат нощник', en: 'Whiskered bat' } },
    { label: { la: 'Myotis nattereri', bg: 'Нощник на Натерер', en: 'Natterer\'s bat' } },
    { label: { la: 'Nyctalus sp.', bg: 'Вечерници', en: 'noctule bat' } },
    { label: { la: 'Nyctalus lasiopterus', bg: 'Голям (гигантски) вечерник', en: 'Greater noctule bat' } },
    { label: { la: 'Nyctalus leisleri', bg: 'Малък вечерник', en: 'Leisler\'s bat' } },
    { label: { la: 'Nyctalus noctula', bg: 'Ръждив (обикновен) вечерник', en: 'common noctule' } },
    { label: { la: 'Pipistrellus sp.', bg: 'Прилепчета', en: 'pipistrelle bat' } },
    { label: { la: 'Pipistrellus kuhlii', bg: 'Средиземноморско прилепче', en: 'Kuhl\'s pipistrelle bat' } },
    { label: { la: 'Pipistrellus nathusii', bg: 'Прилепче на Натузий', en: 'Nathusius\' pipistrelle bat' } },
    { label: { la: 'Pipistrellus pipistrellus', bg: 'Кафяво прилепче', en: 'Common pipistrelle bat' } },
    { label: { la: 'Pipistrellus pygmaeus', bg: 'Малко кафяво прилепче', en: 'Soprano pipistrelle bat' } },
    { label: { la: 'Plecotus sp.', bg: 'Ушани', en: 'long-eared bat' } },
    { label: { la: 'Plecotus auritus', bg: 'Кафяв дългоух прилеп', en: 'Brown long-eared bat' } },
    { label: { la: 'Plecotus austriacus', bg: 'Сив дългоух прилеп', en: 'Grey long-eared bat' } },
    { label: { la: 'Plecotus macrobullaris', bg: 'Алпийският дългоух прилеп', en: 'Alpine long-eared bat' } },
    { label: { la: 'Rhinolophus sp.', bg: 'Подковонос', en: 'horseshoe bat' } },
    { label: { la: 'Rhinolophus euryale', bg: 'Южен подковонос', en: 'Mediterranean horseshoe bat' } },
    { label: { la: 'Rhinolophus ferrumequinum', bg: 'Голям подковонос', en: 'Greater horseshoe bat' } },
    { label: { la: 'Rhinolophus hipposideros', bg: 'Малък подковонос', en: 'Lesser horseshoe bat' } },
    { label: { la: 'Rhinolophus mehelyi', bg: 'Подковонос на Мехели', en: 'Mehely\'s horseshoe bat' } },
    { label: { la: 'Rhinolophus blasii', bg: 'Подковонос на Блази', en: 'Blasius\' horseshoe bat' } },
    { label: { la: 'Tadarida teniotis', bg: 'Булдогов прилеп', en: 'European free-tailed bat' } },
    { label: { la: 'Vespertilio murinus', bg: 'Двуцветен прилеп', en: 'Parti-coloured bat' } }
  ]
}

const nomenclatureValues = Object.entries(nomenclatures).flatMap(([type, values]) => values.map((value) => ({
  createdAt: new Date(),
  updatedAt: new Date(),
  type,
  ...Object.fromEntries(Object.keys(value.label).map(lang => [`label${capitalizeFirstLetter(lang)}`, value.label[lang]]))
})))

const speciesValues = Object.entries(species).flatMap(([type, values]) => values.map((value) => ({
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
  }),
  queryInterface.bulkDelete('Species', {
    type: {
      [Sequelize.Op.in]: Object.keys(species)
    }
  })
])

module.exports = {
  async up (queryInterface) {
    await queryInterface.createTable(tableName, {
      autoLocationEn: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      autoLocationLocal: DataTypes.TEXT,
      autoLocationLang: Sequelize.STRING(3),
      observationMethodologyEn: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      observationMethodologyLocal: DataTypes.TEXT,
      observationMethodologyLang: Sequelize.STRING(3),
      moderatorReview: {
        type: DataTypes.BOOLEAN,
        allowNull: true
      },
      sourceEn: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      sourceLocal: DataTypes.TEXT,
      sourceLang: DataTypes.STRING(3),
      latitude: DataTypes.FLOAT,
      longitude: DataTypes.FLOAT,
      observationDateTime: DataTypes.DATE,
      monitoringCode: DataTypes.TEXT,
      endDateTime: DataTypes.DATE,
      startDateTime: DataTypes.DATE,
      observers: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      rainEn: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      rainLocal: DataTypes.TEXT,
      rainLang: DataTypes.STRING(3),
      temperature: {
        type: DataTypes.FLOAT,
        allowNull: true
      },
      windDirectionEn: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      windDirectionLocal: DataTypes.TEXT,
      windDirectionLang: DataTypes.STRING(3),
      windSpeedEn: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      windSpeedLocal: DataTypes.TEXT,
      windSpeedLang: DataTypes.STRING(3),
      cloudinessEn: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      cloudinessLocal: DataTypes.TEXT,
      cloudinessLang: DataTypes.STRING(3),
      cloudsType: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      visibility: {
        type: DataTypes.FLOAT,
        allowNull: true
      },
      mto: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      threatsEn: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      threatsLocal: DataTypes.TEXT,
      threatsLang: DataTypes.STRING(3),
      pictures: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      track: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      confidential: {
        type: DataTypes.BOOLEAN,
        allowNull: true
      },
      geolocationAccuracy: {
        type: DataTypes.FLOAT,
        allowNull: true
      },
      location: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      userId: DataTypes.INTEGER,
      organization: DataTypes.TEXT,
      imported: {
        type: DataTypes.INTEGER,
        allowNull: true
      },

      metodologyEn: DataTypes.TEXT,
      metodologyLocal: DataTypes.TEXT,
      metodologyLang: DataTypes.STRING(3),
      tCave: DataTypes.FLOAT,
      hCave: DataTypes.FLOAT,
      typlocEn: DataTypes.TEXT,
      typlocLocal: DataTypes.TEXT,
      typlocLang: DataTypes.STRING(3),
      sublocality: DataTypes.TEXT,
      species: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      count: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      swarming: DataTypes.BOOLEAN,
      sexEn: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      sexLocal: DataTypes.TEXT,
      sexLang: DataTypes.STRING(3),
      ageEn: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      ageLocal: DataTypes.TEXT,
      ageLang: DataTypes.STRING(3),
      habitatsEn: DataTypes.TEXT,
      habitatsLocal: DataTypes.TEXT,
      habitatsLang: DataTypes.STRING(3),
      conditionEn: DataTypes.TEXT,
      conditionLocal: DataTypes.TEXT,
      conditionLang: DataTypes.STRING(3),
      typeCondEn: DataTypes.TEXT,
      typeCondLocal: DataTypes.TEXT,
      typeCondLang: DataTypes.STRING(3),
      reproductiveStatusEn: DataTypes.TEXT,
      reproductiveStatusLocal: DataTypes.TEXT,
      reproductiveStatusLang: DataTypes.STRING(3),
      ringEn: DataTypes.TEXT,
      ringLocal: DataTypes.TEXT,
      ringLang: DataTypes.STRING(3),
      ringN: DataTypes.TEXT,
      bodyLength: DataTypes.FLOAT,
      tailLength: DataTypes.FLOAT,
      earLength: DataTypes.FLOAT,
      forearmLength: DataTypes.FLOAT,
      lengthThirdDigit: DataTypes.FLOAT,
      lengthFifthDigit: DataTypes.FLOAT,
      lengthWS: DataTypes.FLOAT,
      weight: DataTypes.FLOAT,

      speciesNotes: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      createdAt: DataTypes.DATE,
      updatedAt: DataTypes.DATE,

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
      hash: Sequelize.STRING(64)
    })

    // we use hard-coded IDs for the nomenclatures in test fixtures and fixtures cannot be applied if the migration is executed
    if (queryInterface.sequelize.options.dialect !== 'postgres') {
      return
    }
    await deleteExistingValues(queryInterface)
    await Promise.all([
      queryInterface.bulkInsert('Nomenclatures', nomenclatureValues),
      queryInterface.bulkInsert('Species', speciesValues)
    ])
  },

  async down (queryInterface) {
    await queryInterface.dropTable(tableName)
    // we use hard-coded IDs for the nomenclatures in test fixtures and fixtures cannot be applied if the migration is executed
    if (queryInterface.sequelize.options.dialect !== 'postgres') {
      return
    }
    await deleteExistingValues(queryInterface)
  }
}
