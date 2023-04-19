const { Action } = require('actionhero')

exports.importFromCsv = class ImportFromCsv extends Action {
  constructor () {
    super()
    this.name = 'import'
    this.description = 'import'
    this.middleware = ['auth']
    this.inputs = {
      form: { required: true },
      data: { required: true }
    }
  }

  async run (data) {
    data.response.data = {
      success: true
    }
  }
}
