const _ = require('lodash')
const moment = require('moment')
const { assign } = Object

exports = module.exports = assign({}, require('./_common'))

exports.tableName = 'FormCiconia'

exports.fields = assign(exports.fields, {
  primarySubstrateType: {
    type: 'choice',
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
  countJuvenilesInNest: '+int',
  nestNotUsedForOverOneYear: '+int',
  dataOnJuvenileMortalityFromElectrocutions: '+int',
  dataOnJuvenilesExpelledFromParents: '+int',
  diedOtherReasons: '+int',
  reason: 'text',
  speciesNotes: 'text',
  location: {
    type: 'text',
    required: true
  }
})

exports.listInputs = {
  location: {}
}

exports.filterList = async function (api, data, q) {
  if (data.params.location) {
    q.where = _.extend(q.where || {}, {
      location: api.sequelize.sequelize.options.dialect === 'postgres'
        ? { ilike: data.params.location }
        : data.params.location
    })
  }
  if (data.params.from_date) {
    q.where = q.where || {}
    q.where.observationDateTime = _.extend(q.where.observationDateTime || {}, {
      $gte: moment(data.params.from_date).toDate()
    })
  }
  if (data.params.to_date) {
    q.where = q.where || {}
    q.where.observationDateTime = _.extend(q.where.observationDateTime || {}, {
      $lte: moment(data.params.to_date).toDate()
    })
  }
  return q
}
