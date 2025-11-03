/* eslint-env node, jest */
/* globals setup */

const crypto = require('crypto')
const formBirdsFactory = require('../../__utils__/factories/formBirdsFactory')
const speciesFactory = require('../../__utils__/factories/speciesFactory')

const { api } = setup

describe('Response Encryption', () => {
  let species

  // Helper to run action as user with custom headers (e.g., encryption accept header)
  // Extends setup.runActionAsUser to support additional headers
  async function runActionAsUserWithHeaders (action, params, customHeaders = {}) {
    const conn = await api.specHelper.Connection.createAsync()
    conn.params = { email: 'user@smartbirds.com', password: 'secret' }
    const response = await setup.runAction('session:create', conn)

    conn.params = Object.assign({}, params)
    conn.rawConnection.req = {
      headers: {
        'x-sb-csrf-token': response.csrfToken,
        ...customHeaders
      }
    }
    return setup.runAction(action, conn)
  }

  // Helper to decrypt encrypted response envelope
  function decryptResponse (envelope, key, algorithm = 'aes-256-gcm') {
    const iv = Buffer.from(envelope.iv, 'base64')
    const tag = Buffer.from(envelope.tag, 'base64')
    const ciphertext = Buffer.from(envelope.payload, 'base64')

    const decipher = crypto.createDecipheriv(algorithm, key, iv)
    decipher.setAuthTag(tag)

    const plaintext = Buffer.concat([
      decipher.update(ciphertext),
      decipher.final()
    ])

    return JSON.parse(plaintext.toString('utf8'))
  }

  beforeAll(async () => {
    species = await speciesFactory(api, 'birds')
  })

  afterAll(async () => {
    await api.models.formBirds.destroy({ force: true, where: {} })
  })

  describe('Encryption Middleware', () => {
    describe('When encryption is disabled', () => {
      let originalEnabled
      let testRecord

      beforeAll(() => {
        originalEnabled = api.config.encryption.enabled
        api.config.encryption.enabled = false
      })

      afterAll(() => {
        api.config.encryption.enabled = originalEnabled
      })

      beforeEach(async () => {
        testRecord = await formBirdsFactory(api, {
          user: 'user@smartbirds.com',
          species: species.labelLa
        })
      })

      afterEach(async () => {
        if (testRecord) {
          await testRecord.destroy({ force: true })
        }
      })

      setup.describeAsUser((runAction) => {
        it('does not encrypt formBirds:list response', async () => {
          const response = await runAction('formBirds:list', {})
          expect(response.error).toBeFalsy()
          expect(Array.isArray(response.data)).toBe(true)
          // Check that data is not encrypted (no __enc property)
          if (response.data.length > 0) {
            expect(response.data[0]).not.toHaveProperty('__enc')
          }
        })

        it('does not encrypt formBirds:view response', async () => {
          const response = await runAction('formBirds:view', { id: testRecord.id })
          expect(response.error).toBeFalsy()
          expect(response.data).toBeDefined()
          expect(typeof response.data).toBe('object')
          expect(response.data).not.toHaveProperty('__enc')
          expect(response.data).toHaveProperty('id', testRecord.id)
        })
      })
    })

    describe('When encryption is enabled', () => {
      let originalEnabled
      let originalKey
      let originalKid

      beforeAll(() => {
        originalEnabled = api.config.encryption.enabled
        originalKey = api.config.encryption.key
        originalKid = api.config.encryption.kid
        api.config.encryption.enabled = true
        // Use a test encryption key (32 bytes)
        api.config.encryption.key = crypto.randomBytes(32)
        api.config.encryption.kid = 'test-key-1'
      })

      afterAll(() => {
        api.config.encryption.enabled = originalEnabled
        api.config.encryption.key = originalKey
        api.config.encryption.kid = originalKid
      })

      describe('Without requireClientHeader', () => {
        let originalRequireHeader
        let testRecord

        beforeAll(() => {
          originalRequireHeader = api.config.encryption.requireClientHeader
          api.config.encryption.requireClientHeader = false
        })

        afterAll(() => {
          api.config.encryption.requireClientHeader = originalRequireHeader
        })

        beforeEach(async () => {
          testRecord = await formBirdsFactory(api, {
            user: 'user@smartbirds.com',
            species: species.labelLa
          })
        })

        afterEach(async () => {
          if (testRecord) {
            await testRecord.destroy({ force: true })
          }
        })

        setup.describeAsUser((runAction) => {
          it('encrypts formBirds:list response', async () => {
            const response = await runAction('formBirds:list', {})
            expect(response.error).toBeFalsy()
            expect(response).toHaveProperty('data')
            expect(response.data).toHaveProperty('__enc', true)
            expect(response.data).toHaveProperty('alg', 'A256GCM')
            expect(response.data).toHaveProperty('kid', 'test-key-1')
            expect(response.data).toHaveProperty('iv')
            expect(response.data).toHaveProperty('tag')
            expect(response.data).toHaveProperty('payload')
          })

          it('encrypts formBirds:view response', async () => {
            const response = await runAction('formBirds:view', { id: testRecord.id })
            expect(response.error).toBeFalsy()
            expect(response).toHaveProperty('data')
            expect(response.data).toHaveProperty('__enc', true)
            expect(response.data).toHaveProperty('alg', 'A256GCM')
            expect(response.data).toHaveProperty('kid', 'test-key-1')
            expect(response.data).toHaveProperty('iv')
            expect(response.data).toHaveProperty('tag')
            expect(response.data).toHaveProperty('payload')
          })

          it('does not encrypt non-matching actions', async () => {
            const response = await setup.runActionAsUser('session:check', {})
            expect(response.error).toBeFalsy()
            expect(response).toHaveProperty('user')
            expect(response.user).not.toHaveProperty('__enc')
          })

          it('does not encrypt responses with errors', async () => {
            const response = await runAction('formBirds:view', { id: 999999 })
            expect(response.error).toBeTruthy()
            // Error responses should not be encrypted
            expect(response).not.toHaveProperty('data')
          })

          it('keeps count and metadata unencrypted in list responses', async () => {
            const response = await runAction('formBirds:list', {})
            expect(response.error).toBeFalsy()
            // Count should remain unencrypted if present
            if (response.count !== undefined) {
              expect(typeof response.count).toBe('number')
            }
            // Only data property should be encrypted
            expect(response.data).toHaveProperty('__enc', true)
          })
        })
      })

      describe('With requireClientHeader enabled', () => {
        let originalRequireHeader
        let testRecord

        beforeAll(() => {
          originalRequireHeader = api.config.encryption.requireClientHeader
          api.config.encryption.requireClientHeader = true
        })

        afterAll(() => {
          api.config.encryption.requireClientHeader = originalRequireHeader
        })

        beforeEach(async () => {
          testRecord = await formBirdsFactory(api, {
            user: 'user@smartbirds.com',
            species: species.labelLa
          })
        })

        afterEach(async () => {
          if (testRecord) {
            await testRecord.destroy({ force: true })
          }
        })

        it('does not encrypt without client header', async () => {
          // Call without the encryption accept header
          const response = await runActionAsUserWithHeaders('formBirds:list', {})

          expect(response.error).toBeFalsy()
          expect(Array.isArray(response.data)).toBe(true)
          // Should not be encrypted without header
          if (response.data.length > 0) {
            expect(response.data[0]).not.toHaveProperty('__enc')
          }
        })

        it('encrypts with client header present', async () => {
          // Call with the encryption accept header
          const response = await runActionAsUserWithHeaders('formBirds:list', {}, {
            'x-sb-accept-encrypted': '1'
          })

          expect(response.error).toBeFalsy()
          expect(response.data).toHaveProperty('__enc', true)
        })

        it('encrypts with case-insensitive header', async () => {
          // Call with the encryption accept header (uppercase)
          const response = await runActionAsUserWithHeaders('formBirds:list', {}, {
            'X-SB-Accept-Encrypted': '1'
          })

          expect(response.error).toBeFalsy()
          expect(response.data).toHaveProperty('__enc', true)
        })
      })
    })
  })

  describe('Encryption/Decryption', () => {
    const testKey = crypto.randomBytes(32)
    const testKid = 'test-key'
    const testAlgorithm = 'aes-256-gcm'

    function encryptPayload (plaintext) {
      const iv = crypto.randomBytes(12)
      const cipher = crypto.createCipheriv(testAlgorithm, testKey, iv)
      const ciphertext = Buffer.concat([
        cipher.update(Buffer.from(plaintext, 'utf8')),
        cipher.final()
      ])
      const tag = cipher.getAuthTag()

      return {
        __enc: true,
        alg: 'A256GCM',
        kid: testKid,
        iv: iv.toString('base64'),
        tag: tag.toString('base64'),
        payload: ciphertext.toString('base64')
      }
    }

    it('can encrypt and decrypt simple object', () => {
      const original = { id: 1, name: 'test', value: 42 }
      const encrypted = encryptPayload(JSON.stringify(original))

      expect(encrypted).toHaveProperty('__enc', true)
      expect(encrypted).toHaveProperty('alg', 'A256GCM')
      expect(encrypted).toHaveProperty('iv')
      expect(encrypted).toHaveProperty('tag')
      expect(encrypted).toHaveProperty('payload')

      const decrypted = decryptResponse(encrypted, testKey, testAlgorithm)
      expect(decrypted).toEqual(original)
    })

    it('can encrypt and decrypt array of objects', () => {
      const original = [
        { id: 1, name: 'first' },
        { id: 2, name: 'second' },
        { id: 3, name: 'third' }
      ]
      const encrypted = encryptPayload(JSON.stringify(original))
      const decrypted = decryptResponse(encrypted, testKey, testAlgorithm)
      expect(decrypted).toEqual(original)
    })

    it('can encrypt and decrypt complex nested object', () => {
      const original = {
        id: 1,
        species: { labelLa: 'Aquila heliaca', labelBg: 'Царски орел' },
        location: { latitude: 42.5, longitude: 23.5 },
        metadata: { notes: 'Test observation', confidential: false },
        tags: ['tag1', 'tag2']
      }
      const encrypted = encryptPayload(JSON.stringify(original))
      const decrypted = decryptResponse(encrypted, testKey, testAlgorithm)
      expect(decrypted).toEqual(original)
    })

    it('generates unique IV for each encryption', () => {
      const data = JSON.stringify({ test: 'data' })
      const encrypted1 = encryptPayload(data)
      const encrypted2 = encryptPayload(data)

      // IVs should be different
      expect(encrypted1.iv).not.toBe(encrypted2.iv)
      // But both should decrypt to same value
      expect(decryptResponse(encrypted1, testKey, testAlgorithm)).toEqual(decryptResponse(encrypted2, testKey, testAlgorithm))
    })

    it('fails to decrypt with wrong key', () => {
      const original = { test: 'data' }
      const encrypted = encryptPayload(JSON.stringify(original))

      // Try to decrypt with wrong key
      const wrongKey = crypto.randomBytes(32)
      const iv = Buffer.from(encrypted.iv, 'base64')
      const tag = Buffer.from(encrypted.tag, 'base64')
      const ciphertext = Buffer.from(encrypted.payload, 'base64')

      const decipher = crypto.createDecipheriv(testAlgorithm, wrongKey, iv)
      decipher.setAuthTag(tag)

      expect(() => {
        decipher.update(ciphertext)
        decipher.final()
      }).toThrow()
    })

    it('handles unicode characters correctly', () => {
      const original = {
        labelBg: 'Царски орел',
        labelEn: 'Imperial Eagle',
        notes: 'Наблюдение в парк 🦅'
      }
      const encrypted = encryptPayload(JSON.stringify(original))
      const decrypted = decryptResponse(encrypted, testKey, testAlgorithm)
      expect(decrypted).toEqual(original)
    })

    it('handles large payloads', () => {
      // Create a large array
      const original = Array.from({ length: 1000 }, (_, i) => ({
        id: i,
        species: `Species ${i}`,
        location: { lat: 42 + i * 0.01, lon: 23 + i * 0.01 }
      }))
      const encrypted = encryptPayload(JSON.stringify(original))
      const decrypted = decryptResponse(encrypted, testKey, testAlgorithm)
      expect(decrypted).toEqual(original)
    })
  })

  describe('Integration with Form Actions', () => {
    let originalEnabled
    let originalKey
    let testRecord

    beforeAll(async () => {
      originalEnabled = api.config.encryption.enabled
      originalKey = api.config.encryption.key
      api.config.encryption.enabled = true
      api.config.encryption.key = crypto.randomBytes(32)
      api.config.encryption.requireClientHeader = false
    })

    afterAll(async () => {
      await api.models.formBirds.destroy({ force: true, where: {} })
      api.config.encryption.enabled = originalEnabled
      api.config.encryption.key = originalKey
    })

    beforeEach(async () => {
      testRecord = await formBirdsFactory(api, {
        user: 'user@smartbirds.com',
        species: species.labelLa
      })
    })

    afterEach(async () => {
      if (testRecord) {
        await testRecord.destroy({ force: true })
      }
    })

    setup.describeAsUser((runAction) => {
      it('encrypted list response can be decrypted to original data', async () => {
        const encryptedResponse = await runAction('formBirds:list', {})
        expect(encryptedResponse.error).toBeFalsy()
        expect(encryptedResponse.data).toHaveProperty('__enc', true)

        // Decrypt the response
        const decryptedData = decryptResponse(
          encryptedResponse.data,
          api.config.encryption.key,
          api.config.encryption.algorithm
        )

        expect(Array.isArray(decryptedData)).toBe(true)
        expect(decryptedData.length).toBeGreaterThan(0)
        expect(decryptedData[0]).toHaveProperty('id')
        expect(decryptedData[0]).toHaveProperty('species')
      })

      it('encrypted view response can be decrypted to original data', async () => {
        const encryptedResponse = await runAction('formBirds:view', { id: testRecord.id })
        expect(encryptedResponse.error).toBeFalsy()
        expect(encryptedResponse.data).toHaveProperty('__enc', true)

        // Decrypt the response
        const decryptedData = decryptResponse(
          encryptedResponse.data,
          api.config.encryption.key,
          api.config.encryption.algorithm
        )

        expect(decryptedData).toHaveProperty('id', testRecord.id)
        expect(decryptedData).toHaveProperty('species')
        // Species can be either string or object depending on API response format
        if (typeof decryptedData.species === 'object') {
          expect(decryptedData.species).toHaveProperty('labelLa', species.labelLa)
        } else {
          expect(decryptedData.species).toBe(species.labelLa)
        }
      })
    })
  })
})
