const { Task, api } = require('actionhero')
const sequelize = require('sequelize')
const haversine = require('haversine-distance')

module.exports = class AutoLocation extends Task {
  constructor () {
    super()
    this.name = 'autoLocation'
    this.description = 'Populate location based on coordinates'
    // use cronjob to schedule the task
    // npm run enqueue autoLocation
    this.frequency = 0
  }

  async run ({ form, id } = {}, worker) {
    if (!form) {
      return Promise.all(Object.values(api.forms).map(async (form) => {
        if (!form.$isForm) return

        await api.tasks.enqueue('autoLocation', { form: form.modelName }, 'default')
      }))
    }

    const records = await api.forms[form].model.findAll({
      where: id ? { id } : { autoLocationEn: null },
      limit: api.config.app.location.maxRecords,
      order: [['id', 'DESC']]
    })
    await Promise.all(records.map(async (record) => {
      const settlement = await api.models.settlement.findOne({
        order: sequelize.literal(`(latitude-${api.sequelize.sequelize.escape(record.latitude)})*(latitude-${api.sequelize.sequelize.escape(record.latitude)}) + (longitude-${api.sequelize.sequelize.escape(record.longitude)})*(longitude-${api.sequelize.sequelize.escape(record.longitude)})`)
      })
      if (settlement) {
        const dist = haversine(settlement, record)
        if (dist <= api.config.app.location.maxDistance) {
          // en is not required, so it may be null, default to empty string to prevent duplicate processing
          record.autoLocationEn = settlement.nameEn || ''
          record.autoLocationLocal = settlement.nameLocal
          record.autoLocationLang = settlement.nameLang
          await record.save()
          return
        }
      }

      // mark as empty string so we don't repeat it
      record.autoLocationEn = ''
      await record.save()
    }))
  }
}
