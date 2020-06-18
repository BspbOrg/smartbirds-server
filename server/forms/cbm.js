const _ = require('lodash')
const moment = require('moment')
const extra = require('./_extra')

exports = module.exports = _.cloneDeep(require('./_common'))

exports.modelName = 'formCBM'
exports.tableName = 'FormCBM'
exports.hasSpecies = true
exports.hasThreats = true

exports.fields = {
  confidential: 'boolean',
  plot: {
    type: 'choice',
    required: true,
    uniqueHash: true,
    relation: {
      model: 'nomenclature',
      filter: { type: 'cbm_sector' }
    }
  },
  visit: {
    type: 'choice',
    required: true,
    uniqueHash: true,
    relation: {
      model: 'nomenclature',
      filter: { type: 'cbm_visit_number' }
    }
  },
  secondaryHabitat: {
    type: 'choice',
    relation: {
      model: 'nomenclature',
      filter: { type: 'cbm_habitat' }
    }
  },
  primaryHabitat: {
    type: 'choice',
    required: true,
    relation: {
      model: 'nomenclature',
      filter: { type: 'cbm_habitat' }
    }
  },
  distance: {
    type: 'choice',
    required: true,
    uniqueHash: true,
    relation: {
      model: 'nomenclature',
      filter: { type: 'cbm_distance' }
    }
  },
  species: {
    type: 'choice',
    required: true,
    uniqueHash: true,
    public: true,
    relation: {
      model: 'species',
      filter: { type: 'birds' }
    }
  },
  cloudiness: {
    type: 'choice',
    relation: {
      model: 'nomenclature',
      filter: { type: 'main_cloud_level' }
    }
  },
  windDirection: {
    type: 'choice',
    relation: {
      model: 'nomenclature',
      filter: { type: 'main_wind_direction' }
    }
  },
  windSpeed: {
    type: 'choice',
    relation: {
      model: 'nomenclature',
      filter: { type: 'main_wind_force' }
    }
  },
  rain: {
    type: 'choice',
    relation: {
      model: 'nomenclature',
      filter: { type: 'main_rain' }
    }
  },

  count: {
    type: '+int',
    required: true,
    public: true,
    uniqueHash: true
  },
  endDateTime: {
    type: 'timestamp',
    required: true,
    uniqueHash: true
  },
  startDateTime: {
    type: 'timestamp',
    required: true,
    uniqueHash: true
  },
  notes: 'text',
  visibility: '+num',
  mto: 'text',
  cloudsType: 'text',
  temperature: 'num',
  observers: 'text',
  latitude: {
    type: 'num',
    required: true,
    public: true,
    uniqueHash: true
  },
  longitude: {
    type: 'num',
    required: true,
    public: true,
    uniqueHash: true
  },

  observationDateTime: {
    type: 'timestamp',
    required: true,
    public: true,
    uniqueHash: true
  },
  monitoringCode: {
    type: 'text',
    required: true
  },

  zone: {
    type: 'choice',
    required: true,
    uniqueHash: true,
    relation: {
      model: 'zone'
    }
  },

  threats: {
    type: 'multi',
    relation: {
      model: 'nomenclature',
      filter: { type: 'main_threats' }
    }
  },

  user: {
    type: 'choice',
    required: true,
    uniqueHash: true,
    observationDateTime: '2015-12-10T12:15:04Z',
    relation: {
      model: 'user'
    }
  },

  organization: {
    type: 'choice',
    required: true,
    relation: {
      model: 'organization'
    },
    default: 'bspb'
  },

  pictures: 'json',
  track: 'text',
  ...extra.fields
}

exports.foreignKeys.push({ targetModelName: 'zone', as: 'zone' })
exports.foreignKeys.push({
  targetModelName: 'species',
  as: 'speciesInfo',
  foreignKey: 'species',
  targetKey: 'labelLa',
  scope: { type: 'birds' }
})

exports.indexes.push({ fields: ['species'] })
exports.indexes.push({ fields: ['zoneId'] })

exports.listInputs = {
  zone: {},
  visit: {},
  year: {}
}

exports.filterList = async function (api, { params }, q) {
  if (params.zone) {
    q.where = _.extend(q.where || {}, {
      zoneId: params.zone
    })
  } else if (params.location) {
    q.where = q.where || {}
    // remove the filter by location string
    delete q.where.location
    q.include = q.include || []
    q.include.push(api.models.zone.associations.zone)
    q.where['$zone.locationId$'] = params.location
  }
  if (params.visit) {
    q.where = _.extend(q.where || {}, {
      $or: {
        visitLocal: params.visit,
        visitEn: params.visit
      }
    })
  }
  if (params.year) {
    q.where = _.extend(q.where || {}, {
      startDateTime: {
        $gte: moment().year(params.year).startOf('year').toDate(),
        $lte: moment().year(params.year).endOf('year').toDate()
      }
    })
  }
  return q
}

exports.prepareCsv = async function (api, record, {
  plotEn, plotLocal, zoneId, userId,
  ...csv
}) {
  return {
    temperature: record.temperature,
    cloudinessLocal: record.cloudinessLocal,
    cloudinessEn: record.cloudinessEn,
    cloudsType: record.cloudsType,
    threatsLocal: record.threatsLocal,
    threatsEn: record.threatsEn,
    observers: record.observers,
    mto: record.mto,
    monitoringCode: record.monitoringCode,
    zone: record.zoneId,
    rainLocal: record.rainLocal,
    rainEn: record.rainEn,
    windSpeedLocal: record.windSpeedLocal,
    windSpeedEn: record.windSpeedEn,
    visibility: record.visibility,
    windDirectionLocal: record.windDirectionLocal,
    windDirectionEn: record.windDirectionEn,
    longitude: record.longitude,
    distanceLocal: record.distanceLocal,
    distanceEn: record.distanceEn,
    secondaryHabitatLocal: record.secondaryHabitatLocal,
    secondaryHabitatEn: record.secondaryHabitatEn,
    plotSectionLocal: record.plotLocal,
    plotSectionEn: record.plotEn,
    latitude: record.latitude,
    species: record['speciesInfo.labelLa'],
    visitLocal: record.visitLocal,
    visitEn: record.visitEn,
    count: record.count,
    primaryHabitatLocal: record.primaryHabitatLocal,
    primaryHabitatEn: record.primaryHabitatEn,
    speciesEuringCode: record['speciesInfo.euring'],
    speciesCode: record['speciesInfo.code'],
    ...csv
  }
}
