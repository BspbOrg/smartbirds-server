const { api } = require('actionhero')
const sequelize = require('sequelize')
const FormsTask = require('../classes/FormsTask')
const findCellByCoordinates = require('../helpers/findCellByCoordinates')

const { Op } = sequelize

module.exports = class FillEtrs89Codes extends FormsTask {
  constructor () {
    super()
    this.name = 'fill-etrs89-codes'
    this.description = 'Populate ETRS89-LAEA code based on coordinates'
    // use cronjob to schedule the task
    // npm run enqueue fill-etrs89-codes
    this.frequency = 0
    this.defaultLimit = api.config.app.etrs89.maxRecords
  }

  getForms () {
    return super.getForms().filter((form) => form.hasEtrs89GridCode)
  }

  filterRecords ({ force }) {
    return {
      ...(force ? {} : { etrs89GridCode: null }),
      observationDateTime: { [Op.gte]: api.config.app.etrs89.startTimestamp }
    }
  }

  async processRecord (record, form) {
    record.etrs89GridCode = await findCellByCoordinates({
      latitude: record.latitude,
      longitude: record.longitude,
      model: api.models.etrs89_cell,
      gridSize: api.config.app.etrs89.gridSize,
      codeField: 'code'
    })

    if (!await api.forms.trySave(record, api.forms[form]) && record.etrs89GridCode !== '') {
      // mark as empty string so we don't repeat it
      record.etrs89GridCode = ''
      await api.forms.trySave(record, api.forms[form])
    }
  }
}
