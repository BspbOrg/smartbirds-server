const { Action, api } = require('actionhero')
const auditHelpers = require('../helpers/auditHelpers')

module.exports.accessAuditSummary = class AccessAuditSummary extends Action {
  constructor () {
    super()
    this.name = 'accessAudit:summary'
    this.description = 'Daily summary of access audit by user. Admin only. Returns per-user counts of each action type (VIEW, EDIT, DELETE, LIST, EXPORT) for a given date.'
    this.middleware = ['admin']
    this.inputs = {
      date: { required: true },
      actorUserId: { required: false }
    }
  }

  async run ({ params, response }) {
    // Validate date
    const date = auditHelpers.validateDate(params.date, 'date')
    if (!date) throw new Error('date is required')

    const dayStart = new Date(date)
    dayStart.setUTCHours(0, 0, 0, 0)
    const dayEnd = new Date(dayStart)
    dayEnd.setUTCDate(dayEnd.getUTCDate() + 1)

    // Validate optional actorUserId filter
    const actorUserId = auditHelpers.validateInteger(params.actorUserId, 'actorUserId')

    const bindParams = { dayStart, dayEnd }
    const actorFilter = actorUserId
      ? 'AND "actorUserId" = :actorUserId'
      : ''
    if (actorUserId) bindParams.actorUserId = actorUserId

    const sql = `
      SELECT
        "actorUserId",
        "actorRole",
        "actorOrganization",
        COUNT(*) FILTER (WHERE action = 'VIEW')   AS "viewCount",
        COUNT(*) FILTER (WHERE action = 'EDIT')   AS "editCount",
        COUNT(*) FILTER (WHERE action = 'DELETE') AS "deleteCount",
        COUNT(*) FILTER (WHERE action = 'LIST')   AS "listCount",
        COUNT(*) FILTER (WHERE action = 'EXPORT') AS "exportCount",
        COUNT(*) AS "totalCount"
      FROM access_audit
      WHERE "occurredAt" >= :dayStart
        AND "occurredAt" <  :dayEnd
        ${actorFilter}
      GROUP BY "actorUserId", "actorRole", "actorOrganization"
      ORDER BY "totalCount" DESC
    `

    const rows = await api.sequelize.sequelize.query(sql, {
      replacements: bindParams,
      type: api.sequelize.sequelize.QueryTypes.SELECT
    })

    response.date = params.date
    response.data = rows.map(row => ({
      actorUserId: row.actorUserId,
      actorRole: row.actorRole,
      actorOrganization: row.actorOrganization,
      viewCount: parseInt(row.viewCount),
      editCount: parseInt(row.editCount),
      deleteCount: parseInt(row.deleteCount),
      listCount: parseInt(row.listCount),
      exportCount: parseInt(row.exportCount),
      totalCount: parseInt(row.totalCount)
    }))
  }
}

module.exports.accessAuditList = class AccessAuditList extends Action {
  constructor () {
    super()
    this.name = 'accessAudit:list'
    this.description = 'List access audit logs. Admin only. Returns records of user access to forms (VIEW, EDIT, DELETE, LIST, EXPORT). Supports filtering by user, record, action, and date range. Max 500 records per request.'
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
    // Step 1: Validate pagination
    const pagination = auditHelpers.validatePagination(params.limit, params.offset, 500)

    // Step 2: Validate sorting
    const validSortFields = [
      'id', 'occurredAt', 'actorUserId', 'ownerUserId',
      'recordType', 'recordId', 'action', 'operationId'
    ]
    const sort = auditHelpers.validateSort(params.sortBy, params.sortOrder, validSortFields)

    const query = {
      where: {},
      limit: pagination.limit,
      offset: pagination.offset,
      order: [[sort.sortBy, sort.sortOrder]]
    }

    // Step 3: Validate integer filters
    const actorUserId = auditHelpers.validateInteger(params.actorUserId, 'actorUserId')
    if (actorUserId) query.where.actorUserId = actorUserId

    const ownerUserId = auditHelpers.validateInteger(params.ownerUserId, 'ownerUserId')
    if (ownerUserId) query.where.ownerUserId = ownerUserId

    const recordId = auditHelpers.validateInteger(params.recordId, 'recordId')
    if (recordId) query.where.recordId = recordId

    // Step 4: Validate recordType against registered forms
    if (params.recordType) {
      const validRecordTypes = Object.keys(api.models).filter(model => model.startsWith('form'))
      if (!validRecordTypes.includes(params.recordType)) {
        throw new Error(`Invalid recordType. Must be a registered form type (e.g., ${validRecordTypes.slice(0, 3).join(', ')})`)
      }
      query.where.recordType = params.recordType
    }

    // Step 5: Validate userAction with whitelist
    const validActions = ['VIEW', 'EDIT', 'DELETE', 'LIST', 'EXPORT']
    const userAction = auditHelpers.validateEnum(params.userAction, validActions, 'userAction')
    if (userAction) query.where.action = userAction

    // Step 6: Validate operationId (UUID v7) - SQL INJECTION PROTECTION
    const operationId = auditHelpers.validateUUID(params.operationId, 'operationId')
    if (operationId) query.where.operationId = operationId

    // Step 7: Validate date range
    const dateFilter = auditHelpers.buildDateRangeFilter(params.fromDate, params.toDate)
    if (dateFilter) query.where.occurredAt = dateFilter

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
      operationId: row.operationId,
      species: row.species
    }))

    response.count = result.count
  }
}
