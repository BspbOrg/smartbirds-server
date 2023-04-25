/* global describe, before, after, it */

const _ = require('lodash')
const should = require('should')
const setup = require('../_setup')
const generators = require('../helpers/generators')

require('should-sinon')

const forms = [
  'formBirds'
  // 'formCBM',
  // 'formCiconia',
  // 'formHerptiles',
  // 'formInvertebrates',
  // 'formMammals',
  // 'formPlants',
  // 'formThreats'
]

describe('Import', () => {
  before(async () => {
    await setup.init()
  })

  after(async () => {
    await setup.finish()
  })

  forms.forEach((form) => {
    setup.describeAsUser(function (runAction) {
      it(`imports ${form} records`, function () {
        const itemsToImport = []
        for (let i = 0; i < 5; i++) {
          itemsToImport.push(generators[form]({ notes: 'from import' }))
        }

        return runAction(`${form}:import`, { items: itemsToImport }).then(function (response) {
          should.not.exist(response.error)
          return setup.api.models[form].findAll({ where: { notes: 'from import' } }).then(function (items) {
            items.length.should.be.equal(5)
          })
        })
      })
    })
  })
})
