/* global describe, before, after, it */

const assert = require('assert')
const isDeniedRead = require('../../server/helpers/filestorage').isDeniedRead

describe('Filestorage helper:', function () {

  describe('Downloader', function () {
    it('allows to download own image file', function () {
      const stat = {
        custom: { userId: 1 },
        type: 'image/jpeg'
      }
      const user = { userId: 1 }

      const denied = isDeniedRead(user, stat)

      assert(!denied)
    })

    it('allows to download image file owned by another user', function () {
      const stat = {
        custom: { userId: 2 },
        type: 'image/jpeg'
      }
      const user = { userId: 1 }

      const denied = isDeniedRead(user, stat)

      assert(!denied)
    })

    it('allows to download own file', function () {
      const stat = {
        custom: { userId: 1 }
      }
      const user = { userId: 1 }

      const denied = isDeniedRead(user, stat)

      assert(!denied)
    })

    it('forbids to download file owned by another user', function () {
      const stat = {
        custom: { userId: 2 }
      }
      const user = { userId: 1 }

      const denied = isDeniedRead(user, stat)

      assert(denied)
    })
  })
})
