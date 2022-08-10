const { api } = require('actionhero')
const { getDistance } = require('geolib')
const FormsTask = require('../classes/FormsTask')

module.exports = class BirdsMigrationsDistanceFromMigrationPoint extends FormsTask {
  constructor () {
    super()
    this.name = 'birdsMigrationsDistanceFromMigrationPoint'
    this.description = this.name
    // use cronjob to schedule the task
    // npm run enqueue birdsMigrationsDistanceFromMigrationPoint
    this.frequency = 0
  }

  getForms () {
    return [api.forms.formBirdsMigrations]
  }

  filterRecords ({ force }) {
    // force all
    if (force === true) return {}
    // specific migration point
    if (typeof force === 'string') {
      return {
        migrationPointEn: force
      }
    }
    // default to unprocessed
    return { distanceFromMigrationPoint: null }
  }

  async processRecord (record, form) {
    const poi = await api.models.poi.findOne({ where: { labelEn: record.migrationPointEn } })
    if (!poi) {
      record.distanceFromMigrationPoint = -1
    } else {
      const dist = getDistance({
        latitude: poi.latitude,
        longitude: poi.longitude
      }, {
        latitude: record.latitude,
        longitude: record.longitude
      })
      if (Number.isNaN(dist) || dist == null) {
        record.distanceFromMigrationPoint = -1
      } else {
        record.distanceFromMigrationPoint = dist
      }
    }

    await api.forms.trySave(record, api.forms[form])
  }
}
