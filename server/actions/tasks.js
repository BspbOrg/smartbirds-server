const { Action, api } = require('actionhero')

module.exports = class Tasks extends Action {
  constructor () {
    super()
    this.name = 'tasks:enqueue:autoLocation'
    this.description = 'Trigger auto location'
    this.middleware = ['auth', 'admin']
    this.inputs = {
      form: {},
      id: {}
    }
  }

  async run ({ params: { form, id }, response }) {
    if (form) {
      if (typeof form !== 'string') throw new Error('form must be string')
      if (!api.forms[form] || !api.forms[form].$isForm) throw new Error(`Unknown form ${form}. Available ${Object.keys(api.forms).join(', ')}`)
    }
    if (id) {
      if (typeof id !== 'number') throw new Error('id must be number')
      if (!form) throw new Error('missing form with id')
    }
    response.result = await api.tasks.enqueue('autoLocation', { form, id })
  }
}
