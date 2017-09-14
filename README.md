# ric
Ricardo mini framework for DOM manipulation and other things.

Role: provide very basic functionality related to the DOM, events, the browser
and a couple of essential polyfills. Keep it simple and small.


The ric function is an instance builder or an initializer depending
of what is passed as first parameter.

```javascript
  ric(function() {
    // Called on DOMContentLoaded
  })

  // any string will be considered a CSS selector
  var articles = ric('#some .articles')
  // the DOM elements are available in the dom property
  console.log(articles.dom)

  // a single DOM element is also accepted
  ric(document.body).addClass('something')

  // as well as an array of DOM elements
  ric([document.body, document.querySelector('#footer')])
```

## Ric instance methods

Once a ric instance is created, you have a list of methods you can use.

```javascript
  // return true if any of the dom element contain this class name
  ric.prototype.hasClass(className)
  
  // return the indexed element of the dom array unwrapped
  ric.prototype.get(index || 0) 
  
  // within the DOM elements, find the subset of the children that satisfy the 
  // selector and return the result wrapped in a ric object
  ric.prototype.find(selector)
  // E.g.
  ric('#articles').find('a').hide()

  // self explanatory
  ric.prototype.addClass(className)
  ric.prototype.removeClass(className)
  
  // iterate over the DOM nodes
  ric.prototype.each((dom, index) => {
    console.log(dom, index)
  })

  // iterate over the dom and accumulate the returned values
  ric.prototype.reduce((dom, index) => {
    return dom.getAttribute('data-price')
  })

  // toggle between 2 classes, classB is optional
  ric.prototype.toggleClass(classA, <classB>)

  // set the textContent of the DOM elements, if no value
  // is provided the first DOM element textContent is returned
  ric.prototype.text(<value>)

  // attach event to eventHandler on the DOM nodes
  ric.prototype.on(event, eventHandler)

  // Delegate event from DOM elements onto children that matches the selector.
  // Return a list of triplets containing (dom, event, eventHandler)
  var eventList = ric.prototype.delegate(event, selector, eventHandler)
  // E.g.
  ric('#article-list').delegate('click', '[data-tracking-id]', (e) => {
    track(e.delegationTarget.getAttribute('data-tracking-id')
  })
  
  // find the closest parent that satisfy the selector or the predicate
  // return the DOM element wrapped in a ric object of undefined in case of failure
  ric.prototype.closest(selector || predicate)

  // hide the DOM elements (display:none)
  ric.prototype.hide()

  // show the DOM elements
  ric.prototype.show(display='block')
```

  
## Ric Standalone Functions

Standalone methods not associated with the DOM elements. Those can 
be called from the ric function directly.


```javascript
// similar to ric.prototype.closest but apply to the DOM paramater
ric.closest(DOMElement, predicate)

// return true if any element in the array satisfy the predicate
ric.any(iterable, predicate)

// apply func to every item, return the last func return value
ric.apply(iterable, func)

// synonym of apply
ric.each(iterable, func)

// E.g.
ric.each([1, 2, 3], (item, index) => { console.log(item, index) })
> 1, 0
> 2, 1
> 3, 2

// apply func to every item, and return the accumulation of the func return value
ric.reduce(array, func)

// return a decorated function that debounce the execution to wait time (ms)
var debounced = ric.debounce(decoratee, wait, immediate)

// How to use, first decorate the function you want to debounce for 1 second
var debounced = ric.debounce(() => { console.log('blop') }, 1000)
// let's call it 3 times
debounced(); debounced(); debounced()
// after 1 second you should get only one blop
> blop

// You can also cancel the execution at any point.
debounced.cancel()

// remove the event listeners created by ric.prototype.delegate
ric.off(eventList)

// find one element and wrap it in a ric instance
ric.one(selector).addClass('blop')

// return a decorated a function that listen to requestAnimationFrame but
// prevent that several requests exist at the same time
ric.requestAnimationFrameThrottle(decorated)

// E.g.
var throtteled = ric.requestAnimationFrameThrottle(function(){ console.log('blop') })
// let's call it 3 times
throtteled(); throtteled(); throtteled()
// when the browser is ready you should get only 1 blop
> blop

```
