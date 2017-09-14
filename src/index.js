require('./polyfills')
var debounce = require('./debounce')

/*
Ricardo mini framework for DOM manipulation and other things

  eg:
  ric(function() {
    // called at DOMLoad
  });
  ric('.elements').removeClass('blop')
  ric(document.body).delegate('click', selector, callback)
*/

var domLoaded = false
var cb = [] // callback list

var ua = navigator.userAgent
var iOS = !!ua.match(/iPad/i) || !!ua.match(/iPhone/i)
var webkit = !!ua.match(/WebKit/i) && !ua.match(/Chrome/i)
var iOSSafari = iOS && webkit

// On iOS the "click" event does not bubble up to the document
// with an exception of inputs and links, it stops right before the body.
// Apparently setting the documentElement cursor to pointer fixes this.
if (iOSSafari) {
  document.addEventListener('touchstart', function() {
    document.documentElement.style.cursor = 'pointer'
  })
}

function first(iterable, predicate) {
  for (var index = 0; index < iterable.length; ++index) {
    var _result = predicate(iterable[index])
    if (_result) {
      return [iterable[index], _result]
    }
  }
}

function any(iterable, predicate) {
  for (var index = 0; index < iterable.length; ++index) {
    if (predicate(iterable[index])) {
      return true
    }
  }
  return false
}

function apply(iterable, f) {
  var v
  for (var index = 0; index < iterable.length; ++index) {
    v = f(iterable[index], index)
  }
  return v
}

function reduce(array, func) {
  var acc = ''
  apply(array, function(v, i) {
    acc += func(v, i)
  })
  return acc
}

// Decorate a function so it is executed only when
// the browser is ready to render a frame
function requestAnimationFrameThrottle(decorated) {
  var running = false
  return function() {
    var context = this
    var args = arguments
    if (running) {
      return
    }
    running = true
    window.requestAnimationFrame(function() {
      decorated.apply(context, args)
      running = false
    })
  }
}

document.addEventListener('DOMContentLoaded', function() {
  domLoaded = true
  apply(cb, function(item) {
    item()
  })
})

var ric = function(thing) {
  function F() {}
  F.prototype = ric.prototype
  var f = new F()
  if (thing.nodeName || thing.addEventListener) {
    f.dom = [thing]
  }
  if (typeof thing === 'string') {
    f.dom = document.querySelectorAll(thing)
  }
  if (typeof thing === 'function') {
    if (domLoaded) {
      thing()
    } else {
      cb.push(thing)
    }
  }
  if (Object.prototype.toString.call(thing) === '[object Array]') {
    f.dom = thing
  }
  return f
}

ric.prototype.hasClass = function(cn) {
  return any(this.dom, function(item) {
    return item.classList.contains(cn)
  })
}

ric.prototype.get = function(index) {
  return this.dom[index || 0]
}

ric.prototype.addClass = function(cn) {
  apply(this.dom, function(item) {
    item.classList.add(cn)
  })
  return this
}

ric.prototype.removeClass = function(cn) {
  apply(this.dom, function(item) {
    item.classList.remove(cn)
  })
  return this
}

ric.prototype.each = function(func) {
  apply(this.dom, func)
  return this
}

ric.prototype.reduce = function(func) {
  return reduce(this.dom, func)
}

ric.prototype.toggleClass = function(classA, classB) {
  apply(this.dom, function(item) {
    var i = ric(item)
    if (i.hasClass(classA)) {
      i.removeClass(classA)
      if (classB) {
        i.addClass(classB)
      }
    } else {
      if (classB && i.hasClass(classB)) {
        i.addClass(classA)
        i.removeClass(classB)
      } else {
        i.addClass(classA)
      }
    }
  })
  return this
}

ric.prototype.text = function(v) {
  if (v === undefined) {
    return this.get().textContent
  }
  apply(this.dom, function(item) {
    item.textContent = v
  })
  return this
}

ric.prototype.on = function(event, eventHandler, nop) {
  if (nop) {
    throw new Error('Did you meant ric.delegate?')
  }
  var eventList = []
  apply(this.dom, function(dom) {
    eventList.push([dom, event, eventHandler])
    dom.addEventListener(event, eventHandler)
  })
  return eventList
}

ric.prototype.delegate = function(event, selector, eventHandler) {
  var eventList = []
  apply(this.dom, function(dom) {
    function _eventHandler(e) {
      var _closest = ric(e.target).closest(selector)
      if (_closest) {
        e.delegationTarget = _closest.get()
        eventHandler(e)
      }
    }
    eventList.push([dom, event, _eventHandler])
    dom.addEventListener(event, _eventHandler, true)
  })
  return eventList
}

ric.off = function(eventList) {
  apply(eventList, function(triplet) {
    triplet[0].removeEventListener(triplet[1], triplet[2], true)
  })
}

function closest(el, predicate) {
  do {
    if (predicate(el)) {
      return el
    }
    el = el.parentNode
  } while (el)
}

ric.prototype.closest = function(thing) {
  if (typeof thing === 'string') {
    var result = first(this.dom, function match(el) {
      return closest(el, function(el) {
        return el.matches && el.matches(thing)
      })
    })
  }
  if (typeof thing === 'function') {
    result = first(this.dom, function(el) {
      return closest(el, function(el) {
        return thing(el)
      })
    })
  }
  if (result) {
    return ric(result[1])
  }
}

ric.prototype.hide = function() {
  apply(this.dom, function(dom) {
    dom.style['display'] = 'none'
  })
  return this
}

ric.prototype.show = function(display) {
  apply(this.dom, function(dom) {
    dom.style['display'] = display || 'block'
  })
  return this
}

ric.prototype.find = function(selector) {
  var newDom = []
  apply(this.dom, function(dom) {
    newDom = newDom.concat(Array.from(dom.querySelectorAll(selector)))
  })
  // ensure uniqueness
  newDom = newDom.filter(function(value, index, self) {
    return self.indexOf(value) === index
  })
  return ric(newDom)
}

ric.closest = closest
ric.any = any
ric.apply = apply
ric.each = apply
ric.reduce = reduce
ric.debounce = debounce
ric.requestAnimationFrameThrottle = requestAnimationFrameThrottle
// get only one element
ric.one = function(selector) {
  return ric(document.querySelector(selector))
}

ric(function() {
  // https://medium.com/@david.gilbertson/the-only-way-to-detect-touch-with-javascript-7791a3346685
  function listenToTouch() {
    ric.isTouchDevice = true
    document.body.classList.add('ric__touch-device')
    document.body.removeEventListener('touchstart', listenToTouch, false)
  }
  document.body.addEventListener('touchstart', listenToTouch, false)
})

module.exports = ric
