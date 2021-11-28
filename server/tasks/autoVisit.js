const { api } = require('actionhero')
const FormsTask = require('../classes/FormsTask')
const moment = require('moment')

module.exports = class AutoVisit extends FormsTask {
  constructor () {
    super()
    this.name = 'autoVisit'
    this.description = 'Populate visit number based on observation date time'
    // use cronjob to schedule the task
    // npm run enqueue autoVisit
    this.frequency = 0
    this.defaultLimit = api.config.app.visit.maxRecords
  }

  getForms () {
    return [api.forms.formCBM]
  }

  filterRecords ({ force }) {
    return force ? {} : { auto_visit: null }
  }

  async processRecord (record, form) {
    const year = new Date(record.observationDateTime).getFullYear()
    const visit = await api.models.visit.findOne({ where: { year } })
    const format = (date) => moment.tz(date, api.config.formats.tz).format('YYYYMMDD')

    const observation = format(record.observationDateTime)
    if (!visit) {
      record.auto_visit = -1
    } else if (format(visit.earlyStart) <= observation && observation <= format(visit.earlyEnd)) {
      record.auto_visit = 1
    } else if (format(visit.lateStart) <= observation && observation <= format(visit.lateEnd)) {
      record.auto_visit = 2
    } else {
      record.auto_visit = 0
    }

    await api.forms.trySave(record, api.forms[form])
  }
}
