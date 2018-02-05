const _ = require('lodash')
const moment = require('moment')
const { assign } = Object

exports = module.exports = _.cloneDeep(require('./_common'))

exports.tableName = 'FormBirds'

exports.fields = assign(exports.fields, {
  source: {
    type: 'choice',
    relation: {
      model: 'nomenclature',
      filter: { type: 'main_source' }
    }
  },
  species: {
    type: 'choice',
    required: true,
    uniqueHash: true,
    relation: {
      model: 'species',
      filter: { type: 'birds' }
    }
  },
  countUnit: {
    type: 'choice',
    required: true,
    uniqueHash: true,
    relation: {
      model: 'nomenclature',
      filter: { type: 'birds_count_units' }
    }
  },
  typeUnit: {
    type: 'choice',
    required: true,
    relation: {
      model: 'nomenclature',
      filter: { type: 'birds_count_type' }
    }
  },
  typeNesting: {
    type: 'choice',
    relation: {
      model: 'nomenclature',
      filter: { type: 'birds_nesting' }
    }
  },
  count: {
    type: '+int',
    required: true
  },
  countMin: {
    type: '+int',
    required: true
  },
  countMax: {
    type: '+int',
    required: true
  },
  sex: {
    type: 'choice',
    uniqueHash: true,
    relation: {
      model: 'nomenclature',
      filter: { type: 'birds_sex' }
    }
  },
  age: {
    type: 'choice',
    uniqueHash: true,
    relation: {
      model: 'nomenclature',
      filter: { type: 'birds_age' }
    }
  },
  marking: {
    type: 'choice',
    relation: {
      model: 'nomenclature',
      filter: { type: 'birds_marking' }
    }
  },
  speciesStatus: {
    type: 'choice',
    relation: {
      model: 'nomenclature',
      filter: { type: 'birds_status' }
    }
  },
  behaviour: {
    type: 'multi',
    relation: {
      model: 'nomenclature',
      filter: { type: 'birds_behaviour' }
    }
  },
  deadIndividualCauses: {
    type: 'choice',
    relation: {
      model: 'nomenclature',
      filter: { type: 'birds_death' }
    }
  },
  substrate: {
    type: 'choice',
    relation: {
      model: 'nomenclature',
      filter: { type: 'birds_nest_substrate' }
    }
  },
  tree: 'text',
  treeHeight: '+num',
  treeLocation: {
    type: 'choice',
    relation: {
      model: 'nomenclature',
      filter: { type: 'birds_nest_location' }
    }
  },
  nestHeight: {
    type: 'choice',
    relation: {
      model: 'nomenclature',
      filter: { type: 'birds_nest_height' }
    }
  },
  nestLocation: {
    type: 'choice',
    relation: {
      model: 'nomenclature',
      filter: { type: 'birds_nest_position' }
    }
  },
  brooding: 'boolean',
  eggsCount: '+int',
  countNestling: '+int',
  countFledgling: '+int',
  countSuccessfullyLeftNest: '+int',
  nestProtected: 'boolean',
  ageFemale: {
    type: 'choice',
    relation: {
      model: 'nomenclature',
      filter: { type: 'birds_age_individual' }
    }
  },
  ageMale: {
    type: 'choice',
    relation: {
      model: 'nomenclature',
      filter: { type: 'birds_age_individual' }
    }
  },
  nestingSuccess: {
    type: 'choice',
    relation: {
      model: 'nomenclature',
      filter: { type: 'birds_nest_success' }
    }
  },
  landuse300mRadius: 'text',
  location: {
    type: 'text',
    required: true
  },
  speciesNotes: 'text'
})

exports.foreignKeys.push({
  targetModelName: 'species',
  as: 'speciesInfo',
  foreignKey: 'species',
  targetKey: 'labelLa',
  scope: { type: 'birds' }
})

exports.indexes.push({ fields: [ 'species' ] })

exports.listInputs = {
  location: {},
  species: {},
  from_date: {},
  to_date: {}
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
