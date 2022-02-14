const nomenclatures = [
  {
    name: 'pylons_type',
    values: [
      { bg: 'Тип 1', en: 'Type 1' },
      { bg: 'Тип 2', en: 'Type 2' },
      { bg: 'Тип 3', en: 'Type 3' },
      { bg: 'Тип 4', en: 'Type 4' },
      { bg: 'Тип 5', en: 'Type 5' },
      { bg: 'Тип 6', en: 'Type 6' },
      { bg: 'Тип 7', en: 'Type 7' },
      { bg: 'Тип 8', en: 'Type 8' },
      { bg: 'Тип 9', en: 'Type 9' },
      { bg: 'Тип 10', en: 'Type 10' },
      { bg: 'Тип 11', en: 'Type 11' },
      { bg: 'Тип 12', en: 'Type 12' },
      { bg: 'Тип 13', en: 'Type 13' },
      { bg: 'Тип 14 – 110 / 220 kV – 3 проводника на 2 нива', en: 'Type 14 – 110/220kV Lattice steel pylon with three conductors on two levels' },
      { bg: 'Тип 15 – 110 / 220 kV – 3 проводника на 3 нива', en: 'Type 15 – 110/220kV Lattice steel pylon with three conductors on three levels' },
      { bg: 'Тип 16 – 110 / 220 kV – 6 проводника на 3 нива', en: 'Type 16 - 110/220kV Lattice steel pylon with six conductors on three levels' },
      { bg: 'Тип 17 – 400 kV - 3 изолатора/проводника на 2 нива – 1', en: 'Type 17 – 400kV Lattice steel pylon with three insulators /conductors on two levels - 1' },
      { bg: 'Тип 18 – 400 kV - 3 изолатора/проводника на 2 нива – 2', en: 'Type 18 – 400kV Lattice steel pylon with three insulators / conductors on two levels - 2' },
      { bg: 'Тип 19 – 400 kV - 3 изолатора/проводника на 1 ниво', en: 'Type 19 – 400kV Lattice steel pylon with three insulators / conductors on one level ' },
      { bg: 'Тип 20 – 400 kV - 6 изолатора/проводника на 1 ниво', en: 'Type 20 – 400kV Lattice steel pylon with six insulators / conductors on one level ' }]
  },
  {
    name: 'pylons_type_nest',
    values: [
      { bg: 'Естествено гнездо', en: 'Natural nest' },
      { bg: 'Гнездилка', en: 'Nest box' }
    ]
  },
  {
    name: 'pylons_habitat',
    values: [
      { bg: 'Обработваеми площи', en: 'Arable land' },
      { bg: 'Открити затревени площи', en: 'Grassland' },
      { bg: 'Храстови формации', en: 'Shrubland' },
      { bg: 'Лозя и овощни градини', en: 'Vineyards and orchards' },
      { bg: 'Гора', en: 'Woodland' },
      { bg: 'Влажна зона', en: 'Wetland' }
    ]
  },
  {
    name: 'pylons_cause_of_death',
    values: [
      { bg: 'Токов удар', en: 'Electrocution' },
      { bg: 'Сблъсък с проводници', en: 'Collision' }
    ]
  },
  {
    name: 'pylons_body_condition',
    values: [
      { bg: 'Свеж труп ', en: 'Fresh corpse' },
      { bg: 'Мумифициран труп', en: 'Mummified corpse' },
      { bg: 'Пера и кости', en: 'Feathers and bones' },
      { bg: 'Само пера', en: 'Feathers only' },
      { bg: 'Само кости', en: 'Bones only' }
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
  up: async (queryInterface, Sequelize) => {
    // we use hard-coded IDs for the nomenclatures in test fixtures and fixtures cannot be applied if the migration is executed
    // if (queryInterface.sequelize.options.dialect !== 'postgres') return

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

  down: async (queryInterface, Sequelize) => {
    await deleteExistingValues(queryInterface, Sequelize)
  }
}
