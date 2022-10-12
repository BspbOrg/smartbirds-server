const _ = require('lodash')
const { assign } = Object
const bgatlas2008 = require('./_fields/bgatlas2008')
const newSpeciesModeratorReview = require('./_fields/newSpeciesModeratorReview')

exports = module.exports = _.cloneDeep(require('./_common'))

exports.tableName = 'FormBirds'
exports.hasSpecies = true
exports.hasThreats = true
exports.hasBgAtlas2008 = true

exports.fields = assign(exports.fields, {
  ...bgatlas2008.fields,
  ...newSpeciesModeratorReview.fields,
  species: {
    type: 'choice',
    required: true,
    public: true,
    uniqueHash: true,
    relation: {
      model: 'species',
      filter: { type: 'birds' }
    }
  },
  countUnit: {
    type: 'choice',
    required: true,
    public: true,
    uniqueHash: true,
    relation: {
      model: 'nomenclature',
      filter: { type: 'birds_count_units' }
    }
  },
  typeUnit: {
    type: 'choice',
    public: true,
    required: true,
    uniqueHash: true,
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
    public: true,
    required: true,
    uniqueHash: true
  },
  countMin: {
    type: '+int',
    public: true,
    required: true,
    uniqueHash: true
  },
  countMax: {
    type: '+int',
    public: true,
    required: true,
    uniqueHash: true
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
    uniqueHash: true,
    relation: {
      model: 'nomenclature',
      filter: { type: 'birds_status' }
    }
  },
  behaviour: {
    type: 'multi',
    uniqueHash: true,
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
  speciesNotes: {
    type: 'text',
    uniqueHash: true
  }
})

exports.simpleExportFields = [
  'observationDate',
  'observationTime',
  'otherObservers',
  'email',
  'firstName',
  'lastName',
  'id',
  'autoLocationEn',
  'autoLocationLocal',
  'observationMethodologyEn',
  'observationMethodologyLocal',
  'sourceEn',
  'sourceLocal',
  'latitude',
  'longitude',
  'threatsEn',
  'threatsLocal',
  'location',
  'bgatlas2008UtmCode',
  'species',
  'countUnitEn',
  'countUnitLocal',
  'typeUnitEn',
  'typeUnitLocal',
  'typeNestingEn',
  'typeNestingLocal',
  'count',
  'countMin',
  'countMax',
  'sexEn',
  'sexLocal',
  'ageEn',
  'ageLocal',
  'markingEn',
  'markingLocal',
  'speciesStatusEn',
  'speciesStatusLocal',
  'behaviourEn',
  'behaviourLocal',
  'deadIndividualCausesEn',
  'deadIndividualCausesLocal',
  'notes',
  'speciesNotes',
  'speciesBg',
  'speciesEn'
]

exports.foreignKeys.push({
  targetModelName: 'species',
  as: 'speciesInfo',
  foreignKey: 'species',
  targetKey: 'labelLa',
  scope: { type: 'birds' }
})

exports.indexes.push({ fields: ['species'] })
