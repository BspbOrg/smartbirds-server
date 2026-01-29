const { Action, api } = require('actionhero')
const { Op } = require('sequelize')

module.exports.accessAuditList = class AccessAuditList extends Action {
  constructor () {
    super()
    this.name = 'accessAudit:list'
    this.description = 'accessAudit:list'
    this.middleware = ['admin']
    this.inputs = {
      limit: { required: false, default: 50 },
      offset: { required: false, default: 0 },
      actorUserId: { required: false },
      ownerUserId: { required: false },
      recordType: { required: false },
      recordId: { required: false },
      userAction: { required: false },
      fromDate: { required: false },
      toDate: { required: false },
      operationId: { required: false },
      sortBy: { required: false, default: 'occurredAt' },
      sortOrder: { required: false, default: 'DESC' }
    }
  }

  async run ({ params, response }) {
    const limit = Math.min(500, params.limit || 50)
    const offset = params.offset || 0
    const sortBy = params.sortBy || 'occurredAt'
    const sortOrder = (params.sortOrder || 'DESC').toUpperCase()

    const query = {
      where: {},
      limit,
      offset,
      order: [[sortBy, sortOrder]]
    }

    // Apply filters
    if (params.actorUserId) {
      query.where.actorUserId = parseInt(params.actorUserId)
    }

    if (params.ownerUserId) {
      query.where.ownerUserId = parseInt(params.ownerUserId)
    }

    if (params.recordType) {
      query.where.recordType = params.recordType
    }

    if (params.recordId) {
      query.where.recordId = parseInt(params.recordId)
    }

    if (params.userAction) {
      query.where.action = params.userAction
    }

    if (params.operationId) {
      query.where.operationId = params.operationId
    }

    // Date range filter
    if (params.fromDate || params.toDate) {
      query.where.occurredAt = {}
      if (params.fromDate) {
        query.where.occurredAt[Op.gte] = new Date(params.fromDate)
      }
      if (params.toDate) {
        query.where.occurredAt[Op.lte] = new Date(params.toDate)
      }
    }

    // Execute query
    const result = await api.models.access_audit.findAndCountAll(query)

    // Format response - convert BIGINT id to number
    response.data = result.rows.map(row => ({
      id: parseInt(row.id),
      recordType: row.recordType,
      recordId: row.recordId,
      actorUserId: row.actorUserId,
      action: row.action,
      occurredAt: row.occurredAt,
      ownerUserId: row.ownerUserId,
      actorRole: row.actorRole,
      actorOrganization: row.actorOrganization,
      meta: row.meta,
      operationId: row.operationId
    }))

    response.count = result.count
  }
}
