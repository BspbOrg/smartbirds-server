const _ = require('lodash')
const inputHelpers = require('../helpers/inputs')
const { upgradeInitializer, upgradeAction } = require('../utils/upgrade')

/**
 * @param {{modelName: String}} form
 * @returns {Function}
 */
function generateInsertAction (form) {
  return async function (api, data, next) {
    try {
      let record = await api.models[form.modelName].build({})
      if ((!api.forms.userCanManage(data.session.user, form.modelName)) || !data.params.user) {
        data.params.user = data.session.userId
      }
      data.params.organization = data.session.user.organizationSlug
      record = await record.apiUpdate(data.params, data.session.user.language)
      const hash = record.calculateHash()
      api.log('looking for %s with hash %s', 'info', form.modelName, hash)
      const existing = await api.models[form.modelName].findOne({ where: { hash: hash } })
      if (existing) {
        api.log('found %s with hash %s, updating', 'info', form.modelName, hash)
        data.response.existing = true
        await existing.apiUpdate(data.params, data.session.user.language)
        record = await existing.save()
      } else {
        api.log('not found %s with hash %s, creating', 'info', form.modelName, hash)
        record = await record.save()
      }
      data.response.data = await record.apiData(api)
      next()
    } catch (error) {
      console.error('insert error', error)
      api.log(error, 'error')
      next(error)
    }
  }
}

/**
 * @param {{modelName: String}} form
 * @returns {Function}
 */
function generateEditAction (form) {
  return async function (api, data, next) {
    try {
      const record = await form.retrieveRecord(api, data)

      if (!api.forms.userCanManage(data.session.user, form.modelName)) {
        data.params.user = data.session.userId
      }

      await record.apiUpdate(data.params, data.session.user.language)
      await record.save()
      data.response.data = await record.apiData(api)
      next()
    } catch (error) {
      api.log(error, 'error')
      next(error)
    }
  }
}

/**
 * @param {{modelName: String}} form
 * @returns {Function}
 */
function generateViewAction (form) {
  return async function (api, data, next) {
    try {
      const record = await form.retrieveRecord(api, data)
      data.response.data = await record.apiData(api)
      next()
    } catch (error) {
      api.log(error, 'error')
      next(error)
    }
  }
}

/**
 * @param {{modelName: String}} form
 * @returns {Function}
 */
function generateDeleteAction (form) {
  return async function (api, data, next) {
    try {
      const record = await form.retrieveRecord(api, data)
      await record.destroy()
      next()
    } catch (error) {
      api.log(error, 'error')
      next(error)
    }
  }
}

function generateListAction (form) {
  return async function (api, data, next) {
    try {
      const query = await form.prepareQuery(api, data)

      // fetch the results
      const result = await api.models[form.modelName].findAndCountAll(query)

      // prepare the output
      data.response.data = await Promise.all(result.rows.map(async (model) => model.apiData(api, data.params.context)))
      data.response.count = result.count

      next()
    } catch (error) {
      api.log(error, 'error')
      next(error)
    }
  }
}

function generateExportAction (form) {
  return async function (api, data, next) {
    try {
      const outputType = data.params.outputType

      let allowed = false
      if (api.forms.userCanManage(data.session.user, form.modelName)) {
        allowed = true
      } else if (!data.params.user) {
        // regular users can only export own data
        data.params.user = data.session.userId
        allowed = true
      } else if (data.session.userId === data.params.user) {
        // need to have specified own user
        allowed = true
      }

      if (!allowed) throw new Error(api.config.errors.sessionNoPermission(data.connection))

      const query = await form.prepareQuery(api, data)

      data.response.success = await api.tasks.enqueue('form:export', {
        query,
        outputType,
        user: data.session.user,
        formName: form.modelName
      }, 'low')
      next()
    } catch (error) {
      api.log(error, 'error')
      next(error)
    }
  }
}

function generateFormActions (form) {
  const actions = {}

  if (!form || !form.modelName) return actions

  const insertInputs = {}
  const editInputs = {
    id: { required: true }
  }
  const listInputs = _.extend({
    user: {},
    organization: {},
    limit: { default: 20 },
    offset: { default: 0 },
    location: {},
    from_date: {},
    to_date: {},
    context: {},
    latitude: {},
    longitude: {},
    radius: {}
  },
  form.hasThreats ? {
    threat: {
      formatter: inputHelpers.formatter.nomenclature
    }
  } : {},
  form.hasSpecies ? { species: {} } : {},
  form.listInputs || {})

  const exportInputs = _.extend({}, listInputs, {
    outputType: {
      required: true,
      validator: (param) => {
        if (param !== 'csv' && param !== 'zip') {
          return 'Invalid output type'
        }
        return true
      }
    },
    selection: {}
  })

  _.forEach(form.fields, (field, fieldName) => {
    if (fieldName === 'createdAt' || fieldName === 'updatedAt') return
    if (fieldName === 'organization') return
    if (field.private) return
    insertInputs[fieldName] = {
      required: field.required && fieldName !== 'user'
    }
    editInputs[fieldName] = {}
  })

  actions.formAdd = {
    name: `${form.modelName}:create`,
    description: `${form.modelName}:create`,
    middleware: ['auth'],
    inputs: insertInputs,
    run: generateInsertAction(form)
  }

  actions.formEdit = {
    name: `${form.modelName}:edit`,
    description: `${form.modelName}:edit`,
    middleware: ['auth'],
    inputs: editInputs,
    run: generateEditAction(form)
  }

  actions.formView = {
    name: `${form.modelName}:view`,
    description: `${form.modelName}:view`,
    middleware: ['auth'],
    inputs: { id: { required: true } },
    run: generateViewAction(form)
  }

  actions.formDelete = {
    name: `${form.modelName}:delete`,
    description: `${form.modelName}:delete`,
    middleware: ['auth'],
    inputs: { id: { required: true } },
    run: generateDeleteAction(form)
  }

  actions.formList = {
    name: `${form.modelName}:list`,
    description: `${form.modelName}:list`,
    middleware: ['auth'],
    inputs: listInputs,
    run: generateListAction(form)
  }

  actions.formExport = {
    name: `${form.modelName}:export`,
    description: `${form.modelName}:export`,
    middleware: ['auth'],
    inputs: exportInputs,
    run: generateExportAction(form)
  }

  return actions
}

async function registerForm (api, form) {
  if (!form.$isForm) return
  const name = form.modelName
  const collection = generateFormActions(form)
  api.log(`Registering actions for ${name} form`, 'info')
  await Promise.all(_.map(collection, async actionDescription => {
    const ActionClass = upgradeAction('ah17', actionDescription)
    const action = new ActionClass()

    api.log(`Validating action ${action.name}@${action.version}`, 'debug')
    await action.validate(api)

    if (!api.actions.actions[action.name]) { api.actions.actions[action.name] = {} }
    if (!api.actions.versions[action.name]) { api.actions.versions[action.name] = [] }

    if (action.version === null || action.version === undefined) {
      action.version = 1.0
    }

    api.actions.actions[action.name][action.version] = action
    api.actions.versions[action.name].push(action.version)
    api.actions.versions[action.name].sort()
    api.log(`Registering ${action.name}@${action.version}`, 'info')
  }))
}

module.exports = upgradeInitializer('ah17', {
  name: 'formActions',
  // after actions and before params
  loadPriority: 411,
  initialize: async function (api, next) {
    api.log('Registering form actions', 'info')
    try {
      await Promise.all(_.map(api.forms, form => registerForm(api, form)))
    } catch (e) {
      return next(e)
    }

    api.forms.register = (function (originalRegister) {
      return function (form) {
        const res = originalRegister(form)
        registerForm(api, form)
        return res
      }
    })(api.forms.register)

    next()
  }
})
