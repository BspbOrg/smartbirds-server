const { api } = require('actionhero')
const sequelize = require('sequelize')
const FormsTask = require('../classes/FormsTask')

module.exports = class AutoTranslateNomenclatures extends FormsTask {
  constructor () {
    super()
    this.name = 'autoTranslateNomenclatures'
    this.description = 'Translate nomenclatures'
    // use cronjob to schedule the task
    // npm run enqueue autoTranslateNomenclatures
    this.frequency = 0
    this.defaultLimit = api.config.app.translate.maxRecords
  }

  findNomenclatureFields = (form) => {
    return Object.entries(api.forms[form].fields).map(([key, field]) => {
      if (field.relation?.model === 'nomenclature') {
        return {
          key,
          type: field.type,
          nomenclature: field.relation?.filter?.type
        }
      }
      return null
    }).filter(Boolean)
  }

  filterRecords ({ force, form }) {
    // fore all
    if (force === true) return {}

    const nomenclatureFields = this.findNomenclatureFields(form)

    // no nomenclature fields
    if (nomenclatureFields.length === 0) {
      return {}
    }

    return {
      [sequelize.Op.or]: nomenclatureFields.map(({ key, type, nomenclature }) => {
        return {
          [sequelize.Op.and]: {
            [`${key}En`]: {
              [sequelize.Op.and]: {
                [sequelize.Op.not]: null,
                [sequelize.Op.ne]: ''
              }
            },
            [`${key}Local`]: {
              [sequelize.Op.or]: {
                [sequelize.Op.is]: null,
                [sequelize.Op.eq]: ''
              }
            }
          }
        }
      })
    }
  }

  async processRecord (record, form) {
    const nomenclatureFields = this.findNomenclatureFields(form)

    for (const nomenclatureField of nomenclatureFields) {
      const key = nomenclatureField.key

      if (record[`${key}En`] !== null && record[`${key}En`] !== '' && (record[`${key}Local`] === null || record[`${key}Local`] === '')) {
        if (nomenclatureField.type === 'choice') {
          const nomenclatures = await api.models.nomenclature.findAll({
            attributes: ['labelBg'],
            where: {
              type: nomenclatureField.nomenclature,
              labelEn: record[key + 'En']
            }
          })
          if (nomenclatures?.length > 0 && nomenclatures[0].labelBg) {
            record[key + 'Local'] = nomenclatures[0].labelBg
            record[key + 'Lang'] = 'bg'
          } else {
            record[key + 'Local'] = '|'
            record[key + 'Lang'] = null
          }
        } else if (nomenclatureField.type === 'multi') {
          const enValues = record[key + 'En'].split(' | ')

          const nomenclatures = await api.models.nomenclature.findAll({
            attributes: ['labelBg', 'labelEn'],
            where: {
              type: nomenclatureField.nomenclature,
              labelEn: enValues
            }
          })

          if (nomenclatures?.length > 0 && nomenclatures.length === enValues.length) {
            record[key + 'Local'] = enValues.map((enValue) => {
              const nomenclature = nomenclatures.find((nomenclature) => nomenclature.labelEn === enValue)
              return nomenclature?.labelBg
            }).filter(Boolean).join(' | ')
            record[key + 'Lang'] = 'bg'
          } else {
            record[key + 'Local'] = '|'
            record[key + 'Lang'] = null
          }
        }
      }
    }

    await api.forms.trySave(record, api.forms[form])
  }
}
