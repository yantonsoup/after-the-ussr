(function () {
  'use strict';

  /**
   * Copyright 2016 Google Inc. All Rights Reserved.
   *
   * Licensed under the W3C SOFTWARE AND DOCUMENT NOTICE AND LICENSE.
   *
   *  https://www.w3.org/Consortium/Legal/2015/copyright-software-and-document
   *
   */

  (function(window, document) {


  // Exits early if all IntersectionObserver and IntersectionObserverEntry
  // features are natively supported.
  if ('IntersectionObserver' in window &&
      'IntersectionObserverEntry' in window &&
      'intersectionRatio' in window.IntersectionObserverEntry.prototype) {

    // Minimal polyfill for Edge 15's lack of `isIntersecting`
    // See: https://github.com/w3c/IntersectionObserver/issues/211
    if (!('isIntersecting' in window.IntersectionObserverEntry.prototype)) {
      Object.defineProperty(window.IntersectionObserverEntry.prototype,
        'isIntersecting', {
        get: function () {
          return this.intersectionRatio > 0;
        }
      });
    }
    return;
  }


  /**
   * Creates the global IntersectionObserverEntry constructor.
   * https://w3c.github.io/IntersectionObserver/#intersection-observer-entry
   * @param {Object} entry A dictionary of instance properties.
   * @constructor
   */
  function IntersectionObserverEntry(entry) {
    this.time = entry.time;
    this.target = entry.target;
    this.rootBounds = entry.rootBounds;
    this.boundingClientRect = entry.boundingClientRect;
    this.intersectionRect = entry.intersectionRect || getEmptyRect();
    this.isIntersecting = !!entry.intersectionRect;

    // Calculates the intersection ratio.
    var targetRect = this.boundingClientRect;
    var targetArea = targetRect.width * targetRect.height;
    var intersectionRect = this.intersectionRect;
    var intersectionArea = intersectionRect.width * intersectionRect.height;

    // Sets intersection ratio.
    if (targetArea) {
      // Round the intersection ratio to avoid floating point math issues:
      // https://github.com/w3c/IntersectionObserver/issues/324
      this.intersectionRatio = Number((intersectionArea / targetArea).toFixed(4));
    } else {
      // If area is zero and is intersecting, sets to 1, otherwise to 0
      this.intersectionRatio = this.isIntersecting ? 1 : 0;
    }
  }


  /**
   * Creates the global IntersectionObserver constructor.
   * https://w3c.github.io/IntersectionObserver/#intersection-observer-interface
   * @param {Function} callback The function to be invoked after intersection
   *     changes have queued. The function is not invoked if the queue has
   *     been emptied by calling the `takeRecords` method.
   * @param {Object=} opt_options Optional configuration options.
   * @constructor
   */
  function IntersectionObserver(callback, opt_options) {

    var options = opt_options || {};

    if (typeof callback != 'function') {
      throw new Error('callback must be a function');
    }

    if (options.root && options.root.nodeType != 1) {
      throw new Error('root must be an Element');
    }

    // Binds and throttles `this._checkForIntersections`.
    this._checkForIntersections = throttle(
        this._checkForIntersections.bind(this), this.THROTTLE_TIMEOUT);

    // Private properties.
    this._callback = callback;
    this._observationTargets = [];
    this._queuedEntries = [];
    this._rootMarginValues = this._parseRootMargin(options.rootMargin);

    // Public properties.
    this.thresholds = this._initThresholds(options.threshold);
    this.root = options.root || null;
    this.rootMargin = this._rootMarginValues.map(function(margin) {
      return margin.value + margin.unit;
    }).join(' ');
  }


  /**
   * The minimum interval within which the document will be checked for
   * intersection changes.
   */
  IntersectionObserver.prototype.THROTTLE_TIMEOUT = 100;


  /**
   * The frequency in which the polyfill polls for intersection changes.
   * this can be updated on a per instance basis and must be set prior to
   * calling `observe` on the first target.
   */
  IntersectionObserver.prototype.POLL_INTERVAL = null;

  /**
   * Use a mutation observer on the root element
   * to detect intersection changes.
   */
  IntersectionObserver.prototype.USE_MUTATION_OBSERVER = true;


  /**
   * Starts observing a target element for intersection changes based on
   * the thresholds values.
   * @param {Element} target The DOM element to observe.
   */
  IntersectionObserver.prototype.observe = function(target) {
    var isTargetAlreadyObserved = this._observationTargets.some(function(item) {
      return item.element == target;
    });

    if (isTargetAlreadyObserved) {
      return;
    }

    if (!(target && target.nodeType == 1)) {
      throw new Error('target must be an Element');
    }

    this._registerInstance();
    this._observationTargets.push({element: target, entry: null});
    this._monitorIntersections();
    this._checkForIntersections();
  };


  /**
   * Stops observing a target element for intersection changes.
   * @param {Element} target The DOM element to observe.
   */
  IntersectionObserver.prototype.unobserve = function(target) {
    this._observationTargets =
        this._observationTargets.filter(function(item) {

      return item.element != target;
    });
    if (!this._observationTargets.length) {
      this._unmonitorIntersections();
      this._unregisterInstance();
    }
  };


  /**
   * Stops observing all target elements for intersection changes.
   */
  IntersectionObserver.prototype.disconnect = function() {
    this._observationTargets = [];
    this._unmonitorIntersections();
    this._unregisterInstance();
  };


  /**
   * Returns any queue entries that have not yet been reported to the
   * callback and clears the queue. This can be used in conjunction with the
   * callback to obtain the absolute most up-to-date intersection information.
   * @return {Array} The currently queued entries.
   */
  IntersectionObserver.prototype.takeRecords = function() {
    var records = this._queuedEntries.slice();
    this._queuedEntries = [];
    return records;
  };


  /**
   * Accepts the threshold value from the user configuration object and
   * returns a sorted array of unique threshold values. If a value is not
   * between 0 and 1 and error is thrown.
   * @private
   * @param {Array|number=} opt_threshold An optional threshold value or
   *     a list of threshold values, defaulting to [0].
   * @return {Array} A sorted list of unique and valid threshold values.
   */
  IntersectionObserver.prototype._initThresholds = function(opt_threshold) {
    var threshold = opt_threshold || [0];
    if (!Array.isArray(threshold)) threshold = [threshold];

    return threshold.sort().filter(function(t, i, a) {
      if (typeof t != 'number' || isNaN(t) || t < 0 || t > 1) {
        throw new Error('threshold must be a number between 0 and 1 inclusively');
      }
      return t !== a[i - 1];
    });
  };


  /**
   * Accepts the rootMargin value from the user configuration object
   * and returns an array of the four margin values as an object containing
   * the value and unit properties. If any of the values are not properly
   * formatted or use a unit other than px or %, and error is thrown.
   * @private
   * @param {string=} opt_rootMargin An optional rootMargin value,
   *     defaulting to '0px'.
   * @return {Array<Object>} An array of margin objects with the keys
   *     value and unit.
   */
  IntersectionObserver.prototype._parseRootMargin = function(opt_rootMargin) {
    var marginString = opt_rootMargin || '0px';
    var margins = marginString.split(/\s+/).map(function(margin) {
      var parts = /^(-?\d*\.?\d+)(px|%)$/.exec(margin);
      if (!parts) {
        throw new Error('rootMargin must be specified in pixels or percent');
      }
      return {value: parseFloat(parts[1]), unit: parts[2]};
    });

    // Handles shorthand.
    margins[1] = margins[1] || margins[0];
    margins[2] = margins[2] || margins[0];
    margins[3] = margins[3] || margins[1];

    return margins;
  };


  /**
   * Starts polling for intersection changes if the polling is not already
   * happening, and if the page's visibility state is visible.
   * @private
   */
  IntersectionObserver.prototype._monitorIntersections = function() {
    if (!this._monitoringIntersections) {
      this._monitoringIntersections = true;

      // If a poll interval is set, use polling instead of listening to
      // resize and scroll events or DOM mutations.
      if (this.POLL_INTERVAL) {
        this._monitoringInterval = setInterval(
            this._checkForIntersections, this.POLL_INTERVAL);
      }
      else {
        addEvent(window, 'resize', this._checkForIntersections, true);
        addEvent(document, 'scroll', this._checkForIntersections, true);

        if (this.USE_MUTATION_OBSERVER && 'MutationObserver' in window) {
          this._domObserver = new MutationObserver(this._checkForIntersections);
          this._domObserver.observe(document, {
            attributes: true,
            childList: true,
            characterData: true,
            subtree: true
          });
        }
      }
    }
  };


  /**
   * Stops polling for intersection changes.
   * @private
   */
  IntersectionObserver.prototype._unmonitorIntersections = function() {
    if (this._monitoringIntersections) {
      this._monitoringIntersections = false;

      clearInterval(this._monitoringInterval);
      this._monitoringInterval = null;

      removeEvent(window, 'resize', this._checkForIntersections, true);
      removeEvent(document, 'scroll', this._checkForIntersections, true);

      if (this._domObserver) {
        this._domObserver.disconnect();
        this._domObserver = null;
      }
    }
  };


  /**
   * Scans each observation target for intersection changes and adds them
   * to the internal entries queue. If new entries are found, it
   * schedules the callback to be invoked.
   * @private
   */
  IntersectionObserver.prototype._checkForIntersections = function() {
    var rootIsInDom = this._rootIsInDom();
    var rootRect = rootIsInDom ? this._getRootRect() : getEmptyRect();

    this._observationTargets.forEach(function(item) {
      var target = item.element;
      var targetRect = getBoundingClientRect(target);
      var rootContainsTarget = this._rootContainsTarget(target);
      var oldEntry = item.entry;
      var intersectionRect = rootIsInDom && rootContainsTarget &&
          this._computeTargetAndRootIntersection(target, rootRect);

      var newEntry = item.entry = new IntersectionObserverEntry({
        time: now(),
        target: target,
        boundingClientRect: targetRect,
        rootBounds: rootRect,
        intersectionRect: intersectionRect
      });

      if (!oldEntry) {
        this._queuedEntries.push(newEntry);
      } else if (rootIsInDom && rootContainsTarget) {
        // If the new entry intersection ratio has crossed any of the
        // thresholds, add a new entry.
        if (this._hasCrossedThreshold(oldEntry, newEntry)) {
          this._queuedEntries.push(newEntry);
        }
      } else {
        // If the root is not in the DOM or target is not contained within
        // root but the previous entry for this target had an intersection,
        // add a new record indicating removal.
        if (oldEntry && oldEntry.isIntersecting) {
          this._queuedEntries.push(newEntry);
        }
      }
    }, this);

    if (this._queuedEntries.length) {
      this._callback(this.takeRecords(), this);
    }
  };


  /**
   * Accepts a target and root rect computes the intersection between then
   * following the algorithm in the spec.
   * TODO(philipwalton): at this time clip-path is not considered.
   * https://w3c.github.io/IntersectionObserver/#calculate-intersection-rect-algo
   * @param {Element} target The target DOM element
   * @param {Object} rootRect The bounding rect of the root after being
   *     expanded by the rootMargin value.
   * @return {?Object} The final intersection rect object or undefined if no
   *     intersection is found.
   * @private
   */
  IntersectionObserver.prototype._computeTargetAndRootIntersection =
      function(target, rootRect) {

    // If the element isn't displayed, an intersection can't happen.
    if (window.getComputedStyle(target).display == 'none') return;

    var targetRect = getBoundingClientRect(target);
    var intersectionRect = targetRect;
    var parent = getParentNode(target);
    var atRoot = false;

    while (!atRoot) {
      var parentRect = null;
      var parentComputedStyle = parent.nodeType == 1 ?
          window.getComputedStyle(parent) : {};

      // If the parent isn't displayed, an intersection can't happen.
      if (parentComputedStyle.display == 'none') return;

      if (parent == this.root || parent == document) {
        atRoot = true;
        parentRect = rootRect;
      } else {
        // If the element has a non-visible overflow, and it's not the <body>
        // or <html> element, update the intersection rect.
        // Note: <body> and <html> cannot be clipped to a rect that's not also
        // the document rect, so no need to compute a new intersection.
        if (parent != document.body &&
            parent != document.documentElement &&
            parentComputedStyle.overflow != 'visible') {
          parentRect = getBoundingClientRect(parent);
        }
      }

      // If either of the above conditionals set a new parentRect,
      // calculate new intersection data.
      if (parentRect) {
        intersectionRect = computeRectIntersection(parentRect, intersectionRect);

        if (!intersectionRect) break;
      }
      parent = getParentNode(parent);
    }
    return intersectionRect;
  };


  /**
   * Returns the root rect after being expanded by the rootMargin value.
   * @return {Object} The expanded root rect.
   * @private
   */
  IntersectionObserver.prototype._getRootRect = function() {
    var rootRect;
    if (this.root) {
      rootRect = getBoundingClientRect(this.root);
    } else {
      // Use <html>/<body> instead of window since scroll bars affect size.
      var html = document.documentElement;
      var body = document.body;
      rootRect = {
        top: 0,
        left: 0,
        right: html.clientWidth || body.clientWidth,
        width: html.clientWidth || body.clientWidth,
        bottom: html.clientHeight || body.clientHeight,
        height: html.clientHeight || body.clientHeight
      };
    }
    return this._expandRectByRootMargin(rootRect);
  };


  /**
   * Accepts a rect and expands it by the rootMargin value.
   * @param {Object} rect The rect object to expand.
   * @return {Object} The expanded rect.
   * @private
   */
  IntersectionObserver.prototype._expandRectByRootMargin = function(rect) {
    var margins = this._rootMarginValues.map(function(margin, i) {
      return margin.unit == 'px' ? margin.value :
          margin.value * (i % 2 ? rect.width : rect.height) / 100;
    });
    var newRect = {
      top: rect.top - margins[0],
      right: rect.right + margins[1],
      bottom: rect.bottom + margins[2],
      left: rect.left - margins[3]
    };
    newRect.width = newRect.right - newRect.left;
    newRect.height = newRect.bottom - newRect.top;

    return newRect;
  };


  /**
   * Accepts an old and new entry and returns true if at least one of the
   * threshold values has been crossed.
   * @param {?IntersectionObserverEntry} oldEntry The previous entry for a
   *    particular target element or null if no previous entry exists.
   * @param {IntersectionObserverEntry} newEntry The current entry for a
   *    particular target element.
   * @return {boolean} Returns true if a any threshold has been crossed.
   * @private
   */
  IntersectionObserver.prototype._hasCrossedThreshold =
      function(oldEntry, newEntry) {

    // To make comparing easier, an entry that has a ratio of 0
    // but does not actually intersect is given a value of -1
    var oldRatio = oldEntry && oldEntry.isIntersecting ?
        oldEntry.intersectionRatio || 0 : -1;
    var newRatio = newEntry.isIntersecting ?
        newEntry.intersectionRatio || 0 : -1;

    // Ignore unchanged ratios
    if (oldRatio === newRatio) return;

    for (var i = 0; i < this.thresholds.length; i++) {
      var threshold = this.thresholds[i];

      // Return true if an entry matches a threshold or if the new ratio
      // and the old ratio are on the opposite sides of a threshold.
      if (threshold == oldRatio || threshold == newRatio ||
          threshold < oldRatio !== threshold < newRatio) {
        return true;
      }
    }
  };


  /**
   * Returns whether or not the root element is an element and is in the DOM.
   * @return {boolean} True if the root element is an element and is in the DOM.
   * @private
   */
  IntersectionObserver.prototype._rootIsInDom = function() {
    return !this.root || containsDeep(document, this.root);
  };


  /**
   * Returns whether or not the target element is a child of root.
   * @param {Element} target The target element to check.
   * @return {boolean} True if the target element is a child of root.
   * @private
   */
  IntersectionObserver.prototype._rootContainsTarget = function(target) {
    return containsDeep(this.root || document, target);
  };


  /**
   * Adds the instance to the global IntersectionObserver registry if it isn't
   * already present.
   * @private
   */
  IntersectionObserver.prototype._registerInstance = function() {
  };


  /**
   * Removes the instance from the global IntersectionObserver registry.
   * @private
   */
  IntersectionObserver.prototype._unregisterInstance = function() {
  };


  /**
   * Returns the result of the performance.now() method or null in browsers
   * that don't support the API.
   * @return {number} The elapsed time since the page was requested.
   */
  function now() {
    return window.performance && performance.now && performance.now();
  }


  /**
   * Throttles a function and delays its execution, so it's only called at most
   * once within a given time period.
   * @param {Function} fn The function to throttle.
   * @param {number} timeout The amount of time that must pass before the
   *     function can be called again.
   * @return {Function} The throttled function.
   */
  function throttle(fn, timeout) {
    var timer = null;
    return function () {
      if (!timer) {
        timer = setTimeout(function() {
          fn();
          timer = null;
        }, timeout);
      }
    };
  }


  /**
   * Adds an event handler to a DOM node ensuring cross-browser compatibility.
   * @param {Node} node The DOM node to add the event handler to.
   * @param {string} event The event name.
   * @param {Function} fn The event handler to add.
   * @param {boolean} opt_useCapture Optionally adds the even to the capture
   *     phase. Note: this only works in modern browsers.
   */
  function addEvent(node, event, fn, opt_useCapture) {
    if (typeof node.addEventListener == 'function') {
      node.addEventListener(event, fn, opt_useCapture || false);
    }
    else if (typeof node.attachEvent == 'function') {
      node.attachEvent('on' + event, fn);
    }
  }


  /**
   * Removes a previously added event handler from a DOM node.
   * @param {Node} node The DOM node to remove the event handler from.
   * @param {string} event The event name.
   * @param {Function} fn The event handler to remove.
   * @param {boolean} opt_useCapture If the event handler was added with this
   *     flag set to true, it should be set to true here in order to remove it.
   */
  function removeEvent(node, event, fn, opt_useCapture) {
    if (typeof node.removeEventListener == 'function') {
      node.removeEventListener(event, fn, opt_useCapture || false);
    }
    else if (typeof node.detatchEvent == 'function') {
      node.detatchEvent('on' + event, fn);
    }
  }


  /**
   * Returns the intersection between two rect objects.
   * @param {Object} rect1 The first rect.
   * @param {Object} rect2 The second rect.
   * @return {?Object} The intersection rect or undefined if no intersection
   *     is found.
   */
  function computeRectIntersection(rect1, rect2) {
    var top = Math.max(rect1.top, rect2.top);
    var bottom = Math.min(rect1.bottom, rect2.bottom);
    var left = Math.max(rect1.left, rect2.left);
    var right = Math.min(rect1.right, rect2.right);
    var width = right - left;
    var height = bottom - top;

    return (width >= 0 && height >= 0) && {
      top: top,
      bottom: bottom,
      left: left,
      right: right,
      width: width,
      height: height
    };
  }


  /**
   * Shims the native getBoundingClientRect for compatibility with older IE.
   * @param {Element} el The element whose bounding rect to get.
   * @return {Object} The (possibly shimmed) rect of the element.
   */
  function getBoundingClientRect(el) {
    var rect;

    try {
      rect = el.getBoundingClientRect();
    } catch (err) {
      // Ignore Windows 7 IE11 "Unspecified error"
      // https://github.com/w3c/IntersectionObserver/pull/205
    }

    if (!rect) return getEmptyRect();

    // Older IE
    if (!(rect.width && rect.height)) {
      rect = {
        top: rect.top,
        right: rect.right,
        bottom: rect.bottom,
        left: rect.left,
        width: rect.right - rect.left,
        height: rect.bottom - rect.top
      };
    }
    return rect;
  }


  /**
   * Returns an empty rect object. An empty rect is returned when an element
   * is not in the DOM.
   * @return {Object} The empty rect.
   */
  function getEmptyRect() {
    return {
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
      width: 0,
      height: 0
    };
  }

  /**
   * Checks to see if a parent element contains a child element (including inside
   * shadow DOM).
   * @param {Node} parent The parent element.
   * @param {Node} child The child element.
   * @return {boolean} True if the parent node contains the child node.
   */
  function containsDeep(parent, child) {
    var node = child;
    while (node) {
      if (node == parent) return true;

      node = getParentNode(node);
    }
    return false;
  }


  /**
   * Gets the parent node of an element or its host element if the parent node
   * is a shadow root.
   * @param {Node} node The node whose parent to get.
   * @return {Node|null} The parent node or null if no parent exists.
   */
  function getParentNode(node) {
    var parent = node.parentNode;

    if (parent && parent.nodeType == 11 && parent.host) {
      // If the parent is a shadow root, return the host element.
      return parent.host;
    }
    return parent;
  }


  // Exposes the constructors globally.
  window.IntersectionObserver = IntersectionObserver;
  window.IntersectionObserverEntry = IntersectionObserverEntry;

  }(window, document));

  // DOM helper functions

  // private
  function selectionToArray(selection) {
    const len = selection.length;
    const result = [];
    for (let i = 0; i < len; i += 1) {
      result.push(selection[i]);
    }
    return result;
  }

  // public
  function select(selector) {
    if (selector instanceof Element) return selector;
    else if (typeof selector === 'string')
      return document.querySelector(selector);
    return null;
  }

  function selectAll(selector, parent = document) {
    if (typeof selector === 'string') {
      return selectionToArray(parent.querySelectorAll(selector));
    } else if (selector instanceof Element) {
      return selectionToArray([selector]);
    } else if (selector instanceof NodeList) {
      return selectionToArray(selector);
    } else if (selector instanceof Array) {
      return selector;
    }
    return [];
  }

  function getStepId({ id, i }) {
    return `scrollama__debug-step--${id}-${i}`;
  }

  function getOffsetId({ id }) {
    return `scrollama__debug-offset--${id}`;
  }

  // SETUP

  function setupOffset({ id, offsetVal, stepClass }) {
    const el = document.createElement('div');
    el.setAttribute('id', getOffsetId({ id }));
    el.setAttribute('class', 'scrollama__debug-offset');

    el.style.position = 'fixed';
    el.style.left = '0';
    el.style.width = '100%';
    el.style.height = '0px';
    el.style.borderTop = '2px dashed black';
    el.style.zIndex = '9999';

    const text = document.createElement('p');
    text.innerText = `".${stepClass}" trigger: ${offsetVal}`;
    text.style.fontSize = '12px';
    text.style.fontFamily = 'monospace';
    text.style.color = 'black';
    text.style.margin = '0';
    text.style.padding = '6px';
    el.appendChild(text);
    document.body.appendChild(el);
  }

  function setup({ id, offsetVal, stepEl }) {
    const stepClass = stepEl[0].getAttribute('class');
    setupOffset({ id, offsetVal, stepClass });
  }

  // UPDATE
  function updateOffset({ id, offsetMargin, offsetVal }) {
    const idVal = getOffsetId({ id });
    const el = document.querySelector(`#${idVal}`);
    el.style.top = `${offsetMargin}px`;
  }

  function update({ id, stepOffsetHeight, offsetMargin, offsetVal }) {
    updateOffset({ id, offsetMargin });
  }

  function notifyStep({ id, index, state }) {
    const idVal = getStepId({ id, i: index });
    const elA = document.querySelector(`#${idVal}_above`);
    const elB = document.querySelector(`#${idVal}_below`);
    const display = state === 'enter' ? 'block' : 'none';

    if (elA) elA.style.display = display;
    if (elB) elB.style.display = display;
  }

  function scrollama() {
    const ZERO_MOE = 1; // zero with some rounding margin of error
    const callback = {};
    const io = {};

    let containerEl = null;
    let graphicEl = null;
    let stepEl = null;

    let id = null;
    let offsetVal = 0;
    let offsetMargin = 0;
    let vh = 0;
    let ph = 0;
    let stepOffsetHeight = null;
    let stepOffsetTop = null;
    let bboxGraphic = null;

    let isReady = false;
    let isEnabled = false;
    let debugMode = false;
    let progressMode = false;
    let progressThreshold = 0;
    let preserveOrder = false;
    let triggerOnce = false;

    let stepStates = null;
    let containerState = null;
    let previousYOffset = -1;
    let direction = null;

    const exclude = [];

    // HELPERS
    function generateId() {
      const a = 'abcdefghijklmnopqrstuv';
      const l = a.length;
      const t = new Date().getTime();
      const r = [0, 0, 0].map(d => a[Math.floor(Math.random() * l)]).join('');
      return `${r}${t}`;
    }

    //www.gomakethings.com/how-to-get-an-elements-distance-from-the-top-of-the-page-with-vanilla-javascript/
    function getOffsetTop(el) {
      // Set our distance placeholder
      let distance = 0;

      // Loop up the DOM
      if (el.offsetParent) {
        do {
          distance += el.offsetTop;
          el = el.offsetParent;
        } while (el);
      }

      // Return our distance
      return distance < 0 ? 0 : distance;
    }

    function getPageHeight() {
      const body = document.body;
      const html = document.documentElement;

      return Math.max(
        body.scrollHeight,
        body.offsetHeight,
        html.clientHeight,
        html.scrollHeight,
        html.offsetHeight
      );
    }

    function getIndex(element) {
      return +element.getAttribute('data-scrollama-index');
    }

    function updateDirection() {
      if (window.pageYOffset > previousYOffset) direction = 'down';
      else if (window.pageYOffset < previousYOffset) direction = 'up';
      previousYOffset = window.pageYOffset;
    }

    function handleResize() {
      vh = window.innerHeight;
      ph = getPageHeight();

      bboxGraphic = graphicEl ? graphicEl.getBoundingClientRect() : null;

      offsetMargin = offsetVal * vh;

      stepOffsetHeight = stepEl ? stepEl.map(el => el.offsetHeight) : [];

      stepOffsetTop = stepEl ? stepEl.map(getOffsetTop) : [];

      if (isEnabled && isReady) updateIO();

      if (debugMode)
        update({ id, stepOffsetHeight, offsetMargin, offsetVal });
    }

    function handleEnable(enable) {
      if (enable && !isEnabled) {
        if (isReady) updateIO();
        isEnabled = true;
      } else if (!enable) {
        if (io.top) io.top.disconnect();
        if (io.bottom) io.bottom.disconnect();
        if (io.stepAbove) io.stepAbove.forEach(d => d.disconnect());
        if (io.stepBelow) io.stepBelow.forEach(d => d.disconnect());
        if (io.stepProgress) io.stepProgress.forEach(d => d.disconnect());
        if (io.viewportAbove) io.viewportAbove.forEach(d => d.disconnect());
        if (io.viewportBelow) io.viewportBelow.forEach(d => d.disconnect());
        isEnabled = false;
      }
    }

    function createThreshold(height) {
      const count = Math.ceil(height / progressThreshold);
      const t = [];
      const ratio = 1 / count;
      for (let i = 0; i < count; i++) {
        t.push(i * ratio);
      }
      return t;
    }

    // NOTIFY CALLBACKS
    function notifyOthers(index, location) {
      if (location === 'above') {
        // check if steps above/below were skipped and should be notified first
        for (let i = 0; i < index; i++) {
          const ss = stepStates[i];
          if (ss.state === 'enter') notifyStepExit(stepEl[i], 'down');
          if (ss.direction === 'up') {
            notifyStepEnter(stepEl[i], 'down', false);
            notifyStepExit(stepEl[i], 'down');
          }
        }
      } else if (location === 'below') {
        for (let i = stepStates.length - 1; i > index; i--) {
          const ss = stepStates[i];
          if (ss.state === 'enter') {
            notifyStepExit(stepEl[i], 'up');
          }
          if (ss.direction === 'down') {
            notifyStepEnter(stepEl[i], 'up', false);
            notifyStepExit(stepEl[i], 'up');
          }
        }
      }
    }

    function notifyStepEnter(element, direction, check = true) {
      const index = getIndex(element);
      const resp = { element, index, direction };

      // store most recent trigger
      stepStates[index].direction = direction;
      stepStates[index].state = 'enter';

      if (preserveOrder && check && direction === 'down')
        notifyOthers(index, 'above');

      if (preserveOrder && check && direction === 'up')
        notifyOthers(index, 'below');

      if (
        callback.stepEnter &&
        typeof callback.stepEnter === 'function' &&
        !exclude[index]
      ) {
        callback.stepEnter(resp, stepStates);
        if (debugMode) notifyStep({ id, index, state: 'enter' });
        if (triggerOnce) exclude[index] = true;
      }

      if (progressMode) {
        if (direction === 'down') notifyStepProgress(element, 0);
        else notifyStepProgress(element, 1);
      }
    }

    function notifyStepExit(element, direction) {
      const index = getIndex(element);
      const resp = { element, index, direction };

      // store most recent trigger
      stepStates[index].direction = direction;
      stepStates[index].state = 'exit';

      if (progressMode) {
        if (direction === 'down') notifyStepProgress(element, 1);
        else notifyStepProgress(element, 0);
      }

      if (callback.stepExit && typeof callback.stepExit === 'function') {
        callback.stepExit(resp, stepStates);
        if (debugMode) notifyStep({ id, index, state: 'exit' });
      }
    }

    function notifyStepProgress(element, progress) {
      const index = getIndex(element);
      const resp = { element, index, progress };
      if (callback.stepProgress && typeof callback.stepProgress === 'function')
        callback.stepProgress(resp);
    }

    function notifyContainerEnter() {
      const resp = { direction };
      containerState.direction = direction;
      containerState.state = 'enter';
      if (
        callback.containerEnter &&
        typeof callback.containerEnter === 'function'
      )
        callback.containerEnter(resp);
    }

    function notifyContainerExit() {
      const resp = { direction };
      containerState.direction = direction;
      containerState.state = 'exit';
      if (callback.containerExit && typeof callback.containerExit === 'function')
        callback.containerExit(resp);
    }

    // OBSERVER - INTERSECT HANDLING

    // if TOP edge of step crosses threshold,
    // bottom must be > 0 which means it is on "screen" (shifted by offset)
    function intersectStepAbove(entries) {
      updateDirection();
      entries.forEach(entry => {
        const { isIntersecting, boundingClientRect, target } = entry;

        // bottom is how far bottom edge of el is from top of viewport
        const { bottom, height } = boundingClientRect;
        const bottomAdjusted = bottom - offsetMargin;
        const index = getIndex(target);
        const ss = stepStates[index];

        if (bottomAdjusted >= -ZERO_MOE) {
          if (isIntersecting && direction === 'down' && ss.state !== 'enter')
            notifyStepEnter(target, direction);
          else if (!isIntersecting && direction === 'up' && ss.state === 'enter')
            notifyStepExit(target, direction);
          else if (
            !isIntersecting &&
            bottomAdjusted >= height &&
            direction === 'down' &&
            ss.state === 'enter'
          ) {
            notifyStepExit(target, direction);
          }
        }
      });
    }

    function intersectStepBelow(entries) {
      updateDirection();
      entries.forEach(entry => {
        const { isIntersecting, boundingClientRect, target } = entry;

        const { bottom, height } = boundingClientRect;
        const bottomAdjusted = bottom - offsetMargin;
        const index = getIndex(target);
        const ss = stepStates[index];

        if (
          bottomAdjusted >= -ZERO_MOE &&
          bottomAdjusted < height &&
          isIntersecting &&
          direction === 'up' &&
          ss.state !== 'enter'
        ) {
          notifyStepEnter(target, direction);
        } else if (
          bottomAdjusted <= ZERO_MOE &&
          !isIntersecting &&
          direction === 'down' &&
          ss.state === 'enter'
        ) {
          notifyStepExit(target, direction);
        }
      });
    }

    /*
  	if there is a scroll event where a step never intersects (therefore
  	skipping an enter/exit trigger), use this fallback to detect if it is
  	in view
  	*/
    function intersectViewportAbove(entries) {
      updateDirection();
      entries.forEach(entry => {
        const { isIntersecting, target } = entry;
        const index = getIndex(target);
        const ss = stepStates[index];
        if (
          isIntersecting &&
          direction === 'down' &&
          ss.state !== 'enter' &&
          ss.direction !== 'down'
        ) {
          notifyStepEnter(target, 'down');
          notifyStepExit(target, 'down');
        }
      });
    }

    function intersectViewportBelow(entries) {
      updateDirection();
      entries.forEach(entry => {
        const { isIntersecting, target } = entry;
        const index = getIndex(target);
        const ss = stepStates[index];
        if (
          isIntersecting &&
          direction === 'up' &&
          ss.state !== 'enter' &&
          ss.direction !== 'up'
        ) {
          notifyStepEnter(target, 'up');
          notifyStepExit(target, 'up');
        }
      });
    }

    function intersectStepProgress(entries) {
      updateDirection();
      entries.forEach(
        ({ isIntersecting, intersectionRatio, boundingClientRect, target }) => {
          const { bottom } = boundingClientRect;
          const bottomAdjusted = bottom - offsetMargin;

          if (isIntersecting && bottomAdjusted >= -ZERO_MOE) {
            notifyStepProgress(target, +intersectionRatio.toFixed(3));
          }
        }
      );
    }

    function intersectTop(entries) {
      updateDirection();
      const { isIntersecting, boundingClientRect } = entries[0];
      const { top, bottom } = boundingClientRect;

      if (bottom > -ZERO_MOE) {
        if (isIntersecting) notifyContainerEnter(direction);
        else if (containerState.state === 'enter') notifyContainerExit(direction);
      }
    }

    function intersectBottom(entries) {
      updateDirection();
      const { isIntersecting, boundingClientRect } = entries[0];
      const { top } = boundingClientRect;

      if (top < ZERO_MOE) {
        if (isIntersecting) notifyContainerEnter(direction);
        else if (containerState.state === 'enter') notifyContainerExit(direction);
      }
    }

    // OBSERVER - CREATION

    function updateTopIO() {
      if (io.top) io.top.unobserve(containerEl);

      const options = {
        root: null,
        rootMargin: `${vh}px 0px -${vh}px 0px`,
        threshold: 0
      };

      io.top = new IntersectionObserver(intersectTop, options);
      io.top.observe(containerEl);
    }

    function updateBottomIO() {
      if (io.bottom) io.bottom.unobserve(containerEl);
      const options = {
        root: null,
        rootMargin: `-${bboxGraphic.height}px 0px ${bboxGraphic.height}px 0px`,
        threshold: 0
      };

      io.bottom = new IntersectionObserver(intersectBottom, options);
      io.bottom.observe(containerEl);
    }

    // top edge
    function updateStepAboveIO() {
      if (io.stepAbove) io.stepAbove.forEach(d => d.disconnect());

      io.stepAbove = stepEl.map((el, i) => {
        const marginTop = stepOffsetHeight[i];
        const marginBottom = -vh + offsetMargin;
        const rootMargin = `${marginTop}px 0px ${marginBottom}px 0px`;

        const options = {
          root: null,
          rootMargin,
          threshold: 0
        };

        const obs = new IntersectionObserver(intersectStepAbove, options);
        obs.observe(el);
        return obs;
      });
    }

    // bottom edge
    function updateStepBelowIO() {
      if (io.stepBelow) io.stepBelow.forEach(d => d.disconnect());

      io.stepBelow = stepEl.map((el, i) => {
        const marginTop = -offsetMargin;
        const marginBottom = ph - vh + stepOffsetHeight[i] + offsetMargin;
        const rootMargin = `${marginTop}px 0px ${marginBottom}px 0px`;

        const options = {
          root: null,
          rootMargin,
          threshold: 0
        };

        const obs = new IntersectionObserver(intersectStepBelow, options);
        obs.observe(el);
        return obs;
      });
    }

    // jump into viewport
    function updateViewportAboveIO() {
      if (io.viewportAbove) io.viewportAbove.forEach(d => d.disconnect());
      io.viewportAbove = stepEl.map((el, i) => {
        const marginTop = stepOffsetTop[i];
        const marginBottom = -(vh - offsetMargin + stepOffsetHeight[i]);
        const rootMargin = `${marginTop}px 0px ${marginBottom}px 0px`;
        const options = {
          root: null,
          rootMargin,
          threshold: 0
        };

        const obs = new IntersectionObserver(intersectViewportAbove, options);
        obs.observe(el);
        return obs;
      });
    }

    function updateViewportBelowIO() {
      if (io.viewportBelow) io.viewportBelow.forEach(d => d.disconnect());
      io.viewportBelow = stepEl.map((el, i) => {
        const marginTop = -(offsetMargin + stepOffsetHeight[i]);
        const marginBottom =
          ph - stepOffsetTop[i] - stepOffsetHeight[i] - offsetMargin;
        const rootMargin = `${marginTop}px 0px ${marginBottom}px 0px`;
        const options = {
          root: null,
          rootMargin,
          threshold: 0
        };

        const obs = new IntersectionObserver(intersectViewportBelow, options);
        obs.observe(el);
        return obs;
      });
    }

    // progress progress tracker
    function updateStepProgressIO() {
      if (io.stepProgress) io.stepProgress.forEach(d => d.disconnect());

      io.stepProgress = stepEl.map((el, i) => {
        const marginTop = stepOffsetHeight[i] - offsetMargin;
        const marginBottom = -vh + offsetMargin;
        const rootMargin = `${marginTop}px 0px ${marginBottom}px 0px`;

        const threshold = createThreshold(stepOffsetHeight[i]);
        const options = {
          root: null,
          rootMargin,
          threshold
        };

        const obs = new IntersectionObserver(intersectStepProgress, options);
        obs.observe(el);
        return obs;
      });
    }

    function updateIO() {
      updateViewportAboveIO();
      updateViewportBelowIO();
      updateStepAboveIO();
      updateStepBelowIO();

      if (progressMode) updateStepProgressIO();

      if (containerEl && graphicEl) {
        updateTopIO();
        updateBottomIO();
      }
    }

    // SETUP FUNCTIONS

    function indexSteps() {
      stepEl.forEach((el, i) => el.setAttribute('data-scrollama-index', i));
    }

    function setupStates() {
      stepStates = stepEl.map(() => ({
        direction: null,
        state: null
      }));

      containerState = { direction: null, state: null };
    }

    function addDebug() {
      if (debugMode) setup({ id, stepEl, offsetVal });
    }

    const S = {};

    S.setup = ({
      container,
      graphic,
      step,
      offset = 0.5,
      progress = false,
      threshold = 4,
      debug = false,
      order = true,
      once = false
    }) => {
      id = generateId();
      // elements
      stepEl = selectAll(step);
      containerEl = container ? select(container) : null;
      graphicEl = graphic ? select(graphic) : null;

      // error if no step selected
      if (!stepEl.length) {
        console.error('scrollama error: no step elements');
        return S;
      }

      // options
      debugMode = debug;
      progressMode = progress;
      preserveOrder = order;
      triggerOnce = once;

      S.offsetTrigger(offset);
      progressThreshold = Math.max(1, +threshold);

      isReady = true;

      // customize
      addDebug();
      indexSteps();
      setupStates();
      handleResize();
      handleEnable(true);
      return S;
    };

    S.resize = () => {
      handleResize();
      return S;
    };

    S.enable = () => {
      handleEnable(true);
      return S;
    };

    S.disable = () => {
      handleEnable(false);
      return S;
    };

    S.destroy = () => {
      handleEnable(false);
      Object.keys(callback).forEach(c => (callback[c] = null));
      Object.keys(io).forEach(i => (io[i] = null));
    };

    S.offsetTrigger = function(x) {
      if (x && !isNaN(x)) {
        offsetVal = Math.min(Math.max(0, x), 1);
        return S;
      }
      return offsetVal;
    };

    S.onStepEnter = cb => {
      callback.stepEnter = cb;
      return S;
    };

    S.onStepExit = cb => {
      callback.stepExit = cb;
      return S;
    };

    S.onStepProgress = cb => {
      callback.stepProgress = cb;
      return S;
    };

    S.onContainerEnter = cb => {
      callback.containerEnter = cb;
      return S;
    };

    S.onContainerExit = cb => {
      callback.containerExit = cb;
      return S;
    };

    return S;
  }

  const sovietCountryIsoCodes = ["ARM", "AZE", "BLR", "EST", "GEO", "KAZ", "KGZ", "LVA", "LTU", "MDA", "RUS", "TJK", "TKM", "UKR", "UZB"];
  const primaryReceivingIsoCodes = ["DEU", "ISR", "USA"];
  const colors = ["#feedde", "#fdbe85", "#fd8d3c", "#e6550d", "#dd6344", "#feedde", "#fdbe85", "#fd8d3c", "#e6550d", "#feedde", "#fdbe85", "#fd8d3c", "#e6550d", "#dd6344"];
  const sovietLabelShift = {
    ARM: {
      x: -16,
      y: 3
    },
    AZE: {
      x: -14,
      y: 7
    },
    BLR: {
      x: -20,
      y: 2
    },
    EST: {
      x: -13,
      y: -3
    },
    GEO: {
      x: -18,
      y: 1
    },
    KAZ: {
      x: 13,
      y: 15
    },
    KGZ: {
      x: 1,
      y: 10
    },
    LVA: {
      x: -15,
      y: -2
    },
    LTU: {
      x: -18,
      y: 0
    },
    MDA: {
      x: -18,
      y: 2
    },
    RUS: {
      x: -40,
      y: 10
    },
    TJK: {
      x: -6,
      y: 10
    },
    TKM: {
      x: -20,
      y: 10
    },
    UKR: {
      x: -23,
      y: 0
    },
    UZB: {
      x: -12,
      y: 18
    }
  }; // Step 2

  const populationsIn1989millions = [{
    name: "ARM",
    population: 3
  }, {
    name: "AZE",
    population: 6
  }, {
    name: "BLR",
    population: 9.6
  }, {
    name: "EST",
    population: 14.7
  }, {
    name: "GEO",
    population: 5
  }, {
    name: "KAZ",
    population: 16.5
  }, {
    name: "KGZ",
    population: 3.5
  }, {
    name: "LVA",
    population: 2.5
  }, {
    name: "LTU",
    population: 3.4
  }, {
    name: "MDA",
    population: 4
  }, {
    name: "TJK",
    population: 3.8
  }, {
    name: "TKM",
    population: 2.8
  }, {
    name: "UKR",
    population: 51.7
  }, {
    name: "UZB",
    population: 19.9
  }];
  const russianPopulationsIn1989thousands = [{
    name: "ARM",
    population: 52
  }, {
    name: "AZE",
    population: 392
  }, {
    name: "BLR",
    population: 1342
  }, {
    name: "EST",
    population: 475
  }, {
    name: "GEO",
    population: 341
  }, {
    name: "KAZ",
    population: 6228
  }, {
    name: "KGZ",
    population: 917
  }, {
    name: "LVA",
    population: 906
  }, {
    name: "LTU",
    population: 345
  }, {
    name: "MDA",
    population: 562
  }, {
    name: "TJK",
    population: 389
  }, {
    name: "TKM",
    population: 334
  }, {
    name: "UKR",
    population: 11356
  }, {
    name: "UZB",
    population: 1654
  }]; // export const populationsIn1989 = [
  //   { name: "ARM", population: 3031000	 },
  //   { name: "AZE", population: 6028000 },
  //   { name: "BLR", population: 9560000 },
  //   { name: "EST", population: 1466000	 },
  //   { name: "GEO", population: 5015000 },
  //   { name: "KAZ", population: 16536511 },
  //   { name: "KGZ", population: 3529000 },
  //   { name: "LVA", population: 2521000 },
  //   { name: "LTU", population: 3398000 },
  //   { name: "MDA", population: 3947000 },
  //   { name: "TJK", population: 3801000 },
  //   { name: "TKM", population: 2759000 },
  //   { name: "UKR", population: 51706742 },
  //   { name: "UZB", population: 19905158 }
  // ];
  // Step 3
  // in thousands

  const netMigrantsToRussia1989to2002 = [{
    name: "ARM",
    population: 34
  }, {
    name: "AZE",
    population: 195
  }, {
    name: "BLR",
    population: 10
  }, {
    name: "EST",
    population: 59
  }, {
    name: "GEO",
    population: 162
  }, {
    name: "KAZ",
    population: 125
  }, {
    name: "KGZ",
    population: 244
  }, {
    name: "LVA",
    population: 96
  }, {
    name: "LTU",
    population: 46
  }, {
    name: "MDA",
    population: 65
  }, {
    name: "TJK",
    population: 232
  }, {
    name: "TKM",
    population: 98
  }, {
    name: "UKR",
    population: 3341
  }, {
    name: "UZB",
    population: 496
  }]; // Step 4
  const migrationAbroadDestination1995to2002 = [{
    name: 'a',
    population: 0
  }, {
    name: 'b',
    population: 0
  }, {
    name: 'c',
    population: 0
  }, {
    name: 'd',
    population: 0
  }, {
    name: 'e',
    population: 0
  }, {
    name: 'f',
    population: 0
  }, {
    name: 'g',
    population: 0
  }, {
    name: 'h',
    population: 0
  }, {
    name: 'i',
    population: 0
  }, {
    name: 'j',
    population: 0
  }, {
    name: 'k',
    population: 0
  }, {
    name: "Germany",
    population: 59
  }, {
    name: "Israel",
    population: 25
  }, {
    name: "United States",
    population: 11
  }];
  // export const netFsuMigrationOne = [
  //   { name: "ARM", population: 200000 },
  //   { name: "AZE", population: 298900 },
  //   { name: "BLR", population: 26500, net: "in" },
  //   { name: "EST", population: 66400 },
  //   { name: "GEO", population: 358700 },
  //   { name: "KAZ", population: 1497400 },
  //   { name: "KGZ", population: 272900 },
  //   { name: "LVA", population: 109700 },
  //   { name: "LTU", population: 46600 },
  //   { name: "MDA", population: 78500 },
  //   { name: "TJK", population: 314700 },
  //   { name: "TKM", population: 116100 },
  //   { name: "UKR", population: 341600 },
  //   { name: "UZB", population: 605000 }
  // ];
  // export const netFsuMigrationTwo = [
  //   { name: "ARM", population: 188700 },
  //   { name: "AZE", population: 120500 },
  //   { name: "BLR", population: 2200 },
  //   { name: "EST", population: 2400 },
  //   { name: "GEO", population: 70900 },
  //   { name: "KAZ", population: 347400 },
  //   { name: "KGZ", population: 179400 },
  //   { name: "LVA", population: 6800 },
  //   { name: "LTU", population: 2900 },
  //   { name: "MDA", population: 106100 },
  //   { name: "TJK", population: 135700 },
  //   { name: "TKM", population: 43200 },
  //   { name: "UKR", population: 261500 },
  //   { name: "UZB", population: 349000 }
  // ];
  // Three non-FSU countries counries recieve bhe bulk of persons
  // leaving Russia:
  // const worldOut1995to2002inPercent = {
  //   germany: 59,
  //   israel: 25,
  //   us: 11
  // };
  // migration to the far abroud consisted of 3 groups
  // Germans / Russians / Jews
  // 1995 -> 2002,
  // 43% of net migration consisted of germans
  // attracted by the generous resettlement package for the aussiedler
  // and strong german economy
  // Russians
  // 38% of net migrants
  // Jews
  // 10% of net migrants
  // Since 1989, Russia has net in migrants from FSU states, with exception of Belarus
  // 1989 to 2002
  // the largest share of Russian immigration was from 3 states that already
  // had the largest Russian diaspora populations:
  // Ukr: 25%
  // Kazakhstan 25%
  // Uzbekistan: 11%
  // overall,
  // Central Asia is 50%
  // 3 states above 15%
  // baltics 4%
  // Migration Rates
  // 61,500 1991
  // 612,378 1994
  // 71,120 in 2002
  //
  // 1989 -> 2002, Russians account for 58.6% immigrants to Russia
  // Russia in 1989 was 81.3 percent russians

  function zeroAnimation(worldMap) {
    worldMap.animateSectionStyles({
      duration: 1000,
      section: '.non-soviet-country',
      styles: {
        opacity: '0.5',
        'stroke-width': '0.25px'
      }
    });
  }

  function firstAnimation(worldMap) {
    const zoomParams = {
      scale: 4,
      duration: 1000,
      translateX: -Math.floor(worldMap.width * 0.462),
      translateY: -Math.floor(worldMap.height * 0.2)
    };
    worldMap.animateMapZoom(zoomParams);
    worldMap.createLabels();
    worldMap.createPopulationChoropleth();
    worldMap.animateSectionStyles({
      duration: 500,
      section: '.non-soviet-country',
      styles: {
        opacity: '0.1',
        'stroke-width': '0.175px'
      }
    });
  }

  function secondAnimation(worldMap, barChart) {
    worldMap.moveMapContainer({
      duration: 1000,
      top: 0
    });
    barChart.revealBarChart();
    barChart.redrawBars(populationsIn1989millions);
    barChart.addPopulationLabels(populationsIn1989millions);
  }

  function thirdAnimation(worldMap, barChart) {
    const title = 'Russians Populations 1989';
    barChart.drawTitle(title, 'thou');
    barChart.repaintChart(russianPopulationsIn1989thousands);
  }

  function fourthAnimation(worldMap, barChart) {
    worldMap.addPointsToMap();
    worldMap.drawCurves(); // worldMap.drawLabelPointer()

    const title = 'Net Migration to Russia \'89-\'02';
    barChart.drawTitle(title, 'thou');
    barChart.repaintChart(netMigrantsToRussia1989to2002);
  }

  function fifthAnimation(worldMap, barChart) {
    worldMap.animateSectionStyles({
      duration: 500,
      section: '.arc',
      styles: {
        opacity: '0'
      }
    });
    worldMap.animateSectionStyles({
      duration: 500,
      section: 'circle',
      styles: {
        opacity: '0'
      }
    });
    barChart.hideAllElements();
    const graphicMarginTop = Math.floor(window.innerHeight * 0.25);
    worldMap.moveMapContainer({
      duration: 1000,
      top: graphicMarginTop
    });
  }

  function sixthAnimation(worldMap, barChart) {
    worldMap.animateSectionStyles({
      duration: 500,
      section: '.place-label',
      styles: {
        opacity: '0'
      }
    });
    const zoomParams = {
      scale: 2,
      duration: 1000,
      translateX: -Math.floor(worldMap.width * 0.5),
      translateY: -Math.floor(worldMap.height * 0.1)
    };
    worldMap.animateMapZoom(zoomParams);
    worldMap.animateSectionStyles({
      duration: 500,
      section: '.non-soviet-country',
      styles: {
        opacity: '0.25'
      }
    });
    worldMap.animateCISStyles({
      duration: 500,
      section: '.soviet-country',
      styles: {
        opacity: '0.25',
        fill: '#d0d0d0'
      }
    }); // const title = 'Russia Population 1989 - 2002'
    // barChart.drawTitle(title)
    // barChart.repaintChart(populationRussia1989to2002)
  }

  function seventhAnimation(worldMap, barChart) {
    const title = 'Top Destinations For FSU Immigrants';
    barChart.drawTitle(title);
    barChart.redrawBarsWith3DataPoints(migrationAbroadDestination1995to2002);
    const zoomParams = {
      scale: 2,
      duration: 1000,
      translateX: -Math.floor(worldMap.width * 0.2),
      translateY: -Math.floor(worldMap.height * 0.2)
    };
    worldMap.animateMapZoom(zoomParams);
    worldMap.animateSectionStyles({
      duration: 500,
      section: '.soviet-country',
      styles: {
        opacity: '1',
        fill: '#fcd116'
      }
    });
    worldMap.animateWorldSections(zoomParams);
  }

  function eightAnimation(worldMap, barChart) {
    const zoomParams = {
      scale: 4,
      duration: 1000,
      translateX: -Math.floor(worldMap.width * 0.4),
      translateY: -Math.floor(worldMap.height * 0.2)
    };
    worldMap.animateMapZoom(zoomParams);
    worldMap.animateSectionStyles({
      duration: 1000,
      section: '.arc',
      styles: {
        opacity: '0'
      }
    });
    worldMap.animateSectionStyles({
      duration: 1000,
      section: '#arc-DEU',
      styles: {
        opacity: '1'
      }
    });
  }

  function ninthAnimation(worldMap, barChart) {
    worldMap.animateSectionStyles({
      duration: 1000,
      section: '#arc-DEU',
      styles: {
        opacity: '0'
      }
    });
    worldMap.animateSectionStyles({
      duration: 1000,
      section: '#arc-ISR',
      styles: {
        opacity: '1'
      }
    });
  }

  function tenthAnimation(worldMap, barChart) {// Zoom to Germany -> DONE
    // hide other arcs
    // animate bars? 
  }

  function eleventhAnimation(worldMap, barChart) {}

  function twelfthAnimation(worldMap, barChart) {}

  var animations = {
    0: zeroAnimation,
    1: firstAnimation,
    2: secondAnimation,
    3: thirdAnimation,
    4: fourthAnimation,
    5: fifthAnimation,
    6: sixthAnimation,
    7: seventhAnimation,
    8: eightAnimation,
    9: ninthAnimation,
    10: tenthAnimation,
    11: eleventhAnimation,
    12: twelfthAnimation
  };

  function setupScrollama(worldMap, barChart) {
    // response = { element, direction, index }
    function handleStepEnter(response) {
      console.warn('SCROLLAMA animation[index]:: ', response.index);
      const animationIndex = response.index;
      const animationHandler = animations[animationIndex];
      animationHandler(worldMap, barChart);
    }

    scrollama().setup({
      container: ".scroll",
      graphic: ".map-graphic-container",
      text: ".scroll-text",
      step: ".scroll-text .step",
      debug: false,
      offset: 0.9
    }).onStepEnter(handleStepEnter);
  }

  function firstPaint() {
    // Setup sizes for the graphic and steps
    const fullPageHeight = Math.floor(window.innerHeight);
    const halfPageHeight = Math.floor(window.innerHeight / 2);
    const quarterPageHeight = Math.floor(window.innerHeight * 0.25);
    d3.selectAll(".step").style("height", fullPageHeight + "px"); // scroll graphic is world map container

    d3.select(".map-graphic-container").style("width", '100%').style("height", halfPageHeight + "px").style("top", quarterPageHeight + "px");
    d3.select(".bar-graphic-container").style('top', halfPageHeight + 'px').style("width", '100%').style("height", halfPageHeight + "px"); // Use this to set the distance of the first step

    d3.select(".splash-container").style("height", fullPageHeight + "px");
  }

  function loadMap() {
    return new Promise((resolve, reject) => {
      d3.json("./json/110topoworld.json", function (json) {
        console.warn("loaded 110topoworld.json:", json);
        resolve(json);
      });
    });
  }

  var commonjsGlobal = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

  function unwrapExports (x) {
  	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x.default : x;
  }

  function createCommonjsModule(fn, module) {
  	return module = { exports: {} }, fn(module, module.exports), module.exports;
  }

  var topojson = createCommonjsModule(function (module, exports) {
  (function (global, factory) {
    factory(exports);
  }(commonjsGlobal, (function (exports) {
  function noop() {}

  function transformAbsolute(transform) {
    if (!transform) return noop;
    var x0,
        y0,
        kx = transform.scale[0],
        ky = transform.scale[1],
        dx = transform.translate[0],
        dy = transform.translate[1];
    return function(point, i) {
      if (!i) x0 = y0 = 0;
      point[0] = (x0 += point[0]) * kx + dx;
      point[1] = (y0 += point[1]) * ky + dy;
    };
  }

  function transformRelative(transform) {
    if (!transform) return noop;
    var x0,
        y0,
        kx = transform.scale[0],
        ky = transform.scale[1],
        dx = transform.translate[0],
        dy = transform.translate[1];
    return function(point, i) {
      if (!i) x0 = y0 = 0;
      var x1 = Math.round((point[0] - dx) / kx),
          y1 = Math.round((point[1] - dy) / ky);
      point[0] = x1 - x0;
      point[1] = y1 - y0;
      x0 = x1;
      y0 = y1;
    };
  }

  function reverse(array, n) {
    var t, j = array.length, i = j - n;
    while (i < --j) t = array[i], array[i++] = array[j], array[j] = t;
  }

  function bisect(a, x) {
    var lo = 0, hi = a.length;
    while (lo < hi) {
      var mid = lo + hi >>> 1;
      if (a[mid] < x) lo = mid + 1;
      else hi = mid;
    }
    return lo;
  }

  function feature(topology, o) {
    return o.type === "GeometryCollection" ? {
      type: "FeatureCollection",
      features: o.geometries.map(function(o) { return feature$1(topology, o); })
    } : feature$1(topology, o);
  }

  function feature$1(topology, o) {
    var f = {
      type: "Feature",
      id: o.id,
      properties: o.properties || {},
      geometry: object(topology, o)
    };
    if (o.id == null) delete f.id;
    return f;
  }

  function object(topology, o) {
    var absolute = transformAbsolute(topology.transform),
        arcs = topology.arcs;

    function arc(i, points) {
      if (points.length) points.pop();
      for (var a = arcs[i < 0 ? ~i : i], k = 0, n = a.length, p; k < n; ++k) {
        points.push(p = a[k].slice());
        absolute(p, k);
      }
      if (i < 0) reverse(points, n);
    }

    function point(p) {
      p = p.slice();
      absolute(p, 0);
      return p;
    }

    function line(arcs) {
      var points = [];
      for (var i = 0, n = arcs.length; i < n; ++i) arc(arcs[i], points);
      if (points.length < 2) points.push(points[0].slice());
      return points;
    }

    function ring(arcs) {
      var points = line(arcs);
      while (points.length < 4) points.push(points[0].slice());
      return points;
    }

    function polygon(arcs) {
      return arcs.map(ring);
    }

    function geometry(o) {
      var t = o.type;
      return t === "GeometryCollection" ? {type: t, geometries: o.geometries.map(geometry)}
          : t in geometryType ? {type: t, coordinates: geometryType[t](o)}
          : null;
    }

    var geometryType = {
      Point: function(o) { return point(o.coordinates); },
      MultiPoint: function(o) { return o.coordinates.map(point); },
      LineString: function(o) { return line(o.arcs); },
      MultiLineString: function(o) { return o.arcs.map(line); },
      Polygon: function(o) { return polygon(o.arcs); },
      MultiPolygon: function(o) { return o.arcs.map(polygon); }
    };

    return geometry(o);
  }

  function stitchArcs(topology, arcs) {
    var stitchedArcs = {},
        fragmentByStart = {},
        fragmentByEnd = {},
        fragments = [],
        emptyIndex = -1;

    // Stitch empty arcs first, since they may be subsumed by other arcs.
    arcs.forEach(function(i, j) {
      var arc = topology.arcs[i < 0 ? ~i : i], t;
      if (arc.length < 3 && !arc[1][0] && !arc[1][1]) {
        t = arcs[++emptyIndex], arcs[emptyIndex] = i, arcs[j] = t;
      }
    });

    arcs.forEach(function(i) {
      var e = ends(i),
          start = e[0],
          end = e[1],
          f, g;

      if (f = fragmentByEnd[start]) {
        delete fragmentByEnd[f.end];
        f.push(i);
        f.end = end;
        if (g = fragmentByStart[end]) {
          delete fragmentByStart[g.start];
          var fg = g === f ? f : f.concat(g);
          fragmentByStart[fg.start = f.start] = fragmentByEnd[fg.end = g.end] = fg;
        } else {
          fragmentByStart[f.start] = fragmentByEnd[f.end] = f;
        }
      } else if (f = fragmentByStart[end]) {
        delete fragmentByStart[f.start];
        f.unshift(i);
        f.start = start;
        if (g = fragmentByEnd[start]) {
          delete fragmentByEnd[g.end];
          var gf = g === f ? f : g.concat(f);
          fragmentByStart[gf.start = g.start] = fragmentByEnd[gf.end = f.end] = gf;
        } else {
          fragmentByStart[f.start] = fragmentByEnd[f.end] = f;
        }
      } else {
        f = [i];
        fragmentByStart[f.start = start] = fragmentByEnd[f.end = end] = f;
      }
    });

    function ends(i) {
      var arc = topology.arcs[i < 0 ? ~i : i], p0 = arc[0], p1;
      if (topology.transform) p1 = [0, 0], arc.forEach(function(dp) { p1[0] += dp[0], p1[1] += dp[1]; });
      else p1 = arc[arc.length - 1];
      return i < 0 ? [p1, p0] : [p0, p1];
    }

    function flush(fragmentByEnd, fragmentByStart) {
      for (var k in fragmentByEnd) {
        var f = fragmentByEnd[k];
        delete fragmentByStart[f.start];
        delete f.start;
        delete f.end;
        f.forEach(function(i) { stitchedArcs[i < 0 ? ~i : i] = 1; });
        fragments.push(f);
      }
    }

    flush(fragmentByEnd, fragmentByStart);
    flush(fragmentByStart, fragmentByEnd);
    arcs.forEach(function(i) { if (!stitchedArcs[i < 0 ? ~i : i]) fragments.push([i]); });

    return fragments;
  }

  function mesh(topology) {
    return object(topology, meshArcs.apply(this, arguments));
  }

  function meshArcs(topology, o, filter) {
    var arcs = [];

    function arc(i) {
      var j = i < 0 ? ~i : i;
      (geomsByArc[j] || (geomsByArc[j] = [])).push({i: i, g: geom});
    }

    function line(arcs) {
      arcs.forEach(arc);
    }

    function polygon(arcs) {
      arcs.forEach(line);
    }

    function geometry(o) {
      if (o.type === "GeometryCollection") o.geometries.forEach(geometry);
      else if (o.type in geometryType) geom = o, geometryType[o.type](o.arcs);
    }

    if (arguments.length > 1) {
      var geomsByArc = [],
          geom;

      var geometryType = {
        LineString: line,
        MultiLineString: polygon,
        Polygon: polygon,
        MultiPolygon: function(arcs) { arcs.forEach(polygon); }
      };

      geometry(o);

      geomsByArc.forEach(arguments.length < 3
          ? function(geoms) { arcs.push(geoms[0].i); }
          : function(geoms) { if (filter(geoms[0].g, geoms[geoms.length - 1].g)) arcs.push(geoms[0].i); });
    } else {
      for (var i = 0, n = topology.arcs.length; i < n; ++i) arcs.push(i);
    }

    return {type: "MultiLineString", arcs: stitchArcs(topology, arcs)};
  }

  function cartesianTriangleArea(triangle) {
    var a = triangle[0], b = triangle[1], c = triangle[2];
    return Math.abs((a[0] - c[0]) * (b[1] - a[1]) - (a[0] - b[0]) * (c[1] - a[1]));
  }

  function ring(ring) {
    var i = -1,
        n = ring.length,
        a,
        b = ring[n - 1],
        area = 0;

    while (++i < n) {
      a = b;
      b = ring[i];
      area += a[0] * b[1] - a[1] * b[0];
    }

    return area / 2;
  }

  function merge(topology) {
    return object(topology, mergeArcs.apply(this, arguments));
  }

  function mergeArcs(topology, objects) {
    var polygonsByArc = {},
        polygons = [],
        components = [];

    objects.forEach(function(o) {
      if (o.type === "Polygon") register(o.arcs);
      else if (o.type === "MultiPolygon") o.arcs.forEach(register);
    });

    function register(polygon) {
      polygon.forEach(function(ring$$) {
        ring$$.forEach(function(arc) {
          (polygonsByArc[arc = arc < 0 ? ~arc : arc] || (polygonsByArc[arc] = [])).push(polygon);
        });
      });
      polygons.push(polygon);
    }

    function area(ring$$) {
      return Math.abs(ring(object(topology, {type: "Polygon", arcs: [ring$$]}).coordinates[0]));
    }

    polygons.forEach(function(polygon) {
      if (!polygon._) {
        var component = [],
            neighbors = [polygon];
        polygon._ = 1;
        components.push(component);
        while (polygon = neighbors.pop()) {
          component.push(polygon);
          polygon.forEach(function(ring$$) {
            ring$$.forEach(function(arc) {
              polygonsByArc[arc < 0 ? ~arc : arc].forEach(function(polygon) {
                if (!polygon._) {
                  polygon._ = 1;
                  neighbors.push(polygon);
                }
              });
            });
          });
        }
      }
    });

    polygons.forEach(function(polygon) {
      delete polygon._;
    });

    return {
      type: "MultiPolygon",
      arcs: components.map(function(polygons) {
        var arcs = [], n;

        // Extract the exterior (unique) arcs.
        polygons.forEach(function(polygon) {
          polygon.forEach(function(ring$$) {
            ring$$.forEach(function(arc) {
              if (polygonsByArc[arc < 0 ? ~arc : arc].length < 2) {
                arcs.push(arc);
              }
            });
          });
        });

        // Stitch the arcs into one or more rings.
        arcs = stitchArcs(topology, arcs);

        // If more than one ring is returned,
        // at most one of these rings can be the exterior;
        // choose the one with the greatest absolute area.
        if ((n = arcs.length) > 1) {
          for (var i = 1, k = area(arcs[0]), ki, t; i < n; ++i) {
            if ((ki = area(arcs[i])) > k) {
              t = arcs[0], arcs[0] = arcs[i], arcs[i] = t, k = ki;
            }
          }
        }

        return arcs;
      })
    };
  }

  function neighbors(objects) {
    var indexesByArc = {}, // arc index -> array of object indexes
        neighbors = objects.map(function() { return []; });

    function line(arcs, i) {
      arcs.forEach(function(a) {
        if (a < 0) a = ~a;
        var o = indexesByArc[a];
        if (o) o.push(i);
        else indexesByArc[a] = [i];
      });
    }

    function polygon(arcs, i) {
      arcs.forEach(function(arc) { line(arc, i); });
    }

    function geometry(o, i) {
      if (o.type === "GeometryCollection") o.geometries.forEach(function(o) { geometry(o, i); });
      else if (o.type in geometryType) geometryType[o.type](o.arcs, i);
    }

    var geometryType = {
      LineString: line,
      MultiLineString: polygon,
      Polygon: polygon,
      MultiPolygon: function(arcs, i) { arcs.forEach(function(arc) { polygon(arc, i); }); }
    };

    objects.forEach(geometry);

    for (var i in indexesByArc) {
      for (var indexes = indexesByArc[i], m = indexes.length, j = 0; j < m; ++j) {
        for (var k = j + 1; k < m; ++k) {
          var ij = indexes[j], ik = indexes[k], n;
          if ((n = neighbors[ij])[i = bisect(n, ik)] !== ik) n.splice(i, 0, ik);
          if ((n = neighbors[ik])[i = bisect(n, ij)] !== ij) n.splice(i, 0, ij);
        }
      }
    }

    return neighbors;
  }

  function compareArea(a, b) {
    return a[1][2] - b[1][2];
  }

  function minAreaHeap() {
    var heap = {},
        array = [],
        size = 0;

    heap.push = function(object) {
      up(array[object._ = size] = object, size++);
      return size;
    };

    heap.pop = function() {
      if (size <= 0) return;
      var removed = array[0], object;
      if (--size > 0) object = array[size], down(array[object._ = 0] = object, 0);
      return removed;
    };

    heap.remove = function(removed) {
      var i = removed._, object;
      if (array[i] !== removed) return; // invalid request
      if (i !== --size) object = array[size], (compareArea(object, removed) < 0 ? up : down)(array[object._ = i] = object, i);
      return i;
    };

    function up(object, i) {
      while (i > 0) {
        var j = ((i + 1) >> 1) - 1,
            parent = array[j];
        if (compareArea(object, parent) >= 0) break;
        array[parent._ = i] = parent;
        array[object._ = i = j] = object;
      }
    }

    function down(object, i) {
      while (true) {
        var r = (i + 1) << 1,
            l = r - 1,
            j = i,
            child = array[j];
        if (l < size && compareArea(array[l], child) < 0) child = array[j = l];
        if (r < size && compareArea(array[r], child) < 0) child = array[j = r];
        if (j === i) break;
        array[child._ = i] = child;
        array[object._ = i = j] = object;
      }
    }

    return heap;
  }

  function presimplify(topology, triangleArea) {
    var absolute = transformAbsolute(topology.transform),
        relative = transformRelative(topology.transform),
        heap = minAreaHeap();

    if (!triangleArea) triangleArea = cartesianTriangleArea;

    topology.arcs.forEach(function(arc) {
      var triangles = [],
          maxArea = 0,
          triangle,
          i,
          n,
          p;

      // To store each point’s effective area, we create a new array rather than
      // extending the passed-in point to workaround a Chrome/V8 bug (getting
      // stuck in smi mode). For midpoints, the initial effective area of
      // Infinity will be computed in the next step.
      for (i = 0, n = arc.length; i < n; ++i) {
        p = arc[i];
        absolute(arc[i] = [p[0], p[1], Infinity], i);
      }

      for (i = 1, n = arc.length - 1; i < n; ++i) {
        triangle = arc.slice(i - 1, i + 2);
        triangle[1][2] = triangleArea(triangle);
        triangles.push(triangle);
        heap.push(triangle);
      }

      for (i = 0, n = triangles.length; i < n; ++i) {
        triangle = triangles[i];
        triangle.previous = triangles[i - 1];
        triangle.next = triangles[i + 1];
      }

      while (triangle = heap.pop()) {
        var previous = triangle.previous,
            next = triangle.next;

        // If the area of the current point is less than that of the previous point
        // to be eliminated, use the latter's area instead. This ensures that the
        // current point cannot be eliminated without eliminating previously-
        // eliminated points.
        if (triangle[1][2] < maxArea) triangle[1][2] = maxArea;
        else maxArea = triangle[1][2];

        if (previous) {
          previous.next = next;
          previous[2] = triangle[2];
          update(previous);
        }

        if (next) {
          next.previous = previous;
          next[0] = triangle[0];
          update(next);
        }
      }

      arc.forEach(relative);
    });

    function update(triangle) {
      heap.remove(triangle);
      triangle[1][2] = triangleArea(triangle);
      heap.push(triangle);
    }

    return topology;
  }

  var version = "1.6.27";

  exports.version = version;
  exports.mesh = mesh;
  exports.meshArcs = meshArcs;
  exports.merge = merge;
  exports.mergeArcs = mergeArcs;
  exports.feature = feature;
  exports.neighbors = neighbors;
  exports.presimplify = presimplify;

  Object.defineProperty(exports, '__esModule', { value: true });

  })));
  });

  unwrapExports(topojson);

  var type = function(types) {
    for (var type in typeDefaults) {
      if (!(type in types)) {
        types[type] = typeDefaults[type];
      }
    }
    types.defaults = typeDefaults;
    return types;
  };

  var typeDefaults = {

    Feature: function(feature) {
      if (feature.geometry) this.geometry(feature.geometry);
    },

    FeatureCollection: function(collection) {
      var features = collection.features, i = -1, n = features.length;
      while (++i < n) this.Feature(features[i]);
    },

    GeometryCollection: function(collection) {
      var geometries = collection.geometries, i = -1, n = geometries.length;
      while (++i < n) this.geometry(geometries[i]);
    },

    LineString: function(lineString) {
      this.line(lineString.coordinates);
    },

    MultiLineString: function(multiLineString) {
      var coordinates = multiLineString.coordinates, i = -1, n = coordinates.length;
      while (++i < n) this.line(coordinates[i]);
    },

    MultiPoint: function(multiPoint) {
      var coordinates = multiPoint.coordinates, i = -1, n = coordinates.length;
      while (++i < n) this.point(coordinates[i]);
    },

    MultiPolygon: function(multiPolygon) {
      var coordinates = multiPolygon.coordinates, i = -1, n = coordinates.length;
      while (++i < n) this.polygon(coordinates[i]);
    },

    Point: function(point) {
      this.point(point.coordinates);
    },

    Polygon: function(polygon) {
      this.polygon(polygon.coordinates);
    },

    object: function(object) {
      return object == null ? null
          : typeObjects.hasOwnProperty(object.type) ? this[object.type](object)
          : this.geometry(object);
    },

    geometry: function(geometry) {
      return geometry == null ? null
          : typeGeometries.hasOwnProperty(geometry.type) ? this[geometry.type](geometry)
          : null;
    },

    point: function() {},

    line: function(coordinates) {
      var i = -1, n = coordinates.length;
      while (++i < n) this.point(coordinates[i]);
    },

    polygon: function(coordinates) {
      var i = -1, n = coordinates.length;
      while (++i < n) this.line(coordinates[i]);
    }
  };

  var typeGeometries = {
    LineString: 1,
    MultiLineString: 1,
    MultiPoint: 1,
    MultiPolygon: 1,
    Point: 1,
    Polygon: 1,
    GeometryCollection: 1
  };

  var typeObjects = {
    Feature: 1,
    FeatureCollection: 1
  };

  var stitch = function(objects, transform) {
    var ε = 1e-2,
        x0 = -180, x0e = x0 + ε,
        x1 = 180, x1e = x1 - ε,
        y0 = -90, y0e = y0 + ε,
        y1 = 90, y1e = y1 - ε;

    if (transform) {
      var kx = transform.scale[0],
          ky = transform.scale[1],
          dx = transform.translate[0],
          dy = transform.translate[1];

      x0 = Math.round((x0 - dx) / kx);
      x1 = Math.round((x1 - dx) / kx);
      y0 = Math.round((y0 - dy) / ky);
      y1 = Math.round((y1 - dy) / ky);
      x0e = Math.round((x0e - dx) / kx);
      x1e = Math.round((x1e - dx) / kx);
      y0e = Math.round((y0e - dy) / ky);
      y1e = Math.round((y1e - dy) / ky);
    }

    function normalizePoint(y) {
      return y <= y0e ? [0, y0] // south pole
          : y >= y1e ? [0, y1] // north pole
          : [x0, y]; // antimeridian
    }

    function stitchPolygons(polygons) {
      var fragments = [];

      for (var p = 0, np = polygons.length; p < np; ++p) {
        var polygon = polygons[p];

        // For each ring, detect where it crosses the antimeridian or pole.
        for (var j = 0, m = polygon.length; j < m; ++j) {
          var ring = polygon[j];
          ring.polygon = polygon;

          // By default, assume that this ring doesn’t need any stitching.
          fragments.push(ring);

          for (var i = 0, n = ring.length; i < n; ++i) {
            var point = ring[i],
                x = point[0],
                y = point[1];

            // If this is an antimeridian or polar point…
            if (x <= x0e || x >= x1e || y <= y0e || y >= y1e) {

              // Advance through any antimeridian or polar points…
              for (var k = i + 1; k < n; ++k) {
                var pointk = ring[k],
                    xk = pointk[0],
                    yk = pointk[1];
                if (xk > x0e && xk < x1e && yk > y0e && yk < y1e) break;
              }

              // If this was just a single antimeridian or polar point,
              // we don’t need to cut this ring into a fragment;
              // we can just leave it as-is.
              if (k === i + 1) continue;

              // Otherwise, if this is not the first point in the ring,
              // cut the current fragment so that it ends at the current point.
              // The current point is also normalized for later joining.
              if (i) {
                var fragmentBefore = ring.slice(0, i + 1);
                fragmentBefore.polygon = polygon;
                fragmentBefore[fragmentBefore.length - 1] = normalizePoint(y);
                fragments[fragments.length - 1] = fragmentBefore;
              }

              // If the ring started with an antimeridian fragment,
              // we can ignore that fragment entirely.
              else {
                fragments.pop();
              }

              // If the remainder of the ring is an antimeridian fragment,
              // move on to the next ring.
              if (k >= n) break;

              // Otherwise, add the remaining ring fragment and continue.
              fragments.push(ring = ring.slice(k - 1));
              ring[0] = normalizePoint(ring[0][1]);
              ring.polygon = polygon;
              i = -1;
              n = ring.length;
            }
          }
        }
        polygon.length = 0;
      }

      // Now stitch the fragments back together into rings.
      // To connect the fragments start-to-end, create a simple index by end.
      var fragmentByStart = {},
          fragmentByEnd = {};

      // For each fragment…
      for (var i = 0, n = fragments.length; i < n; ++i) {
        var fragment = fragments[i],
            start = fragment[0],
            end = fragment[fragment.length - 1];

        // If this fragment is closed, add it as a standalone ring.
        if (start[0] === end[0] && start[1] === end[1]) {
          fragment.polygon.push(fragment);
          fragments[i] = null;
          continue;
        }

        fragment.index = i;
        fragmentByStart[start] = fragmentByEnd[end] = fragment;
      }

      // For each open fragment…
      for (var i = 0; i < n; ++i) {
        var fragment = fragments[i];
        if (fragment) {

          var start = fragment[0],
              end = fragment[fragment.length - 1],
              startFragment = fragmentByEnd[start],
              endFragment = fragmentByStart[end];

          delete fragmentByStart[start];
          delete fragmentByEnd[end];

          // If this fragment is closed, add it as a standalone ring.
          if (start[0] === end[0] && start[1] === end[1]) {
            fragment.polygon.push(fragment);
            continue;
          }

          if (startFragment) {
            delete fragmentByEnd[start];
            delete fragmentByStart[startFragment[0]];
            startFragment.pop(); // drop the shared coordinate
            fragments[startFragment.index] = null;
            fragment = startFragment.concat(fragment);
            fragment.polygon = startFragment.polygon;

            if (startFragment === endFragment) {
              // Connect both ends to this single fragment to create a ring.
              fragment.polygon.push(fragment);
            } else {
              fragment.index = n++;
              fragments.push(fragmentByStart[fragment[0]] = fragmentByEnd[fragment[fragment.length - 1]] = fragment);
            }
          } else if (endFragment) {
            delete fragmentByStart[end];
            delete fragmentByEnd[endFragment[endFragment.length - 1]];
            fragment.pop(); // drop the shared coordinate
            fragment = fragment.concat(endFragment);
            fragment.polygon = endFragment.polygon;
            fragment.index = n++;
            fragments[endFragment.index] = null;
            fragments.push(fragmentByStart[fragment[0]] = fragmentByEnd[fragment[fragment.length - 1]] = fragment);
          } else {
            fragment.push(fragment[0]); // close ring
            fragment.polygon.push(fragment);
          }
        }
      }
      // TODO remove empty polygons.
    }

    var stitch = type({
      Polygon: function(polygon) { stitchPolygons([polygon.coordinates]); },
      MultiPolygon: function(multiPolygon) { stitchPolygons(multiPolygon.coordinates); }
    });

    for (var key in objects) {
      stitch.object(objects[key]);
    }
  };

  var name = "cartesian";
  var formatDistance_1 = formatDistance;
  var ringArea_1 = ringArea;
  var absoluteArea = Math.abs;
  var triangleArea_1 = triangleArea;
  var distance_1 = distance;

  function formatDistance(d) {
    return d.toString();
  }

  function ringArea(ring) {
    var i = -1,
        n = ring.length,
        a,
        b = ring[n - 1],
        area = 0;

    while (++i < n) {
      a = b;
      b = ring[i];
      area += a[0] * b[1] - a[1] * b[0];
    }

    return area * .5;
  }

  function triangleArea(triangle) {
    return Math.abs(
      (triangle[0][0] - triangle[2][0]) * (triangle[1][1] - triangle[0][1])
      - (triangle[0][0] - triangle[1][0]) * (triangle[2][1] - triangle[0][1])
    );
  }

  function distance(x0, y0, x1, y1) {
    var dx = x0 - x1, dy = y0 - y1;
    return Math.sqrt(dx * dx + dy * dy);
  }

  var cartesian = {
  	name: name,
  	formatDistance: formatDistance_1,
  	ringArea: ringArea_1,
  	absoluteArea: absoluteArea,
  	triangleArea: triangleArea_1,
  	distance: distance_1
  };

  var π = Math.PI,
      π_4 = π / 4,
      radians = π / 180;

  var name$1 = "spherical";
  var formatDistance_1$1 = formatDistance$1;
  var ringArea_1$1 = ringArea$1;
  var absoluteArea_1 = absoluteArea$1;
  var triangleArea_1$1 = triangleArea$1;
  var distance_1$1 = haversinDistance; // XXX why two implementations?

  function formatDistance$1(k) {
    var km = k * radians * 6371;
    return (km > 1 ? km.toFixed(3) + "km" : (km * 1000).toPrecision(3) + "m") + " (" + k.toPrecision(3) + "°)";
  }

  function ringArea$1(ring) {
    if (!ring.length) return 0;
    var area = 0,
        p = ring[0],
        λ = p[0] * radians,
        φ = p[1] * radians / 2 + π_4,
        λ0 = λ,
        cosφ0 = Math.cos(φ),
        sinφ0 = Math.sin(φ);

    for (var i = 1, n = ring.length; i < n; ++i) {
      p = ring[i], λ = p[0] * radians, φ = p[1] * radians / 2 + π_4;

      // Spherical excess E for a spherical triangle with vertices: south pole,
      // previous point, current point.  Uses a formula derived from Cagnoli’s
      // theorem.  See Todhunter, Spherical Trig. (1871), Sec. 103, Eq. (2).
      var dλ = λ - λ0,
          cosφ = Math.cos(φ),
          sinφ = Math.sin(φ),
          k = sinφ0 * sinφ,
          u = cosφ0 * cosφ + k * Math.cos(dλ),
          v = k * Math.sin(dλ);
      area += Math.atan2(v, u);

      // Advance the previous point.
      λ0 = λ, cosφ0 = cosφ, sinφ0 = sinφ;
    }

    return 2 * (area > π ? area - 2 * π : area < -π ? area + 2 * π : area);
  }

  function absoluteArea$1(a) {
    return a < 0 ? a + 4 * π : a;
  }

  function triangleArea$1(t) {
    var a = distance$1(t[0], t[1]),
        b = distance$1(t[1], t[2]),
        c = distance$1(t[2], t[0]),
        s = (a + b + c) / 2;
    return 4 * Math.atan(Math.sqrt(Math.max(0, Math.tan(s / 2) * Math.tan((s - a) / 2) * Math.tan((s - b) / 2) * Math.tan((s - c) / 2))));
  }

  function distance$1(a, b) {
    var Δλ = (b[0] - a[0]) * radians,
        sinΔλ = Math.sin(Δλ),
        cosΔλ = Math.cos(Δλ),
        sinφ0 = Math.sin(a[1] * radians),
        cosφ0 = Math.cos(a[1] * radians),
        sinφ1 = Math.sin(b[1] * radians),
        cosφ1 = Math.cos(b[1] * radians),
        _;
    return Math.atan2(Math.sqrt((_ = cosφ1 * sinΔλ) * _ + (_ = cosφ0 * sinφ1 - sinφ0 * cosφ1 * cosΔλ) * _), sinφ0 * sinφ1 + cosφ0 * cosφ1 * cosΔλ);
  }

  function haversinDistance(x0, y0, x1, y1) {
    x0 *= radians, y0 *= radians, x1 *= radians, y1 *= radians;
    return 2 * Math.asin(Math.sqrt(haversin(y1 - y0) + Math.cos(y0) * Math.cos(y1) * haversin(x1 - x0)));
  }

  function haversin(x) {
    return (x = Math.sin(x / 2)) * x;
  }

  var spherical = {
  	name: name$1,
  	formatDistance: formatDistance_1$1,
  	ringArea: ringArea_1$1,
  	absoluteArea: absoluteArea_1,
  	triangleArea: triangleArea_1$1,
  	distance: distance_1$1
  };

  var coordinateSystems = {
    cartesian: cartesian,
    spherical: spherical
  };

  var hashmap = function(size, hash, equal, keyType, keyEmpty, valueType) {
    if (arguments.length === 3) {
      keyType = valueType = Array;
      keyEmpty = null;
    }

    var keystore = new keyType(size = 1 << Math.max(4, Math.ceil(Math.log(size) / Math.LN2))),
        valstore = new valueType(size),
        mask = size - 1;

    for (var i = 0; i < size; ++i) {
      keystore[i] = keyEmpty;
    }

    function set(key, value) {
      var index = hash(key) & mask,
          matchKey = keystore[index],
          collisions = 0;
      while (matchKey != keyEmpty) {
        if (equal(matchKey, key)) return valstore[index] = value;
        if (++collisions >= size) throw new Error("full hashmap");
        matchKey = keystore[index = (index + 1) & mask];
      }
      keystore[index] = key;
      valstore[index] = value;
      return value;
    }

    function maybeSet(key, value) {
      var index = hash(key) & mask,
          matchKey = keystore[index],
          collisions = 0;
      while (matchKey != keyEmpty) {
        if (equal(matchKey, key)) return valstore[index];
        if (++collisions >= size) throw new Error("full hashmap");
        matchKey = keystore[index = (index + 1) & mask];
      }
      keystore[index] = key;
      valstore[index] = value;
      return value;
    }

    function get(key, missingValue) {
      var index = hash(key) & mask,
          matchKey = keystore[index],
          collisions = 0;
      while (matchKey != keyEmpty) {
        if (equal(matchKey, key)) return valstore[index];
        if (++collisions >= size) break;
        matchKey = keystore[index = (index + 1) & mask];
      }
      return missingValue;
    }

    function keys() {
      var keys = [];
      for (var i = 0, n = keystore.length; i < n; ++i) {
        var matchKey = keystore[i];
        if (matchKey != keyEmpty) keys.push(matchKey);
      }
      return keys;
    }

    return {
      set: set,
      maybeSet: maybeSet, // set if unset
      get: get,
      keys: keys
    };
  };

  // Extracts the lines and rings from the specified hash of geometry objects.
  //
  // Returns an object with three properties:
  //
  // * coordinates - shared buffer of [x, y] coordinates
  // * lines - lines extracted from the hash, of the form [start, end]
  // * rings - rings extracted from the hash, of the form [start, end]
  //
  // For each ring or line, start and end represent inclusive indexes into the
  // coordinates buffer. For rings (and closed lines), coordinates[start] equals
  // coordinates[end].
  //
  // For each line or polygon geometry in the input hash, including nested
  // geometries as in geometry collections, the `coordinates` array is replaced
  // with an equivalent `arcs` array that, for each line (for line string
  // geometries) or ring (for polygon geometries), points to one of the above
  // lines or rings.
  var extract = function(objects) {
    var index = -1,
        lines = [],
        rings = [],
        coordinates = [];

    function extractGeometry(geometry) {
      if (geometry && extractGeometryType.hasOwnProperty(geometry.type)) extractGeometryType[geometry.type](geometry);
    }

    var extractGeometryType = {
      GeometryCollection: function(o) { o.geometries.forEach(extractGeometry); },
      LineString: function(o) { o.arcs = extractLine(o.coordinates); delete o.coordinates; },
      MultiLineString: function(o) { o.arcs = o.coordinates.map(extractLine); delete o.coordinates; },
      Polygon: function(o) { o.arcs = o.coordinates.map(extractRing); delete o.coordinates; },
      MultiPolygon: function(o) { o.arcs = o.coordinates.map(extractMultiRing); delete o.coordinates; }
    };

    function extractLine(line) {
      for (var i = 0, n = line.length; i < n; ++i) coordinates[++index] = line[i];
      var arc = {0: index - n + 1, 1: index};
      lines.push(arc);
      return arc;
    }

    function extractRing(ring) {
      for (var i = 0, n = ring.length; i < n; ++i) coordinates[++index] = ring[i];
      var arc = {0: index - n + 1, 1: index};
      rings.push(arc);
      return arc;
    }

    function extractMultiRing(rings) {
      return rings.map(extractRing);
    }

    for (var key in objects) {
      extractGeometry(objects[key]);
    }

    return {
      type: "Topology",
      coordinates: coordinates,
      lines: lines,
      rings: rings,
      objects: objects
    };
  };

  var hashset = function(size, hash, equal, type, empty) {
    if (arguments.length === 3) {
      type = Array;
      empty = null;
    }

    var store = new type(size = 1 << Math.max(4, Math.ceil(Math.log(size) / Math.LN2))),
        mask = size - 1;

    for (var i = 0; i < size; ++i) {
      store[i] = empty;
    }

    function add(value) {
      var index = hash(value) & mask,
          match = store[index],
          collisions = 0;
      while (match != empty) {
        if (equal(match, value)) return true;
        if (++collisions >= size) throw new Error("full hashset");
        match = store[index = (index + 1) & mask];
      }
      store[index] = value;
      return true;
    }

    function has(value) {
      var index = hash(value) & mask,
          match = store[index],
          collisions = 0;
      while (match != empty) {
        if (equal(match, value)) return true;
        if (++collisions >= size) break;
        match = store[index = (index + 1) & mask];
      }
      return false;
    }

    function values() {
      var values = [];
      for (var i = 0, n = store.length; i < n; ++i) {
        var match = store[i];
        if (match != empty) values.push(match);
      }
      return values;
    }

    return {
      add: add,
      has: has,
      values: values
    };
  };

  // TODO if quantized, use simpler Int32 hashing?

  var buffer = new ArrayBuffer(16),
      floats = new Float64Array(buffer),
      uints = new Uint32Array(buffer);

  var pointHash = function(point) {
    floats[0] = point[0];
    floats[1] = point[1];
    var hash = uints[0] ^ uints[1];
    hash = hash << 5 ^ hash >> 7 ^ uints[2] ^ uints[3];
    return hash & 0x7fffffff;
  };

  var pointEqual = function(pointA, pointB) {
    return pointA[0] === pointB[0] && pointA[1] === pointB[1];
  };

  // Given an extracted (pre-)topology, identifies all of the junctions. These are
  // the points at which arcs (lines or rings) will need to be cut so that each
  // arc is represented uniquely.
  //
  // A junction is a point where at least one arc deviates from another arc going
  // through the same point. For example, consider the point B. If there is a arc
  // through ABC and another arc through CBA, then B is not a junction because in
  // both cases the adjacent point pairs are {A,C}. However, if there is an
  // additional arc ABD, then {A,D} != {A,C}, and thus B becomes a junction.
  //
  // For a closed ring ABCA, the first point A’s adjacent points are the second
  // and last point {B,C}. For a line, the first and last point are always
  // considered junctions, even if the line is closed; this ensures that a closed
  // line is never rotated.
  var join = function(topology) {
    var coordinates = topology.coordinates,
        lines = topology.lines,
        rings = topology.rings,
        indexes = index(),
        visitedByIndex = new Int32Array(coordinates.length),
        leftByIndex = new Int32Array(coordinates.length),
        rightByIndex = new Int32Array(coordinates.length),
        junctionByIndex = new Int8Array(coordinates.length),
        junctionCount = 0; // upper bound on number of junctions

    for (var i = 0, n = coordinates.length; i < n; ++i) {
      visitedByIndex[i] = leftByIndex[i] = rightByIndex[i] = -1;
    }

    for (var i = 0, n = lines.length; i < n; ++i) {
      var line = lines[i],
          lineStart = line[0],
          lineEnd = line[1],
          previousIndex,
          currentIndex = indexes[lineStart],
          nextIndex = indexes[++lineStart];
      ++junctionCount, junctionByIndex[currentIndex] = 1; // start
      while (++lineStart <= lineEnd) {
        sequence(i, previousIndex = currentIndex, currentIndex = nextIndex, nextIndex = indexes[lineStart]);
      }
      ++junctionCount, junctionByIndex[nextIndex] = 1; // end
    }

    for (var i = 0, n = coordinates.length; i < n; ++i) {
      visitedByIndex[i] = -1;
    }

    for (var i = 0, n = rings.length; i < n; ++i) {
      var ring = rings[i],
          ringStart = ring[0] + 1,
          ringEnd = ring[1],
          previousIndex = indexes[ringEnd - 1],
          currentIndex = indexes[ringStart - 1],
          nextIndex = indexes[ringStart];
      sequence(i, previousIndex, currentIndex, nextIndex);
      while (++ringStart <= ringEnd) {
        sequence(i, previousIndex = currentIndex, currentIndex = nextIndex, nextIndex = indexes[ringStart]);
      }
    }

    function sequence(i, previousIndex, currentIndex, nextIndex) {
      if (visitedByIndex[currentIndex] === i) return; // ignore self-intersection
      visitedByIndex[currentIndex] = i;
      var leftIndex = leftByIndex[currentIndex];
      if (leftIndex >= 0) {
        var rightIndex = rightByIndex[currentIndex];
        if ((leftIndex !== previousIndex || rightIndex !== nextIndex)
          && (leftIndex !== nextIndex || rightIndex !== previousIndex)) {
          ++junctionCount, junctionByIndex[currentIndex] = 1;
        }
      } else {
        leftByIndex[currentIndex] = previousIndex;
        rightByIndex[currentIndex] = nextIndex;
      }
    }

    function index() {
      var indexByPoint = hashmap(coordinates.length * 1.4, hashIndex, equalIndex, Int32Array, -1, Int32Array),
          indexes = new Int32Array(coordinates.length);

      for (var i = 0, n = coordinates.length; i < n; ++i) {
        indexes[i] = indexByPoint.maybeSet(i, i);
      }

      return indexes;
    }

    function hashIndex(i) {
      return pointHash(coordinates[i]);
    }

    function equalIndex(i, j) {
      return pointEqual(coordinates[i], coordinates[j]);
    }

    visitedByIndex = leftByIndex = rightByIndex = null;

    var junctionByPoint = hashset(junctionCount * 1.4, pointHash, pointEqual);

    // Convert back to a standard hashset by point for caller convenience.
    for (var i = 0, n = coordinates.length, j; i < n; ++i) {
      if (junctionByIndex[j = indexes[i]]) {
        junctionByPoint.add(coordinates[j]);
      }
    }

    return junctionByPoint;
  };

  // Given an extracted (pre-)topology, cuts (or rotates) arcs so that all shared
  // point sequences are identified. The topology can then be subsequently deduped
  // to remove exact duplicate arcs.
  var cut = function(topology) {
    var junctions = join(topology),
        coordinates = topology.coordinates,
        lines = topology.lines,
        rings = topology.rings;

    for (var i = 0, n = lines.length; i < n; ++i) {
      var line = lines[i],
          lineMid = line[0],
          lineEnd = line[1];
      while (++lineMid < lineEnd) {
        if (junctions.has(coordinates[lineMid])) {
          var next = {0: lineMid, 1: line[1]};
          line[1] = lineMid;
          line = line.next = next;
        }
      }
    }

    for (var i = 0, n = rings.length; i < n; ++i) {
      var ring = rings[i],
          ringStart = ring[0],
          ringMid = ringStart,
          ringEnd = ring[1],
          ringFixed = junctions.has(coordinates[ringStart]);
      while (++ringMid < ringEnd) {
        if (junctions.has(coordinates[ringMid])) {
          if (ringFixed) {
            var next = {0: ringMid, 1: ring[1]};
            ring[1] = ringMid;
            ring = ring.next = next;
          } else { // For the first junction, we can rotate rather than cut.
            rotateArray(coordinates, ringStart, ringEnd, ringEnd - ringMid);
            coordinates[ringEnd] = coordinates[ringStart];
            ringFixed = true;
            ringMid = ringStart; // restart; we may have skipped junctions
          }
        }
      }
    }

    return topology;
  };

  function rotateArray(array, start, end, offset) {
    reverse(array, start, end);
    reverse(array, start, start + offset);
    reverse(array, start + offset, end);
  }

  function reverse(array, start, end) {
    for (var mid = start + ((end-- - start) >> 1), t; start < mid; ++start, --end) {
      t = array[start], array[start] = array[end], array[end] = t;
    }
  }

  // Given a cut topology, combines duplicate arcs.
  var dedup = function(topology) {
    var coordinates = topology.coordinates,
        lines = topology.lines,
        rings = topology.rings,
        arcCount = lines.length + rings.length;

    delete topology.lines;
    delete topology.rings;

    // Count the number of (non-unique) arcs to initialize the hashmap safely.
    for (var i = 0, n = lines.length; i < n; ++i) {
      var line = lines[i]; while (line = line.next) ++arcCount;
    }
    for (var i = 0, n = rings.length; i < n; ++i) {
      var ring = rings[i]; while (ring = ring.next) ++arcCount;
    }

    var arcsByEnd = hashmap(arcCount * 2 * 1.4, pointHash, pointEqual),
        arcs = topology.arcs = [];

    for (var i = 0, n = lines.length; i < n; ++i) {
      var line = lines[i];
      do {
        dedupLine(line);
      } while (line = line.next);
    }

    for (var i = 0, n = rings.length; i < n; ++i) {
      var ring = rings[i];
      if (ring.next) { // arc is no longer closed
        do {
          dedupLine(ring);
        } while (ring = ring.next);
      } else {
        dedupRing(ring);
      }
    }

    function dedupLine(arc) {
      var startPoint,
          endPoint,
          startArcs,
          endArcs;

      // Does this arc match an existing arc in order?
      if (startArcs = arcsByEnd.get(startPoint = coordinates[arc[0]])) {
        for (var i = 0, n = startArcs.length; i < n; ++i) {
          var startArc = startArcs[i];
          if (equalLine(startArc, arc)) {
            arc[0] = startArc[0];
            arc[1] = startArc[1];
            return;
          }
        }
      }

      // Does this arc match an existing arc in reverse order?
      if (endArcs = arcsByEnd.get(endPoint = coordinates[arc[1]])) {
        for (var i = 0, n = endArcs.length; i < n; ++i) {
          var endArc = endArcs[i];
          if (reverseEqualLine(endArc, arc)) {
            arc[1] = endArc[0];
            arc[0] = endArc[1];
            return;
          }
        }
      }

      if (startArcs) startArcs.push(arc); else arcsByEnd.set(startPoint, [arc]);
      if (endArcs) endArcs.push(arc); else arcsByEnd.set(endPoint, [arc]);
      arcs.push(arc);
    }

    function dedupRing(arc) {
      var endPoint,
          endArcs;

      // Does this arc match an existing line in order, or reverse order?
      // Rings are closed, so their start point and end point is the same.
      if (endArcs = arcsByEnd.get(endPoint = coordinates[arc[0]])) {
        for (var i = 0, n = endArcs.length; i < n; ++i) {
          var endArc = endArcs[i];
          if (equalRing(endArc, arc)) {
            arc[0] = endArc[0];
            arc[1] = endArc[1];
            return;
          }
          if (reverseEqualRing(endArc, arc)) {
            arc[0] = endArc[1];
            arc[1] = endArc[0];
            return;
          }
        }
      }

      // Otherwise, does this arc match an existing ring in order, or reverse order?
      if (endArcs = arcsByEnd.get(endPoint = coordinates[arc[0] + findMinimumOffset(arc)])) {
        for (var i = 0, n = endArcs.length; i < n; ++i) {
          var endArc = endArcs[i];
          if (equalRing(endArc, arc)) {
            arc[0] = endArc[0];
            arc[1] = endArc[1];
            return;
          }
          if (reverseEqualRing(endArc, arc)) {
            arc[0] = endArc[1];
            arc[1] = endArc[0];
            return;
          }
        }
      }

      if (endArcs) endArcs.push(arc); else arcsByEnd.set(endPoint, [arc]);
      arcs.push(arc);
    }

    function equalLine(arcA, arcB) {
      var ia = arcA[0], ib = arcB[0],
          ja = arcA[1], jb = arcB[1];
      if (ia - ja !== ib - jb) return false;
      for (; ia <= ja; ++ia, ++ib) if (!pointEqual(coordinates[ia], coordinates[ib])) return false;
      return true;
    }

    function reverseEqualLine(arcA, arcB) {
      var ia = arcA[0], ib = arcB[0],
          ja = arcA[1], jb = arcB[1];
      if (ia - ja !== ib - jb) return false;
      for (; ia <= ja; ++ia, --jb) if (!pointEqual(coordinates[ia], coordinates[jb])) return false;
      return true;
    }

    function equalRing(arcA, arcB) {
      var ia = arcA[0], ib = arcB[0],
          ja = arcA[1], jb = arcB[1],
          n = ja - ia;
      if (n !== jb - ib) return false;
      var ka = findMinimumOffset(arcA),
          kb = findMinimumOffset(arcB);
      for (var i = 0; i < n; ++i) {
        if (!pointEqual(coordinates[ia + (i + ka) % n], coordinates[ib + (i + kb) % n])) return false;
      }
      return true;
    }

    function reverseEqualRing(arcA, arcB) {
      var ia = arcA[0], ib = arcB[0],
          ja = arcA[1], jb = arcB[1],
          n = ja - ia;
      if (n !== jb - ib) return false;
      var ka = findMinimumOffset(arcA),
          kb = n - findMinimumOffset(arcB);
      for (var i = 0; i < n; ++i) {
        if (!pointEqual(coordinates[ia + (i + ka) % n], coordinates[jb - (i + kb) % n])) return false;
      }
      return true;
    }

    // Rings are rotated to a consistent, but arbitrary, start point.
    // This is necessary to detect when a ring and a rotated copy are dupes.
    function findMinimumOffset(arc) {
      var start = arc[0],
          end = arc[1],
          mid = start,
          minimum = mid,
          minimumPoint = coordinates[mid];
      while (++mid < end) {
        var point = coordinates[mid];
        if (point[0] < minimumPoint[0] || point[0] === minimumPoint[0] && point[1] < minimumPoint[1]) {
          minimum = mid;
          minimumPoint = point;
        }
      }
      return minimum - start;
    }

    return topology;
  };

  // Constructs the TopoJSON Topology for the specified hash of geometries.
  // Each object in the specified hash must be a GeoJSON object,
  // meaning FeatureCollection, a Feature or a geometry object.
  var topology = function(objects) {
    var topology = dedup(cut(extract(objects))),
        coordinates = topology.coordinates,
        indexByArc = hashmap(topology.arcs.length * 1.4, hashArc, equalArc);

    objects = topology.objects; // for garbage collection

    topology.arcs = topology.arcs.map(function(arc, i) {
      indexByArc.set(arc, i);
      return coordinates.slice(arc[0], arc[1] + 1);
    });

    delete topology.coordinates;
    coordinates = null;

    function indexGeometry(geometry) {
      if (geometry && indexGeometryType.hasOwnProperty(geometry.type)) indexGeometryType[geometry.type](geometry);
    }

    var indexGeometryType = {
      GeometryCollection: function(o) { o.geometries.forEach(indexGeometry); },
      LineString: function(o) { o.arcs = indexArcs(o.arcs); },
      MultiLineString: function(o) { o.arcs = o.arcs.map(indexArcs); },
      Polygon: function(o) { o.arcs = o.arcs.map(indexArcs); },
      MultiPolygon: function(o) { o.arcs = o.arcs.map(indexMultiArcs); }
    };

    function indexArcs(arc) {
      var indexes = [];
      do {
        var index = indexByArc.get(arc);
        indexes.push(arc[0] < arc[1] ? index : ~index);
      } while (arc = arc.next);
      return indexes;
    }

    function indexMultiArcs(arcs) {
      return arcs.map(indexArcs);
    }

    for (var key in objects) {
      indexGeometry(objects[key]);
    }

    return topology;
  };

  function hashArc(arc) {
    var i = arc[0], j = arc[1], t;
    if (j < i) t = i, i = j, j = t;
    return i + 31 * j;
  }

  function equalArc(arcA, arcB) {
    var ia = arcA[0], ja = arcA[1],
        ib = arcB[0], jb = arcB[1], t;
    if (ja < ia) t = ia, ia = ja, ja = t;
    if (jb < ib) t = ib, ib = jb, jb = t;
    return ia === ib && ja === jb;
  }

  // Given a TopoJSON topology in absolute (quantized) coordinates,
  // converts to fixed-point delta encoding.
  // This is a destructive operation that modifies the given topology!
  var delta = function(topology) {
    var arcs = topology.arcs,
        i = -1,
        n = arcs.length;

    while (++i < n) {
      var arc = arcs[i],
          j = 0,
          m = arc.length,
          point = arc[0],
          x0 = point[0],
          y0 = point[1],
          x1,
          y1;
      while (++j < m) {
        point = arc[j];
        x1 = point[0];
        y1 = point[1];
        arc[j] = [x1 - x0, y1 - y0];
        x0 = x1;
        y0 = y1;
      }
    }

    return topology;
  };

  // Given a hash of GeoJSON objects, replaces Features with geometry objects.
  // This is a destructive operation that modifies the input objects!
  var geomify = function(objects) {

    function geomifyObject(object) {
      return (object && geomifyObjectType.hasOwnProperty(object.type)
          ? geomifyObjectType[object.type]
          : geomifyGeometry)(object);
    }

    function geomifyFeature(feature) {
      var geometry = feature.geometry;
      if (geometry == null) {
        feature.type = null;
      } else {
        geomifyGeometry(geometry);
        feature.type = geometry.type;
        if (geometry.geometries) feature.geometries = geometry.geometries;
        else if (geometry.coordinates) feature.coordinates = geometry.coordinates;
      }
      delete feature.geometry;
      return feature;
    }

    function geomifyGeometry(geometry) {
      if (!geometry) return {type: null};
      if (geomifyGeometryType.hasOwnProperty(geometry.type)) geomifyGeometryType[geometry.type](geometry);
      return geometry;
    }

    var geomifyObjectType = {
      Feature: geomifyFeature,
      FeatureCollection: function(collection) {
        collection.type = "GeometryCollection";
        collection.geometries = collection.features;
        collection.features.forEach(geomifyFeature);
        delete collection.features;
        return collection;
      }
    };

    var geomifyGeometryType = {
      GeometryCollection: function(o) {
        var geometries = o.geometries, i = -1, n = geometries.length;
        while (++i < n) geometries[i] = geomifyGeometry(geometries[i]);
      },
      MultiPoint: function(o) {
        if (!o.coordinates.length) {
          o.type = null;
          delete o.coordinates;
        } else if (o.coordinates.length < 2) {
          o.type = "Point";
          o.coordinates = o.coordinates[0];
        }
      },
      LineString: function(o) {
        if (!o.coordinates.length) {
          o.type = null;
          delete o.coordinates;
        }
      },
      MultiLineString: function(o) {
        for (var lines = o.coordinates, i = 0, N = 0, n = lines.length; i < n; ++i) {
          var line = lines[i];
          if (line.length) lines[N++] = line;
        }
        if (!N) {
          o.type = null;
          delete o.coordinates;
        } else if (N < 2) {
          o.type = "LineString";
          o.coordinates = lines[0];
        } else {
          o.coordinates.length = N;
        }
      },
      Polygon: function(o) {
        for (var rings = o.coordinates, i = 0, N = 0, n = rings.length; i < n; ++i) {
          var ring = rings[i];
          if (ring.length) rings[N++] = ring;
        }
        if (!N) {
          o.type = null;
          delete o.coordinates;
        } else {
          o.coordinates.length = N;
        }
      },
      MultiPolygon: function(o) {
        for (var polygons = o.coordinates, j = 0, M = 0, m = polygons.length; j < m; ++j) {
          for (var rings = polygons[j], i = 0, N = 0, n = rings.length; i < n; ++i) {
            var ring = rings[i];
            if (ring.length) rings[N++] = ring;
          }
          if (N) {
            rings.length = N;
            polygons[M++] = rings;
          }
        }
        if (!M) {
          o.type = null;
          delete o.coordinates;
        } else if (M < 2) {
          o.type = "Polygon";
          o.coordinates = polygons[0];
        } else {
          polygons.length = M;
        }
      }
    };

    for (var key in objects) {
      objects[key] = geomifyObject(objects[key]);
    }

    return objects;
  };

  var quantize = function(dx, dy, kx, ky) {

    function quantizePoint(coordinates) {
      coordinates[0] = Math.round((coordinates[0] + dx) * kx);
      coordinates[1] = Math.round((coordinates[1] + dy) * ky);
      return coordinates;
    }

    function quantizeLine(coordinates) {
      var i = 0,
          j = 1,
          n = coordinates.length,
          pi = quantizePoint(coordinates[0]),
          pj,
          px = pi[0],
          py = pi[1],
          x,
          y;

      while (++i < n) {
        pi = quantizePoint(coordinates[i]);
        x = pi[0];
        y = pi[1];
        if (x !== px || y !== py) { // skip coincident points
          pj = coordinates[j++];
          pj[0] = px = x;
          pj[1] = py = y;
        }
      }

      coordinates.length = j;
    }

    return {
      point: quantizePoint,
      line: quantizeLine,
      transform: {
        scale: [1 / kx, 1 / ky],
        translate: [-dx, -dy]
      }
    };
  };

  var preQuantize = function(objects, bbox, Q0, Q1) {
    if (arguments.length < 4) Q1 = Q0;

    var x0 = isFinite(bbox[0]) ? bbox[0] : 0,
        y0 = isFinite(bbox[1]) ? bbox[1] : 0,
        x1 = isFinite(bbox[2]) ? bbox[2] : 0,
        y1 = isFinite(bbox[3]) ? bbox[3] : 0,
        kx = x1 - x0 ? (Q1 - 1) / (x1 - x0) * Q0 / Q1 : 1,
        ky = y1 - y0 ? (Q1 - 1) / (y1 - y0) * Q0 / Q1 : 1,
        q = quantize(-x0, -y0, kx, ky);

    function quantizeGeometry(geometry) {
      if (geometry && quantizeGeometryType.hasOwnProperty(geometry.type)) quantizeGeometryType[geometry.type](geometry);
    }

    var quantizeGeometryType = {
      GeometryCollection: function(o) { o.geometries.forEach(quantizeGeometry); },
      Point: function(o) { q.point(o.coordinates); },
      MultiPoint: function(o) { o.coordinates.forEach(q.point); },
      LineString: function(o) {
        var line = o.coordinates;
        q.line(line);
        if (line.length < 2) line[1] = line[0]; // must have 2+
      },
      MultiLineString: function(o) {
        for (var lines = o.coordinates, i = 0, n = lines.length; i < n; ++i) {
          var line = lines[i];
          q.line(line);
          if (line.length < 2) line[1] = line[0]; // must have 2+
        }
      },
      Polygon: function(o) {
        for (var rings = o.coordinates, i = 0, n = rings.length; i < n; ++i) {
          var ring = rings[i];
          q.line(ring);
          while (ring.length < 4) ring.push(ring[0]); // must have 4+
        }
      },
      MultiPolygon: function(o) {
        for (var polygons = o.coordinates, i = 0, n = polygons.length; i < n; ++i) {
          for (var rings = polygons[i], j = 0, m = rings.length; j < m; ++j) {
            var ring = rings[j];
            q.line(ring);
            while (ring.length < 4) ring.push(ring[0]); // must have 4+
          }
        }
      }
    };

    for (var key in objects) {
      quantizeGeometry(objects[key]);
    }

    return q.transform;
  };

  var postQuantize = function(topology, Q0, Q1) {
    if (Q0) {
      if (Q1 === Q0 || !topology.bbox.every(isFinite)) return topology;
      var k = Q1 / Q0,
          q = quantize(0, 0, k, k);

      topology.transform.scale[0] /= k;
      topology.transform.scale[1] /= k;
    } else {
      var bbox = topology.bbox,
          x0 = isFinite(bbox[0]) ? bbox[0] : 0,
          y0 = isFinite(bbox[1]) ? bbox[1] : 0,
          x1 = isFinite(bbox[2]) ? bbox[2] : 0,
          y1 = isFinite(bbox[3]) ? bbox[3] : 0,
          kx = x1 - x0 ? (Q1 - 1) / (x1 - x0) : 1,
          ky = y1 - y0 ? (Q1 - 1) / (y1 - y0) : 1,
          q = quantize(-x0, -y0, kx, ky);

      topology.transform = q.transform;
    }

    function quantizeGeometry(geometry) {
      if (geometry && quantizeGeometryType.hasOwnProperty(geometry.type)) quantizeGeometryType[geometry.type](geometry);
    }

    var quantizeGeometryType = {
      GeometryCollection: function(o) { o.geometries.forEach(quantizeGeometry); },
      Point: function(o) { q.point(o.coordinates); },
      MultiPoint: function(o) { o.coordinates.forEach(q.point); }
    };

    for (var key in topology.objects) {
      quantizeGeometry(topology.objects[key]);
    }

    // XXX shared points are bad mmkay
    topology.arcs = topology.arcs.map(function(arc) {
      q.line(arc = arc.map(function(point) { return point.slice(); }));
      if (arc.length < 2) arc.push(arc[0]); // arcs must have at least two points
      return arc;
    });

    return topology;
  };

  // Computes the bounding box of the specified hash of GeoJSON objects.
  var bounds = function(objects) {
    var x0 = Infinity,
        y0 = Infinity,
        x1 = -Infinity,
        y1 = -Infinity;

    function boundGeometry(geometry) {
      if (geometry && boundGeometryType.hasOwnProperty(geometry.type)) boundGeometryType[geometry.type](geometry);
    }

    var boundGeometryType = {
      GeometryCollection: function(o) { o.geometries.forEach(boundGeometry); },
      Point: function(o) { boundPoint(o.coordinates); },
      MultiPoint: function(o) { o.coordinates.forEach(boundPoint); },
      LineString: function(o) { boundLine(o.coordinates); },
      MultiLineString: function(o) { o.coordinates.forEach(boundLine); },
      Polygon: function(o) { o.coordinates.forEach(boundLine); },
      MultiPolygon: function(o) { o.coordinates.forEach(boundMultiLine); }
    };

    function boundPoint(coordinates) {
      var x = coordinates[0],
          y = coordinates[1];
      if (x < x0) x0 = x;
      if (x > x1) x1 = x;
      if (y < y0) y0 = y;
      if (y > y1) y1 = y;
    }

    function boundLine(coordinates) {
      coordinates.forEach(boundPoint);
    }

    function boundMultiLine(coordinates) {
      coordinates.forEach(boundLine);
    }

    for (var key in objects) {
      boundGeometry(objects[key]);
    }

    return [x0, y0, x1, y1];
  };

  // Given a hash of GeoJSON objects and an id function, invokes the id function
  // to compute a new id for each object that is a feature. The function is passed
  // the feature and is expected to return the new feature id, or null if the
  // feature should not have an id.
  var computeId = function(objects, id) {
    if (arguments.length < 2) id = function(d) { return d.id; };

    function idObject(object) {
      if (object && idObjectType.hasOwnProperty(object.type)) idObjectType[object.type](object);
    }

    function idFeature(feature) {
      var i = id(feature);
      if (i == null) delete feature.id;
      else feature.id = i;
    }

    var idObjectType = {
      Feature: idFeature,
      FeatureCollection: function(collection) { collection.features.forEach(idFeature); }
    };

    for (var key in objects) {
      idObject(objects[key]);
    }

    return objects;
  };

  // Given a hash of GeoJSON objects, transforms any properties on features using
  // the specified transform function. If no properties are propagated to the new
  // properties hash, the properties hash will be deleted.
  var transformProperties = function(objects, propertyTransform) {
    if (arguments.length < 2) propertyTransform = function() {};

    function transformObject(object) {
      if (object && transformObjectType.hasOwnProperty(object.type)) transformObjectType[object.type](object);
    }

    function transformFeature(feature) {
      if (feature.properties == null) feature.properties = {};
      var properties = feature.properties = propertyTransform(feature);
      if (properties) for (var key in properties) return;
      delete feature.properties;
    }

    var transformObjectType = {
      Feature: transformFeature,
      FeatureCollection: function(collection) { collection.features.forEach(transformFeature); }
    };

    for (var key in objects) {
      transformObject(objects[key]);
    }

    return objects;
  };

  var ε = 1e-6;

  var topology$1 = function(objects, options) {
    var Q0 = 1e4, // precision of pre-quantization
        Q1 = 1e4, // precision of post-quantization (must be divisor of Q0)
        id = function(d) { return d.id; }, // function to compute object id
        propertyTransform = function() {}, // function to transform properties
        transform,
        minimumArea = 0,
        stitchPoles = true,
        verbose = false,
        system = null;

    if (options)
      "verbose" in options && (verbose = !!options["verbose"]),
      "stitch-poles" in options && (stitchPoles = !!options["stitch-poles"]),
      "coordinate-system" in options && (system = coordinateSystems[options["coordinate-system"]]),
      "minimum-area" in options && (minimumArea = +options["minimum-area"]),
      "quantization" in options && (Q0 = Q1 = +options["quantization"]),
      "pre-quantization" in options && (Q0 = +options["pre-quantization"]),
      "post-quantization" in options && (Q1 = +options["post-quantization"]),
      "id" in options && (id = options["id"]),
      "property-transform" in options && (propertyTransform = options["property-transform"]);

    if (Q0 / Q1 % 1) throw new Error("post-quantization is not a divisor of pre-quantization");
    if (Q0 && !Q1) throw new Error("post-quantization is required when input is already quantized");

    // Compute the new feature id and transform properties.
    computeId(objects, id);
    transformProperties(objects, propertyTransform);

    // Convert to geometry objects.
    geomify(objects);

    // Compute initial bounding box.
    var bbox = bounds(objects);

    // For automatic coordinate system determination, consider the bounding box.
    var oversize = bbox[0] < -180 - ε
        || bbox[1] < -90 - ε
        || bbox[2] > 180 + ε
        || bbox[3] > 90 + ε;
    if (!system) {
      system = coordinateSystems[oversize ? "cartesian" : "spherical"];
      if (options) options["coordinate-system"] = system.name;
    }

    if (system === coordinateSystems.spherical) {
      if (oversize) throw new Error("spherical coordinates outside of [±180°, ±90°]");

      // When near the spherical coordinate limits, clamp to nice round values.
      // This avoids quantized coordinates that are slightly outside the limits.
      if (bbox[0] < -180 + ε) bbox[0] = -180;
      if (bbox[1] < -90 + ε) bbox[1] = -90;
      if (bbox[2] > 180 - ε) bbox[2] = 180;
      if (bbox[3] > 90 - ε) bbox[3] = 90;
    }

    if (verbose) {
      process.stderr.write("bounds: " + bbox.join(" ") + " (" + system.name + ")\n");
    }

    // Pre-topology quantization.
    if (Q0) {
      transform = preQuantize(objects, bbox, Q0, Q1);
      if (verbose) {
        process.stderr.write("pre-quantization: " + transform.scale.map(function(k) { return system.formatDistance(k); }).join(" ") + "\n");
      }
    }

    // Remove any antimeridian cuts and restitch.
    if (system === coordinateSystems.spherical && stitchPoles) {
      stitch(objects, transform);
    }

    // Compute the topology.
    var topology$$1 = topology(objects);
    if (Q0) topology$$1.transform = transform;
    topology$$1.bbox = bbox;
    if (verbose) {
      process.stderr.write("topology: " + topology$$1.arcs.length + " arcs, " + topology$$1.arcs.reduce(function(p, v) { return p + v.length; }, 0) + " points\n");
    }

    // Post-topology quantization.
    if (Q1 && Q1 !== Q0) {
      postQuantize(topology$$1, Q0, Q1);
      transform = topology$$1.transform;
      if (verbose) {
        process.stderr.write("post-quantization: " + transform.scale.map(function(k) { return system.formatDistance(k); }).join(" ") + "\n");
      }
    }

    // Convert to delta-encoding.
    if (Q1) {
      delta(topology$$1);
    }

    return topology$$1;
  };

  var simplify = function(topology, options) {
    var minimumArea = 0,
        retainProportion,
        verbose = false,
        system = null,
        N = topology.arcs.reduce(function(p, v) { return p + v.length; }, 0),
        M = 0;

    if (options)
      "minimum-area" in options && (minimumArea = +options["minimum-area"]),
      "coordinate-system" in options && (system = coordinateSystems[options["coordinate-system"]]),
      "retain-proportion" in options && (retainProportion = +options["retain-proportion"]),
      "verbose" in options && (verbose = !!options["verbose"]);

    topojson.presimplify(topology, system.triangleArea);

    if (retainProportion) {
      var areas = [];
      topology.arcs.forEach(function(arc) {
        arc.forEach(function(point) {
          if (isFinite(point[2])) areas.push(point[2]); // ignore endpoints
        });
      });
      var n = areas.length;
      options["minimum-area"] = minimumArea = n ? areas.sort(function(a, b) { return b - a; })[Math.max(0, Math.ceil((N - 1) * retainProportion + n - N))] : 0;
      if (verbose) process.stderr.write("simplification: effective minimum area " + minimumArea.toPrecision(3) + "\n");
    }

    topology.arcs.forEach(topology.transform ? function(arc) {
      var dx = 0,
          dy = 0, // accumulate removed points
          i = -1,
          j = -1,
          n = arc.length,
          source,
          target;

      while (++i < n) {
        source = arc[i];
        if (source[2] >= minimumArea) {
          target = arc[++j];
          target[0] = source[0] + dx;
          target[1] = source[1] + dy;
          dx = dy = 0;
        } else {
          dx += source[0];
          dy += source[1];
        }
      }

      arc.length = ++j;
    } : function(arc) {
      var i = -1,
          j = -1,
          n = arc.length,
          point;

      while (++i < n) {
        point = arc[i];
        if (point[2] >= minimumArea) {
          arc[++j] = point;
        }
      }

      arc.length = ++j;
    });

    // Remove computed area (z) for each point, and remove coincident points.
    // This is done as a separate pass because some coordinates may be shared
    // between arcs (such as the last point and first point of a cut line).
    // If the entire arc is empty, retain at least two points (per spec).
    topology.arcs.forEach(topology.transform ? function(arc) {
      var i = 0,
          j = 0,
          n = arc.length,
          p = arc[0];
      p.length = 2;
      while (++i < n) {
        p = arc[i];
        p.length = 2;
        if (p[0] || p[1]) arc[++j] = p;
      }
      M += arc.length = (j || 1) + 1;
    } : function(arc) {
      var i = 0,
          j = 0,
          n = arc.length,
          p = arc[0],
          x0 = p[0],
          y0 = p[1],
          x1,
          y1;
      p.length = 2;
      while (++i < n) {
        p = arc[i], x1 = p[0], y1 = p[1];
        p.length = 2;
        if (x0 !== x1 || y0 !== y1) arc[++j] = p, x0 = x1, y0 = y1;
      }
      M += arc.length = (j || 1) + 1;
    });

    if (verbose) process.stderr.write("simplification: retained " + M + " / " + N + " points (" + Math.round((M / N) * 100) + "%)\n");

    return topology;
  };

  var clockwise = function(object, options) {
    if (object.type === "Topology") clockwiseTopology(object, options);
    else clockwiseGeometry(object, options);
  };

  function clockwiseGeometry(object, options) {
    var system = null;

    if (options)
      "coordinate-system" in options && (system = coordinateSystems[options["coordinate-system"]]);

    var clockwisePolygon = clockwisePolygonSystem(system.ringArea, reverse);

    type({
      LineString: noop,
      MultiLineString: noop,
      Point: noop,
      MultiPoint: noop,
      Polygon: function(polygon) { clockwisePolygon(polygon.coordinates); },
      MultiPolygon: function(multiPolygon) { multiPolygon.coordinates.forEach(clockwisePolygon); }
    }).object(object);

    function reverse(array) { array.reverse(); }
  }

  function clockwiseTopology(topology, options) {
    var system = null;

    if (options)
      "coordinate-system" in options && (system = coordinateSystems[options["coordinate-system"]]);

    var clockwisePolygon = clockwisePolygonSystem(ringArea, reverse);

    var clockwise = type({
      LineString: noop,
      MultiLineString: noop,
      Point: noop,
      MultiPoint: noop,
      Polygon: function(polygon) { clockwisePolygon(polygon.arcs); },
      MultiPolygon: function(multiPolygon) { multiPolygon.arcs.forEach(clockwisePolygon); }
    });

    for (var key in topology.objects) {
      clockwise.object(topology.objects[key]);
    }

    function ringArea(ring) {
      return system.ringArea(topojson.feature(topology, {type: "Polygon", arcs: [ring]}).geometry.coordinates[0]);
    }

    // TODO It might be slightly more compact to reverse the arc.
    function reverse(ring) {
      var i = -1, n = ring.length;
      ring.reverse();
      while (++i < n) ring[i] = ~ring[i];
    }
  }
  function clockwisePolygonSystem(ringArea, reverse) {
    return function(rings) {
      if (!(n = rings.length)) return;
      var n,
          areas = new Array(n),
          max = -Infinity,
          best,
          area,
          t;
      // Find the largest absolute ring area; this should be the exterior ring.
      for (var i = 0; i < n; ++i) {
        var area = Math.abs(areas[i] = ringArea(rings[i]));
        if (area > max) max = area, best = i;
      }
      // Ensure the largest ring appears first.
      if (best) {
        t = rings[best], rings[best] = rings[0], rings[0] = t;
        t = areas[best], areas[best] = areas[0], areas[0] = t;
      }
      if (areas[0] < 0) reverse(rings[0]);
      for (var i = 1; i < n; ++i) {
        if (areas[i] > 0) reverse(rings[i]);
      }
    };
  }

  function noop() {}

  var prune = function(topology, options) {
    var verbose = false,
        objects = topology.objects,
        oldArcs = topology.arcs,
        oldArcCount = oldArcs.length,
        newArcs = topology.arcs = [],
        newArcCount = 0,
        newIndexByOldIndex = new Array(oldArcs.length);

    if (options)
      "verbose" in options && (verbose = !!options["verbose"]);

    function pruneGeometry(geometry) {
      if (geometry && pruneGeometryType.hasOwnProperty(geometry.type)) pruneGeometryType[geometry.type](geometry);
    }

    var pruneGeometryType = {
      GeometryCollection: function(o) { o.geometries.forEach(pruneGeometry); },
      LineString: function(o) { pruneArcs(o.arcs); },
      MultiLineString: function(o) { o.arcs.forEach(pruneArcs); },
      Polygon: function(o) { o.arcs.forEach(pruneArcs); },
      MultiPolygon: function(o) { o.arcs.forEach(pruneMultiArcs); }
    };

    function pruneArcs(arcs) {
      for (var i = 0, n = arcs.length; i < n; ++i) {
        var oldIndex = arcs[i],
            oldReverse = oldIndex < 0 && (oldIndex = ~oldIndex, true),
            newIndex;

        // If this is the first instance of this arc,
        // record it under its new index.
        if ((newIndex = newIndexByOldIndex[oldIndex]) == null) {
          newIndexByOldIndex[oldIndex] = newIndex = newArcCount++;
          newArcs[newIndex] = oldArcs[oldIndex];
        }

        arcs[i] = oldReverse ? ~newIndex : newIndex;
      }
    }

    function pruneMultiArcs(arcs) {
      arcs.forEach(pruneArcs);
    }

    for (var key in objects) {
      pruneGeometry(objects[key]);
    }

    if (verbose) process.stderr.write("prune: retained " + newArcCount + " / " + oldArcCount + " arcs (" + Math.round(newArcCount / oldArcCount * 100) + "%)\n");

    return topology;
  };

  var filter = function(topology, options) {
    var system = null,
        forceClockwise = true, // force exterior rings to be clockwise?
        preserveAttached = true, // e.g., remove islands but not small counties
        preserveRing = preserveNone,
        minimumArea;

    if (options)
      "coordinate-system" in options && (system = coordinateSystems[options["coordinate-system"]]),
      "minimum-area" in options && (minimumArea = +options["minimum-area"]),
      "preserve-attached" in options && (preserveAttached = !!options["preserve-attached"]),
      "force-clockwise" in options && (forceClockwise = !!options["force-clockwise"]);

    if (forceClockwise) clockwise(topology, options); // deprecated; for backwards-compatibility

    if (!(minimumArea > 0)) minimumArea = Number.MIN_VALUE;

    if (preserveAttached) {
      var uniqueRingByArc = {}, // arc index -> index of unique associated ring, or -1 if used by multiple rings
          ringIndex = 0;

      var checkAttachment = type({
        LineString: noop$2,
        MultiLineString: noop$2,
        Point: noop$2,
        MultiPoint: noop$2,
        MultiPolygon: function(multiPolygon) {
          var arcs = multiPolygon.arcs, i = -1, n = arcs.length;
          while (++i < n) this.polygon(arcs[i]);
        },
        Polygon: function(polygon) {
          this.polygon(polygon.arcs);
        },
        polygon: function(arcs) {
          for (var i = 0, n = arcs.length; i < n; ++i, ++ringIndex) {
            for (var ring = arcs[i], j = 0, m = ring.length; j < m; ++j) {
              var arc = ring[j];
              if (arc < 0) arc = ~arc;
              var uniqueRing = uniqueRingByArc[arc];
              if (uniqueRing >= 0 && uniqueRing !== ringIndex) uniqueRingByArc[arc] = -1;
              else uniqueRingByArc[arc] = ringIndex;
            }
          }
        }
      });

      preserveRing = function(ring) {
        for (var j = 0, m = ring.length; j < m; ++j) {
          var arc = ring[j];
          if (uniqueRingByArc[arc < 0 ? ~arc : arc] < 0) {
            return true;
          }
        }
      };

      for (var key in topology.objects) {
        checkAttachment.object(topology.objects[key]);
      }
    }

    var filter = type({
      LineString: noop$2, // TODO remove empty lines
      MultiLineString: noop$2,
      Point: noop$2,
      MultiPoint: noop$2,
      Polygon: function(polygon) {
        polygon.arcs = filterPolygon(polygon.arcs);
        if (!polygon.arcs || !polygon.arcs.length) {
          polygon.type = null;
          delete polygon.arcs;
        }
      },
      MultiPolygon: function(multiPolygon) {
        multiPolygon.arcs = multiPolygon.arcs
            .map(filterPolygon)
            .filter(function(polygon) { return polygon && polygon.length; });
        if (!multiPolygon.arcs.length) {
          multiPolygon.type = null;
          delete multiPolygon.arcs;
        }
      },
      GeometryCollection: function(collection) {
        this.defaults.GeometryCollection.call(this, collection);
        collection.geometries = collection.geometries.filter(function(geometry) { return geometry.type != null; });
        if (!collection.geometries.length) {
          collection.type = null;
          delete collection.geometries;
        }
      }
    });

    for (var key in topology.objects) {
      filter.object(topology.objects[key]);
    }

    prune(topology, options);

    function filterPolygon(arcs) {
      return arcs.length && filterExteriorRing(arcs[0]) // if the exterior is small, ignore any holes
          ? [arcs.shift()].concat(arcs.filter(filterInteriorRing))
          : null;
    }

    function filterExteriorRing(ring) {
      return preserveRing(ring) || system.absoluteArea(ringArea(ring)) >= minimumArea;
    }

    function filterInteriorRing(ring) {
      return preserveRing(ring) || system.absoluteArea(-ringArea(ring)) >= minimumArea;
    }

    function ringArea(ring) {
      return system.ringArea(topojson.feature(topology, {type: "Polygon", arcs: [ring]}).geometry.coordinates[0]);
    }
  };

  function noop$2() {}

  function preserveNone() {
    return false;
  }

  var scale = function(topology, options) {
    var width,
        height,
        margin = 0,
        invert = true;

    if (options)
      "width" in options && (width = +options["width"]),
      "height" in options && (height = +options["height"]),
      "margin" in options && (margin = +options["margin"]),
      "invert" in options && (invert = !!options["invert"]);

    var bx = topology.bbox,
        dx = bx[2] - bx[0],
        dy = bx[3] - bx[1],
        cx = (bx[2] + bx[0]) / 2,
        cy = (bx[3] + bx[1]) / 2,
        kx;

    width = Math.max(0, width - margin * 2);
    height = Math.max(0, height - margin * 2);

    if (width && height) {
      kx = Math.min(width / dx, height / dy);
    } else if (width) {
      kx = width / dx;
      height = kx * dy;
    } else {
      kx = height / dy;
      width = kx * dx;
    }

    var ky = invert ? -kx : kx,
        lt = scalePoint([bx[0], bx[1]]),
        rb = scalePoint([bx[2], bx[3]]),
        tx;

    topology.bbox = invert
        ? [lt[0], rb[1], rb[0], lt[1]]
        : [lt[0], lt[1], rb[0], rb[1]];

    function scalePoint(point) {
      return [
        point[0] * kx + (width / 2 - cx * kx) + margin,
        point[1] * ky + (height / 2 - cy * ky) + margin
      ];
    }

    if (tx = topology.transform) {
      tx.scale[0] *= kx;
      tx.scale[1] *= ky;
      tx.translate[0] = width / 2 + margin - (cx - tx.translate[0]) * kx;
      tx.translate[1] = height / 2 + margin - (cy - tx.translate[1]) * ky;
    } else {
      var scale = type({
        LineString: noop$3,
        MultiLineString: noop$3,
        Point: function(point) { point.coordinates = scalePoint(point.coordinates); },
        MultiPoint: function(multipoint) { multipoint.coordinates = multipoint.coordinates.map(scalePoint); },
        Polygon: noop$3,
        MultiPolygon: noop$3
      });

      for (var key in topology.objects) {
        scale.object(topology.objects[key]);
      }

      topology.arcs = topology.arcs.map(function(arc) {
        return arc.map(scalePoint);
      });
    }

    return topology;
  };

  function noop$3() {}

  var server = createCommonjsModule(function (module) {
  var topojson$$1 = module.exports = topojson;
  topojson$$1.topology = topology$1;
  topojson$$1.simplify = simplify;
  topojson$$1.clockwise = clockwise;
  topojson$$1.filter = filter;
  topojson$$1.prune = prune;
  topojson$$1.stitch = stitch;
  topojson$$1.scale = scale;
  });

  const rotate = -20; // so that [-60, 0] becomes initial center of projection

  const maxlat = 83;
  class WorldMap {
    constructor(opts) {
      // load in arguments from config object
      this.data = opts.data;
      this.sovietDataPoints = opts.data.filter(country => sovietCountryIsoCodes.includes(country.id));
      this.element = opts.element; // create the chart

      this.draw();
    }

    getMercatorBounds(projection) {
      const yaw = projection.rotate()[0];
      const xymax = projection([-yaw + 180 - 1e-6, -maxlat]);
      const xymin = projection([-yaw - 180 + 1e-6, maxlat]);
      return [xymin, xymax];
    }

    draw() {
      const boundingBox = d3.select(this.element).node().getBoundingClientRect();
      this.height = boundingBox.height;
      this.width = boundingBox.width; // define width, height and margin

      this.projection = d3.geo.mercator().rotate([rotate, 0]).scale(1) // we'll scale up to match viewport shortly.
      .translate([this.width / 2, this.height / 2]);
      this.initialScale = this.getInitialScale();
      console.warn('this.initialScale', this.initialScale);
      this.projection.scale(this.initialScale);
      this.path = d3.geo.path().projection(this.projection);
      const svg = d3.select(this.element).append("svg").attr("width", this.width).attr("height", this.height);
      this.mapGraphic = svg.append("g").attr("id", "map"); // TODO: give russia a seperate handle from others

      this.mapGraphic.selectAll("path").data(this.data).enter().append("path").attr("d", this.path).style("stroke-width", 0.5 + "px").attr("class", "country").attr("id", function (d, i) {
        return d.id;
      }).attr("class", function (datapoint, i) {
        if (sovietCountryIsoCodes.includes(datapoint.id)) {
          return "country soviet-country";
        } else {
          return "country non-soviet-country";
        }
      });
      this.applyInitialHideAndHighlight();
    }

    applyInitialHideAndHighlight() {
      this.mapGraphic.selectAll('.country').style("display", function (datum) {
        if (datum.id === 'ATA') {
          console.warn('ATA');
          return 'none';
        }
      }).style('fill', datum => {
        if (sovietCountryIsoCodes.includes(datum.id)) {
          return "#fcd116";
        }
      });
    }

    getInitialScale() {
      const b = this.getMercatorBounds(this.projection);
      const s = this.width / (b[1][0] - b[0][0]);
      const scaleExtent = [s, 10 * s];
      return scaleExtent[0];
    }

    animateSectionStyles({
      duration,
      section,
      styles,
      delay = 0
    } = {}) {
      console.warn({
        duration,
        section,
        styles
      });
      d3.select(this.element).selectAll(section).transition().delay(delay).duration(duration).style(styles);
    }

    animateCISStyles({
      duration,
      section,
      styles
    }) {
      console.warn({
        duration,
        section,
        styles
      });
      d3.select(this.element).selectAll(section).filter(({
        id
      }) => id !== 'RUS').transition().duration(duration).style(styles);
    }

    animateMapZoom({
      scale,
      translateX,
      translateY,
      duration
    }) {
      this.mapGraphic.transition().duration(duration).attr("transform", `scale(${scale})translate(${translateX},${translateY})`);
    } // TODO: find a better way to shift labels


    createLabels() {
      this.mapGraphic.selectAll(".place-label").data(this.sovietDataPoints).enter().append("text").attr("class", "place-label").attr("transform", d => {
        const [x, y] = this.path.centroid(d);
        return `translate(${x},${y})`;
      }).attr("dx", function ({
        id
      }) {
        const {
          x
        } = sovietLabelShift[id];
        return `${x}px`;
      }).attr("dy", function ({
        id
      }) {
        const {
          y
        } = sovietLabelShift[id];
        return `${y}px`;
      }).text(function (d) {
        return d.properties.name;
      }).style("font-size", 3 + "px");
    } // TODO: makethis an actual choropleth funk


    createPopulationChoropleth() {
      d3.selectAll(".soviet-country").transition().duration(1000).style("fill", function (d, i) {
        // console.warn('i', i)
        return colors[i];
      }).style("stroke-width", 0.25 + "px");
    }

    moveMapContainer({
      top,
      duration
    }) {
      d3.select(this.element).transition().duration(duration).style("top", top + "px");
    }

    addPointsToMap() {
      const centroids = this.sovietDataPoints.map(country => {
        return this.path.centroid(country);
      });
      this.mapGraphic.selectAll(".centroid").data(centroids).enter().append("circle").attr("class", ".centroid").attr("fill", "black").attr("r", "0.45px").attr("cx", function (d) {
        return d[0];
      }).attr("cy", function (d) {
        return d[1];
      });
      const russiaCoordinates = [235, 110];
      this.mapGraphic.selectAll(".russia-centroid").data(russiaCoordinates).enter().append("circle").attr("fill", "white").attr("r", "0.25px").attr("cx", function (d) {
        return d[0];
      }).attr("cy", function (d) {
        return d[1];
      });
    }

    drawLabelPointer() {
      const centroidsWithoutRussia = this.sovietDataPoints.filter(({
        id
      }) => id !== "RUS").map(country => {
        return this.path.centroid(country);
      });
      console.warn("ayyeee drawing an arrow");
      this.mapGraphic.selectAll(".centroid").data(centroidsWithoutRussia).enter().append("line").attr("x1", function (d) {
        return d[0];
      }).attr("y1", function (d) {
        return d[1];
      }).attr("x2", function (d) {
        return d[0] + 5;
      }).attr("y2", function (d) {
        return d[1] + 10;
      }).attr("stroke", "black").attr("stroke-width", 0.1).attr("marker-end", "url(#arrow)");
    }

    drawCurves() {
      const centroidsWithValues = this.sovietDataPoints.filter(({
        id
      }) => id !== 'RUS').map(country => this.path.centroid(country)); // console.warn("centroidsWithValues", centroidsWithValues);

      const russiaCoordinates = [235, 110];
      const arcs = this.mapGraphic.append("g").selectAll("path.datamaps-arc").data(centroidsWithValues);
      arcs.enter().append("path").attr("class", "arc").attr("d", (datum, index) => {
        // console.warn({datum})
        const curveoffset = 15;
        const origin = [datum[0], datum[1]];
        const dest = russiaCoordinates;
        const mid = [(origin[0] + dest[0]) / 2, (origin[1] + dest[1]) / 2]; //define handle points for Bezier curves. Higher values for curveoffset will generate more pronounced curves.

        const midcurve = [mid[0], mid[1] - curveoffset]; // move cursor to origin
        // define the arrowpoint: the destination, minus a scaled tangent vector, minus an orthogonal vector scaled to the datum.trade variable
        // move cursor to origin

        return "M" + origin[0] + ',' + origin[1] // smooth curve to offset midpoint
        + "S" + midcurve[0] + "," + midcurve[1] //smooth curve to destination	
        + "," + dest[0] + "," + dest[1];
      }).style('fill', 'none').style('stroke-width', '0.5px').style('stroke', '#7772a8').style('opacity', '0').transition().duration(1000).style('opacity', '1');
    }

    animateWorldSections() {
      this.mapGraphic.select('#ISR').style('opacity', '1').style('fill', 'pink');
      this.mapGraphic.select('#DEU').style('opacity', '1').style('fill', 'green');
      this.mapGraphic.select('#USA').style('opacity', '1').style('fill', 'blue');
      const russiaCoordinates = [235, 110];
      const receivingCentroids = this.data.filter(({
        id
      }) => primaryReceivingIsoCodes.includes(id)).map(country => {
        return {
          id: country.id,
          centroid: this.path.centroid(country)
        };
      });
      const receivingArcs = this.mapGraphic.append("g").selectAll("path.datamaps-arc").data(receivingCentroids);
      const curveOffsets = [50, 15, 15]; // 0 => usa
      // 1 => israel
      // 2 => germany

      receivingArcs.enter().append("path").attr("class", "arc").attr("id", fulldatum => {
        return 'arc-' + fulldatum.id;
      }).attr("d", (fulldatum, index) => {
        const datum = fulldatum.centroid;
        console.warn('arc datum', datum);
        console.warn('arc fulldatum', fulldatum);
        const origin = [datum[0], datum[1]];
        const dest = russiaCoordinates;
        const mid = [(origin[0] + dest[0]) / 2, (origin[1] + dest[1]) / 2]; //define handle points for Bezier curves. Higher values for curveoffset will generate more pronounced curves.

        const midcurve = [mid[0], mid[1] - curveOffsets[index]]; // move cursor to origin
        // define the arrowpoint: the destination, minus a scaled tangent vector, minus an orthogonal vector scaled to the datum.trade variable
        // move cursor to origin

        return "M" + origin[0] + ',' + origin[1] // smooth curve to offset midpoint
        + "S" + midcurve[0] + "," + midcurve[1] //smooth curve to destination	
        + "," + dest[0] + "," + dest[1];
      }).style('fill', 'none').style('stroke-width', '0.5px').style('stroke', '#7772a8').style('opacity', '0').transition().duration(1000).style('opacity', '1');
    }

  }

  class BarChart {
    constructor(opts) {
      // load in arguments from config object
      this.data = opts.data;
      this.sovietDataPoints = opts.data.filter(country => sovietCountryIsoCodes.includes(country.id));
      this.element = opts.element; // create the chart

      this.draw();
    }

    draw() {
      // define width, height and margin
      const scrollContainer = d3.select(".scroll");
      const boundingBox = scrollContainer.node().getBoundingClientRect();
      const {
        width
      } = boundingBox;
      this.barMargin = {
        top: 15,
        right: 85,
        bottom: 40,
        left: 64
      };
      const halfPageHeight = Math.floor(window.innerHeight) / 2;
      this.width = width - this.barMargin.left - this.barMargin.right;
      this.height = halfPageHeight - this.barMargin.top - this.barMargin.bottom;
      this.paintPlot(this.width, this.height, this.barMargin);
      const headerText = "1989 Soviet State Populations";
      this.drawTitle(headerText, "mil"); // create the other stuff

      this.setXScale(this.data);
      this.setYScale(this.data);
      this.bindDataToBars(this.data);
      this.paintHiddenBars();
      this.addYAxes();
      this.hideAllElements();
    }

    paintPlot(width, height, margins) {
      this.plot = d3.select(".bar-graphic").append("svg").attr("width", width + margins.left + margins.right).attr("height", height + margins.top + margins.bottom).append("g").attr("transform", "translate(" + margins.left + "," + margins.top + ")");
    }

    hideAllElements() {
      this.plot.style("opacity", "0");
      d3.select(".bar-graphic-header").style("opacity", "0");
    }

    drawTitle(text, units) {
      this.textHeader = d3.select(".bar-graphic-header-text");
      this.textHeader.text(text);
      this.textHeaderUnits = d3.select(".bar-graphic-header-units");
      this.textHeaderUnits.text(units);
    }

    paintHiddenBars() {
      this.bars.append("rect").attr("class", "bar").attr("y", d => {
        return this.yScale(d.name);
      }).attr("height", () => this.yScale.rangeBand()).attr("fill", (d, i) => colors[i]);
    }

    setXScale(data) {
      this.xScale = d3.scale.linear().range([0, this.width]).domain([0, d3.max(data, function (d) {
        return d.population;
      })]);
    }

    setYScale(data) {
      this.yScale = d3.scale.ordinal().rangeRoundBands([this.height, 0], 0.1).domain(data.map(function (d) {
        return d.name;
      }));
    }

    addYAxes() {
      const yAxisStuff = d3.svg.axis().scale(this.yScale) //no tick marks
      .tickSize(0).orient("left");
      this.plot.append("g").attr("class", "y-axis").call(yAxisStuff);
    }

    redrawYAxes(data) {
      const yAxisStuff = d3.svg.axis().scale(this.yScale) //no tick marks
      .tickSize(0).orient("left");
      this.plot.select(".y-axis").call(yAxisStuff); // .call(yAxisStuff)
    }

    repaintChart(data) {
      this.setXScale(data);
      this.setYScale(data);
      this.bindDataToBars(data);
      this.redrawBars(data);
      this.redrawLabels(data);
      this.redrawYAxes(data);
    }

    paintPercentageChart(data) {
      this.xScale = d3.scale.linear().range([0, this.width]).domain([0, 100]);
      this.setYScale(data);
      this.bindDataToBars(data);
      this.redrawBars(data);
      this.redrawPercentLabels(data);
      this.redrawYAxes(data);
    }

    redrawBarsWith3DataPoints(data) {
      this.xScale = d3.scale.linear().range([0, this.width]).domain([0, 100]);
      this.setYScale(data);
      this.bindDataToBars(data);
      this.redrawBars(data);
      this.redrawPercentLabels(data);
      this.redrawYAxes(data);
    }

    bindDataToBars(data) {
      this.bars = this.plot.selectAll(".bar").data(data).enter().append("g");
    }

    redrawBars(data) {
      d3.selectAll("rect").data(data).transition().delay(function (d, i) {
        return i * 100;
      }).attr("width", d => {
        return this.xScale(d.population);
      });
    }

    redrawPercentLabels(data) {
      this.plot.selectAll(".label").transition().duration(500).style("opacity", "0");
      this.plot.select("g").selectAll(".text").data(data).enter().append("text").attr("class", "label").attr("y", d => {
        return this.yScale(d.name);
      }).attr("x", d => {
        return this.xScale(d.population);
      }).attr("dx", ".75em").text(function (datum) {
        return datum.population + "%";
      }).attr("transform", "translate(" + 0 + "," + this.barMargin.top + ")");
    }

    redrawLabels(data) {
      this.plot.selectAll(".label").remove();
      this.plot.select("g").selectAll(".text").data(data).enter().append("text").attr("class", "label").attr("y", d => {
        return this.yScale(d.name);
      }).attr("x", d => {
        return this.xScale(d.population);
      }).attr("dx", ".75em").text(function (datum) {
        return parseMillionsPopulationText(datum);
      }).style("fill", "lightgoldenrodyellow").style("font-weight", 600).attr("transform", "translate(" + 0 + "," + this.barMargin.top + ")");
    }

    addPopulationLabels(data) {
      this.redrawLabels(data);
      this.plot.selectAll(".label").style("opacity", "0").transition().delay(500).duration(500).style("opacity", "1");
    }

    revealBarChart() {
      this.plot.transition().delay(500).style("opacity", "1");
      d3.select(".bar-graphic-header").transition().delay(500).style("opacity", "1").style("color", "black");
    }

  }

  function parseMillionsPopulationText(datum) {
    const populationText = datum.population;
    return `${populationText}`;
  }

  window.onbeforeunload = function () {
    window.scrollTo(0, 0);
  };

  loadMap().then(json => {
    firstPaint();
    const countries = server.feature(json, json.objects.subunits);
    const features = countries.features;
    const worldMap = new WorldMap({
      data: features,
      element: '.map-graphic-container'
    });
    const barChart = new BarChart({
      element: '.bar-graphic',
      data: populationsIn1989millions
    });
    console.warn('features', features);
    setupScrollama(worldMap, barChart);
  });

}());
//# sourceMappingURL=bundle.js.map
