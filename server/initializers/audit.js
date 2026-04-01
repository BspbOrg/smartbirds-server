const { Initializer, api } = require('actionhero')
const { v7: uuidv7 } = require('uuid')

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
      logAccessBulk: async (options) => {
        const { action, recordType, recordIds, ownerUserIds, actorUserId, actorRole, actorOrganization, meta = null, speciesList } = options
        if (api.sequelize.sequelize.options.dialect !== 'postgres') {
          return
        }

        const recordIdsToAudit = []
        const ownerUserIdsToAudit = []
        for (let i = 0; i < recordIds.length; i++) {
          if (ownerUserIds[i] && ownerUserIds[i] !== actorUserId) {
            recordIdsToAudit.push(recordIds[i])
            ownerUserIdsToAudit.push(ownerUserIds[i])
          }
        }
        if (recordIdsToAudit.length > 0) {
          await api.audit.createAuditRecords({
            action,
            recordType,
            recordIds: recordIdsToAudit,
            ownerUserIds: ownerUserIdsToAudit,
            actorUserId,
            actorRole,
            actorOrganization,
            meta,
            speciesList
          })
        }
      },
      logAccess: async (options) => {
        const { action, recordType, recordId, ownerUserId, actorUserId, actorRole, actorOrganization, meta = null, species } = options
        await api.audit.logAccessBulk({
          action,
          recordType,
          recordIds: [recordId],
          ownerUserIds: [ownerUserId],
          actorUserId,
          actorRole,
          actorOrganization,
          meta,
          speciesList: species ? [species] : null
        })
      },
      createAuditRecords: async (options) => {
        const { action, recordType, recordIds, ownerUserIds, actorUserId, actorRole, actorOrganization, meta = null, speciesList } = options
        if (api.sequelize.sequelize.options.dialect !== 'postgres') {
          return
        }

        // Generate operationId once for all records in this batch
        // Using UUID v7 for better index performance (time-ordered)
        const operationId = uuidv7()
        const occurredAt = new Date()
        const recordIdChunks = []
        const ownerUserIdChunks = []
        const speciesListChunks = []

        // chunk the record ids and owner user ids
        for (let i = 0; i < recordIds.length; i += api.config.audit.chunkSize) {
          const chunkSlice = recordIds.slice(i, i + api.config.audit.chunkSize)
          recordIdChunks.push(chunkSlice)
          ownerUserIdChunks.push(ownerUserIds.slice(i, i + api.config.audit.chunkSize))
          speciesListChunks.push(speciesList ? speciesList.slice(i, i + api.config.audit.chunkSize) : new Array(chunkSlice.length).fill(null))
        }

        const sql = `
          INSERT INTO access_audit
            ("action", "recordType", "recordId", "ownerUserId", "actorUserId", "actorRole", "actorOrganization", "meta", "operationId", "occurredAt", "species")
          SELECT
            $1 AS "action",
            $2 AS "recordType",
            x."recordId" AS "recordId",
            x."ownerUserId" AS "ownerUserId",
            $5 AS "actorUserId",
            $6 AS "actorRole",
            $7 AS "actorOrganization",
            $8 AS "meta",
            $9 AS "operationId",
            $10 AS "occurredAt",
            x."species" AS "species"
          FROM unnest($3::int[], $4::int[], $11::text[]) AS x("recordId", "ownerUserId", "species")
          WHERE x."ownerUserId" <> $5
        `

        for (let i = 0; i < recordIdChunks.length; i++) {
          await api.sequelize.sequelize.query(sql, {
            bind: [action, recordType, recordIdChunks[i], ownerUserIdChunks[i], actorUserId, actorRole, actorOrganization, meta ?? null, operationId, occurredAt, speciesListChunks[i]]
          })
        }
      }
    }
  }
}
