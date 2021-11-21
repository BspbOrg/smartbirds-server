const { Action, api } = require('actionhero')
const { Op } = require('sequelize')

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
      api.models.bgatlas2008_observed_user_species.findAll({
        where: {
          utm_code: utmCode,
          user_id: userId
        }
      }),
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
      .map(({ userInfo: user, spec_known: known, spec_unknown: unknown }) => ({
        user,
        species: known + unknown
      }))
      .filter(({ species }) => species > 0)
      .map(({ user, species }) => ({
        user: user.apiData(api, 'public'),
        species
      }))
  }
}

class ModeratorCellMethodologyStats extends Action {
  constructor () {
    super()
    this.name = 'bgatlas2008_mod_cell_methodology_stats'
    this.description = this.name
    this.middleware = ['auth']
    this.inputs = {
      utm_code: { required: true }
    }
  }

  async run ({ connection, params: { utm_code: utmCode }, response, session: { user } }) {
    if (!api.forms.userCanManage(user, 'formBirds')) {
      connection.rawConnection.responseHttpCode = 403
      throw new Error('Moderator required')
    }
    const cell = await api.models.bgatlas2008_cells.findByPk(utmCode)
    if (!cell) {
      connection.rawConnection.responseHttpCode = 404
      throw new Error('No such utm code')
    }

    const methodologyStats = await api.models.bgatlas2008_stats_methodology.findAll({
      where: { utm_code: utmCode }
    })

    response.count = methodologyStats.length
    response.data = methodologyStats.map((record) => record.apiData())
  }
}

class ModeratorCellUserStats extends Action {
  constructor () {
    super()
    this.name = 'bgatlas2008_mod_cell_user_stats'
    this.description = this.name
    this.middleware = ['auth']
    this.inputs = {
      utm_code: { required: true }
    }
  }

  async run ({ connection, params: { utm_code: utmCode }, response, session: { user } }) {
    if (!api.forms.userCanManage(user, 'formBirds')) {
      connection.rawConnection.responseHttpCode = 403
      throw new Error('Moderator required')
    }
    const cell = await api.models.bgatlas2008_cells.findByPk(utmCode)
    if (!cell) {
      connection.rawConnection.responseHttpCode = 404
      throw new Error('No such utm code')
    }

    const stats = await api.models.bgatlas2008_stats_user.findAll({
      where: {
        records_count: { [Op.gt]: 0 },
        utm_code: utmCode
      },
      include: [api.models.bgatlas2008_stats_user.associations.userInfo],
      order: [['records_count', 'DESC']]
    })

    response.count = stats.length
    response.data = stats.map((record) => record.apiData('moderator'))
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

class StatsUserRank extends Action {
  constructor () {
    super()
    this.name = 'bgatlas2008_user_rank_stats'
    this.description = this.name
    this.middleware = ['auth']
    this.inputs = {}
  }

  async run ({ session: { userId }, response }) {
    const query = {
      where: {
        [Op.or]: [
          { position: { [Op.lte]: 10 } },
          { user_id: userId }
        ]
      },
      include: [
        api.models.bgatlas2008_stats_user_rank.associations.user
      ],
      order: ['position']
    }

    const rows = await api.models.bgatlas2008_stats_user_rank.findAll(query)
    response.data = rows.map(row => row.apiData('public'))
    response.count = await api.models.bgatlas2008_stats_user_rank.count()
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

class GetCellStatus extends Action {
  constructor () {
    super()
    this.name = 'bgatlas2008_update_cell_status'
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

    const [status] = await api.models.bgatlas2008_cell_status.findOrCreate({ where: { utm_code: cell.utm_code } })

    response.data = status.apiData()
  }
}

class SetCellStatus extends Action {
  constructor () {
    super()
    this.name = 'bgatlas2008_update_cell_status'
    this.description = this.name
    this.middleware = ['auth']
    this.inputs = {
      utm_code: { required: true },
      completed: {}
    }
  }

  async run ({ connection, params: { utm_code: utmCode, ...props }, response, session: { user } }) {
    if (!api.forms.userCanManage(user, 'formBirds')) {
      connection.rawConnection.responseHttpCode = 403
      throw new Error('Moderator required')
    }
    const cell = await api.models.bgatlas2008_cells.findByPk(utmCode)
    if (!cell) {
      connection.rawConnection.responseHttpCode = 404
      throw new Error('No such utm code')
    }

    const [status] = await api.models.bgatlas2008_cell_status.findOrCreate({ where: { utm_code: cell.utm_code } })

    if ('completed' in props) {
      if (!props.completed) {
        if (!['admin', 'org-admin'].includes(user.role)) {
          connection.rawConnection.responseHttpCode = 403
          throw new Error('Not allowed')
        }
      }

      status.completed = Boolean(props.completed)
    }

    await status.save()

    response.data = status.apiData()
  }
}

module.exports = {
  CellInfo,
  CellStats,
  GetUserSelection,
  ListCells,
  ModeratorCellMethodologyStats,
  ModeratorCellUserStats,
  StatsUserRank,
  GetCellStatus,
  SetCellStatus,
  SetUserSelection
}
