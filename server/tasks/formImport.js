const { api, Task } = require('actionhero')
const { prepareImportData } = require('../utils/import')

const prepareNomenclatureData = async () => {
  const nomenclatures = await api.models.nomenclature.findAll()
  const species = await api.models.species.findAll()

  return {
    nomenclatures: (nomenclatures?.map(n => n.apiData()) || []).reduce((acc, n) => {
      if (!acc[n.type]) {
        acc[n.type] = []
      }
      acc[n.type].push(n)
      return acc
    }, {}),
    species: (species?.map(s => s.apiData()) || []).reduce((acc, s) => {
      if (!acc[s.type]) {
        acc[s.type] = []
      }
      acc[s.type].push(s)
      return acc
    }, {})
  }
}
module.exports = class FormImport extends Task {
  constructor () {
    super()
    this.name = 'form:import'
    this.description = 'form:import'
    this.frequency = 0
    this.queue = 'low'
    this.middleware = []
  }

  async run ({ params, user, formName }) {
    const importResult = {
      total: params.items.length,
      processed: 0,
      created: 0,
      updated: 0,
      errors: []
    }

    try {
      const form = api.forms[formName]
      let userAllowed = false
      if (api.forms.userCanManage(user, form.modelName)) {
        userAllowed = true
      }

      await api.sequelize.sequelize.transaction(async (t) => {
        for (let i = 0; i < params.items.length; i++) {
          try {
            const itemData = prepareImportData(
              params.items[i],
              (userAllowed ? params.items[i]?.userId : user.id) || user.id,
              params.language,
              user.organizationSlug
            )

            const nomenclatureData = await prepareNomenclatureData()

            let record = await api.models[form.modelName].build({})
            record = await record.apiUpdate(
              itemData,
              params.language,
              null,
              {
                validateNomenclatures: true,
                nomenclatures: nomenclatureData.nomenclatures,
                species: nomenclatureData.species
              })

            const hash = record.calculateHash()

            api.log('looking for %s with hash %s', 'info', form.modelName, hash)
            const existing = await api.models[form.modelName].findOne({ where: { hash }, transaction: t })

            if (existing) {
              api.log('found %s with hash %s, updating', 'info', form.modelName, hash)
              await existing.apiUpdate(itemData, params.language)
              record = await existing.save({ transaction: t })
              importResult.updated++
            } else {
              api.log('not found %s with hash %s, creating', 'info', form.modelName, hash)
              record = await record.save({ transaction: t })
              importResult.created++
            }
          } catch (error) {
            api.log(error, 'error')
            importResult.errors.push({ row: i + 1, error: error.message })
            if (!params.skipErrors) {
              importResult.created = 0
              importResult.updated = 0
              break
            }
          }

          importResult.processed++
        }

        const success = importResult.errors.length === 0 || params.skipErrors

        api.log('Sending import email notification', 'notice', { user })
        const successEmail = await api.tasks.enqueue('mail:send', {
          mail: { to: user.email, subject: 'Import ready' },
          template: 'import_ready',
          locals: { importResult, user }
        }, 'default')

        if (!success && !params.skipErrors) {
          throw new Error('Errors during import')
        }

        return { success, successEmail }
      })
    } catch (error) {
      api.log('Error from transaction function', 'error')
      throw error
    }
  }
}
