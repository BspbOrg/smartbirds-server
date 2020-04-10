/* eslint-env mocha */

const {Process} = require('actionhero')
const languages = require('../../config/languages')
require('should')

const Actionhero = new Process()

describe('organization model', () => {
  it('can create with all label fields', async () => {
    const api = await Actionhero.start()

    const base = {
      slug: 'org'
    }
    Object.keys(languages).forEach((lang) => {
      base[`label${lang.substr(0, 1).toUpperCase()}${lang.substr(1)}`] = `label ${lang}`
    })

    const written = await api.models.organization.create(base)

    Object.keys(languages).forEach((lang) => {
      written.should.have.property(`label${lang.substr(0, 1).toUpperCase()}${lang.substr(1)}`, `label ${lang}`)
    })

    await Actionhero.stop()
  })
})
