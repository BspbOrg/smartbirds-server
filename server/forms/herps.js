const _ = require('lodash')
const moment = require('moment')
const { assign } = Object

exports = module.exports = assign({}, require('./_common'))

exports.tableName = 'FormHerps'

exports.fields = assign(exports.fields, {
  species: {
    type: 'choice',
    required: true,
    uniqueHash: true,
    relation: {
      model: 'species',
      filter: { type: 'herp_name' }
    }
  },
  sex: {
    type: 'choice',
    uniqueHash: true,
    relation: {
      model: 'nomenclature',
      filter: { type: 'herp_gender' }
    }
  },
  age: {
    type: 'choice',
    uniqueHash: true,
    relation: {
      model: 'nomenclature',
      filter: { type: 'herp_age' }
    }
  },
  habitat: {
    type: 'choice',
    relation: {
      model: 'nomenclature',
      filter: { type: 'herp_habitat' }
    }
  },
  threatsHerps: {
    type: 'multi',
    relation: {
      model: 'nomenclature',
      filter: { type: 'herp_danger_observation' }
    }
  },
  count: {
    type: '+int',
    required: true
  },
  marking: 'text',
  axisDistance: 'num',
  weight: 'num',
  sCLL: 'num',
  mPLLcdC: 'num',
  mCWA: 'num',
  hLcapPl: 'num',
  tempSubstrat: 'num',
  tempAir: 'num',
  tempCloaca: 'num',
  sqVentr: 'num',
  sqCaud: 'num',
  sqDors: 'num',
  speciesNotes: 'text',
  location: {
    type: 'text',
    required: true
  }
})

exports.foreignKeys.push({
  targetModelName: 'species',
  as: 'speciesInfo',
  foreignKey: 'species',
  targetKey: 'labelLa',
  scope: { type: 'herp' }
})

exports.indexes.push({ fields: [ 'species' ] })

exports.listInputs = {
  location: {},
  species: {}
}

exports.filterList = async function (api, data, q) {
  if (data.params.location) {
    q.where = _.extend(q.where || {}, {
      location: api.sequelize.sequelize.options.dialect === 'postgres'
        ? { ilike: data.params.location }
        : data.params.location
    })
  }
  if (data.params.species) {
    q.where = _.extend(q.where || {}, {
      species: data.params.species
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
