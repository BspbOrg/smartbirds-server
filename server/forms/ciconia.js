const _ = require('lodash')
const { assign } = Object
const bgatlas2008 = require('./_fields/bgatlas2008')
const newSpeciesModeratorReview = require('./_fields/newSpeciesModeratorReview')
const etrs89GridCode = require('./_fields/etrs89GridCode')

exports = module.exports = _.cloneDeep(require('./_common'))

exports.tableName = 'FormCiconia'
exports.hasSpecies = false
exports.hasThreats = true
exports.hasBgAtlas2008 = true

exports.fields = assign(exports.fields, {
  ...bgatlas2008.fields,
  ...newSpeciesModeratorReview.fields,
  ...etrs89GridCode.fields,
  primarySubstrateType: {
    type: 'choice',
    uniqueHash: true,
    relation: {
      model: 'nomenclature',
      filter: { type: 'ciconia_substratum' }
    }
  },
  electricityPole: {
    type: 'choice',
    relation: {
      model: 'nomenclature',
      filter: { type: 'ciconia_column' }
    }
  },
  nestIsOnArtificialPlatform: 'boolean',
  typeElectricityPole: {
    type: 'choice',
    relation: {
      model: 'nomenclature',
      filter: { type: 'ciconia_column_type' }
    }
  },
  tree: {
    type: 'choice',
    relation: {
      model: 'nomenclature',
      filter: { type: 'ciconia_tree' }
    }
  },
  building: {
    type: 'choice',
    relation: {
      model: 'nomenclature',
      filter: { type: 'ciconia_building' }
    }
  },
  nestOnArtificialHumanMadePlatform: 'boolean',
  nestIsOnAnotherTypeOfSubstrate: 'text',
  nestThisYearNotUtilizedByWhiteStorks: {
    type: 'choice',
    uniqueHash: true,
    relation: {
      model: 'nomenclature',
      filter: { type: 'ciconia_not_occupied' }
    }
  },
  thisYearOneTwoBirdsAppearedInNest: {
    type: 'choice',
    relation: {
      model: 'nomenclature',
      filter: { type: 'ciconia_new_birds' }
    }
  },
  approximateDateStorksAppeared: 'timestamp',
  approximateDateDisappearanceWhiteStorks: 'timestamp',
  thisYearInTheNestAppeared: {
    type: 'choice',
    relation: {
      model: 'nomenclature',
      filter: { type: 'ciconia_new_birds' }
    }
  },
  countJuvenilesInNest: {
    type: '+int',
    uniqueHash: true
  },
  nestNotUsedForOverOneYear: '+int',
  dataOnJuvenileMortalityFromElectrocutions: '+int',
  dataOnJuvenilesExpelledFromParents: '+int',
  diedOtherReasons: '+int',
  reason: 'text',
  speciesNotes: {
    type: 'text',
    uniqueHash: true
  }
})

exports.simpleExportFields = [
  'id',
  'observationDate',
  'observationTime',
  'firstName',
  'lastName',
  'email',
  'otherObservers',
  'autoLocationLocal',
  'autoLocationEn',
  'latitude',
  'longitude',
  'location',
  'primarySubstrateTypeLocal',
  'primarySubstrateTypeEn',
  'electricityPoleLocal',
  'electricityPoleEn',
  'nestIsOnArtificialPlatform',
  'typeElectricityPoleLocal',
  'typeElectricityPoleEn',
  'treeLocal',
  'treeEn',
  'buildingLocal',
  'buildingEn',
  'nestOnArtificialHumanMadePlatform',
  'nestIsOnAnotherTypeOfSubstrate',
  'nestThisYearNotUtilizedByWhiteStorksLocal',
  'nestThisYearNotUtilizedByWhiteStorksEn',
  'thisYearOneTwoBirdsAppearedInNestLocal',
  'thisYearOneTwoBirdsAppearedInNestEn',
  'approximateDateStorksAppeared',
  'approximateDateDisappearanceWhiteStorks',
  'thisYearInTheNestAppearedLocal',
  'thisYearInTheNestAppearedEn',
  'countJuvenilesInNest',
  'nestNotUsedForOverOneYear',
  'dataOnJuvenileMortalityFromElectrocutions',
  'dataOnJuvenilesExpelledFromParents',
  'diedOtherReasons',
  'reason',
  'threatsLocal',
  'threatsEn',
  'speciesNotes',
  'notes'
]
