const { api } = require('actionhero')
const { Op } = require('sequelize')
const FormsTask = require('../classes/FormsTask')

module.exports = class BirdsNewSpeciesBgatlasModerator extends FormsTask {
  constructor () {
    super()
    this.name = 'birdsNewSpeciesModeratorReview'
    this.description = 'Check for new species and request moderator'
    // use cronjob to schedule the task
    // npm run enqueue autoVisit
    this.frequency = 0
    this.defaultLimit = api.config.app.visit.maxRecords
  }

  getForms () {
    return [api.forms.formCBM, api.forms.formBirds]
  }

  filterRecords ({ force }) {
    if (force) return {}
    return {
      bgatlas2008UtmCode: {
        [Op.ne]: ''
      },
      newSpeciesModeratorReview: null
    }
  }

  async processRecord (record, form) {
    record.newSpeciesModeratorReview = false
    try {
      const existsInAtlas = await api.models.bgatlas2008_species.count({
        where: {
          utm_code: record.bgatlas2008UtmCode,
          species: record.species
        }
      })
      if (existsInAtlas) return

      const alreadyObserved = await api.models.birds_observations.count({
        where: {
          id: { [Op.ne]: record.id },
          bgatlas2008_utm_code: record.bgatlas2008UtmCode,
          species: record.species,
          // only records that are older than trustOldRecords hours
          observation_date_time: { [Op.lt]: Date.now() - api.config.app.moderator.trustOldRecords * 60 * 60 * 1000 },
          moderatorReview: false,
          newSpeciesModeratorReview: false
        }
      })
      if (alreadyObserved) return

      record.newSpeciesModeratorReview = true
    } finally {
      await api.forms.trySave(record, api.forms[form])
    }
  }
}
