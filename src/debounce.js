// Based on https://davidwalsh.name/javascript-debounce-function

function cancellableDebounce(decorated, wait, immediate) {
  var timeout
  function _cancellableDebounce() {
    var context = this
    var args = arguments
    var later = function() {
      timeout = null
      if (!immediate) decorated.apply(context, args)
    }
    var callNow = immediate && !timeout
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
    if (callNow) decorated.apply(context, args)
  }
  _cancellableDebounce.cancel = function() {
    clearTimeout(timeout)
  }
  return _cancellableDebounce
}

module.exports = cancellableDebounce
