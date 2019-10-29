const { promisify } = require('util')
const { Initializer, Action, Task, api } = require('actionhero')

let counter = 1
const upgradeInitializer = (version, legacyInitializer) => {
  if (version === 'ah17') {
    const clazz = class UpgradedInitializer extends Initializer {
      constructor () {
        super()
        this.name = legacyInitializer.name || `LegacyInitializer_${version}_${counter++}`
        this.loadPriority = legacyInitializer.loadPriority || this.loadPriority
        this.startPriority = legacyInitializer.startPriority || this.startPriority
        this.stopPriority = legacyInitializer.stopPriority || this.stopPriority
      }
    }

    if (legacyInitializer.start instanceof Function) {
      clazz.prototype.start = promisify(legacyInitializer.start).bind(null, api)
    }
    if (legacyInitializer.stop instanceof Function) {
      clazz.prototype.stop = promisify(legacyInitializer.stop).bind(null, api)
    }
    if (legacyInitializer.initialize instanceof Function) {
      clazz.prototype.initialize = promisify(legacyInitializer.initialize).bind(null, api)
    }

    return clazz
  }

  throw new Error(`Unsupported legacy verion ${version}`)
}

const upgradeAction = (version, legacyAction) => {
  if (version === 'ah17') {
    const clazz = class UpgradedAction extends Action {
      constructor () {
        super()
        this.name = legacyAction.name
        this.description = legacyAction.description || this.description
        this.outputExample = legacyAction.outputExample || this.outputExample
        this.inputs = legacyAction.inputs || this.inputs
        this.middleware = legacyAction.middleware || this.middleware
        this.blockedConnectionTypes = legacyAction.blockedConnectionTypes || this.blockedConnectionTypes
        this.logLevel = legacyAction.logLevel || this.logLevel
        this.matchExtensionMimeType = legacyAction.matchExtensionMimeType || this.matchExtensionMimeType
        this.toDocument = legacyAction.toDocument || this.toDocument
      }
    }

    if (legacyAction.run instanceof Function) {
      const legacyRun = promisify(legacyAction.run)
      clazz.prototype.run = async (data) => {
        // unfreeze params - used in some actions to set user id to current user
        data.params = { ...data.params }
        return legacyRun(api, data)
      }
    }

    return clazz
  }

  throw new Error(`Unsupported legacy verion ${version}`)
}

const upgradeTask = (version, legacyTask) => {
  if (version === 'ah17') {
    const clazz = class UpgradedTask extends Task {
      constructor () {
        super()
        this.name = legacyTask.name
        this.description = legacyTask.description || this.description
        this.frequency = legacyTask.frequency || this.frequency
        this.queue = legacyTask.queue || this.queue
        this.middleware = legacyTask.middleware || this.middleware
        this.reEnqueuePeriodicTaskIfException = legacyTask.reEnqueuePeriodicTaskIfException || this.reEnqueuePeriodicTaskIfException
      }
    }

    if (legacyTask.run instanceof Function) {
      const legacyRun = promisify(legacyTask.run)
      clazz.prototype.run = (data, self) => legacyRun.call(self, api, data)
    }

    return clazz
  }

  throw new Error(`Unsupported legacy verion ${version}`)
}

const upgradeMiddleware = (version, legacyMiddleware) => {
  if (version === 'ah17') {
    if (legacyMiddleware.preProcessor instanceof Function) {
      legacyMiddleware.preProcessor = promisify(legacyMiddleware.preProcessor)
    }
    if (legacyMiddleware.postProcessor instanceof Function) {
      legacyMiddleware.postProcessor = promisify(legacyMiddleware.postProcessor)
    }

    return legacyMiddleware
  }

  throw new Error(`Unsupported legacy verion ${version}`)
}

module.exports = {
  upgradeInitializer,
  upgradeAction,
  upgradeTask,
  upgradeMiddleware
}
