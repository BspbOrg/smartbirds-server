'use strict'

const Sequelize = require('sequelize')

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
  up: async function (queryInterface) {
    await queryInterface.removeIndex('FormCBM', ['visitLocal'])
    await queryInterface.removeIndex('Locations', ['areaLocal'])
    await queryInterface.removeIndex('Locations', ['nameLocal'])

    await Promise.all(
      tables.map((table) =>
        table.columns.reduce(async (prev, column) => {
          await prev
          await queryInterface.addColumn(table.name, `${column}Lang`, Sequelize.STRING(3))
          await queryInterface.bulkUpdate(table.name, { [`${column}Lang`]: 'bg' }, {})
        }, {})
      )
    )

    await queryInterface.addIndex('FormCBM', { fields: ['visitLang', 'visitLocal'] })
    await queryInterface.addIndex('Locations', { fields: ['areaLang', 'areaLocal'] })
    await queryInterface.addIndex('Locations', { fields: ['nameLang', 'nameLocal'] })
  },

  down: async function (queryInterface) {
    if (queryInterface.sequelize.options.dialect !== 'sqlite') {
      await Promise.all(
        tables.map((table) =>
          table.columns.reduce(async (prev, column) => {
            await prev
            await queryInterface.removeColumn(table.name, `${column}Lang`)
          }, {})
        )
      )
    }

    await queryInterface.addIndex('FormCBM', ['visitLocal'])
    await queryInterface.addIndex('Locations', ['areaLocal'])
    await queryInterface.addIndex('Locations', ['nameLocal'])
  }
}
