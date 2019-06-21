try {
  var ce = new window.CustomEvent('test', { cancelable: true })
  ce.preventDefault()
  if (ce.defaultPrevented !== true) {
    // IE has problems with .preventDefault() on custom events
    // http://stackoverflow.com/questions/23349191
    throw new Error('Could not prevent default')
  }
  module.exports = window.CustomEvent
} catch (e) {
  var CustomEvent = function (event, params) {
    var evt, origPrevent
    params = params || {}
    params.bubbles = !!params.bubbles
    params.cancelable = !!params.cancelable

    evt = document.createEvent('CustomEvent')
    evt.initCustomEvent(
      event,
      params.bubbles,
      params.cancelable,
      params.detail
    )
    origPrevent = evt.preventDefault
    evt.preventDefault = function () {
      origPrevent.call(this)
      try {
        Object.defineProperty(this, 'defaultPrevented', {
          get: function () {
            return true
          }
        })
      } catch (e) {
        this.defaultPrevented = true
      }
    }
    return evt
  }

  CustomEvent.prototype = window.Event.prototype
  module.exports = CustomEvent // expose definition to window
}
