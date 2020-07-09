/**
 * Creates a promise and next callback out of provided callback. Useful for legacy apis to return promise when
 * no callback is provided
 * @param {function} next - the callback passed to the api
 * @param {function} mapper - map the api response to a promise single result
 * @return {{result: *, next: next}|{next: *}} map with result and next, result is to be returned by the api, while next to be called in place of original callback
 */
module.exports = function promiseCallback (next = null, mapper = (res) => res) {
  if (next != null) return { next }

  let resolvePromise
  let rejectPromise
  return {
    result: new Promise((resolve, reject) => {
      resolvePromise = resolve
      rejectPromise = reject
    }),
    next: (error, ...args) => {
      if (error) {
        rejectPromise(error)
        return
      }
      let resolution
      try {
        resolution = mapper(...args)
      } catch (e) {
        rejectPromise(e)
      }
      resolvePromise(resolution)
    }
  }
}
