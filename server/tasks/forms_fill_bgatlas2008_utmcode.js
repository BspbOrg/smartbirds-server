const { api } = require('actionhero')
const sequelize = require('sequelize')
const FormsTask = require('../classes/FormsTask')
const findCellByCoordinates = require('../helpers/findCellByCoordinates')

const { Op } = sequelize

module.exports = class FormsFillBgAtlas2008UtmCode extends FormsTask {
  constructor () {
    super()
    this.name = 'forms_fill_bgatlas2008_utmcode'
    this.description = 'Populate bg atlas 2008 utm code based on coordinates'
    // use cronjob to schedule the task
    // npm run enqueue forms_fill_bgatlas2008_utmcode
    this.frequency = 0
    this.defaultLimit = api.config.app.bgatlas2008.maxRecords
  }

  getForms () {
    return super.getForms().filter((form) => form.hasBgAtlas2008)
  }

  filterRecords ({ force }) {
    return {
      ...(force ? {} : { bgatlas2008UtmCode: null }),
      observationDateTime: { [Op.gte]: api.config.app.bgatlas2008.startTimestamp }
    }
  }

  async processRecord (record, form) {
    record.bgatlas2008UtmCode = await findCellByCoordinates({
      latitude: record.latitude,
      longitude: record.longitude,
      model: api.models.bgatlas2008_cells,
      gridSize: api.config.app.bgatlas2008.gridSize,
      codeField: 'utm_code'
    })

    if (!await api.forms.trySave(record, api.forms[form]) && record.bgatlas2008UtmCode !== '') {
      // mark as empty string so we don't repeat it
      record.bgatlas2008UtmCode = ''
      await api.forms.trySave(record, api.forms[form])
    }
  }
}
