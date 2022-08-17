'use strict'

const { DataTypes } = require('sequelize')
const Sequelize = require('sequelize')

const tableName = 'FormFishes'

const nomenclatures = {
  fishes_age: [
    {
      label: {
        bg: 'Ad (Възрастен)',
        en: 'Ad (Adult)'
      }
    },
    {
      label: {
        bg: 'Juv (млад, неполовозрял)',
        en: 'Juv (Juvenile, not adult)'
      }
    },
    {
      label: {
        bg: '0+ (Личинки)',
        en: '0+ (Larvae)'
      }
    },
    {
      label: {
        bg: 'Eggs (яйца)',
        en: 'Eggs'
      }
    }
  ],
  fishes_sex: [
    {
      label: {
        bg: 'M (мъжки)',
        en: 'M (male)'
      }
    },
    {
      label: {
        bg: 'F (женски)',
        en: 'F (female)'
      }
    }
  ],
  fishes_findings: [
    {
      label: {
        bg: 'уловен',
        en: 'caught specimen'
      }
    },
    {
      label: {
        bg: 'мониторинг',
        en: 'monitoring'
      }
    },
    {
      label: {
        bg: 'мъртъв екземпляр',
        en: 'dead specimen'
      }
    },
    {
      label: {
        bg: 'наблюдаван',
        en: 'observed'
      }
    }
  ],
  fishes_monitoring_type: [
    {
      label: {
        bg: 'електроулов',
        en: 'electrofishing'
      }
    },
    {
      label: {
        bg: 'винтери',
        en: 'fish traps'
      }
    },
    {
      label: {
        bg: 'гриб',
        en: 'sceine net'
      }
    },
    {
      label: {
        bg: 'стоящи мрежи',
        en: 'gill net'
      }
    },
    {
      label: {
        bg: 'плаващи мрежи',
        en: 'floating net'
      }
    },
    {
      label: {
        bg: 'планктонни мрежи',
        en: 'plankton net'
      }
    }
  ],
  fishes_habitat_description_type: ['R1', 'R2', 'R3', 'R4', 'R5', 'R6', 'R7', 'R8', 'R9', 'R10', 'R11', 'R12', 'R13', 'R14', 'R15', 'R16', 'L1', 'L2', 'L3', 'L4', 'L5', 'L6', 'L7', 'L8', 'L9', 'L10', 'L11', 'L12', 'L13', 'L14', 'L15', 'L16'].map(val => ({
    label: {
      bg: val,
      en: val
    }
  })),
  fishes_water_level: [
    {
      label: {
        bg: 'ниско',
        en: 'low'
      }
    },
    {
      label: {
        bg: 'нормално',
        en: 'normal'
      }
    },
    {
      label: {
        bg: 'високо',
        en: 'high'
      }
    }
  ],
  fishes_river_current: [
    {
      label: {
        bg: 'бързо',
        en: 'fast'
      }
    },
    {
      label: {
        bg: 'средно',
        en: 'moderate'
      }
    },
    {
      label: {
        bg: 'бавно',
        en: 'slow'
      }
    }
  ],
  fishes_bank_type: [
    {
      label: {
        bg: 'изкуствен/дигиран',
        en: 'artificial/dike'
      }
    },
    {
      label: {
        bg: 'естествен',
        en: 'natural'
      }
    },
    {
      label: {
        bg: 'полуестествен',
        en: 'semi natural'
      }
    }
  ],
  fishes_shelters: [
    {
      label: {
        bg: 'камъни',
        en: 'stones'
      }
    },
    {
      label: {
        bg: 'дървета',
        en: 'trees'
      }
    },
    {
      label: {
        bg: 'корени',
        en: 'roots'
      }
    },
    {
      label: {
        bg: 'подмоли',
        en: 'cavities'
      }
    },
    {
      label: {
        bg: 'други',
        en: 'other'
      }
    },
    {
      label: {
        bg: 'липсват',
        en: 'none'
      }
    }
  ],
  fishes_vegetation_type: [
    {
      label: {
        bg: 'потопена',
        en: 'submerged'
      }
    },
    {
      label: {
        bg: 'плуваща',
        en: 'floating'
      }
    },
    {
      label: {
        bg: 'подводна',
        en: 'underwater'
      }
    }
  ]
}

const nomenclatureValues = Object.entries(nomenclatures).flatMap(([type, values]) => values.map((value) => ({
  created_at: new Date(),
  updated_at: new Date(),
  type,
  ...Object.fromEntries(Object.keys(value.label).map(lang => [`label_${lang}`, value.label[lang]]))
})))

const deleteExistingValues = (queryInterface) =>
  queryInterface.bulkDelete('Nomenclatures', {
    type: {
      [Sequelize.Op.in]: Object.keys(nomenclatures)
    }
  })

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
      species: DataTypes.TEXT,
      count: DataTypes.INTEGER,
      nameWaterBody: {
        type: DataTypes.TEXT,
        allowNull: true
      },
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
      sizeTL_mm: {
        type: DataTypes.FLOAT,
        allowNull: true
      },
      siteSL_mm: {
        type: DataTypes.FLOAT,
        allowNull: true
      },
      masa_gr: {
        type: DataTypes.FLOAT,
        allowNull: true
      },
      findingsEn: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      findingsLocal: DataTypes.TEXT,
      findingsLang: DataTypes.STRING(3),
      monitoringTypeEn: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      monitoringTypeLocal: DataTypes.TEXT,
      monitoringTypeLang: DataTypes.STRING(3),
      transectLength_M: {
        type: DataTypes.FLOAT,
        allowNull: true
      },
      transectWidth_M: {
        type: DataTypes.FLOAT,
        allowNull: true
      },
      fishingArea_M: {
        type: DataTypes.FLOAT,
        allowNull: true
      },
      exposition: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      meshSize: {
        type: DataTypes.FLOAT,
        allowNull: true
      },
      countNetTrap: {
        type: DataTypes.FLOAT,
        allowNull: true
      },
      waterTemp: {
        type: DataTypes.FLOAT,
        allowNull: true
      },
      conductivity: {
        type: DataTypes.FLOAT,
        allowNull: true
      },
      pH: {
        type: DataTypes.FLOAT,
        allowNull: true
      },
      o2mgL: {
        type: DataTypes.FLOAT,
        allowNull: true
      },
      o2percent: {
        type: DataTypes.FLOAT,
        allowNull: true
      },
      salinity: {
        type: DataTypes.FLOAT,
        allowNull: true
      },
      habitatDescriptionTypeEn: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      habitatDescriptionTypeLocal: DataTypes.TEXT,
      habitatDescriptionTypeLang: DataTypes.STRING(3),
      substrateMud: {
        type: DataTypes.FLOAT,
        allowNull: true
      },
      substrateSilt: {
        type: DataTypes.FLOAT,
        allowNull: true
      },
      substrateSand: {
        type: DataTypes.FLOAT,
        allowNull: true
      },
      substrateGravel: {
        type: DataTypes.FLOAT,
        allowNull: true
      },
      substrateSmallStones: {
        type: DataTypes.FLOAT,
        allowNull: true
      },
      substrateCobble: {
        type: DataTypes.FLOAT,
        allowNull: true
      },
      substrateBoulder: {
        type: DataTypes.FLOAT,
        allowNull: true
      },
      substrateRock: {
        type: DataTypes.FLOAT,
        allowNull: true
      },
      substrateOther: {
        type: DataTypes.FLOAT,
        allowNull: true
      },
      waterLevelEn: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      waterLevelLocal: DataTypes.TEXT,
      waterLevelLang: DataTypes.STRING(3),
      riverCurrentEn: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      riverCurrentLocal: DataTypes.TEXT,
      riverCurrentLang: DataTypes.STRING(3),
      transectAvDepth: {
        type: DataTypes.FLOAT,
        allowNull: true
      },
      transectMaxDepth: {
        type: DataTypes.FLOAT,
        allowNull: true
      },
      slopeEn: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      slopeLocal: DataTypes.TEXT,
      slopeLang: DataTypes.STRING(3),
      bankTypeEn: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      bankTypeLocal: DataTypes.TEXT,
      bankTypeLang: DataTypes.STRING(3),
      shading: {
        type: DataTypes.FLOAT,
        allowNull: true
      },
      riparianVegetation: {
        type: DataTypes.FLOAT,
        allowNull: true
      },
      sheltersEn: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      sheltersLocal: DataTypes.TEXT,
      sheltersLang: DataTypes.STRING(3),
      transparency: {
        type: DataTypes.FLOAT,
        allowNull: true
      },
      vegetationTypeEn: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      vegetationTypeLocal: DataTypes.TEXT,
      vegetationTypeLang: DataTypes.STRING(3),
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
    await queryInterface.bulkInsert('Nomenclatures', nomenclatureValues)
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
