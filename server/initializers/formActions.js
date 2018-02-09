const _ = require('lodash')

/**
 * @param {{modelName: String}} form
 * @returns {Function}
 */
function generateInsertAction (form) {
  return async function (api, data, next) {
    try {
      let record = await api.models[ form.modelName ].build({})
      if ((!data.session.user.isAdmin && !api.forms.isModerator(data.session.user, form.modelName)) || !data.params.user) {
        data.params.user = data.session.userId
      }
      record = await record.apiUpdate(data.params)
      const hash = record.calculateHash()
      api.log('looking for %s with hash %s', 'info', form.modelName, hash)
      const existing = await api.models[ form.modelName ].findOne({ where: { hash: hash } })
      if (existing) {
        api.log('found %s with hash %s, updating', 'info', form.modelName, hash)
        data.response.existing = true
        await existing.apiUpdate(data.params)
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
      let record = await form.retrieveRecord(api, data)
      await record.apiUpdate(data.params)
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
      let record = await form.retrieveRecord(api, data)
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
      let record = await form.retrieveRecord(api, data)
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
      let query = await form.prepareQuery(api, data)

      // fetch the results
      let result = await api.models[ form.modelName ].findAndCountAll(query)

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
      let outputType = data.params.outputType

      if (!data.session.user.isAdmin && !api.forms.isModerator(data.session.user, form.modelName) && data.session.userId !== data.params.user) {
        data.response.success = false
        data.response.error = 'No permission'
        return next()
      }

      let query = await form.prepareQuery(api, data)

      api.tasks.enqueue('form:export', {
        query,
        outputType,
        user: data.session.user,
        formName: form.modelName
      }, 'low', (error, success) => {
        if (error) return next(error)
        data.response.success = success
        next()
      })
    } catch (error) {
      api.log(error, 'error')
      next(error)
    }
  }
}

function generateFormActions (form) {
  const actions = {}

  if (!form || !form.modelName) return actions

  let insertInputs = {}
  let editInputs = {
    id: { required: true }
  }
  let listInputs = _.extend({
    user: {},
    limit: { default: 20 },
    offset: { default: 0 },
    location: {},
    from_date: {},
    to_date: {},
    context: {}
  }, form.model.associations.speciesInfo ? { species: {} } : {}, form.listInputs || {})

  let exportInputs = _.extend({}, listInputs, {
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
    if (field.private) return
    insertInputs[ fieldName ] = {
      required: field.required && fieldName !== 'user'
    }
    editInputs[ fieldName ] = {}
  })

  actions.formAdd = {
    name: `${form.modelName}:create`,
    description: `${form.modelName}:create`,
    middleware: [ 'auth' ],
    inputs: insertInputs,
    run: generateInsertAction(form)
  }

  actions.formEdit = {
    name: `${form.modelName}:edit`,
    description: `${form.modelName}:edit`,
    middleware: [ 'auth' ],
    inputs: editInputs,
    run: generateEditAction(form)
  }

  actions.formView = {
    name: `${form.modelName}:view`,
    description: `${form.modelName}:view`,
    middleware: [ 'auth' ],
    inputs: { id: { required: true } },
    run: generateViewAction(form)
  }

  actions.formDelete = {
    name: `${form.modelName}:delete`,
    description: `${form.modelName}:delete`,
    middleware: [ 'auth' ],
    inputs: { id: { required: true } },
    run: generateDeleteAction(form)
  }

  actions.formList = {
    name: `${form.modelName}:list`,
    description: `${form.modelName}:list`,
    middleware: [ 'auth' ],
    inputs: listInputs,
    run: generateListAction(form)
  }

  actions.formExport = {
    name: `${form.modelName}:export`,
    description: `${form.modelName}:export`,
    middleware: [ 'auth' ],
    inputs: exportInputs,
    run: generateExportAction(form)
  }

  return actions
}

module.exports = {
  // after actions and before params
  loadPriority: 411,
  initialize: function (api, next) {
    api.log('Registering form actions', 'info')
    _.forEach(api.forms, (form, name) => {
      const collection = generateFormActions(form)
      api.log(`Registering actions for ${name} form`, 'info')
      _.forEach(collection, action => {
        if (action.version === null || action.version === undefined) {
          action.version = 1.0
        }
        if (api.actions.actions[ action.name ] === null || api.actions.actions[ action.name ] === undefined) {
          api.actions.actions[ action.name ] = {}
        }
        api.actions.actions[ action.name ][ action.version ] = action
        if (api.actions.versions[ action.name ] === null || api.actions.versions[ action.name ] === undefined) {
          api.actions.versions[ action.name ] = []
        }
        api.actions.versions[ action.name ].push(action.version)
        api.actions.versions[ action.name ].sort()
        api.actions.validateAction(api.actions.actions[ action.name ][ action.version ])
        api.log(`Registering ${action.name}@${action.version}`, 'info')
      })
    })

    next()
  }
}
