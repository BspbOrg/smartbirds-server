const { Task, api } = require('actionhero')
const fs = require('fs')
const path = require('path')
const { promisify } = require('util')
const writeFile = promisify(fs.writeFile)

module.exports = class PublicStatTask extends Task {
  constructor () {
    super()
    this.queue = 'default'
  }

  async generateStats (data, worker) {
    throw new Error(`You need to implement generateStats in ${this.name}!`)
  }

  async run (data, worker) {
    const stats = await this.generateStats(data, worker)

    await Promise.all(Object.entries(stats).map(async ([name, stat]) => {
      const filename = path.join(api.config.general.paths.public[0], `${name}.json`)
      const content = JSON.stringify(await stat)
      return writeFile(filename, content)
    }))
  }
}
