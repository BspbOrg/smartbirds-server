const { Task, api } = require('actionhero')
const sequelize = require('sequelize')
const { getBoundsOfDistance, getDistance } = require('geolib')

const { Op } = sequelize

async function trySave (record, form) {
  try {
    await record.save()
  } catch (e) {
    const duplicated = await api.forms[form].model.findOne({
      attributes: ['id'],
      where: { hash: record.hash }
    })
    if (duplicated) {
      api.log(`[${form}] Duplicate records ${record.id} and ${duplicated.id}`, 'error')
    } else {
      api.log(`Could not update record ${form}.${record.id} (hash: ${record.hash})`, 'error', e)
      throw e
    }
  }
}

async function process (record, form) {
  if (record.latitude == null || record.longitude == null) {
    return
  }

  const bounds = getBoundsOfDistance({
    latitude: record.latitude,
    longitude: record.longitude
  }, api.config.app.location.maxDistance)

  const settlement = await api.models.settlement.findOne({
    where: {
      latitude: { [Op.between]: [bounds[0].latitude, bounds[1].latitude] },
      longitude: bounds[0].longitude <= bounds[1].longitude
        ? { [Op.between]: [bounds[0].longitude, bounds[1].longitude] }
        : {
          [Op.or]: [
            { [Op.gte]: bounds[0].longitude },
            { [Op.lte]: bounds[1].longitude }
          ]
        }
    },
    order: sequelize.literal(`
          (latitude-(${api.sequelize.sequelize.escape(record.latitude)}))*(latitude-(${api.sequelize.sequelize.escape(record.latitude)}))
           +
          (longitude-(${api.sequelize.sequelize.escape(record.longitude)}))*(longitude-(${api.sequelize.sequelize.escape(record.longitude)}))
          `)
  })
  if (!settlement) {
    return
  }
  const dist = getDistance(settlement, record)
  if (dist > api.config.app.location.maxDistance) {
    return
  }
  // en is not required, so it may be null, default to empty string to prevent duplicate processing
  record.autoLocationEn = settlement.nameEn || ''
  record.autoLocationLocal = settlement.nameLocal
  record.autoLocationLang = settlement.nameLang

  await trySave(record, form)

  return true
}

module.exports = class AutoLocation extends Task {
  constructor () {
    super()
    this.name = 'autoLocation'
    this.description = 'Populate location based on coordinates'
    // use cronjob to schedule the task
    // npm run enqueue autoLocation
    this.frequency = 0
  }

  async run ({ form, id, limit = api.config.app.location.maxRecords, lastId = null } = {}, worker) {
    if (!form) {
      return Promise.all(Object.values(api.forms).map(async (form) => {
        if (!form.$isForm) return

        await api.tasks.enqueue('autoLocation', { form: form.modelName, limit }, 'default')
      }))
    }

    let records
    do {
      records = await api.forms[form].model.findAll({
        where: id ? { id } : {
          autoLocationEn: null,
          ...(lastId != null ? { id: { [Op.lt]: lastId } } : {})
        },
        limit: limit === -1 ? api.config.app.location.maxRecords : limit,
        order: [['id', 'DESC']]
      })
      await Promise.all(records.map(async (record) => {
        if (lastId == null || lastId > record.id) {
          lastId = record.id
        }

        if (!await process(record, form)) {
          // mark as empty string so we don't repeat it
          record.autoLocationEn = ''
          await trySave(record, form)
        }
      }))
      if (records.length === 0) limit = 0
    } while (limit === -1)
  }
}
