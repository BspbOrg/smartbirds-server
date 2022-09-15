const _ = require('lodash')
const { assign } = Object

exports = module.exports = _.cloneDeep(require('./_common'))

exports.tableName = 'FormFishes'
exports.hasSpecies = true
exports.hasThreats = true

exports.fields = assign(exports.fields, {
  // main fields
  species: {
    type: 'choice',
    required: true,
    public: true,
    uniqueHash: true,
    relation: {
      model: 'species',
      filter: { type: 'fishes' }
    }
  },
  count: {
    type: '+int',
    public: true,
    required: true,
    uniqueHash: true
  },
  nameWaterBody: {
    type: 'text',
    uniqueHash: true
  },
  sex: {
    type: 'choice',
    uniqueHash: true,
    relation: {
      model: 'nomenclature',
      filter: { type: 'fishes_sex' }
    }
  },
  age: {
    type: 'choice',
    uniqueHash: true,
    relation: {
      model: 'nomenclature',
      filter: { type: 'fishes_age' }
    }
  },
  sizeTL_mm: {
    type: 'num',
    uniqueHash: true
  },
  sizeSL_mm: {
    type: 'num',
    uniqueHash: true
  },
  masa_gr: {
    type: 'num',
    uniqueHash: true
  },
  findings: {
    type: 'choice',
    uniqueHash: true,
    relation: {
      model: 'nomenclature',
      filter: { type: 'fishes_findings' }
    }
  },
  monitoringType: {
    type: 'choice',
    uniqueHash: true,
    relation: {
      model: 'nomenclature',
      filter: { type: 'fishes_monitoring_type' }
    }
  },

  // habitat fields
  transectLength_M: 'num',
  transectWidth_M: 'num',
  fishingArea_M: 'num',
  exposition: '+int',
  meshSize: 'num',
  countNetTrap: 'num',
  waterTemp: 'num',
  conductivity: 'num',
  pH: 'num',
  o2mgL: 'num',
  o2percent: 'num',
  salinity: 'num',
  habitatDescriptionType: {
    type: 'choice',
    relation: {
      model: 'nomenclature',
      filter: { type: 'fishes_habitat_description_type' }
    }
  },
  substrateMud: 'num',
  substrateSilt: 'num',
  substrateSand: 'num',
  substrateGravel: 'num',
  substrateSmallStones: 'num',
  substrateCobble: 'num',
  substrateBoulder: 'num',
  substrateRock: 'num',
  substrateOther: 'num',
  waterLevel: {
    type: 'choice',
    relation: {
      model: 'nomenclature',
      filter: { type: 'fishes_water_level' }
    }
  },
  riverCurrent: {
    type: 'choice',
    relation: {
      model: 'nomenclature',
      filter: { type: 'fishes_river_current' }
    }
  },
  transectAvDepth: 'num',
  transectMaxDepth: 'num',
  slope: {
    type: 'choice',
    relation: {
      model: 'nomenclature',
      filter: { type: 'fishes_slope' }
    }
  },
  bankType: {
    type: 'choice',
    relation: {
      model: 'nomenclature',
      filter: { type: 'fishes_bank_type' }
    }
  },
  shading: 'num',
  riparianVegetation: 'num',
  shelters: {
    type: 'multi',
    relation: {
      model: 'nomenclature',
      filter: { type: 'fishes_shelters' }
    }
  },
  transparency: 'num',
  vegetationType: {
    type: 'multi',
    relation: {
      model: 'nomenclature',
      filter: { type: 'fishes_vegetation_type' }
    }
  },
  naturalBarriers: 'boolean',

  speciesNotes: {
    type: 'text'
  }
})

exports.foreignKeys.push({
  targetModelName: 'species',
  as: 'speciesInfo',
  foreignKey: 'species',
  targetKey: 'labelLa',
  scope: { type: 'fishes' }
})

exports.indexes.push({ fields: ['species'] })
