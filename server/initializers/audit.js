const { Initializer, api } = require('actionhero')

module.exports = class AuditInit extends Initializer {
  constructor () {
    super()
    this.name = 'audit'
    this.loadPriority = 500
  }

  async initialize () {
    api.audit = {
      actions: {
        view: 'VIEW',
        edit: 'EDIT',
        delete: 'DELETE',
        export: 'EXPORT',
        list: 'LIST'
      },
      logAccessBulk: async (action, recordType, recordIds, ownerUserIds, actorUserId, actorRole, actorOrganization, meta) => {
        const recordIdsToAudit = []
        const ownerUserIdsToAudit = []
        for (let i = 0; i < recordIds.length; i++) {
          if (ownerUserIds[i] && ownerUserIds[i] !== actorUserId) {
            recordIdsToAudit.push(recordIds[i])
            ownerUserIdsToAudit.push(ownerUserIds[i])
          }
        }
        if (recordIdsToAudit.length > 0) {
          await api.audit.createAuditRecords(action, recordType, recordIdsToAudit, ownerUserIdsToAudit, actorUserId, actorRole, actorOrganization, meta)
        }
      },
      logAccess: async (action, recordType, recordId, ownerUserId, actorUserId, actorRole, actorOrganization, meta) => {
        await api.audit.logAccessBulk(action, recordType, [recordId], [ownerUserId], actorUserId, actorRole, actorOrganization, meta)
      },
      createAuditRecords: async (action, recordType, recordIds, ownerUserIds, actorUserId, actorRole, actorOrganization, meta) => {
        const occurredAt = new Date()
        const recordIdChunks = []
        const ownerUserIdChunks = []

        // chunk the record ids and owner user ids
        for (let i = 0; i < recordIds.length; i += api.config.audit.chunkSize) {
          recordIdChunks.push(recordIds.slice(i, i + api.config.audit.chunkSize))
          ownerUserIdChunks.push(ownerUserIds.slice(i, i + api.config.audit.chunkSize))
        }

        const sql = `
          INSERT INTO access_audit
            ("action", "recordType", "recordId", "ownerUserId", "actorUserId", "actorRole", "actorOrganization", "meta", "occurredAt")
          SELECT
            $1 AS "action",
            $2 AS "recordType",
            x."recordId" AS "recordId",
            x."ownerUserId" AS "ownerUserId",
            $5 AS "actorUserId",
            $6 AS "actorRole",
            $7 AS "actorOrganization",
            $8 AS "meta",
            $9 AS "occurredAt"
          FROM unnest($3::int[], $4::int[]) AS x("recordId", "ownerUserId")
          WHERE x."ownerUserId" <> $5
        `

        for (let i = 0; i < recordIdChunks.length; i++) {
          await api.sequelize.sequelize.query(sql, {
            bind: [action, recordType, recordIdChunks[i], ownerUserIdChunks[i], actorUserId, actorRole, actorOrganization, meta ?? null, occurredAt]
          })
        }
      }
    }
  }
}
