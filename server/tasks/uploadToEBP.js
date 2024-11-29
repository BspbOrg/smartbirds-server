const { Task, api } = require('actionhero')
const sequelize = require('sequelize')
const { Op } = sequelize
const startOfDay = require('date-fns/startOfDay')
const endOfDay = require('date-fns/endOfDay')
const format = require('date-fns/format')

// const availableForms = [api.forms.formCBM, api.forms.formBirds, api.forms.formCiconia]
const availableForms = [api.forms.formBirds]

// eslint-disable-next-line no-unused-vars
const API_TOKEN = process.env.EBP_API_TOKEN
// eslint-disable-next-line no-unused-vars
const apiParams = {
  provisionMode: {
    bulk: { // all data is replaced
      code: 'B'
    },
    standard: { // new data is added, existing data is updated
      code: 'S'
    },
    test: { // The data will not be persisted to the database. It is used for testing purposes.
      code: 'T'
    }
  },
  updateMode: {
    modify: { // Only updated records will be provided
      code: 'M'
    },
    all: { // All records will be provided
      code: 'A'
    }
  },
  dataType: {
    casual: { // Casual records
      code: 'C'
    },
    completeList: { // Complete list records
      code: 'L'
    },
    fixedList: { // Fixed list of records
      code: 'F'
    }
  },
  locationMode: {
    exactLocation: {
      code: 'E'
    },
    coarseLocation: { // location lowered to 10x10km level ETRS89-LAEA grid
      code: 'D'
    },
    aggregatedLocation: { // data aggregated at 10x10km level ETRS89-LAEA grid
      code: 'A'
    }
  },
  eventState: {
    removed: { // Provided event is removed
      code: 0
    },
    modified: { // Provided event is new or has been modified
      code: 1
    },
    unchanged: { // Provided event is unchanged
      code: 2
    }
  },
  recordState: {
    removed: { // Provided record is removed
      code: 0
    },
    modified: { // Provided record is new or has been modified
      code: 1
    }
  }
}

const allowedOrganizations = () => {
  return ['bspb', 'independent']
}

const excludedSources = () => {
  return ['Project NMNH-BAS & MOEW', 'Research of breeding birds, BSPB-NMNH']
}

const getSensitiveSpecies = async () => {
  return api.models.species.findAll({
    where: {
      sensitive: true,
      type: 'birds'
    }
  } || [])
}

const getEbpSpecies = async () => {
  return api.models.ebp_birds.findAll({
    where: {
      sbNameLa: { [Op.not]: null }
    }
  })
}

const getEbpSpeciesStatus = async () => {
  return api.models.ebp_birds_status.findAll({
    where: {
      sbNameEn: { [Op.not]: null }
    }
  })
}

const loadRecords = async (forms, date) => {
  const records = await Promise.allSettled(forms.map(async form => {
    return form.model.findAll({
      where: {
        etrs89GridCode: { [Op.not]: null },
        observationDateTime: {
          [Op.and]: [
            { [Op.gte]: startOfDay(date) },
            { [Op.lte]: endOfDay(date) }
          ]
        },
        organization: { [Op.in]: allowedOrganizations() },
        sourceEn: { [Op.notIn]: excludedSources() }
      }
    })
  }))

  for (const record of records) {
    if (record.status === 'rejected') {
      throw record.reason
    }
  }

  return records?.map(record => record.value).flat()
}

const prepareEbpData = async (date = new Date()) => {
  const ebpSpecies = await getEbpSpecies()
  const sensitiveSpecies = await getSensitiveSpecies()
  const ebpSpeciesStatus = await getEbpSpeciesStatus()

  console.log('+++++ EBP SPECIES: ', ebpSpecies?.length)
  console.log('+++++ SENSITIVE SPECIES: ', sensitiveSpecies?.length)

  // load all records for the given date
  const records = await loadRecords(availableForms, date)

  console.log('+++++ RECORDS: ', records?.length)
  // filter records by EBP species
  let filtered = records.filter(record => ebpSpecies.find(species => {
    return species.sbNameLa === record.species
  }))
  console.log('+++++ FILTERED BY EBP SPECIES: ', filtered?.length)

  // filter records by sensitive species
  filtered = filtered.filter(record => !sensitiveSpecies.find(species => {
    return species.labelLa === record.species
  }))
  console.log('+++++ FILTERED BY SENSITIVE SPECIES: ', filtered?.length)

  // filter records by EBP species status
  filtered = filtered.filter(record => record.speciesStatusEn === null || ebpSpeciesStatus.find(status => status.sbNameEn === record.speciesStatusEn))
  console.log('+++++ FILTERED BY EBP SPECIES STATUS: ', filtered?.length)

  return filtered
}

module.exports = class UploadToEBP extends Task {
  constructor () {
    super()
    this.name = 'upload-to-ebp'
    this.description = 'Upload records to EBP'
    // use cronjob to schedule the task
    // npm run enqueue upload-to-ebp
    this.frequency = 0
  }

  async run () {
    const recordsDate = new Date('2024-01-13')
    const startTimestamp = new Date().getTime()

    const ebpEvent = {
      data_type: apiParams.dataType.casual.code,
      locationMode: apiParams.locationMode.aggregatedLocation.code,
      date: format(recordsDate, 'yyyy-MM-dd'),
      state: apiParams.eventState.modified.code
    }

    const ebpRecords = []

    const birdsRecords = await prepareEbpData(recordsDate)

    const ebpEvents = birdsRecords.reduce((acc, record) => {
      if (!acc[record.etrs89GridCode]) {
        acc[record.etrs89GridCode] = []
      }
      acc[record.etrs89GridCode].push(record)

      return acc
    }, {})

    const etrs89GridCodeCounts = Object.entries(ebpEvents).reduce((acc, [key, value]) => {
      acc[key] = value.length
      return acc
    }, {})

    const operationTime = new Date().getTime() - startTimestamp

    console.log('+++++ EBP DATA: ', birdsRecords?.length)
    console.log('+++++ EBP RECORDS: ', ebpRecords?.length)
    console.log('+++++ EBP EVENT: ', ebpEvent)
    console.log('+++++ ETRS codes counts: ', etrs89GridCodeCounts)
    console.log('+++++ OPERATION TIME: ', operationTime)
  }
}
