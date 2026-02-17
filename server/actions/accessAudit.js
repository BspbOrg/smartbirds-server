const { Action, api } = require('actionhero')
const { Op } = require('sequelize')

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
    // Step 1: Validate and sanitize pagination
    const limit = Math.min(500, Math.max(1, parseInt(params.limit, 10) || 50))
    const offset = Math.max(0, parseInt(params.offset, 10) || 0)

    // Step 2: Validate sorting
    const validSortFields = [
      'id', 'occurredAt', 'actorUserId', 'ownerUserId',
      'recordType', 'recordId', 'action', 'operationId'
    ]
    const sortBy = validSortFields.includes(params.sortBy)
      ? params.sortBy
      : 'occurredAt'
    const sortOrder = (params.sortOrder === 'ASC' ? 'ASC' : 'DESC')

    const query = {
      where: {},
      limit,
      offset,
      order: [[sortBy, sortOrder]]
    }

    // Step 3: Validate integer parameters with helper function
    const validateInteger = (value, fieldName) => {
      if (value === undefined || value === null || value === '') {
        return null
      }
      const parsed = parseInt(value, 10)
      if (isNaN(parsed) || parsed < 1) {
        throw new Error(`${fieldName} must be a valid positive integer`)
      }
      return parsed
    }

    // Apply integer filters
    const actorUserId = validateInteger(params.actorUserId, 'actorUserId')
    if (actorUserId) query.where.actorUserId = actorUserId

    const ownerUserId = validateInteger(params.ownerUserId, 'ownerUserId')
    if (ownerUserId) query.where.ownerUserId = ownerUserId

    const recordId = validateInteger(params.recordId, 'recordId')
    if (recordId) query.where.recordId = recordId

    // Step 4: Validate recordType against registered forms
    if (params.recordType) {
      // Get valid form types from registered forms
      const validRecordTypes = Object.keys(api.models).filter(model => model.startsWith('form'))
      if (!validRecordTypes.includes(params.recordType)) {
        throw new Error(`Invalid recordType. Must be a registered form type (e.g., ${validRecordTypes.slice(0, 3).join(', ')})`)
      }
      query.where.recordType = params.recordType
    }

    // Step 5: Validate userAction with whitelist
    const validActions = ['VIEW', 'EDIT', 'DELETE', 'LIST', 'EXPORT']
    if (params.userAction) {
      if (!validActions.includes(params.userAction)) {
        throw new Error(`Invalid userAction. Must be one of: ${validActions.join(', ')}`)
      }
      query.where.action = params.userAction
    }

    if (params.operationId) {
      query.where.operationId = params.operationId
    }

    // Step 6: Validate date range filters
    if (params.fromDate || params.toDate) {
      query.where.occurredAt = {}

      if (params.fromDate) {
        const fromDate = new Date(params.fromDate)
        if (isNaN(fromDate.getTime())) {
          throw new Error('Invalid fromDate format. Use ISO 8601 (e.g., 2026-01-15T10:00:00Z)')
        }
        query.where.occurredAt[Op.gte] = fromDate
      }

      if (params.toDate) {
        const toDate = new Date(params.toDate)
        if (isNaN(toDate.getTime())) {
          throw new Error('Invalid toDate format. Use ISO 8601 (e.g., 2026-01-15T23:59:59Z)')
        }
        // Add 1 day and use < to include entire toDate day
        toDate.setDate(toDate.getDate() + 1)
        query.where.occurredAt[Op.lt] = toDate
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
