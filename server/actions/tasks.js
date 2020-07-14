const { Action, api } = require('actionhero')

class BaseAction extends Action {
  constructor () {
    super()
    this.middleware = ['auth', 'admin']
    this.inputs = {
      form: {},
      id: {},
      limit: {},
      force: {}
    }
  }

  async enqueue ({ form, id, limit }) {
    throw new Error('must implement enqueue!')
  }

  async run ({ params: { form, id, limit, force }, response }) {
    if (form) {
      if (typeof form !== 'string') throw new Error('form must be string')
      if (!api.forms[form] || !api.forms[form].$isForm) throw new Error(`Unknown form ${form}. Available ${Object.keys(api.forms.filter(f => f.$isForm)).join(', ')}`)
    }
    if (id) {
      if (typeof id !== 'number') throw new Error('id must be number')
      if (!form) throw new Error('missing form with id')
    }
    if (limit) {
      if (typeof limit !== 'number') throw new Error('limit must be number')
      if (limit <= 0 && limit !== -1) throw new Error('limit must be positive or -1')
    }
    response.result = await this.enqueue({ form, id, limit, force: Boolean(force) })
  }
}

module.exports.autoLocation = class EnqueueAutoLocation extends BaseAction {
  constructor () {
    super()
    this.name = 'tasks:enqueue:autoLocation'
    this.description = 'Trigger auto location'
  }

  async enqueue ({ form, id, limit, force }) {
    return await api.tasks.enqueue('autoLocation', { form, id, limit, force })
  }
}

module.exports.bgAtlas2008 = class EnqueueBgAtlas2008 extends BaseAction {
  constructor () {
    super()
    this.name = 'tasks:enqueue:bgatlas2008'
    this.description = 'Trigger bg atlas 2008 utm code'
  }

  async enqueue ({ form, id, limit, force }) {
    if (form) {
      if (!api.forms[form].hasBgAtlas2008) throw new Error(`Form ${form} is not part of bg atlas 2008. Available ${Object.keys(api.forms.filter(f => f.hasBgAtlas2008)).join(', ')}`)
    }
    return await api.tasks.enqueue('forms_fill_bgatlas2008_utmcode', { form, id, limit, force })
  }
}
