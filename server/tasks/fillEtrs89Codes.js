const { api } = require('actionhero')
const sequelize = require('sequelize')
const { getBoundsOfDistance, isPointInLine, isPointInPolygon } = require('geolib')
const FormsTask = require('../classes/FormsTask')

const { Op } = sequelize

async function getEtrs89GridCode ({ latitude, longitude }) {
  if (latitude == null || longitude == null) {
    return ''
  }

  const point = { latitude, longitude }

  // add 75% over for rounding errors
  const bounds = getBoundsOfDistance(point, api.config.app.etrs89.gridSize * 1.75)
  const where = {}
  for (let i = 1; i <= 4; i++) {
    where[`lat${i}`] = { [Op.between]: [bounds[0].latitude, bounds[1].latitude] }
    where[`lon${i}`] = bounds[0].longitude <= bounds[1].longitude
      ? { [Op.between]: [bounds[0].longitude, bounds[1].longitude] }
      : {
          [Op.or]: [
            { [Op.gte]: bounds[0].longitude },
            { [Op.lte]: bounds[1].longitude }
          ]
        }
  }

  const cells = await api.models.etrs89_cell.findAll({
    where,
    // doesn't matter the order, but makes sense to have always the same
    // as overlapping cells (e.g. vertices, edges) otherwise will be
    // assigned randomly
    order: ['code']
  })

  const cell = cells.reduce((found, cell) => {
    if (found) return found

    const coords = cell.coordinates()

    // check for point inside
    if (isPointInPolygon(point, coords)) {
      return cell
    }
    // check for point on the vertices
    for (let i = 0; i < coords.length; i++) {
      if (isPointInLine(point, coords[i], coords[(i + 1) % coords.length])) {
        return cell
      }
    }

    return found
  }, null)

  if (!cell) {
    return ''
  }

  return cell.code
}

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
    record.etrs89GridCode = await getEtrs89GridCode(record)

    if (!await api.forms.trySave(record, api.forms[form]) && record.etrs89GridCode !== '') {
      // mark as empty string so we don't repeat it
      record.etrs89GridCode = ''
      await api.forms.trySave(record, api.forms[form])
    }
  }
}
