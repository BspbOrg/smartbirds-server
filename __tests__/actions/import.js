/* eslint-env node, jest */
/* globals setup */

const forms = require('../../__utils__/forms.js')
const userFactory = require('../../__utils__/factories/userFactory')
const _ = require('lodash')

const formsWithGenerators = forms.map((form) => {
  return {
    name: form,
    generator: require(`../../__utils__/factories/${form}Factory.js`)
  }
})

// Temporary skip all tests
describe('Import', () => {
  afterEach(() => {
    return Promise.all(forms.map(form => {
      return setup.api.models[form].destroy({
        force: true,
        where: {}
      })
    }))
  })

  const roles = ['user', 'admin']

  roles.forEach((role) => {
    setup[`describeAs${_.capitalize(role.toLowerCase())}`]((specs) => {
      test.each(formsWithGenerators.map(form => [form.name, form]))('imports %s records', async (name, form) => {
        const user = await userFactory(setup.api, { role })

        const records = []
        for (let i = 0; i < 5; i++) {
          const recordData = await form.generator(setup.api, { notes: 'from import' }, { create: false, apiInsertFormat: true })
          records.push(recordData)
        }

        await setup.api.tasks.tasks['form:import'].run(
          {
            params: { items: records, user: user.id, language: 'en' },
            user,
            formName: form.name
          }
        )

        const expectedItems = await setup.api.models[form.name].findAll({ where: { notes: 'from import' } })
        expect(expectedItems.length).toBe(5)
      })
    })
  })
})
