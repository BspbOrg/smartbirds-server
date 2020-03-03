'use strict'

const tables = [
  {
    name: 'FormBirds',
    columns: [
      'source',
      'countUnit',
      'typeUnit',
      'typeNesting',
      'sex',
      'age',
      'marking',
      'speciesStatus',
      'behaviour',
      'deadIndividualCauses',
      'substrate',
      'treeLocation',
      'nestHeight',
      'nestLocation',
      'ageFemale',
      'ageMale',
      'nestingSuccess',
      'rain',
      'windDirection',
      'windSpeed',
      'cloudiness',
      'threats'

    ]
  },
  {
    name: 'FormCBM',
    columns: [
      'plot',
      'visit',
      'secondaryHabitat',
      'primaryHabitat',
      'distance',
      'rain',
      'windDirection',
      'windSpeed',
      'cloudiness',
      'threats'
    ]
  },
  {
    name: 'FormCiconia',
    columns: [
      'primarySubstrateType',
      'electricityPole',
      'typeElectricityPole',
      'tree',
      'building',
      'nestThisYearNotUtilizedByWhiteStorks',
      'thisYearOneTwoBirdsAppearedInNest',
      'thisYearInTheNestAppeared',
      'rain',
      'windDirection',
      'windSpeed',
      'cloudiness',
      'threats'
    ]
  },
  {
    name: 'FormHerptiles',
    columns: [
      'sex',
      'age',
      'habitat',
      'threatsHerptiles',
      'findings',
      'rain',
      'windDirection',
      'windSpeed',
      'cloudiness',
      'threats'
    ]
  },
  {
    name: 'FormInvertebrates',
    columns: [
      'sex',
      'age',
      'habitat',
      'threatsInvertebrates',
      'findings',
      'rain',
      'windDirection',
      'windSpeed',
      'cloudiness',
      'threats'
    ]
  },
  {
    name: 'FormMammals',
    columns: [
      'sex',
      'age',
      'habitat',
      'threatsMammals',
      'findings',
      'rain',
      'windDirection',
      'windSpeed',
      'cloudiness',
      'threats'
    ]
  },
  {
    name: 'FormPlants',
    columns: [
      'habitat',
      'reportingUnit',
      'phenologicalPhase',
      'threatsPlants',
      'rain',
      'windDirection',
      'windSpeed',
      'cloudiness',
      'threats'
    ]
  },
  {
    name: 'FormThreats',
    columns: [
      'category',
      'estimate',
      'stateCarcass',
      'sampleTaken1',
      'sampleTaken2',
      'sampleTaken3',
      'rain',
      'windDirection',
      'windSpeed',
      'cloudiness',
      'threats'
    ]
  },
  {
    name: 'Locations',
    columns: [
      'name',
      'area',
      'type',
      'region'
    ]
  }
]

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('FormCBM', ['visitBg'])
    await queryInterface.removeIndex('Locations', ['areaBg'])
    await queryInterface.removeIndex('Locations', ['nameBg'])

    await Promise.all(
      tables.map((table) =>
        table.columns.reduce(async (prev, column) => {
          await prev
          await queryInterface.renameColumn(table.name, `${column}Bg`, `${column}Local`)
        }, {})
      )
    )

    await queryInterface.addIndex('FormCBM', { fields: ['visitLocal'] })
    await queryInterface.addIndex('Locations', { fields: ['areaLocal'] })
    await queryInterface.addIndex('Locations', { fields: ['nameLocal'] })
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('FormCBM', ['visitLocal'])
    await queryInterface.removeIndex('Locations', ['areaLocal'])
    await queryInterface.removeIndex('Locations', ['nameLocal'])

    await Promise.all(
      tables.map((table) =>
        table.columns.reduce(async (prev, column) => {
          await prev
          await queryInterface.renameColumn(table.name, `${column}Local`, `${column}Bg`)
        }, {})
      )
    )

    await queryInterface.addIndex('FormCBM', { fields: ['visitBg'] })
    await queryInterface.addIndex('Locations', { fields: ['areaBg'] })
    await queryInterface.addIndex('Locations', { fields: ['nameBg'] })
  }
}
