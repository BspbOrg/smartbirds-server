const { Action, api } = require('actionhero')
const { Op } = require('sequelize')

module.exports.requestIpLogList = class RequestIpLogList extends Action {
  constructor () {
    super()
    this.name = 'requestIpLog:list'
    this.description = 'List IP logs (admin only)'
    this.middleware = ['admin']
    this.inputs = {
      userId: { required: false },
      ipAddress: { required: false },
      fromDate: { required: false },
      toDate: { required: false },
      limit: { required: false, default: 100 },
      offset: { required: false, default: 0 }
    }
  }

  async run ({ params, response }) {
    const limit = Math.min(500, params.limit || 100)
    const offset = params.offset || 0

    const where = {}

    if (params.userId) {
      where.userId = parseInt(params.userId)
    }

    if (params.ipAddress) {
      where.ipAddress = params.ipAddress
    }

    if (params.fromDate || params.toDate) {
      where.occurredAt = {}
      if (params.fromDate) {
        where.occurredAt[Op.gte] = new Date(params.fromDate)
      }
      if (params.toDate) {
        where.occurredAt[Op.lte] = new Date(params.toDate)
      }
    }

    const result = await api.models.request_ip_log.findAndCountAll({
      where,
      limit,
      offset,
      order: [['occurredAt', 'DESC']]
    })

    response.data = result.rows.map(row => ({
      id: row.id.toString(), // BIGINT to string
      userId: row.userId,
      ipAddress: row.ipAddress,
      endpoint: row.endpoint,
      httpMethod: row.httpMethod,
      occurredAt: row.occurredAt,
      userAgent: row.userAgent,
      sessionFingerprint: row.sessionFingerprint
    }))

    response.count = result.count
  }
}
