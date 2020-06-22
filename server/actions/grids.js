const { Action, api } = require('actionhero')
const { Op } = require('sequelize')
const paging = require('../helpers/paging')
const inputs = require('../helpers/inputs')

class ListGridCells extends Action {
  constructor () {
    super()
    this.name = 'grids:cells:list'
    this.description = this.name
    this.inputs = {
      gridId: { required: true },
      fromLat: { format: inputs.formatter.float },
      fromLon: { format: inputs.formatter.float },
      toLat: { format: inputs.formatter.float },
      toLon: { format: inputs.formatter.float }
    }

    paging.declareInputs(this.inputs)
  }

  async run (
    {
      params: {
        gridId,
        offset,
        limit,
        fromLat,
        toLat,
        fromLon,
        toLon
      },
      response
    }
  ) {
    const query = {
      where: {
        gridId
      }
    }

    if (fromLat != null && toLat != null && fromLon != null && toLon != null) {
      const latRange = [Math.min(fromLat, toLat), Math.max(fromLat, toLat)]
      const lonRange = [Math.min(fromLon, toLon), Math.max(fromLon, toLon)]
      query.where[Op.or] = [
        {
          [Op.and]: {
            lat1: { [Op.between]: latRange },
            lon1: { [Op.between]: lonRange }
          }
        },
        {
          [Op.and]: {
            lat2: { [Op.between]: latRange },
            lon2: { [Op.between]: lonRange }
          }
        },
        {
          [Op.and]: {
            lat3: { [Op.between]: latRange },
            lon3: { [Op.between]: lonRange }
          }
        },
        {
          [Op.and]: {
            lat4: { [Op.between]: latRange },
            lon4: { [Op.between]: lonRange }
          }
        }
      ]
    }

    paging.prepareQuery(query, { offset, limit })

    const { count, rows } = await api.models.grid_cell.findAndCountAll(query)

    response.count = count
    response.data = rows.map((row) => row.apiData())
  }
}

module.exports = {
  ListGridCells
}
