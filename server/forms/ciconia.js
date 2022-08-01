const _ = require('lodash')
const { assign } = Object
const bgatlas2008 = require('./_fields/bgatlas2008')
const newSpeciesModeratorReview = require('./_fields/newSpeciesModeratorReview')

exports = module.exports = _.cloneDeep(require('./_common'))

exports.tableName = 'FormCiconia'
exports.hasSpecies = false
exports.hasThreats = true
exports.hasBgAtlas2008 = true

exports.fields = assign(exports.fields, {
  ...bgatlas2008.fields,
  ...newSpeciesModeratorReview.fields,
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
