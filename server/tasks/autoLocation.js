const { api } = require('actionhero')
const sequelize = require('sequelize')
const { getBoundsOfDistance, getDistance } = require('geolib')
const FormsTask = require('../classes/FormsTask')

const { Op } = sequelize

async function getSettlement ({ latitude, longitude }) {
  if (latitude == null || longitude == null) {
    return
  }

  const bounds = getBoundsOfDistance({ latitude, longitude }, api.config.app.location.maxDistance)

  const settlement = await api.models.settlement.findOne({
    where: {
      latitude: { [Op.between]: [bounds[0].latitude, bounds[1].latitude] },
      longitude: bounds[0].longitude <= bounds[1].longitude
        ? { [Op.between]: [bounds[0].longitude, bounds[1].longitude] }
        : {
          [Op.or]: [
            { [Op.gte]: bounds[0].longitude },
            { [Op.lte]: bounds[1].longitude }
          ]
        }
    },
    order: sequelize.literal(`
          (latitude-(${api.sequelize.sequelize.escape(latitude)}))*(latitude-(${api.sequelize.sequelize.escape(latitude)}))
           +
          (longitude-(${api.sequelize.sequelize.escape(longitude)}))*(longitude-(${api.sequelize.sequelize.escape(longitude)}))
          `)
  })
  if (!settlement) {
    return
  }
  const dist = getDistance(settlement, { latitude, longitude })
  if (dist > api.config.app.location.maxDistance) {
    return
  }

  return settlement
}

module.exports = class AutoLocation extends FormsTask {
  constructor () {
    super()
    this.name = 'autoLocation'
    this.description = 'Populate location based on coordinates'
    // use cronjob to schedule the task
    // npm run enqueue autoLocation
    this.frequency = 0
    this.defaultLimit = api.config.app.location.maxRecords
  }

  filterRecords () {
    return { autoLocationEn: null }
  }

  async processRecord (record, form) {
    const settlement = await getSettlement(record)
    if (settlement) {
      // en is not required, so it may be null, default to empty string to prevent duplicate processing
      record.autoLocationEn = settlement.nameEn || ''
      record.autoLocationLocal = settlement.nameLocal
      record.autoLocationLang = settlement.nameLang
    } else {
      record.autoLocationEn = ''
    }

    if (!await api.forms.trySave(record, api.forms[form]) && record.autoLocationEn !== '') {
      // mark as empty string so we don't repeat it
      record.autoLocationEn = ''
      await api.forms.trySave(record, api.forms[form])
    }
  }
}
