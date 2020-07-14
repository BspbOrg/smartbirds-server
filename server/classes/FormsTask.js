const { Task, api } = require('actionhero')
const sequelize = require('sequelize')

const { Op } = sequelize

module.exports = class FormsTask extends Task {
  constructor () {
    super()
    this.defaultLimit = 10
    this.queue = 'default'
  }

  filterRecords ({ force = false }) {
    throw new Error(`You need to implement filterRecords in ${this.name} to return a sequelize where filter`)
  }

  async processRecord () {
    throw new Error(`You need to implement processRecord in ${this.name}!`)
  }

  async run ({ form, id, limit = this.defaultLimit, lastId = null, force = false } = {}, worker) {
    if (!form) {
      return Promise.all(Object.values(api.forms).map(async (form) => {
        if (!form.$isForm) return

        await api.tasks.enqueue(this.name, { form: form.modelName, id, limit, lastId, force }, this.queue)
      }))
    }

    let records
    do {
      records = await api.forms[form].model.findAll({
        where: id ? { id } : {
          [Op.and]: [
            lastId != null ? { id: { [Op.lt]: lastId } } : {},
            this.filterRecords({ force })
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
