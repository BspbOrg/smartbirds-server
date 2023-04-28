/* eslint-env node, jest */
/* globals setup */

const forms = require('../../__utils__/forms.js')

const formsWithGenerators = forms.map((form) => {
  return {
    name: form,
    generator: require(`../../__utils__/factories/${form}Factory.js`)
  }
})

describe('Import', () => {
  afterEach(() => {
    return Promise.all(forms.map(form => {
      return setup.api.models[form].destroy({
        force: true,
        where: {}
      })
    }))
  })

  setup.describeAsAuth((runAction) => {
    test.each(formsWithGenerators.map(form => [form.name, form]))('imports %s records', async (name, form) => {
      const records = []
      for (let i = 0; i < 5; i++) {
        const recordData = await form.generator(setup.api, { notes: 'from import' }, { create: false })
        records.push(recordData)
      }

      return runAction(`${form.name}:import`, { items: records }).then(function (response) {
        return setup.api.models[form.name].findAll({ where: { notes: 'from import' } }).then(function (items) {
          expect(items.length).toBe(5)
        })
      })
    })
  })
})
