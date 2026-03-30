const { Action, api } = require('actionhero')
const auditHelpers = require('../helpers/auditHelpers')

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
