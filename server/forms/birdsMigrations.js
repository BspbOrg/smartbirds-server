const _ = require('lodash')
const { assign } = Object
const bgatlas2008 = require('./_fields/bgatlas2008')
const newSpeciesModeratorReview = require('./_fields/newSpeciesModeratorReview')

exports = module.exports = _.cloneDeep(require('./_common'))

exports.tableName = 'FormBirdsMigrations'
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
  count: {
    type: '+int',
    public: true,
    required: true,
    uniqueHash: true
  },
  migrationPoint: {
    type: 'choice',
    uniqueHash: true,
    required: true,
    relation: {
      model: 'poi',
      filter: { type: 'birds_migration_point' }
    },
    allowNull: false
  },
  distanceFromMigrationPoint: {
    type: '+num',
    afterApiUpdate (model) {
      if (model.changed('latitude') || model.changed('longitude') || model.changed('migrationPointEn')) {
        model.distanceFromMigrationPoint = null
      }
    }
  },
  locationFromMigrationPoint: {
    type: 'choice',
    relation: {
      model: 'nomenclature',
      filter: { type: 'main_geo_direction' }
    }
  },
  sex: {
    type: 'choice',
    uniqueHash: true,
    relation: {
      model: 'nomenclature',
      filter: { type: 'birds_sex' }
    }
  },
  plumage: {
    type: 'choice',
    uniqueHash: true,
    relation: {
      model: 'nomenclature',
      filter: { type: 'birds_migration_plumage' }
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
  visochinaPolet: {
    type: 'num',
    uniqueHash: true
  },
  posokaPoletFrom: {
    type: 'choice',
    uniqueHash: true,
    relation: {
      model: 'nomenclature',
      filter: { type: 'main_geo_direction' }
    }
  },
  posokaPoletTo: {
    type: 'choice',
    uniqueHash: true,
    relation: {
      model: 'nomenclature',
      filter: { type: 'main_geo_direction' }
    }
  },
  typeFlight: {
    type: 'choice',
    uniqueHash: true,
    relation: {
      model: 'nomenclature',
      filter: { type: 'birds_migration_type_flight' }
    }
  },

  speciesNotes: {
    type: 'text',
    uniqueHash: true
  }
})

exports.foreignKeys.push({
  targetModelName: 'species',
  as: 'speciesInfo',
  foreignKey: 'species',
  targetKey: 'labelLa',
  scope: { type: 'birds' }
})

exports.indexes.push({ fields: ['species'] })
