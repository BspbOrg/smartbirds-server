const _ = require('lodash')
const moment = require('moment')

exports = module.exports = _.cloneDeep(require('./_common'))

exports.modelName = 'formCBM'
exports.tableName = 'FormCBM'
exports.hasSpecies = true

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

  pictures: 'json',
  track: 'text'
}

exports.foreignKeys.push({ targetModelName: 'zone', as: 'zone' })
exports.foreignKeys.push({
  targetModelName: 'species',
  as: 'speciesInfo',
  foreignKey: 'species',
  targetKey: 'labelLa',
  scope: { type: 'birds' }
})

exports.indexes.push({ fields: [ 'species' ] })
exports.indexes.push({ fields: [ 'zoneId' ] })

exports.listInputs = {
  zone: {},
  visit: {},
  year: {}
}

exports.filterList = async function (api, data, q) {
  if (data.params.zone) {
    q.where = _.extend(q.where || {}, {
      zoneId: data.params.zone
    })
  } else if (data.params.location) {
    q.where = q.where || {}
    // remove the filter by location string
    delete q.where.location
    q.include = q.include || []
    q.include.push(api.models.zone.associations.zone)
    q.where[ '$zone.locationId$' ] = data.params.location
  }
  if (data.params.visit) {
    q.where = _.extend(q.where || {}, {
      $or: {
        visitBg: data.params.visit,
        visitEn: data.params.visit
      }
    })
  }
  if (data.params.year) {
    q.where = _.extend(q.where || {}, {
      startDateTime: {
        $gte: moment().year(data.params.year).startOf('year').toDate(),
        $lte: moment().year(data.params.year).endOf('year').toDate()
      }
    })
  }
  return q
}

exports.prepareCsv = async function (api, record) {
  return {
    temperature: record.temperature,
    cloudinessBg: record.cloudinessBg,
    cloudinessEn: record.cloudinessEn,
    cloudsType: record.cloudsType,
    threatsBg: record.threatsBg,
    threatsEn: record.threatsEn,
    observers: record.observers,
    mto: record.mto,
    monitoringCode: record.monitoringCode,
    zone: record.zoneId,
    rainBg: record.rainBg,
    rainEn: record.rainEn,
    windSpeedBg: record.windSpeedBg,
    windSpeedEn: record.windSpeedEn,
    visibility: record.visibility,
    windDirectionBg: record.windDirectionBg,
    windDirectionEn: record.windDirectionEn,
    longitude: record.longitude,
    distanceBg: record.distanceBg,
    distanceEn: record.distanceEn,
    secondaryHabitatBg: record.secondaryHabitatBg,
    secondaryHabitatEn: record.secondaryHabitatEn,
    plotSectionBg: record.plotBg,
    plotSectionEn: record.plotEn,
    latitute: record.latitude,
    species: record[ 'speciesInfo.labelLa' ] + ' | ' + record[ 'speciesInfo.labelBg' ],
    visitBg: record.visitBg,
    visitEn: record.visitEn,
    count: record.count,
    primaryHabitatBg: record.primaryHabitatBg,
    primaryHabitatEn: record.primaryHabitatEn,
    speciesEuringCode: record[ 'speciesInfo.euring' ],
    speciesCode: record[ 'speciesInfo.code' ]
  }
}
