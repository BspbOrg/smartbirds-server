const { Action, api } = require('actionhero')
const { Op } = require('sequelize')

// List alerts with filtering
module.exports.suspiciousActivityAlertList = class SuspiciousActivityAlertList extends Action {
  constructor () {
    super()
    this.name = 'suspiciousActivityAlert:list'
    this.description = 'List suspicious activity alerts (admin only)'
    this.middleware = ['admin']
    this.inputs = {
      status: { required: false },
      patternType: { required: false },
      userId: { required: false },
      fromDate: { required: false },
      toDate: { required: false },
      limit: { required: false, default: 50 },
      offset: { required: false, default: 0 },
      sortBy: { required: false, default: 'detectedAt' },
      sortOrder: { required: false, default: 'DESC' }
    }
  }

  async run ({ params, response }) {
    const limit = Math.min(500, params.limit || 50)
    const offset = params.offset || 0

    const where = {}

    if (params.status) {
      where.status = params.status
    }

    if (params.patternType) {
      where.patternType = params.patternType
    }

    if (params.userId) {
      where.userId = parseInt(params.userId)
    }

    if (params.fromDate || params.toDate) {
      where.detectedAt = {}
      if (params.fromDate) {
        where.detectedAt[Op.gte] = new Date(params.fromDate)
      }
      if (params.toDate) {
        // Add 1 day and use < (less than) to include the entire toDate day
        const toDateEnd = new Date(params.toDate)
        toDateEnd.setDate(toDateEnd.getDate() + 1)
        where.detectedAt[Op.lt] = toDateEnd
      }
    }

    const validSortFields = ['detectedAt', 'createdAt', 'requestCount', 'ipCount']
    const sortBy = validSortFields.includes(params.sortBy) ? params.sortBy : 'detectedAt'
    const sortOrder = params.sortOrder === 'ASC' ? 'ASC' : 'DESC'

    const result = await api.models.suspicious_activity_alert.findAndCountAll({
      where,
      limit,
      offset,
      order: [[sortBy, sortOrder]]
    })

    response.data = result.rows.map(row => ({
      id: row.id.toString(),
      userId: row.userId,
      patternType: row.patternType,
      status: row.status,
      detectedAt: row.detectedAt,
      resolvedAt: row.resolvedAt,
      resolvedBy: row.resolvedBy,
      detectionData: row.detectionData,
      requestCount: row.requestCount,
      ipCount: row.ipCount,
      distinctIps: row.distinctIps,
      endpoints: row.endpoints,
      timeWindow: row.timeWindow,
      adminNotes: row.adminNotes,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt
    }))

    response.count = result.count
  }
}

// View single alert
module.exports.suspiciousActivityAlertView = class SuspiciousActivityAlertView extends Action {
  constructor () {
    super()
    this.name = 'suspiciousActivityAlert:view'
    this.description = 'View single alert with full details (admin only)'
    this.middleware = ['admin']
    this.inputs = {
      id: { required: true }
    }
  }

  async run ({ params, response }) {
    const alert = await api.models.suspicious_activity_alert.findOne({
      where: { id: params.id }
    })

    if (!alert) {
      throw new Error('Alert not found')
    }

    response.data = {
      id: alert.id.toString(),
      userId: alert.userId,
      patternType: alert.patternType,
      status: alert.status,
      detectedAt: alert.detectedAt,
      resolvedAt: alert.resolvedAt,
      resolvedBy: alert.resolvedBy,
      detectionData: alert.detectionData,
      requestCount: alert.requestCount,
      ipCount: alert.ipCount,
      distinctIps: alert.distinctIps,
      endpoints: alert.endpoints,
      timeWindow: alert.timeWindow,
      adminNotes: alert.adminNotes,
      createdAt: alert.createdAt,
      updatedAt: alert.updatedAt
    }
  }
}

// Update alert (change status, add notes)
module.exports.suspiciousActivityAlertUpdate = class SuspiciousActivityAlertUpdate extends Action {
  constructor () {
    super()
    this.name = 'suspiciousActivityAlert:update'
    this.description = 'Update alert status and notes (admin only)'
    this.middleware = ['admin']
    this.inputs = {
      id: { required: true },
      status: { required: false },
      adminNotes: { required: false }
    }
  }

  async run ({ session, params, response }) {
    const alert = await api.models.suspicious_activity_alert.findOne({
      where: { id: params.id }
    })

    if (!alert) {
      throw new Error('Alert not found')
    }

    const updates = {}

    // Validate and update status
    if (params.status) {
      const validStatuses = Object.values(api.suspiciousActivityDetector.statuses)
      if (!validStatuses.includes(params.status)) {
        throw new Error('Invalid status. Must be one of: ' + validStatuses.join(', '))
      }
      updates.status = params.status

      // Set resolved_at and resolved_by when marking as resolved/false_positive
      const resolvedStatuses = [
        api.suspiciousActivityDetector.statuses.RESOLVED,
        api.suspiciousActivityDetector.statuses.FALSE_POSITIVE
      ]
      if (resolvedStatuses.includes(params.status)) {
        updates.resolvedAt = new Date()
        updates.resolvedBy = session.userId
      }
    }

    // Update admin notes
    if (params.adminNotes !== undefined) {
      updates.adminNotes = params.adminNotes
    }

    await alert.update(updates)

    response.data = {
      id: alert.id.toString(),
      userId: alert.userId,
      patternType: alert.patternType,
      status: alert.status,
      detectedAt: alert.detectedAt,
      resolvedAt: alert.resolvedAt,
      resolvedBy: alert.resolvedBy,
      adminNotes: alert.adminNotes,
      updatedAt: alert.updatedAt
    }
  }
}

// Stats endpoint (summary counts)
module.exports.suspiciousActivityAlertStats = class SuspiciousActivityAlertStats extends Action {
  constructor () {
    super()
    this.name = 'suspiciousActivityAlert:stats'
    this.description = 'Get alert statistics (admin only)'
    this.middleware = ['admin']
    this.inputs = {
      fromDate: { required: false },
      toDate: { required: false }
    }
  }

  async run ({ params, response }) {
    const where = {}

    if (params.fromDate || params.toDate) {
      where.detectedAt = {}
      if (params.fromDate) {
        where.detectedAt[Op.gte] = new Date(params.fromDate)
      }
      if (params.toDate) {
        // Add 1 day and use < (less than) to include the entire toDate day
        const toDateEnd = new Date(params.toDate)
        toDateEnd.setDate(toDateEnd.getDate() + 1)
        where.detectedAt[Op.lt] = toDateEnd
      }
    }

    const resolvedThisWeekWhere = {
      ...where,
      status: 'resolved',
      resolvedAt: {
        [Op.gte]: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      }
    }

    const [byStatus, byPattern, resolvedThisWeek, total] = await Promise.all([
      // Count by status
      api.models.suspicious_activity_alert.findAll({
        where,
        attributes: [
          'status',
          [api.sequelize.sequelize.fn('COUNT', api.sequelize.sequelize.col('id')), 'count']
        ],
        group: ['status'],
        raw: true
      }),
      // Count by pattern type
      api.models.suspicious_activity_alert.findAll({
        where,
        attributes: [
          'patternType',
          [api.sequelize.sequelize.fn('COUNT', api.sequelize.sequelize.col('id')), 'count']
        ],
        group: ['patternType'],
        raw: true
      }),
      // Count resolved in last 7 days
      api.models.suspicious_activity_alert.count({ where: resolvedThisWeekWhere }),
      // Total count
      api.models.suspicious_activity_alert.count({ where })
    ])

    // Convert to object for easy access
    const statusCounts = byStatus.reduce((acc, row) => {
      acc[row.status] = parseInt(row.count)
      return acc
    }, {})

    const patternCounts = byPattern.reduce((acc, row) => {
      acc[row.patternType] = parseInt(row.count)
      return acc
    }, {})

    response.data = {
      total,
      newCount: statusCounts.new || 0,
      investigatingCount: statusCounts.investigating || 0,
      resolvedCount: statusCounts.resolved || 0,
      falsePositiveCount: statusCounts.false_positive || 0,
      resolvedThisWeek,
      byStatus: statusCounts,
      byPattern: patternCounts
    }
  }
}
