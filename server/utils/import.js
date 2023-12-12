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

  importItem.startDateTime = data.startDateTime || moment(data.startDate + ' ' + data.startTime, api.config.formats.date + ' ' + api.config.formats.time).tz(api.config.formats.tz).toDate()
  importItem.endDateTime = data.endDateTime || moment(data.endDate + ' ' + data.endTime, api.config.formats.date + ' ' + api.config.formats.time).tz(api.config.formats.tz).toDate()
  importItem.observationDateTime = data.observationDateTime || moment(data.observationDate + ' ' + data.observationTime, api.config.formats.date + ' ' + api.config.formats.time).tz(api.config.formats.tz).toDate()
  importItem.userId = data.userId || data.user

  return importItem
}

module.exports = {
  prepareImportData
}
