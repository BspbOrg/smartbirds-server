const _ = require('lodash')
const { assign } = Object

exports = module.exports = _.cloneDeep(require('./_common'))

exports.tableName = 'FormBats'
exports.hasSpecies = true
exports.hasThreats = true

exports.fields = assign(exports.fields, {
  // main fields
  metodology: {
    type: 'choice',
    uniqueHash: true,
    relation: {
      model: 'nomenclature',
      filter: { type: 'bats_methodology' }
    }
  },
  tCave: {
    type: 'num',
    uniqueHash: true
  },
  hCave: {
    type: 'num',
    uniqueHash: true
  },
  typloc: {
    type: 'choice',
    uniqueHash: true,
    relation: {
      model: 'nomenclature',
      filter: { type: 'bats_type_location' }
    }
  },
  sublocality: {
    type: 'text',
    uniqueHash: true
  },
  species: {
    type: 'choice',
    required: true,
    public: true,
    uniqueHash: true,
    relation: {
      model: 'species',
      filter: { type: 'bats' }
    }
  },
  count: {
    type: '+int',
    public: true,
    required: true,
    uniqueHash: true
  },
  swarming: {
    type: 'boolean',
    uniqueHash: true
  },
  sex: {
    type: 'choice',
    uniqueHash: true,
    relation: {
      model: 'nomenclature',
      filter: { type: 'bats_sex' }
    }
  },
  age: {
    type: 'choice',
    uniqueHash: true,
    relation: {
      model: 'nomenclature',
      filter: { type: 'bats_age' }
    }
  },
  habitats: {
    type: 'choice',
    uniqueHash: true,
    relation: {
      model: 'nomenclature',
      filter: { type: 'bats_habitat' }
    }
  },
  condition: {
    type: 'choice',
    uniqueHash: true,
    relation: {
      model: 'nomenclature',
      filter: { type: 'bats_condition' }
    }
  },
  typeCond: {
    type: 'choice',
    uniqueHash: true,
    relation: {
      model: 'nomenclature',
      filter: { type: 'bats_type_condition' }
    }
  },
  reproductiveStatus: {
    type: 'choice',
    uniqueHash: true,
    relation: {
      model: 'nomenclature',
      filter: { type: 'bats_reproductive_status' }
    }
  },
  ring: {
    type: 'choice',
    uniqueHash: true,
    relation: {
      model: 'nomenclature',
      filter: { type: 'bats_ring' }
    }
  },
  ringN: {
    type: 'text',
    uniqueHash: true
  },
  bodyLength: {
    type: 'num',
    uniqueHash: true
  },
  tailLength: {
    type: 'num',
    uniqueHash: true
  },
  earLength: {
    type: 'num',
    uniqueHash: true
  },
  forearmLength: {
    type: 'num',
    uniqueHash: true
  },
  lengthThirdDigit: {
    type: 'num',
    uniqueHash: true
  },
  lengthFifthDigit: {
    type: 'num',
    uniqueHash: true
  },
  lengthWS: {
    type: 'num',
    uniqueHash: true
  },
  weight: {
    type: 'num',
    uniqueHash: true
  },
  tragus: {
    type: 'num'
  },
  upperMolar: {
    type: 'num'
  },

  speciesNotes: {
    type: 'text'
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
  'species',
  'speciesBg',
  'speciesEn',
  'count',
  'ageLocal',
  'ageEn',
  'sexLocal',
  'sexEn',
  'threatsLocal',
  'threatsEn',
  'sourceLocal',
  'sourceEn',
  'speciesNotes',
  'notes'
]

exports.foreignKeys.push({
  targetModelName: 'species',
  as: 'speciesInfo',
  foreignKey: 'species',
  targetKey: 'labelLa',
  scope: { type: 'bats' }
})

exports.indexes.push({ fields: ['species'] })
