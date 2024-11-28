const { Task, api } = require('actionhero')
const sequelize = require('sequelize')
const { Op } = sequelize

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

const getEbpSpecies = async () => {
  return api.models.ebp_birds.findAll({
    where: {
      sbNameLa: { [Op.not]: null }
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
            { [Op.gte]: '2024-01-13 00:00:00' },
            { [Op.lte]: '2024-01-13 23:59:59' }
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
  console.log('+++++ EBP SPECIES: ', ebpSpecies?.length)
  const records = await loadRecords(availableForms, date)
  return records
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
    const ebpData = await prepareEbpData(new Date())
    console.log('+++++ EBP DATA: ', ebpData?.length)
  }
}
