const NodeEnvironment = require('jest-environment-node')
const setup = require('../../test/_setup')

class ActionheroEnvironment extends NodeEnvironment {
  async setup () {
    await super.setup()

    setup.global = this.global
    this.global.api = await setup.init()
    this.global.setup = setup
  }

  async teardown () {
    await setup.finish()
    await super.teardown()
  }
}

module.exports = ActionheroEnvironment
