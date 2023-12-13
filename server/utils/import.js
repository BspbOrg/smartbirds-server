const _ = require('lodash')
const moment = require('moment/moment')
const { api } = require('actionhero')

const prepareImportData = (data, user, language, organization) => {
  const importSkipFields = [
    'id',
    'pictures',
    'track',
    'moderatorReview',
    'startDate',
    'startTime',
    'endDate',
    'endTime',
    'observationDate',
    'observationTime'
  ]

  const importItem = {
    user,
    language,
    organization
  }

  _.forEach(data, (value, name) => {
    if (value === '') return
    if (importSkipFields.includes(name)) return
    // check if value is object
    if (typeof value === 'object' && value?.label?.en.includes(' | ')) {
      importItem[name] = []
      const labelValues = Object.entries(value.label).map(([key, langValues]) => {
        return { language: key, value: langValues.split(' | ') }
      }).reduce((acc, curr) => {
        acc[curr.language] = curr.value
        return acc
      }, {})
      labelValues.en.forEach((labelValue, index) => {
        importItem[name].push({
          ...value,
          label: Object.keys(labelValues).reduce((acc, curr) => {
            acc[curr] = labelValues[curr][index]
            return acc
          }, {})
        })
      })
    } else {
      importItem[name] = value
    }
  })

  importItem.observationDateTime = data.observationDateTime || moment(data.observationDate + ' ' + data.observationTime, api.config.formats.date + ' ' + api.config.formats.time).tz(api.config.formats.tz).toDate()
  if (data.startDateTime) {
    importItem.startDateTime = data.startDateTime || moment(data.startDate + ' ' + data.startTime, api.config.formats.date + ' ' + api.config.formats.time).tz(api.config.formats.tz).toDate() || importItem.observationDateTime
  } else {
    importItem.startDateTime =
      (data.startDate && data.startTime)
        ? moment(data.startDate + ' ' + data.startTime, api.config.formats.date + ' ' + api.config.formats.time).tz(api.config.formats.tz).toDate()
        : importItem.observationDateTime
  }

  if (data.endDateTime) {
    importItem.endDateTime = data.endDateTime
  } else {
    importItem.endDateTime =
      (data.endDate && data.endTime)
        ? moment(data.endDate + ' ' + data.endTime, api.config.formats.date + ' ' + api.config.formats.time).tz(api.config.formats.tz).toDate()
        : importItem.observationDateTime
  }

  importItem.userId = data.userId || data.user
  importItem.monitoringCode = data.monitoringCode || generateMonitoringCode(importItem)

  return importItem
}

const generateMonitoringCode = (data) => {
  let date = data.observationDateTime || data.startDateTime
  if (date && date.toJSON) { date = date.toJSON() }
  return '!IMPORT-' + date
}

module.exports = {
  prepareImportData
}
