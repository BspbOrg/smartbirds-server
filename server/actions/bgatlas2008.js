const { Action, api } = require('actionhero')

class ListCells extends Action {
  constructor () {
    super()
    this.name = 'bgatlas2008_cells_list'
    this.description = this.name
    this.middleware = ['auth']
  }

  async run ({ response }) {
    const query = {
      include: [
        api.models.bgatlas2008_stats_global.associations.utmCoordinates
      ]
    }

    const { count, rows } = await api.models.bgatlas2008_stats_global.findAndCountAll(query)

    response.count = count
    response.data = rows.map((row) => row.apiData())
  }
}

module.exports = {
  ListCells
}
