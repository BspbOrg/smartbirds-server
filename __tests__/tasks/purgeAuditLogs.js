/* eslint-env node, jest */
/* globals setup */

const run = (...args) => setup.api.tasks.tasks['auditLogs:purge'].run(...args)

const DAY = 24 * 60 * 60 * 1000

describe('Task: auditLogs:purge', () => {
  const isPostgres = () => setup.api.sequelize.sequelize.options.dialect === 'postgres'
  let originalRetentionDays

  const createAudit = (recordId, daysAgo) => setup.api.models.access_audit.create({
    recordType: 'purgeTest',
    recordId,
    actorUserId: 1,
    ownerUserId: 2,
    action: setup.api.audit.actions.view,
    occurredAt: new Date(Date.now() - daysAgo * DAY)
  })

  const remainingIds = async () => {
    const rows = await setup.api.models.access_audit.findAll({ where: { recordType: 'purgeTest' } })
    return rows.map((row) => row.recordId).sort()
  }

  beforeEach(async () => {
    originalRetentionDays = setup.api.config.audit.retentionDays
    await setup.api.models.access_audit.destroy({ where: { recordType: 'purgeTest' } })
  })

  afterEach(async () => {
    setup.api.config.audit.retentionDays = originalRetentionDays
    await setup.api.models.access_audit.destroy({ where: { recordType: 'purgeTest' } })
  })

  it('deletes only records older than the retention period', async () => {
    setup.api.config.audit.retentionDays = 30
    await createAudit(1, 31)
    await createAudit(2, 29)
    await createAudit(3, 1)

    const result = await run({})

    if (!isPostgres()) {
      expect(result).toBeUndefined()
      expect(await remainingIds()).toEqual([1, 2, 3])
      return
    }

    expect(result).toEqual({ success: true, deleted: 1 })
    expect(await remainingIds()).toEqual([2, 3])
  })

  it.each([0, -5, 'abc'])('skips purge when retentionDays is %p', async (retentionDays) => {
    setup.api.config.audit.retentionDays = retentionDays
    await createAudit(1, 1000)

    const result = await run({})

    expect(result).toBeUndefined()
    expect(await remainingIds()).toEqual([1])
  })
})
