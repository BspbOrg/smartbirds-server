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

class SetUserSelection extends Action {
  constructor () {
    super()
    this.name = 'bgatlas2008_set_user_selection'
    this.description = this.name
    this.middleware = ['auth']
    this.inputs = {
      cells: {
        required: true,
        validator: (param) => {
          if (!Array.isArray(param)) return 'cells must be an array'
          if (!param.every((cell) => {
            return typeof cell === 'string'
          })) {
            return `cells must be strings. got ${JSON.stringify(param)}`
          }
        }
      }
    }
  }

  async run ({ params: { cells }, session: { userId }, response }) {
    const existsCount = await api.models.bgatlas2008_cells.count({ where: { utm_code: cells } })
    if (existsCount !== cells.length) {
      throw new Error('Invalid cells provided!')
    }
    const user = await api.models.user.findByPk(userId, { attributes: ['id'] })
    await user.setBgatlas2008Cells(cells, { validate: true })
    const res = await user.getBgatlas2008Cells()
    response.data = res.map(({ utm_code: utmCode }) => utmCode)
  }
}

class GetUserSelection extends Action {
  constructor () {
    super()
    this.name = 'bgatlas2008_get_user_selection'
    this.description = this.name
    this.middleware = ['auth']
  }

  async run ({ session: { userId }, response }) {
    const user = await api.models.user.findByPk(userId, {
      attributes: [],
      include: [api.models.user.associations.bgatlas2008Cells]
    })
    response.data = user.bgatlas2008Cells.map((cell) => cell.utm_code)
  }
}

module.exports = {
  ListCells,
  GetUserSelection,
  SetUserSelection
}
