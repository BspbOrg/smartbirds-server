const { Action, api } = require('actionhero')
const differenceInDays = require('date-fns/differenceInDays')

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

  availableForms () {
    return Object.entries(api.forms).filter(([k, f]) => f.$isForm).map(([k]) => k)
  }

  async run ({ params: { form, id, limit, force }, response }) {
    if (form) {
      if (typeof form !== 'string') throw new Error('form must be string')
      if (!api.forms[form] || !api.forms[form].$isForm) throw new Error(`Unknown form ${form}. Available ${this.availableForms().join(', ')}`)
      if (!this.availableForms().includes(form)) throw new Error(`Form ${form} is not supported. Available ${this.availableForms().join(', ')}`)
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

  availableForms () {
    return super.availableForms().filter(k => api.forms[k].hasBgAtlas2008)
  }

  async enqueue ({ form, id, limit, force }) {
    return await api.tasks.enqueue('forms_fill_bgatlas2008_utmcode', { form, id, limit, force })
  }
}

module.exports.autoVisit = class EnqueueAutoVisit extends BaseAction {
  constructor () {
    super()
    this.name = 'tasks:enqueue:autoVisit'
    this.description = 'Trigger automatic CBM visit number'
  }

  availableForms () {
    return api.tasks.tasks.autoVisit.getForms()
  }

  async enqueue ({ form, id, limit, force }) {
    return await api.tasks.enqueue('autoVisit', { form, id, limit, force })
  }
}

module.exports.birdsNewSpeciesModeratorReview = class EnqueueAutoVisit extends BaseAction {
  constructor () {
    super()
    this.name = 'tasks:enqueue:birdsNewSpeciesModeratorReview'
    this.description = 'Trigger birdsNewSpeciesModeratorReview'
  }

  availableForms () {
    return api.tasks.tasks.birdsNewSpeciesModeratorReview.getForms()
  }

  async enqueue ({ form, id, limit, force }) {
    await api.tasks.enqueue('forms_fill_bgatlas2008_utmcode', { form, id, limit, force })
    return await api.tasks.enqueue('birdsNewSpeciesModeratorReview', { form, id, limit, force })
  }
}

module.exports.autoTranslateNomenclatures = class EnqueueAutoTranslateNomenclatures extends BaseAction {
  constructor () {
    super()
    this.name = 'tasks:enqueue:autoTranslateNomenclatures'
    this.description = 'Trigger autoTranslateNomenclatures'
  }

  async enqueue ({ form, id, limit, force }) {
    return await api.tasks.enqueue('autoTranslateNomenclatures', { form, id, limit, force })
  }
}

module.exports.etrs89Codes = class EnqueueFillEtrs89Codes extends BaseAction {
  constructor () {
    super()
    this.name = 'tasks:enqueue:etrs89Codes'
    this.description = 'Trigger filling ETRS89-LAEA codes'
  }

  availableForms () {
    return super.availableForms().filter(k => api.forms[k].hasEtrs89GridCode)
  }

  async enqueue ({ form, id, limit, force }) {
    return await api.tasks.enqueue('fill-etrs89-codes', { form, id, limit, force })
  }
}

module.exports.ebpUpload = class EnqueueEbpUpload extends Action {
  constructor () {
    super()
    this.name = 'tasks:enqueue:ebpUpload'
    this.description = 'Trigger EBP upload'
    this.middleware = ['auth', 'admin']
    this.inputs = {
      startDate: {},
      endDate: {},
      mode: {}
    }
  }

  async run ({ params: { startDate, endDate, mode }, response }) {
    if (startDate && endDate) {
      // check if startDate is before endDate
      if (new Date(startDate) > new Date(endDate)) {
        throw new Error('startDate must be before endDate')
      }

      if (differenceInDays(new Date(endDate), new Date(startDate)) > 31) {
        throw new Error('Date range must be less than 31 days')
      }
    }

    response.result = await api.tasks.enqueue('ebpUpload', { startDate, endDate, mode: mode || 'insert' })
  }
}
