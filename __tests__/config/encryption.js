/* eslint-env node, jest */

const crypto = require('crypto')

describe('Encryption Configuration', () => {
  describe('Action name regex', () => {
    let config
    let regex

    beforeEach(() => {
      // Set up encryption config
      process.env.API_ENCRYPTION_KEY = crypto.randomBytes(32).toString('base64')
      process.env.API_ENCRYPTION_ENABLED = 'true'

      // Clear cache and load config
      delete require.cache[require.resolve('../../server/config/encryption')]
      config = require('../../server/config/encryption')
      const result = config.default.encryption({ config: {} })
      regex = result.actionNameRegex
    })

    it('matches form list actions', () => {
      expect(regex.test('formBirds:list')).toBe(true)
      expect(regex.test('formCBM:list')).toBe(true)
      expect(regex.test('formMammals:list')).toBe(true)
    })

    it('matches form view actions', () => {
      expect(regex.test('formBirds:view')).toBe(true)
      expect(regex.test('formCBM:view')).toBe(true)
      expect(regex.test('formMammals:view')).toBe(true)
    })

    it('does not match form create actions', () => {
      expect(regex.test('formBirds:create')).toBe(false)
      expect(regex.test('formCBM:create')).toBe(false)
      expect(regex.test('formMammals:create')).toBe(false)
    })

    it('does not match form update actions', () => {
      expect(regex.test('formBirds:update')).toBe(false)
      expect(regex.test('formCBM:update')).toBe(false)
      expect(regex.test('formMammals:update')).toBe(false)
    })

    it('does not match form delete actions', () => {
      expect(regex.test('formBirds:delete')).toBe(false)
      expect(regex.test('formCBM:delete')).toBe(false)
      expect(regex.test('formMammals:delete')).toBe(false)
    })

    it('does not match non-form actions', () => {
      expect(regex.test('session:create')).toBe(false)
      expect(regex.test('user:view')).toBe(false)
      expect(regex.test('user:list')).toBe(false)
      expect(regex.test('nomenclature:list')).toBe(false)
    })

    it('requires capital letter after "form"', () => {
      expect(regex.test('form:list')).toBe(false)
      expect(regex.test('format:list')).toBe(false)
    })
  })
})
