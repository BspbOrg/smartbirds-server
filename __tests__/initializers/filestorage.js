/* eslint-env node, jest */
/* globals setup */

const path = require('path')
const fs = require('fs')
const sharp = require('sharp')

describe('Initializer filestorage', () => {
  let api

  beforeAll(() => {
    api = setup.api
  })

  describe('preprocessHeif', () => {
    it('should not preprocess regular JPEG files', async () => {
      const testFile = path.join(__dirname, '../../__test_utils__/fixtures/images/test.jpg')
      const result = await api.filestorage.preprocessHeif(testFile, 'image/jpeg')

      expect(result.path).toBe(testFile)
      expect(typeof result.cleanup).toBe('function')
    })

    it('should not preprocess PNG files', async () => {
      const testFile = path.join(__dirname, '../../__test_utils__/fixtures/images/test.png')
      const result = await api.filestorage.preprocessHeif(testFile, 'image/png')

      expect(result.path).toBe(testFile)
      expect(typeof result.cleanup).toBe('function')
    })

    it('should preprocess HEIF file with .heic extension', async () => {
      const testFile = path.join(__dirname, '../../__test_utils__/fixtures/images/test.heic')
      const result = await api.filestorage.preprocessHeif(testFile, 'image/heic')

      expect(result.path).not.toBe(testFile)
      expect(result.path).toContain('.converted.jpg')
      expect(fs.existsSync(result.path)).toBe(true)

      // Verify the converted file is valid JPEG
      const metadata = await sharp(result.path).metadata()
      expect(metadata.format).toBe('jpeg')

      // Cleanup
      result.cleanup()
    })

    it('should detect HEIF file by signature despite wrong extension', async () => {
      const testFile = path.join(__dirname, '../../__test_utils__/fixtures/images/test-heif-misnamed.jpg')
      const result = await api.filestorage.preprocessHeif(testFile, 'image/jpeg')

      expect(result.path).not.toBe(testFile)
      expect(result.path).toContain('.converted.jpg')
      expect(fs.existsSync(result.path)).toBe(true)

      // Verify the converted file is valid JPEG
      const metadata = await sharp(result.path).metadata()
      expect(metadata.format).toBe('jpeg')

      // Cleanup
      result.cleanup()
    })

    it('should cleanup temp files', async () => {
      const testFile = path.join(__dirname, '../../__test_utils__/fixtures/images/test.heic')
      const result = await api.filestorage.preprocessHeif(testFile, 'image/heic')

      const tempPath = result.path
      expect(fs.existsSync(tempPath)).toBe(true)

      result.cleanup()

      // Give a moment for async cleanup
      await new Promise(resolve => setTimeout(resolve, 100))

      expect(fs.existsSync(tempPath)).toBe(false)
    })

    it('should throw error when heif-convert fails', async () => {
      const nonHeifFile = path.join(__dirname, '../../__test_utils__/fixtures/images/test.jpg')

      // Mock it as HEIF to force conversion attempt
      await expect(
        api.filestorage.preprocessHeif(nonHeifFile, 'image/heic')
      ).rejects.toThrow()
    })
  })

  describe('push', () => {
    let tempUploadDir

    beforeEach(() => {
      // Create temp upload directory for tests
      tempUploadDir = path.join(__dirname, '../../__test_utils__/tmp_uploads')
      if (!fs.existsSync(tempUploadDir)) {
        fs.mkdirSync(tempUploadDir, { recursive: true })
      }
    })

    afterEach(() => {
      // Clean up temp files
      if (fs.existsSync(tempUploadDir)) {
        fs.rmSync(tempUploadDir, { recursive: true, force: true })
      }
    })

    it('should successfully store a regular JPEG', (done) => {
      const sourceFile = path.join(__dirname, '../../__test_utils__/fixtures/images/test.jpg')
      const uploadFile = path.join(tempUploadDir, 'upload.jpg')

      // Copy to temp location (simulating upload)
      fs.copyFileSync(sourceFile, uploadFile)

      const file = {
        name: 'test.jpg',
        path: uploadFile
      }

      api.filestorage.push(file, null, (err, key, meta) => {
        expect(err).toBeNull()
        expect(key).toBeTruthy()
        expect(meta).toBeTruthy()
        expect(meta.type).toBe('image/jpeg')
        expect(meta.filters.downsample).toBeDefined()
        done()
      })
    })

    it('should successfully convert and store HEIF file with correct extension', (done) => {
      const sourceFile = path.join(__dirname, '../../__test_utils__/fixtures/images/test.heic')
      const uploadFile = path.join(tempUploadDir, 'upload.heic')

      // Copy to temp location (simulating upload)
      fs.copyFileSync(sourceFile, uploadFile)

      const file = {
        name: 'photo.heic',
        path: uploadFile
      }

      api.filestorage.push(file, null, (err, key, meta) => {
        expect(err).toBeNull()
        expect(key).toBeTruthy()
        expect(meta).toBeTruthy()
        expect(meta.type).toBe('image/heic')
        expect(meta.filters.downsample).toBeDefined()
        done()
      })
    })

    it('should detect and convert HEIF file with wrong extension', (done) => {
      const sourceFile = path.join(__dirname, '../../__test_utils__/fixtures/images/test-heif-misnamed.jpg')
      const uploadFile = path.join(tempUploadDir, 'upload.jpg')

      // Copy to temp location (simulating upload)
      fs.copyFileSync(sourceFile, uploadFile)

      const file = {
        name: 'photo.jpg',
        path: uploadFile
      }

      api.filestorage.push(file, null, (err, key, meta) => {
        expect(err).toBeNull()
        expect(key).toBeTruthy()
        expect(meta).toBeTruthy()
        expect(meta.type).toBe('image/jpeg')
        expect(meta.filters.downsample).toBeDefined()
        done()
      })
    })

    it('should successfully store a PNG', (done) => {
      const sourceFile = path.join(__dirname, '../../__test_utils__/fixtures/images/test.png')
      const uploadFile = path.join(tempUploadDir, 'upload.png')

      // Copy to temp location (simulating upload)
      fs.copyFileSync(sourceFile, uploadFile)

      const file = {
        name: 'test.png',
        path: uploadFile
      }

      api.filestorage.push(file, null, (err, key, meta) => {
        expect(err).toBeNull()
        expect(key).toBeTruthy()
        expect(meta).toBeTruthy()
        expect(meta.type).toBe('image/png')
        expect(meta.filters.downsample).toBeDefined()
        done()
      })
    })

    it('should include custom metadata when provided', (done) => {
      const sourceFile = path.join(__dirname, '../../__test_utils__/fixtures/images/test.jpg')
      const uploadFile = path.join(tempUploadDir, 'upload.jpg')

      fs.copyFileSync(sourceFile, uploadFile)

      const file = {
        name: 'test.jpg',
        path: uploadFile
      }

      const customData = { userId: 123, formId: 456 }

      api.filestorage.push(file, customData, (err, key, meta) => {
        expect(err).toBeNull()
        expect(meta.custom).toEqual(customData)
        done()
      })
    })
  })

  describe('get', () => {
    it('should retrieve stored file', (done) => {
      const sourceFile = path.join(__dirname, '../../__test_utils__/fixtures/images/test.jpg')
      const tempUploadDir = path.join(__dirname, '../../__test_utils__/tmp_uploads')
      if (!fs.existsSync(tempUploadDir)) {
        fs.mkdirSync(tempUploadDir, { recursive: true })
      }

      const uploadFile = path.join(tempUploadDir, 'upload.jpg')
      fs.copyFileSync(sourceFile, uploadFile)

      const file = {
        name: 'test.jpg',
        path: uploadFile
      }

      // First push the file
      api.filestorage.push(file, null, (err, key, meta) => {
        expect(err).toBeNull()

        // Now retrieve it
        api.filestorage.get(key, (getErr, stream, getMeta) => {
          expect(getErr).toBeNull()
          expect(stream).toBeTruthy()
          expect(getMeta).toBeTruthy()
          expect(getMeta.name).toBe('test.jpg')
          expect(getMeta.type).toBe('image/jpeg')

          // Clean up
          fs.rmSync(tempUploadDir, { recursive: true, force: true })
          done()
        })
      })
    })
  })
})
