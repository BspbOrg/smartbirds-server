/* global describe, before, after, it */

const setup = require('../_setup')
const should = require('should')

const forEachForm = (prepare, act, assert) =>
  Object
    .keys(setup.api.forms)
    .filter((formKey, idx) => idx === 4 && setup.api.forms[formKey].$isForm)
    .reduce(async (prev, formKey) => {
      await prev
      const form = setup.api.forms[formKey]
      const model = form.model
      const action = `${form.modelName}:list`

      const row = await model.findOne()
      should(row).not.equal(null, `missing row for ${form.modelName}`)

      const prepared = await prepare({ formKey, form, model, action, row })

      const params = await act({ formKey, form, model, action, prepared })
      const response = await setup.runActionAsAdmin(action, params)
      should(response).not.have.property('error')
      should(response).have.property('data')

      await assert({ formKey, form, model, action, prepared, params, response })
    }, Promise.resolve())

const cloneModel = async (model) => {
  const clone = model.constructor.build({})
  await clone.apiUpdate(await model.apiData(), 'lng')
  clone.id = null
  return clone
}

describe('Auto location', () => {
  before(async () => {
    await setup.init()
  })

  after(async () => {
    console.log('\n\n\n\n\n\n')
    await setup.finish()
  })

  it('can filter on any form by en value', async () => {
    await forEachForm(
      async ({ row }) => {
        const rowMatch = await cloneModel(row)
        rowMatch.autoLocationEn = 'auto location en'
        await rowMatch.save()

        const rowNoMatch = await cloneModel(row)
        rowNoMatch.autoLocationEn = 'auto location no en'
        await rowNoMatch.save()

        return { rowMatch, rowNoMatch }
      },
      () => ({ auto_location: 'auto location en' }),
      ({ response, prepared: { rowMatch, rowNoMatch } }) => {
        response.data.should.containDeep([{ id: rowMatch.id }])
        response.data.should.not.containDeep([{ id: rowNoMatch.id }])
      }
    )
  })

  it('can filter on any form by en start value', async () => {
    await forEachForm(
      async ({ row }) => {
        const rowMatch = await cloneModel(row)
        rowMatch.autoLocationEn = 'auto location en'
        await rowMatch.save()

        const rowNoMatch = await cloneModel(row)
        rowNoMatch.autoLocationEn = 'no auto location en'
        await rowNoMatch.save()

        return { rowMatch, rowNoMatch }
      },
      () => ({ auto_location: 'auto location' }),
      ({ response, prepared: { rowMatch, rowNoMatch } }) => {
        response.data.should.containDeep([{ id: rowMatch.id }])
        response.data.should.not.containDeep([{ id: rowNoMatch.id }])
      }
    )
  })

  it('can filter on any form by local value', async () => {
    await forEachForm(
      async ({ row }) => {
        const rowMatch = await cloneModel(row)
        rowMatch.autoLocationLocal = 'auto location local'
        await rowMatch.save()

        const rowNoMatch = await cloneModel(row)
        rowNoMatch.autoLocationLocal = 'auto location no local'
        await rowNoMatch.save()

        return { rowMatch, rowNoMatch }
      },
      () => ({ auto_location: 'auto location local' }),
      ({ response, prepared: { rowMatch, rowNoMatch } }) => {
        response.data.should.containDeep([{ id: rowMatch.id }])
        response.data.should.not.containDeep([{ id: rowNoMatch.id }])
      }
    )
  })

  it('can filter on any form by local start value', async () => {
    await forEachForm(
      async ({ row }) => {
        const rowMatch = await cloneModel(row)
        rowMatch.autoLocationLocal = 'auto location local'
        await rowMatch.save()

        const rowNoMatch = await cloneModel(row)
        rowNoMatch.autoLocationLocal = 'no auto location local'
        await rowNoMatch.save()

        return { rowMatch, rowNoMatch }
      },
      () => ({ auto_location: 'auto location' }),
      ({ response, prepared: { rowMatch, rowNoMatch } }) => {
        response.data.should.containDeep([{ id: rowMatch.id }])
        response.data.should.not.containDeep([{ id: rowNoMatch.id }])
      }
    )
  })

  it('can filter on any form for EMPTY', async () => {
    await forEachForm(
      async ({ row }) => {
        const rowMatch = await cloneModel(row)
        rowMatch.autoLocationEn = ''
        await rowMatch.save()

        const rowNoMatch = await cloneModel(row)
        rowNoMatch.autoLocationEn = 'EMPTY'
        await rowNoMatch.save()

        const rowNoMatch2 = await cloneModel(row)
        rowNoMatch.autoLocationEn = null
        await rowNoMatch.save()

        return { rowMatch, rowNoMatch, rowNoMatch2 }
      },
      () => ({ auto_location: 'EMPTY' }),
      ({ response, prepared: { rowMatch, rowNoMatch, rowNoMatch2 } }) => {
        response.data.should.containDeep([{ id: rowMatch.id }])
        response.data.should.not.containDeep([{ id: rowNoMatch.id }])
        response.data.should.not.containDeep([{ id: rowNoMatch2.id }])
      }
    )
  })

  it('can filter on any form for NULL', async () => {
    await forEachForm(
      async ({ row }) => {
        const rowMatch = await cloneModel(row)
        rowMatch.autoLocationEn = null
        await rowMatch.save()

        const rowNoMatch = await cloneModel(row)
        rowNoMatch.autoLocationEn = 'NULL'
        await rowNoMatch.save()

        const rowNoMatch2 = await cloneModel(row)
        rowNoMatch.autoLocationEn = ''
        await rowNoMatch.save()

        return { rowMatch, rowNoMatch, rowNoMatch2 }
      },
      () => ({ auto_location: 'NULL' }),
      ({ response, prepared: { rowMatch, rowNoMatch, rowNoMatch2 } }) => {
        response.data.should.containDeep([{ id: rowMatch.id }])
        response.data.should.not.containDeep([{ id: rowNoMatch.id }])
        response.data.should.not.containDeep([{ id: rowNoMatch2.id }])
      }
    )
  })
})
