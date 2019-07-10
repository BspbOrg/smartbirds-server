const _ = require('lodash')
const { assign } = Object
const formsConfig = require('../../config/formsConfig')

exports = module.exports = _.cloneDeep(require('./_common'))

exports.tableName = 'FormThreats'
exports.hasSpecies = true

exports.fields = assign(exports.fields, {
  category: {
    type: 'choice',
    uniqueHash: true,
    relation: {
      model: 'nomenclature',
      filter: { type: 'threats_category' }
    }
  },
  species: {
    type: 'choice',
    public: true,
    uniqueHash: true,
    relation: {
      model: 'species'
    }
  },
  estimate: {
    type: 'choice',
    relation: {
      model: 'nomenclature',
      filter: { type: 'threats_estimate' }
    }
  },
  poisonedType: 'text',
  stateCarcass: {
    type: 'choice',
    relation: {
      model: 'nomenclature',
      filter: { type: 'threats_state_carcass' }
    }
  },
  sampleTaken1: {
    type: 'choice',
    relation: {
      model: 'nomenclature',
      filter: { type: 'threats_sample' }
    }
  },
  sampleTaken2: {
    type: 'choice',
    relation: {
      model: 'nomenclature',
      filter: { type: 'threats_sample' }
    }
  },
  sampleTaken3: {
    type: 'choice',
    relation: {
      model: 'nomenclature',
      filter: { type: 'threats_sample' }
    }
  },
  location: {
    type: 'text',
    required: true
  },
  class: 'text',
  sampleCode1: 'text',
  sampleCode2: 'text',
  sampleCode3: 'text',
  count: '+int',
  threatsNotes: 'text',
  primaryType: {
    type: 'text',
    required: true
  }
})

exports.foreignKeys.push({
  targetModelName: 'species',
  as: 'speciesInfo',
  foreignKey: 'species',
  targetKey: 'labelLa'
})

exports.listInputs = {
  primaryType: {},
  class: {}
}

exports.filterList = async function (api, data, q) {
  if (data.params.primaryType) {
    q.where = _.extend(q.where || {}, {
      primaryType: data.params.primaryType
    })
  }
  if (data.params.class) {
    q.where = _.extend(q.where || {}, {
      class: data.params.class
    })
  }
  return q
}

exports.indexes.push({ fields: ['species'] })

const afterApiUpdate = function (threat, options) {
  if (threat.primaryType === formsConfig.threatsPrimaryTypes.threat.id) {
    threat.poisonedType = null
    threat.stateCarcassBg = null
    threat.stateCarcassEn = null
    threat.sampleCode1 = null
    threat.sampleCode2 = null
    threat.sampleCode3 = null
    threat.sampleTaken1Bg = null
    threat.sampleTaken1En = null
    threat.sampleTaken2Bg = null
    threat.sampleTaken2En = null
    threat.sampleTaken3Bg = null
    threat.sampleTaken3En = null
  } else {
    threat.categoryBg = null
    threat.categoryEn = null
    threat.estimateBg = null
    threat.estimateEn = null
    switch (threat.poisonedType) {
      case formsConfig.threatsPoisonedType.alive.id:
        threat.stateCarcassBg = null
        threat.stateCarcassEn = null
        break
      case formsConfig.threatsPoisonedType.bait.id:
        threat.stateCarcassBg = null
        threat.stateCarcassEn = null
        threat.class = null
        threat.speciesBg = null
        threat.speciesEn = null
        break
      default:
        break
    }
  }
}

exports.hooks = {
  afterApiUpdate: afterApiUpdate
}

exports.validate = {
  validateTypeThreat: function () {
    if (this.primaryType === formsConfig.threatsPrimaryTypes.threat.id) {
      if (!this.categoryBg && !this.categoryEn) {
        throw new Error('Category is required when primaryType is threat')
      }
    }
  },
  validateTypePoison: function () {
    if (this.primaryType === formsConfig.threatsPrimaryTypes.poison.id) {
      if (!this.poisonedType) {
        throw new Error('poisonedType is required when primaryType is poison')
      }

      if (!this.count) {
        throw new Error('count is required when poisonedType is bait')
      }

      if (
        this.poisonedType === formsConfig.threatsPoisonedType.dead.id ||
        this.poisonedType === formsConfig.threatsPoisonedType.alive.id) {
        if (!this.class) {
          throw new Error('class is required when poisonedType is bait')
        }

        if (!this.species) {
          throw new Error('species is required when poisonedType is bait')
        }

        if (this.poisonedType === formsConfig.threatsPoisonedType.dead.id) {
          if (!this.stateCarcassBg && !this.stateCarcassEn) {
            throw new Error('stateCarcass is required when poisonedType is dead')
          }
        }
      }
    }
  }
}
