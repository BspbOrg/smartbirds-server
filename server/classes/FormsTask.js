const { Task, api } = require('actionhero')
const sequelize = require('sequelize')

const { Op } = sequelize

module.exports = class FormsTask extends Task {
  constructor () {
    super()
    this.defaultLimit = api.config.app.tasks.maxRecords
    this.queue = 'default'
  }

  getForms () {
    return Object.values(api.forms).filter((form) => form.$isForm)
  }

  filterRecords ({ force = false, form = null }) {
    throw new Error(`You need to implement filterRecords in ${this.name} to return a sequelize where filter`)
  }

  async processRecord () {
    throw new Error(`You need to implement processRecord in ${this.name}!`)
  }

  async run ({ form, id, limit = this.defaultLimit, lastId = null, force = false, filter = {} } = {}, worker) {
    const forms = this.getForms()
    if (!form) {
      return Promise.all(forms.map((form) =>
        api.tasks.enqueue(this.name, { form: form.modelName, id, limit, lastId, force, filter }, this.queue)
      ))
    } else {
      if (forms.every((f) => f.modelName !== form)) {
        throw new Error(`${form} is not a valid form name. Available ${forms.map((f) => f.modelName).join(', ')}`)
      }
    }

    let records
    do {
      records = await api.forms[form].model.findAll({
        where: id
          ? { id }
          : {
              [Op.and]: [
                lastId != null ? { id: { [Op.lt]: lastId } } : {},
                this.filterRecords({ force, form }),
                filter
              ]
            },
        limit: limit === -1 ? this.defaultLimit : limit,
        order: [['id', 'DESC']]
      })
      await Promise.all(records.map(async (record) => {
        if (lastId == null || lastId > record.id) {
          lastId = record.id
        }

        await this.processRecord(record, form)
      }))
      if (records.length === 0) limit = 0
    } while (limit === -1)
  }
}
