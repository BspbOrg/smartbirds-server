/* globals describe */

const _ = require('lodash')
const path = require('path')
const fs = require('fs')
const ActionHero = require('actionhero')
const util = require('util')

const setup = {
  server: new ActionHero.Process(),

  init: async () => {
    console.log('    starting test server...')
    setup.api = await setup.server.start()
    return setup.api
  },
  finish: async () => {
    try {
      await setup.server.stop()
    } catch (e) {
      console.warn('Failure while shutting down server', e)
    }
  },
  runAction: async (action, params) => {
    let connection
    if (!params) { params = {} }
    if (params.id && params.type === 'testServer') {
      connection = params
    } else {
      connection = await setup.api.specHelper.Connection.createAsync()
      connection.params = params
    }
    const actionResponse = await setup.api.specHelper.runAction(action, connection)
    actionResponse.responseHttpCode = connection.rawConnection.responseHttpCode
    return actionResponse
  },
  runActionAs: async (action, params, user) => {
    const conn = await setup.api.specHelper.Connection.createAsync()
    conn.params = {
      email: user,
      password: 'secret'
    }
    const response = await setup.runAction('session:create', conn)
    if (!response.csrfToken) {
      throw new Error(`Missing csrfToken in response of session:create. Got:\n${JSON.stringify(response, null, '\t')}`)
    }
    conn.params = _.assign({}, params)
    conn.rawConnection.req = { headers: { 'x-sb-csrf-token': response.csrfToken } }
    const actionResponse = await setup.runAction(action, conn)
    actionResponse.requesterUser = response.user
    return actionResponse
  },
  runActionAsAdmin: (action, params) => setup.runActionAs(action, params, 'admin@smartbirds.com'),
  runActionAsUser: (action, params) => setup.runActionAs(action, params, 'user@smartbirds.com'),
  runActionAsUser2: (action, params) => setup.runActionAs(action, params, 'user2@smartbirds.com'),
  runActionAsBirds: (action, params) => setup.runActionAs(action, params, 'birds@smartbirds.com'),
  runActionAsCbm: (action, params) => setup.runActionAs(action, params, 'cbm@smartbirds.com'),
  runActionAsGuest: (action, params) => setup.runAction(action, params),
  describeAs: (name, runAction, specs) => (global.describe || setup.global.describe)(name, () => specs(runAction.bind(setup))),
  describeAsGuest: (specs) => setup.describeAs('guest', setup.runActionAsGuest, specs),
  describeAsUser: (specs) => setup.describeAs('user', setup.runActionAsUser, specs),
  describeAsUser2: (specs) => setup.describeAs('user2', setup.runActionAsUser2, specs),
  describeAsAdmin: (specs) => setup.describeAs('admin', setup.runActionAsAdmin, specs),
  describeAsBirds: (specs) => setup.describeAs('birds moderator', setup.runActionAsBirds, specs),
  describeAsCbm: (specs) => setup.describeAs('cbm moderator', setup.runActionAsCbm, specs),
  describeAsAuth: (specs) => setup.describeAsRoles(['user', 'admin', 'birds', 'cbm'], specs),
  describeAsRoles: (roles, specs) => Promise.all(roles.map((role) =>
    setup[`describeAs${_.capitalize(role.toLowerCase())}`](specs)
  )),
  describeAllRoles: (specs) => setup.describeAsRoles(['guest', 'user', 'admin', 'birds', 'cbm'], specs),
  createUser: async (
    {
      role = 'user',
      forms = {},
      password = 'secret',
      gdprConsent = true,
      ...user
    }
  ) => {
    const response = await setup.runActionAsGuest('user:create', {
      ...user,
      gdprConsent,
      password
    })
    if (response.error) {
      throw new Error(response.error)
    }

    if (role === 'user') {
      return response.data
    }

    const updated = await setup.runActionAsAdmin('user:edit', {
      id: response.data.id,
      role,
      forms
    })

    if (updated.error) {
      throw new Error(updated.error)
    }

    return updated.data
  },
  jestEach: (method, parameters) => (name, op) => {
    parameters.forEach(([nameParameter, ...params]) => {
      method(util.format(name, nameParameter), () => op(nameParameter, ...params))
    })
  }
}

function capitalizeFirstLetter (string) {
  return string.charAt(0).toUpperCase() + string.slice(1)
}

const filenameToFormName = (filename) =>
  `form${capitalizeFirstLetter(path.basename(filename, '.js'))}`

function staticInit () {
  // load forms info
  setup.forms = {}
  const dir = path.normalize(path.join(__dirname, '..', 'server', 'forms'))
  fs.readdirSync(dir).forEach(function (file) {
    if (file.charAt(0) === '_') return
    const filename = path.join(dir, file)
    const form = require(filename)
    form.modelName = form.modelName || filenameToFormName(filename)
    setup.forms[form.modelName] = form
  })
}

staticInit()
module.exports = setup
