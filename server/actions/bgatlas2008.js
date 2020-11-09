const { Action, api } = require('actionhero')

class CellInfo extends Action {
  constructor () {
    super()
    this.name = 'bgatlas2008_cell_info'
    this.description = this.name
    this.middleware = ['auth']
    this.inputs = {
      utm_code: { required: true }
    }
  }

  async run ({ connection, params: { utm_code: utmCode }, session: { userId }, response }) {
    const cell = await api.models.bgatlas2008_cells.findByPk(utmCode)
    if (!cell) {
      connection.rawConnection.responseHttpCode = 404
      throw new Error('No such utm code')
    }

    const [knownSpecies, observedSpecies, otherSpecies] = await Promise.all([
      api.models.bgatlas2008_species.findAll({ where: { utm_code: utmCode } }),
      api.models.bgatlas2008_observed_user_species.findAll({ where: { utm_code: utmCode, user_id: userId } }),
      api.models.bgatlas2008_observed_species.findAll({ where: { utm_code: utmCode } })
    ])

    // merge the lists
    const speciesMap = {}
    const setFlag = (species, flag) => {
      if (!(species in speciesMap)) {
        speciesMap[species] = { species, known: false, observed: false, other: false }
      }
      speciesMap[species][flag] = true
    }
    knownSpecies.forEach(({ species }) => setFlag(species, 'known'))
    observedSpecies.forEach(({ species }) => setFlag(species, 'observed'))
    otherSpecies.forEach(({ species }) => setFlag(species, 'other'))

    response.data = Object.values(speciesMap)
  }
}

class CellStats extends Action {
  constructor () {
    super()
    this.name = 'bgatlas2008_cell_stats'
    this.description = this.name
    this.middleware = ['auth']
    this.inputs = {
      utm_code: { required: true }
    }
  }

  async run ({ connection, params: { utm_code: utmCode }, response }) {
    const cell = await api.models.bgatlas2008_cells.findByPk(utmCode)
    if (!cell) {
      connection.rawConnection.responseHttpCode = 404
      throw new Error('No such utm code')
    }

    const [globalStat, userStats] = await Promise.all([
      await api.models.bgatlas2008_stats_global.findOne({
        where: { utm_code: utmCode }
      }),
      await api.models.bgatlas2008_stats_user.findAll({
        where: {
          utm_code: utmCode,
          '$userInfo.privacy$': 'public'
        },
        include: [api.models.bgatlas2008_stats_user.associations.userInfo],
        order: api.sequelize.sequelize.literal('spec_known + spec_unknown desc'),
        limit: 3
      })
    ])

    response.count = globalStat.spec_old + globalStat.spec_unknown
    response.data = userStats
      .map(({ userInfo: user, spec_known: known, spec_unknown: unknown }) => ({ user, species: known + unknown }))
      .filter(({ species }) => species > 0)
      .map(({ user, species }) => ({
        user: user.apiData(api, 'public'),
        species
      }))
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
    response.data = rows.map((row) => row.apiData('private'))
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

module.exports = {
  CellInfo,
  CellStats,
  GetUserSelection,
  ListCells,
  SetUserSelection
}
