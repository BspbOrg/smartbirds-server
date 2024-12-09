const { Task, api } = require('actionhero')
const sequelize = require('sequelize')
const { Op } = sequelize
const startOfDay = require('date-fns/startOfDay')
const endOfDay = require('date-fns/endOfDay')
const format = require('date-fns/format')
const fetch = require('node-fetch')

// const availableForms = [api.forms.formCBM, api.forms.formBirds, api.forms.formCiconia]
const availableForms = [api.forms.formBirds]

// eslint-disable-next-line no-unused-vars
const API_TOKEN = process.env.EBP_API_TOKEN
// eslint-disable-next-line no-unused-vars
const apiParams = {
  partnerSource: 'BUL_SBI',
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

const filterRecords = async (records, ebpSpecies, ebpSpeciesStatus) => {
  const sensitiveSpecies = await getSensitiveSpecies()

  // filter records by species, sensitive species and species status
  return records
    .filter(record => ebpSpecies.find(species => {
      return species.sbNameLa === record.species
    }))
    .filter(record => !sensitiveSpecies.find(species => {
      return species.labelLa === record.species
    }))
    .filter(record => record.speciesStatusEn === null || ebpSpeciesStatus.find(status => status.sbNameEn === record.speciesStatusEn))
}

const generateEventId = (etrsCode, date) => {
  return format(date, 'yyyyMMdd') + '_' + etrsCode
}

const prepareEbpData = async (date = new Date()) => {
  const ebpSpecies = await getEbpSpecies()
  const ebpSpeciesStatus = await getEbpSpeciesStatus()

  // load all records for the given date
  const records = await loadRecords(availableForms, date)
  console.log('+++++ RECORDS: ', records?.length)

  // additional filtering
  const filtered = await filterRecords(records, ebpSpecies, ebpSpeciesStatus)

  // common event data
  const ebpEvent = {
    data_type: apiParams.dataType.casual.code,
    location_mode: apiParams.locationMode.aggregatedLocation.code,
    date: format(date, 'yyyy-MM-dd'),
    state: apiParams.eventState.modified.code
  }

  // group records by ETRS89 grid code
  const etrsRecords = filtered.reduce((acc, record) => {
    if (!acc[record.etrs89GridCode]) {
      acc[record.etrs89GridCode] = []
    }
    acc[record.etrs89GridCode].push(record)

    return acc
  }, {})

  // prepare EBP events
  const ebpEvents = Object.entries(etrsRecords).reduce((acc, [etrsCode, records]) => {
    const eventData = {
      event: {
        event_id: generateEventId(etrsCode, date),
        location: etrsCode,
        ...ebpEvent
      },
      records: []
    }

    const observers = []
    const speciesUsersRecords = []

    // group records by species
    const speciesRecords = records.reduce((acc, record) => {
      // count unique species-users records
      const key = `${record.species}_${record.userId}`
      if (!speciesUsersRecords.includes(key)) {
        speciesUsersRecords.push(key)
      }

      // count unique observers
      if (!observers.includes(record.userId)) {
        observers.push(record.userId)
      }

      if (!acc[record.species]) {
        acc[record.species] = {
          species: record.species,
          species_code: ebpSpecies.find(species => species.sbNameLa === record.species)?.ebpId,
          breeding_code: null,
          users: [],
          records: []
        }
      }

      if (!acc[record.species].users.includes(record.userId)) {
        acc[record.species].users.push(record.userId)
      }

      if (record.speciesStatusEn) {
        const breedingCode = ebpSpeciesStatus.find(status => status.sbNameEn === record.speciesStatusEn)?.ebpId
        if (!acc[record.species].breeding_code || acc[record.species].breeding_code < breedingCode) {
          acc[record.species].breeding_code = breedingCode
        }
      }

      acc[record.species].records.push(record)

      return acc
    }, {})

    eventData.records = Object.values(speciesRecords).map(speciesRecord => {
      return {
        event_id: eventData.event.event_id,
        record_id: eventData.event.event_id + '_' + speciesRecord.species_code,
        species_code: speciesRecord.species_code,
        count: speciesRecord.records.reduce((acc, record) => acc + Math.max(record.count, record.countMin, record.countMax), 0),
        records_of_species: speciesRecord.users.length,
        breeding_code: speciesRecord.breeding_code,
        state: apiParams.recordState.modified.code
      }
    })

    eventData.event.records = speciesUsersRecords.length
    eventData.event.observer = observers.length?.toString()

    acc.push(eventData)
    return acc
  }, [])

  return {
    mode: apiParams.provisionMode.test.code,
    partner_source: apiParams.partnerSource,
    start_date: format(date, 'yyyy-MM-dd'),
    end_date: format(date, 'yyyy-MM-dd'),
    events: ebpEvents.map(event => event.event),
    records: ebpEvents.map(event => event.records).flat()
  }
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

  async run ({ date } = {}) {
    console.log('+++++ UPLOAD TO EBP TASK: ', date)
    const recordsDate = new Date(date || '2024-01-15')
    const startTimestamp = new Date().getTime()

    const eventsData = await prepareEbpData(recordsDate)

    const operationTime = new Date().getTime() - startTimestamp

    try {
      const response = await fetch('https://api-v2.eurobirdportal.org/data/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${API_TOKEN}`
        },
        body: JSON.stringify(eventsData)
      })

      console.log('+++++ EBP RESPONSE: ', response.status)
      console.log('+++++ RESPONSE: ', await response.json())
    } catch (error) {
      console.log('+++++ ERROR: ', error)
    }

    console.log('+++++ EBP DATA: ', JSON.stringify(eventsData))
    console.log('+++++ OPERATION TIME: ', operationTime)
  }
}
