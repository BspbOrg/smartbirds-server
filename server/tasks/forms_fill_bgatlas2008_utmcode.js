const { api } = require('actionhero')
const sequelize = require('sequelize')
const { getBoundsOfDistance, isPointInLine, isPointInPolygon } = require('geolib')
const FormsTask = require('../classes/FormsTask')

const { Op } = sequelize

async function getUtmCode ({ latitude, longitude }) {
  if (latitude == null || longitude == null) {
    return ''
  }

  const point = { latitude, longitude }

  // add 75% over for rounding errors
  const bounds = getBoundsOfDistance(point, api.config.app.bgatlas2008.gridSize * 1.75)
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

  const cells = await api.models.bgatlas2008_cells.findAll({
    where,
    // doesn't matter the order, but makes sense to have always the same
    // as overlapping cells (e.g. vertices, edges) otherwise will be
    // assigned randomly
    order: ['utm_code']
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
  }, null)

  if (!cell) {
    return ''
  }

  return cell.utm_code
}

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

  filterRecords () {
    return {
      bgatlas2008UtmCode: null,
      observationDateTime: { [Op.gte]: api.config.app.bgatlas2008.startTimestamp }
    }
  }

  async processRecord (record, form) {
    const utmCode = await getUtmCode(record)
    record.bgatlas2008UtmCode = utmCode

    if (!await api.forms.trySave(record, api.forms[form]) && record.bgatlas2008UtmCode !== '') {
      // mark as empty string so we don't repeat it
      record.bgatlas2008UtmCode = ''
      await api.forms.trySave(record, api.forms[form])
    }
  }
}
