/* globals describe */

const _ = require('lodash')
const path = require('path')
const fs = require('fs')
const ActionHero = require('actionhero')

const setup = {
  server: new ActionHero.Process(),

  init: async () => {
    console.log('    starting test server...')
    setup.api = await setup.server.start()
    return setup.api
  },
  finish: () => setup.server.stop(),
  runAction: (action, params) => setup.api.specHelper.runAction(action, params),
  runActionAs: async (action, params, user) => {
    const conn = await setup.api.specHelper.Connection.createAsync()
    conn.params = {
      email: user,
      password: 'secret'
    }
    const response = await setup.runAction('session:create', conn)
    response.should.have.property('csrfToken').and.not.be.empty()
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
  describeAs: (name, runAction, specs) => describe(name, () => specs(runAction.bind(setup))),
  describeAsGuest: (specs) => setup.describeAs('guest', setup.runActionAsGuest, specs),
  describeAsUser: (specs) => setup.describeAs('user', setup.runActionAsUser, specs),
  describeAsAdmin: (specs) => setup.describeAs('admin', setup.runActionAsAdmin, specs),
  describeAsBirds: (specs) => setup.describeAs('birds moderator', setup.runActionAsBirds, specs),
  describeAsCbm: (specs) => setup.describeAs('cbm moderator', setup.runActionAsCbm, specs),
  describeAsAuth: (specs) => setup.describeAsRoles(['user', 'admin', 'birds', 'cbm'], specs),
  describeAsRoles: (roles, specs) => Promise.all(roles.map((role) =>
    setup[`describeAs${_.capitalize(role.toLowerCase())}`](specs)
  )),
  describeAllRoles: (specs) => setup.describeAsRoles(['guest', 'user', 'admin', 'birds', 'cbm'], specs)
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
