const sequelize = require('sequelize')
const { getBoundsOfDistance, isPointInLine, isPointInPolygon } = require('geolib')

const { Op } = sequelize

/**
 * Find the grid cell that contains the given point.
 *
 * Matching runs in two passes:
 * 1. isPointInPolygon across all candidates — returns the first match.
 * 2. isPointInLine fallback — only reached when no polygon contains the point
 *    (point is exactly on a shared edge).  Cells are iterated in alphabetical
 *    order for a consistent result on shared edges.
 *
 * @param {object} params
 * @param {number} params.latitude
 * @param {number} params.longitude
 * @param {object} params.model   - Sequelize model; instances must expose coordinates()
 * @param {number} params.gridSize - nominal cell size in metres
 * @param {string} params.codeField - name of the primary-key / code field on the model
 * @returns {Promise<string>} cell code, or '' if no cell found
 */
async function findCellByCoordinates ({ latitude, longitude, model, gridSize, codeField }) {
  if (latitude == null || longitude == null) return ''

  const point = { latitude, longitude }

  // Pre-filter to nearby cells to avoid a full table scan. The radius must cover the full
  // cell diagonal (√2 × gridSize ≈ 1.414×) so all 4 corners of the containing cell are
  // within the bounding box regardless of where the point falls inside it.
  const bounds = getBoundsOfDistance(point, gridSize * 1.75)
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

  const cells = await model.findAll({
    where,
    // deterministic order so shared-edge tie-breaking is consistent
    order: [codeField]
  })

  const polygonMatch = cells.find((cell) => isPointInPolygon(point, cell.coordinates()))
  if (polygonMatch) return polygonMatch[codeField]

  for (const cell of cells) {
    const coords = cell.coordinates()
    for (let i = 0; i < coords.length; i++) {
      if (isPointInLine(point, coords[i], coords[(i + 1) % coords.length])) {
        return cell[codeField]
      }
    }
  }

  return ''
}

module.exports = findCellByCoordinates
