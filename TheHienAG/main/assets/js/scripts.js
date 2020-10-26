// Utility function
function Util () {};

/* 
	class manipulation functions
*/
Util.hasClass = function(el, className) {
	if (el.classList) return el.classList.contains(className);
	else return !!el.className.match(new RegExp('(\\s|^)' + className + '(\\s|$)'));
};

Util.addClass = function(el, className) {
	var classList = className.split(' ');
 	if (el.classList) el.classList.add(classList[0]);
 	else if (!Util.hasClass(el, classList[0])) el.className += " " + classList[0];
 	if (classList.length > 1) Util.addClass(el, classList.slice(1).join(' '));
};

Util.removeClass = function(el, className) {
	var classList = className.split(' ');
	if (el.classList) el.classList.remove(classList[0]);	
	else if(Util.hasClass(el, classList[0])) {
		var reg = new RegExp('(\\s|^)' + classList[0] + '(\\s|$)');
		el.className=el.className.replace(reg, ' ');
	}
	if (classList.length > 1) Util.removeClass(el, classList.slice(1).join(' '));
};

Util.toggleClass = function(el, className, bool) {
	if(bool) Util.addClass(el, className);
	else Util.removeClass(el, className);
};

Util.setAttributes = function(el, attrs) {
  for(var key in attrs) {
    el.setAttribute(key, attrs[key]);
  }
};

/* 
  DOM manipulation
*/
Util.getChildrenByClassName = function(el, className) {
  var children = el.children,
    childrenByClass = [];
  for (var i = 0; i < el.children.length; i++) {
    if (Util.hasClass(el.children[i], className)) childrenByClass.push(el.children[i]);
  }
  return childrenByClass;
};

Util.is = function(elem, selector) {
  if(selector.nodeType){
    return elem === selector;
  }

  var qa = (typeof(selector) === 'string' ? document.querySelectorAll(selector) : selector),
    length = qa.length,
    returnArr = [];

  while(length--){
    if(qa[length] === elem){
      return true;
    }
  }

  return false;
};

/* 
	Animate height of an element
*/
Util.setHeight = function(start, to, element, duration, cb) {
	var change = to - start,
	    currentTime = null;

  var animateHeight = function(timestamp){  
    if (!currentTime) currentTime = timestamp;         
    var progress = timestamp - currentTime;
    var val = parseInt((progress/duration)*change + start);
    element.style.height = val+"px";
    if(progress < duration) {
        window.requestAnimationFrame(animateHeight);
    } else {
    	cb();
    }
  };
  
  //set the height of the element before starting animation -> fix bug on Safari
  element.style.height = start+"px";
  window.requestAnimationFrame(animateHeight);
};

/* 
	Smooth Scroll
*/

Util.scrollTo = function(final, duration, cb, scrollEl) {
  var element = scrollEl || window;
  var start = element.scrollTop || document.documentElement.scrollTop,
    currentTime = null;

  if(!scrollEl) start = window.scrollY || document.documentElement.scrollTop;
      
  var animateScroll = function(timestamp){
  	if (!currentTime) currentTime = timestamp;        
    var progress = timestamp - currentTime;
    if(progress > duration) progress = duration;
    var val = Math.easeInOutQuad(progress, start, final-start, duration);
    element.scrollTo(0, val);
    if(progress < duration) {
        window.requestAnimationFrame(animateScroll);
    } else {
      cb && cb();
    }
  };

  window.requestAnimationFrame(animateScroll);
};

/* 
  Focus utility classes
*/

//Move focus to an element
Util.moveFocus = function (element) {
  if( !element ) element = document.getElementsByTagName("body")[0];
  element.focus();
  if (document.activeElement !== element) {
    element.setAttribute('tabindex','-1');
    element.focus();
  }
};

/* 
  Misc
*/

Util.getIndexInArray = function(array, el) {
  return Array.prototype.indexOf.call(array, el);
};

Util.cssSupports = function(property, value) {
  if('CSS' in window) {
    return CSS.supports(property, value);
  } else {
    var jsProperty = property.replace(/-([a-z])/g, function (g) { return g[1].toUpperCase();});
    return jsProperty in document.body.style;
  }
};

// merge a set of user options into plugin defaults
// https://gomakethings.com/vanilla-javascript-version-of-jquery-extend/
Util.extend = function() {
  // Variables
  var extended = {};
  var deep = false;
  var i = 0;
  var length = arguments.length;

  // Check if a deep merge
  if ( Object.prototype.toString.call( arguments[0] ) === '[object Boolean]' ) {
    deep = arguments[0];
    i++;
  }

  // Merge the object into the extended object
  var merge = function (obj) {
    for ( var prop in obj ) {
      if ( Object.prototype.hasOwnProperty.call( obj, prop ) ) {
        // If deep merge and property is an object, merge properties
        if ( deep && Object.prototype.toString.call(obj[prop]) === '[object Object]' ) {
          extended[prop] = extend( true, extended[prop], obj[prop] );
        } else {
          extended[prop] = obj[prop];
        }
      }
    }
  };

  // Loop through each object and conduct a merge
  for ( ; i < length; i++ ) {
    var obj = arguments[i];
    merge(obj);
  }

  return extended;
};

// Check if Reduced Motion is enabled
Util.osHasReducedMotion = function() {
  if(!window.matchMedia) return false;
  var matchMediaObj = window.matchMedia('(prefers-reduced-motion: reduce)');
  if(matchMediaObj) return matchMediaObj.matches;
  return false; // return false if not supported
}; 

/* 
	Polyfills
*/
//Closest() method
if (!Element.prototype.matches) {
	Element.prototype.matches = Element.prototype.msMatchesSelector || Element.prototype.webkitMatchesSelector;
}

if (!Element.prototype.closest) {
	Element.prototype.closest = function(s) {
		var el = this;
		if (!document.documentElement.contains(el)) return null;
		do {
			if (el.matches(s)) return el;
			el = el.parentElement || el.parentNode;
		} while (el !== null && el.nodeType === 1); 
		return null;
	};
}

//Custom Event() constructor
if ( typeof window.CustomEvent !== "function" ) {

  function CustomEvent ( event, params ) {
    params = params || { bubbles: false, cancelable: false, detail: undefined };
    var evt = document.createEvent( 'CustomEvent' );
    evt.initCustomEvent( event, params.bubbles, params.cancelable, params.detail );
    return evt;
   }

  CustomEvent.prototype = window.Event.prototype;

  window.CustomEvent = CustomEvent;
}

/* 
	Animation curves
*/
Math.easeInOutQuad = function (t, b, c, d) {
	t /= d/2;
	if (t < 1) return c/2*t*t + b;
	t--;
	return -c/2 * (t*(t-2) - 1) + b;
};

Math.easeInQuart = function (t, b, c, d) {
	t /= d;
	return c*t*t*t*t + b;
};

Math.easeOutQuart = function (t, b, c, d) { 
  t /= d;
	t--;
	return -c * (t*t*t*t - 1) + b;
};

Math.easeInOutQuart = function (t, b, c, d) {
	t /= d/2;
	if (t < 1) return c/2*t*t*t*t + b;
	t -= 2;
	return -c/2 * (t*t*t*t - 2) + b;
};

Math.easeOutElastic = function (t, b, c, d) {
  var s=1.70158;var p=d*0.7;var a=c;
  if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;
  if (a < Math.abs(c)) { a=c; var s=p/4; }
  else var s = p/(2*Math.PI) * Math.asin (c/a);
  return a*Math.pow(2,-10*t) * Math.sin( (t*d-s)*(2*Math.PI)/p ) + c + b;
};


/* JS Utility Classes */

// make focus ring visible only for keyboard navigation (i.e., tab key) 
(function() {
  var focusTab = document.getElementsByClassName('js-tab-focus'),
    shouldInit = false,
    outlineStyle = false,
    eventDetected = false;

  function detectClick() {
    if(focusTab.length > 0) {
      resetFocusStyle(false);
      window.addEventListener('keydown', detectTab);
    }
    window.removeEventListener('mousedown', detectClick);
    outlineStyle = false;
    eventDetected = true;
  };

  function detectTab(event) {
    if(event.keyCode !== 9) return;
    resetFocusStyle(true);
    window.removeEventListener('keydown', detectTab);
    window.addEventListener('mousedown', detectClick);
    outlineStyle = true;
  };

  function resetFocusStyle(bool) {
    var outlineStyle = bool ? '' : 'none';
    for(var i = 0; i < focusTab.length; i++) {
      focusTab[i].style.setProperty('outline', outlineStyle);
    }
  };

  function initFocusTabs() {
    if(shouldInit) {
      if(eventDetected) resetFocusStyle(outlineStyle);
      return;
    }
    shouldInit = focusTab.length > 0;
    window.addEventListener('mousedown', detectClick);
  };

  initFocusTabs();
  window.addEventListener('initFocusTabs', initFocusTabs);
}());

function resetFocusTabsStyle() {
  window.dispatchEvent(new CustomEvent('initFocusTabs'));
};
// File#: _1_anim-menu-btn
// Usage: codyhouse.co/license
(function() {
    var menuBtns = document.getElementsByClassName('js-anim-menu-btn');
    if( menuBtns.length > 0 ) {
      for(var i = 0; i < menuBtns.length; i++) {(function(i){
        initMenuBtn(menuBtns[i]);
      })(i);}
  
      function initMenuBtn(btn) {
        btn.addEventListener('click', function(event){	
          event.preventDefault();
          var status = !Util.hasClass(btn, 'anim-menu-btn--state-b');
          Util.toggleClass(btn, 'anim-menu-btn--state-b', status);
          // emit custom event
          var event = new CustomEvent('anim-menu-btn-clicked', {detail: status});
          btn.dispatchEvent(event);
        });
      };
    }
  }());
// File#: _1_back-to-top
// Usage: codyhouse.co/license
(function() {
    var backTop = document.getElementsByClassName('js-back-to-top')[0];
    if( backTop ) {
      var dataElement = backTop.getAttribute('data-element');
      var scrollElement = dataElement ? document.querySelector(dataElement) : window;
      var scrollDuration = parseInt(backTop.getAttribute('data-duration')) || 300, //scroll to top duration
        scrollOffset = parseInt(backTop.getAttribute('data-offset')) || 0, //show back-to-top if scrolling > scrollOffset
        scrolling = false;
      
      //detect click on back-to-top link
      backTop.addEventListener('click', function(event) {
        event.preventDefault();
        if(!window.requestAnimationFrame) {
          scrollElement.scrollTo(0, 0);
        } else {
          dataElement ? Util.scrollTo(0, scrollDuration, false, scrollElement) : Util.scrollTo(0, scrollDuration);
        } 
        //move the focus to the #top-element - don't break keyboard navigation
        Util.moveFocus(document.getElementById(backTop.getAttribute('href').replace('#', '')));
      });
      
      //listen to the window scroll and update back-to-top visibility
      checkBackToTop();
      if (scrollOffset > 0) {
        scrollElement.addEventListener("scroll", function(event) {
          if( !scrolling ) {
            scrolling = true;
            (!window.requestAnimationFrame) ? setTimeout(function(){checkBackToTop();}, 250) : window.requestAnimationFrame(checkBackToTop);
          }
        });
      }
  
      function checkBackToTop() {
        var windowTop = scrollElement.scrollTop || document.documentElement.scrollTop;
        if(!dataElement) windowTop = window.scrollY || document.documentElement.scrollTop;
        Util.toggleClass(backTop, 'back-to-top--is-visible', windowTop >= scrollOffset);
        scrolling = false;
      }
    }
  }());
// File#: _1_diagonal-movement
// Usage: codyhouse.co/license
/*
  Modified version of the jQuery-menu-aim plugin
  https://github.com/kamens/jQuery-menu-aim
  - Replaced jQuery with Vanilla JS
  - Minor changes
*/
(function() {
    var menuAim = function(opts) {
      init(opts);
    };
  
    window.menuAim = menuAim;
  
    function init(opts) {
      var activeRow = null,
        mouseLocs = [],
        lastDelayLoc = null,
        timeoutId = null,
        options = Util.extend({
          menu: '',
          rows: false, //if false, get direct children - otherwise pass nodes list 
          submenuSelector: "*",
          submenuDirection: "right",
          tolerance: 75,  // bigger = more forgivey when entering submenu
          enter: function(){},
          exit: function(){},
          activate: function(){},
          deactivate: function(){},
          exitMenu: function(){}
        }, opts),
        menu = options.menu;
  
      var MOUSE_LOCS_TRACKED = 3,  // number of past mouse locations to track
        DELAY = 300;  // ms delay when user appears to be entering submenu
  
      /**
       * Keep track of the last few locations of the mouse.
       */
      var mousemoveDocument = function(e) {
        mouseLocs.push({x: e.pageX, y: e.pageY});
  
        if (mouseLocs.length > MOUSE_LOCS_TRACKED) {
          mouseLocs.shift();
        }
      };
  
      /**
       * Cancel possible row activations when leaving the menu entirely
       */
      var mouseleaveMenu = function() {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
  
        // If exitMenu is supplied and returns true, deactivate the
        // currently active row on menu exit.
        if (options.exitMenu(this)) {
          if (activeRow) {
            options.deactivate(activeRow);
          }
  
          activeRow = null;
        }
      };
  
      /**
       * Trigger a possible row activation whenever entering a new row.
       */
      var mouseenterRow = function() {
        if (timeoutId) {
          // Cancel any previous activation delays
          clearTimeout(timeoutId);
        }
  
        options.enter(this);
        possiblyActivate(this);
      },
      mouseleaveRow = function() {
        options.exit(this);
      };
  
      /*
       * Immediately activate a row if the user clicks on it.
       */
      var clickRow = function() {
        activate(this);
      };  
  
      /**
       * Activate a menu row.
       */
      var activate = function(row) {
        if (row == activeRow) {
          return;
        }
  
        if (activeRow) {
          options.deactivate(activeRow);
        }
  
        options.activate(row);
        activeRow = row;
      };
  
      /**
       * Possibly activate a menu row. If mouse movement indicates that we
       * shouldn't activate yet because user may be trying to enter
       * a submenu's content, then delay and check again later.
       */
      var possiblyActivate = function(row) {
        var delay = activationDelay();
  
        if (delay) {
          timeoutId = setTimeout(function() {
            possiblyActivate(row);
          }, delay);
        } else {
          activate(row);
        }
      };
  
      /**
       * Return the amount of time that should be used as a delay before the
       * currently hovered row is activated.
       *
       * Returns 0 if the activation should happen immediately. Otherwise,
       * returns the number of milliseconds that should be delayed before
       * checking again to see if the row should be activated.
       */
      var activationDelay = function() {
        if (!activeRow || !Util.is(activeRow, options.submenuSelector)) {
          // If there is no other submenu row already active, then
          // go ahead and activate immediately.
          return 0;
        }
  
        function getOffset(element) {
          var rect = element.getBoundingClientRect();
          return { top: rect.top + window.pageYOffset, left: rect.left + window.pageXOffset };
        };
  
        var offset = getOffset(menu),
            upperLeft = {
                x: offset.left,
                y: offset.top - options.tolerance
            },
            upperRight = {
                x: offset.left + menu.offsetWidth,
                y: upperLeft.y
            },
            lowerLeft = {
                x: offset.left,
                y: offset.top + menu.offsetHeight + options.tolerance
            },
            lowerRight = {
                x: offset.left + menu.offsetWidth,
                y: lowerLeft.y
            },
            loc = mouseLocs[mouseLocs.length - 1],
            prevLoc = mouseLocs[0];
  
        if (!loc) {
          return 0;
        }
  
        if (!prevLoc) {
          prevLoc = loc;
        }
  
        if (prevLoc.x < offset.left || prevLoc.x > lowerRight.x || prevLoc.y < offset.top || prevLoc.y > lowerRight.y) {
          // If the previous mouse location was outside of the entire
          // menu's bounds, immediately activate.
          return 0;
        }
  
        if (lastDelayLoc && loc.x == lastDelayLoc.x && loc.y == lastDelayLoc.y) {
          // If the mouse hasn't moved since the last time we checked
          // for activation status, immediately activate.
          return 0;
        }
  
        // Detect if the user is moving towards the currently activated
        // submenu.
        //
        // If the mouse is heading relatively clearly towards
        // the submenu's content, we should wait and give the user more
        // time before activating a new row. If the mouse is heading
        // elsewhere, we can immediately activate a new row.
        //
        // We detect this by calculating the slope formed between the
        // current mouse location and the upper/lower right points of
        // the menu. We do the same for the previous mouse location.
        // If the current mouse location's slopes are
        // increasing/decreasing appropriately compared to the
        // previous's, we know the user is moving toward the submenu.
        //
        // Note that since the y-axis increases as the cursor moves
        // down the screen, we are looking for the slope between the
        // cursor and the upper right corner to decrease over time, not
        // increase (somewhat counterintuitively).
        function slope(a, b) {
          return (b.y - a.y) / (b.x - a.x);
        };
  
        var decreasingCorner = upperRight,
          increasingCorner = lowerRight;
  
        // Our expectations for decreasing or increasing slope values
        // depends on which direction the submenu opens relative to the
        // main menu. By default, if the menu opens on the right, we
        // expect the slope between the cursor and the upper right
        // corner to decrease over time, as explained above. If the
        // submenu opens in a different direction, we change our slope
        // expectations.
        if (options.submenuDirection == "left") {
          decreasingCorner = lowerLeft;
          increasingCorner = upperLeft;
        } else if (options.submenuDirection == "below") {
          decreasingCorner = lowerRight;
          increasingCorner = lowerLeft;
        } else if (options.submenuDirection == "above") {
          decreasingCorner = upperLeft;
          increasingCorner = upperRight;
        }
  
        var decreasingSlope = slope(loc, decreasingCorner),
          increasingSlope = slope(loc, increasingCorner),
          prevDecreasingSlope = slope(prevLoc, decreasingCorner),
          prevIncreasingSlope = slope(prevLoc, increasingCorner);
  
        if (decreasingSlope < prevDecreasingSlope && increasingSlope > prevIncreasingSlope) {
          // Mouse is moving from previous location towards the
          // currently activated submenu. Delay before activating a
          // new menu row, because user may be moving into submenu.
          lastDelayLoc = loc;
          return DELAY;
        }
  
        lastDelayLoc = null;
        return 0;
      };
  
      /**
       * Hook up initial menu events
       */
      menu.addEventListener('mouseleave', mouseleaveMenu);  
      var rows = (options.rows) ? options.rows : menu.children;
      if(rows.length > 0) {
        for(var i = 0; i < rows.length; i++) {(function(i){
          rows[i].addEventListener('mouseenter', mouseenterRow);  
          rows[i].addEventListener('mouseleave', mouseleaveRow);
          rows[i].addEventListener('click', clickRow);  
        })(i);}
      }
  
      document.addEventListener('mousemove', function(event){
      (!window.requestAnimationFrame) ? mousemoveDocument(event) : window.requestAnimationFrame(function(){mousemoveDocument(event);});
      });
    };
  }());
  
  
// File#: _1_reveal-effects
// Usage: codyhouse.co/license
(function() {
    var fxElements = document.getElementsByClassName('reveal-fx');
    var intersectionObserverSupported = ('IntersectionObserver' in window && 'IntersectionObserverEntry' in window && 'intersectionRatio' in window.IntersectionObserverEntry.prototype);
    if(fxElements.length > 0) {
      // deactivate effect if Reduced Motion is enabled
      if (Util.osHasReducedMotion() || !intersectionObserverSupported) {
        fxRemoveClasses();
        return;
      }
      //on small devices, do not animate elements -> reveal all
      if( fxDisabled(fxElements[0]) ) {
        fxRevealAll();
        return;
      }
  
      var fxRevealDelta = 120; // amount (in pixel) the element needs to enter the viewport to be revealed - if not custom value (data-reveal-fx-delta)
      
      var viewportHeight = window.innerHeight,
        fxChecking = false,
        fxRevealedItems = [],
        fxElementDelays = fxGetDelays(), //elements animation delay
        fxElementDeltas = fxGetDeltas(); // amount (in px) the element needs enter the viewport to be revealed (default value is fxRevealDelta) 
      
      
      // add event listeners
      window.addEventListener('load', fxReveal);
      window.addEventListener('resize', fxResize);
  
      // observe reveal elements
      var observer = [];
      initObserver();
  
      function initObserver() {
        for(var i = 0; i < fxElements.length; i++) {
          observer[i] = new IntersectionObserver(
            function(entries, observer) { 
              if(entries[0].isIntersecting) {
                fxRevealItemObserver(entries[0].target);
                observer.unobserve(entries[0].target);
              }
            }, 
            {rootMargin: "0px 0px -"+fxElementDeltas[i]+"px 0px"}
          );
    
          observer[i].observe(fxElements[i]);
        }
      };
  
      function fxRevealAll() { // reveal all elements - small devices
        for(var i = 0; i < fxElements.length; i++) {
          Util.addClass(fxElements[i], 'reveal-fx--is-visible');
        }
      };
  
      function fxResize() { // on resize - check new window height and reveal visible elements
        if(fxChecking) return;
        fxChecking = true;
        (!window.requestAnimationFrame) ? setTimeout(function(){fxReset();}, 250) : window.requestAnimationFrame(fxReset);
      };
  
      function fxReset() {
        viewportHeight = window.innerHeight;
        fxReveal();
      };
  
      function fxReveal() { // reveal visible elements
        for(var i = 0; i < fxElements.length; i++) {(function(i){
          if(fxRevealedItems.indexOf(i) != -1 ) return; //element has already been revelead
          if(fxElementIsVisible(fxElements[i], i)) {
            fxRevealItem(i);
            fxRevealedItems.push(i);
          }})(i); 
        }
        fxResetEvents(); 
        fxChecking = false;
      };
  
      function fxRevealItem(index) {
        if(fxElementDelays[index] && fxElementDelays[index] != 0) {
          // wait before revealing element if a delay was added
          setTimeout(function(){
            Util.addClass(fxElements[index], 'reveal-fx--is-visible');
          }, fxElementDelays[index]);
        } else {
          Util.addClass(fxElements[index], 'reveal-fx--is-visible');
        }
      };
  
      function fxRevealItemObserver(item) {
        var index = Util.getIndexInArray(fxElements, item);
        if(fxRevealedItems.indexOf(index) != -1 ) return; //element has already been revelead
        fxRevealItem(index);
        fxRevealedItems.push(index);
        fxResetEvents(); 
        fxChecking = false;
      };
  
      function fxGetDelays() { // get anmation delays
        var delays = [];
        for(var i = 0; i < fxElements.length; i++) {
          delays.push( fxElements[i].getAttribute('data-reveal-fx-delay') ? parseInt(fxElements[i].getAttribute('data-reveal-fx-delay')) : 0);
        }
        return delays;
      };
  
      function fxGetDeltas() { // get reveal delta
        var deltas = [];
        for(var i = 0; i < fxElements.length; i++) {
          deltas.push( fxElements[i].getAttribute('data-reveal-fx-delta') ? parseInt(fxElements[i].getAttribute('data-reveal-fx-delta')) : fxRevealDelta);
        }
        return deltas;
      };
  
      function fxDisabled(element) { // check if elements need to be animated - no animation on small devices
        return !(window.getComputedStyle(element, '::before').getPropertyValue('content').replace(/'|"/g, "") == 'reveal-fx');
      };
  
      function fxElementIsVisible(element, i) { // element is inside viewport
        return (fxGetElementPosition(element) <= viewportHeight - fxElementDeltas[i]);
      };
  
      function fxGetElementPosition(element) { // get top position of element
        return element.getBoundingClientRect().top;
      };
  
      function fxResetEvents() { 
        if(fxElements.length > fxRevealedItems.length) return;
        // remove event listeners if all elements have been revealed
        window.removeEventListener('load', fxReveal);
        window.removeEventListener('resize', fxResize);
      };
  
      function fxRemoveClasses() {
        // Reduced Motion on or Intersection Observer not supported
        while(fxElements[0]) {
          // remove all classes starting with 'reveal-fx--'
          var classes = fxElements[0].getAttribute('class').split(" ").filter(function(c) {
            return c.lastIndexOf('reveal-fx--', 0) !== 0;
          });
          fxElements[0].setAttribute('class', classes.join(" ").trim());
          Util.removeClass(fxElements[0], 'reveal-fx');
        }
      };
    }
  }());
// File#: _1_revealing-section
// Usage: codyhouse.co/license
(function() {
    var RevealingSection = function(element) {
      this.element = element;
      this.scrollingFn = false;
      this.scrolling = false;
      this.resetOpacity = false;
      initRevealingSection(this);
    };
  
    function initRevealingSection(element) {
      // set position of sticky element
      setBottom(element);
      // create a new node - to be inserted before the sticky element
      createPrevElement(element);
      // on resize -> reset element bottom position
      element.element.addEventListener('update-reveal-section', function(){
        setBottom(element);
        setPrevElementTop(element);
      });
      animateRevealingSection.bind(element)(); // set initial status
      // change opacity of layer
      var observer = new IntersectionObserver(revealingSectionCallback.bind(element));
      observer.observe(element.prevElement);
    };
  
    function createPrevElement(element) {
      var newElement = document.createElement("div"); 
      newElement.setAttribute('aria-hidden', 'true');
      element.element.parentElement.insertBefore(newElement, element.element);
      element.prevElement =  element.element.previousElementSibling;
      element.prevElement.style.opacity = '0';
      setPrevElementTop(element);
    };
  
    function setPrevElementTop(element) {
      element.prevElementTop = element.prevElement.getBoundingClientRect().top + window.scrollY;
    };
  
    function revealingSectionCallback(entries, observer) {
      if(entries[0].isIntersecting) {
        if(this.scrollingFn) return; // listener for scroll event already added
        revealingSectionInitEvent(this);
      } else {
        if(!this.scrollingFn) return; // listener for scroll event already removed
        window.removeEventListener('scroll', this.scrollingFn);
        updateOpacityValue(this, 0);
        this.scrollingFn = false;
      }
    };
    
    function revealingSectionInitEvent(element) {
      element.scrollingFn = revealingSectionScrolling.bind(element);
      window.addEventListener('scroll', element.scrollingFn);
    };
  
    function revealingSectionScrolling() {
      if(this.scrolling) return;
      this.scrolling = true;
      window.requestAnimationFrame(animateRevealingSection.bind(this));
    };
  
    function animateRevealingSection() {
      if(this.prevElementTop - window.scrollY < window.innerHeight) {
        var opacity = (1 - (window.innerHeight + window.scrollY - this.prevElementTop)/window.innerHeight).toFixed(2);
        if(opacity > 0 ) {
          this.resetOpacity = false;
          updateOpacityValue(this, opacity);
        } else if(!this.resetOpacity) {
          this.resetOpacity = true;
          updateOpacityValue(this, 0);
        } 
      }
      this.scrolling = false;
    };
  
    function updateOpacityValue(element, value) {
      element.element.style.setProperty('--reavealing-section-overlay-opacity', value);
    };
  
    function setBottom(element) {
      var translateValue = window.innerHeight - element.element.offsetHeight;
      if(translateValue > 0) translateValue = 0;
      element.element.style.bottom = ''+translateValue+'px';
    };
  
    //initialize the Revealing Section objects
    var revealingSection = document.getElementsByClassName('js-revealing-section');
    var stickySupported = Util.cssSupports('position', 'sticky') || Util.cssSupports('position', '-webkit-sticky');
    if( revealingSection.length > 0 && stickySupported) {
      var revealingSectionArray = [];
      for( var i = 0; i < revealingSection.length; i++) {
        (function(i){revealingSectionArray.push(new RevealingSection(revealingSection[i]));})(i);
      }
      
      var resizingId = false,
        customEvent = new CustomEvent('update-reveal-section');
  
      window.addEventListener('resize', function() {
        clearTimeout(resizingId);
        resizingId = setTimeout(doneResizing, 100);
      });
  
      // wait for font to be loaded
      document.fonts.onloadingdone = function (fontFaceSetEvent) {
        doneResizing();
      };
  
      function doneResizing() {
        for( var i = 0; i < revealingSectionArray.length; i++) {
          (function(i){revealingSectionArray[i].element.dispatchEvent(customEvent)})(i);
        };
      };
    }
  }());
// File#: _1_smooth-scrolling
// Usage: codyhouse.co/license
(function() {
    var SmoothScroll = function(element) {
      if(!('CSS' in window) || !CSS.supports('color', 'var(--color-var)')) return;
      this.element = element;
      this.scrollDuration = parseInt(this.element.getAttribute('data-duration')) || 300;
      this.dataElementY = this.element.getAttribute('data-scrollable-element-y') || this.element.getAttribute('data-scrollable-element') || this.element.getAttribute('data-element');
      this.scrollElementY = this.dataElementY ? document.querySelector(this.dataElementY) : window;
      this.dataElementX = this.element.getAttribute('data-scrollable-element-x');
      this.scrollElementX = this.dataElementY ? document.querySelector(this.dataElementX) : window;
      this.initScroll();
    };
  
    SmoothScroll.prototype.initScroll = function() {
      var self = this;
  
      //detect click on link
      this.element.addEventListener('click', function(event){
        event.preventDefault();
        var targetId = event.target.closest('.js-smooth-scroll').getAttribute('href').replace('#', ''),
          target = document.getElementById(targetId),
          targetTabIndex = target.getAttribute('tabindex'),
          windowScrollTop = self.scrollElementY.scrollTop || document.documentElement.scrollTop;
  
        // scroll vertically
        if(!self.dataElementY) windowScrollTop = window.scrollY || document.documentElement.scrollTop;
  
        var scrollElementY = self.dataElementY ? self.scrollElementY : false;
  
        var fixedHeight = self.getFixedElementHeight(); // check if there's a fixed element on the page
        Util.scrollTo(target.getBoundingClientRect().top + windowScrollTop - fixedHeight, self.scrollDuration, function() {
          // scroll horizontally
          self.scrollHorizontally(target, fixedHeight);
          //move the focus to the target element - don't break keyboard navigation
          Util.moveFocus(target);
          history.pushState(false, false, '#'+targetId);
          self.resetTarget(target, targetTabIndex);
        }, scrollElementY);
      });
    };
  
    SmoothScroll.prototype.scrollHorizontally = function(target, delta) {
      var scrollEl = this.dataElementX ? this.scrollElementX : false;
      var windowScrollLeft = this.scrollElementX ? this.scrollElementX.scrollLeft : document.documentElement.scrollLeft;
      var final = target.getBoundingClientRect().left + windowScrollLeft - delta,
        duration = this.scrollDuration;
  
      var element = scrollEl || window;
      var start = element.scrollLeft || document.documentElement.scrollLeft,
        currentTime = null;
  
      if(!scrollEl) start = window.scrollX || document.documentElement.scrollLeft;
      // return if there's no need to scroll
      if(Math.abs(start - final) < 5) return;
          
      var animateScroll = function(timestamp){
        if (!currentTime) currentTime = timestamp;        
        var progress = timestamp - currentTime;
        if(progress > duration) progress = duration;
        var val = Math.easeInOutQuad(progress, start, final-start, duration);
        element.scrollTo({
          left: val,
        });
        if(progress < duration) {
          window.requestAnimationFrame(animateScroll);
        }
      };
  
      window.requestAnimationFrame(animateScroll);
    };
  
    SmoothScroll.prototype.resetTarget = function(target, tabindex) {
      if( parseInt(target.getAttribute('tabindex')) < 0) {
        target.style.outline = 'none';
        !tabindex && target.removeAttribute('tabindex');
      }	
    };
  
    SmoothScroll.prototype.getFixedElementHeight = function() {
      var scrollElementY = this.dataElementY ? this.scrollElementY : document.documentElement;
      var fixedElementDelta = parseInt(getComputedStyle(scrollElementY).getPropertyValue('scroll-padding'));
      if(isNaN(fixedElementDelta) ) { // scroll-padding not supported
        fixedElementDelta = 0;
        var fixedElement = document.querySelector(this.element.getAttribute('data-fixed-element'));
        if(fixedElement) fixedElementDelta = parseInt(fixedElement.getBoundingClientRect().height);
      }
      return fixedElementDelta;
    };
    
    //initialize the Smooth Scroll objects
    var smoothScrollLinks = document.getElementsByClassName('js-smooth-scroll');
    if( smoothScrollLinks.length > 0 && !Util.cssSupports('scroll-behavior', 'smooth') && window.requestAnimationFrame) {
      // you need javascript only if css scroll-behavior is not supported
      for( var i = 0; i < smoothScrollLinks.length; i++) {
        (function(i){new SmoothScroll(smoothScrollLinks[i]);})(i);
      }
    }
  }());
// File#: _1_sticky-banner
// Usage: codyhouse.co/license
(function() {
    var StickyBanner = function(element) {
      this.element = element;
      this.offsetIn = 0;
      this.offsetOut = 0;
      this.targetIn = this.element.getAttribute('data-target-in') ? document.querySelector(this.element.getAttribute('data-target-in')) : false;
      this.targetOut = this.element.getAttribute('data-target-out') ? document.querySelector(this.element.getAttribute('data-target-out')) : false;
      this.reset = 0;
      getBannerOffsets(this);
      initBanner(this);
    };
  
    function getBannerOffsets(element) { // get offset in and offset out values
      // update offsetIn
      element.offsetIn = 0;
      if(element.targetIn) {
        var boundingClientRect = element.targetIn.getBoundingClientRect();
        element.offsetIn = boundingClientRect.top + document.documentElement.scrollTop + boundingClientRect.height;
      }
      var dataOffsetIn = element.element.getAttribute('data-offset-in');
      if(dataOffsetIn) {
        element.offsetIn = element.offsetIn + parseInt(dataOffsetIn);
      }
      // update offsetOut
      element.offsetOut = 0;
      if(element.targetOut) {
        var boundingClientRect = element.targetOut.getBoundingClientRect();
        element.offsetOut = boundingClientRect.top + document.documentElement.scrollTop - window.innerHeight;
      }
      var dataOffsetOut = element.element.getAttribute('data-offset-out');
      if(dataOffsetOut) {
        element.offsetOut = element.offsetOut + parseInt(dataOffsetOut);
      }
    };
  
    function initBanner(element) {
      resetBannerVisibility(element);
  
      element.element.addEventListener('resize-banner', function(){
        getBannerOffsets(element);
        resetBannerVisibility(element);
      });
  
      element.element.addEventListener('scroll-banner', function(){
        if(element.reset < 10) {
          getBannerOffsets(element);
          element.reset = element.reset + 1;
        }
        resetBannerVisibility(element);
      });
    };
  
    function resetBannerVisibility(element) {
      var scrollTop = document.documentElement.scrollTop,
        topTarget = false,
        bottomTarget = false;
      if(element.offsetIn < scrollTop) {
        topTarget = true;
      }
      if(element.offsetOut == 0 || scrollTop < element.offsetOut) {
        bottomTarget = true;
      }
      Util.toggleClass(element.element, 'sticky-banner--visible', bottomTarget && topTarget);
    };
  
    //initialize the Sticky Banner objects
    var stckyBanner = document.getElementsByClassName('js-sticky-banner');
    if( stckyBanner.length > 0 ) {
      for( var i = 0; i < stckyBanner.length; i++) {
        (function(i){new StickyBanner(stckyBanner[i]);})(i);
      }
      
      // init scroll/resize
      var resizingId = false,
        scrollingId = false,
        resizeEvent = new CustomEvent('resize-banner'),
        scrollEvent = new CustomEvent('scroll-banner');
      
      window.addEventListener('resize', function(event){
        clearTimeout(resizingId);
        resizingId = setTimeout(function(){
          doneResizing(resizeEvent);
        }, 300);
      });
  
      window.addEventListener('scroll', function(event){
        if(scrollingId) return;
        scrollingId = true;
        window.requestAnimationFrame 
          ? window.requestAnimationFrame(function(){
            doneResizing(scrollEvent);
            scrollingId = false;
          })
          : setTimeout(function(){
            doneResizing(scrollEvent);
            scrollingId = false;
          }, 200);
  
        resizingId = setTimeout(function(){
          doneResizing(resizeEvent);
        }, 300);
      });
  
      function doneResizing(event) {
        for( var i = 0; i < stckyBanner.length; i++) {
          (function(i){stckyBanner[i].dispatchEvent(event)})(i);
        };
      };
    }
  }());
// File#: _1_swipe-content
(function() {
    var SwipeContent = function(element) {
      this.element = element;
      this.delta = [false, false];
      this.dragging = false;
      this.intervalId = false;
      initSwipeContent(this);
    };
  
    function initSwipeContent(content) {
      content.element.addEventListener('mousedown', handleEvent.bind(content));
      content.element.addEventListener('touchstart', handleEvent.bind(content));
    };
  
    function initDragging(content) {
      //add event listeners
      content.element.addEventListener('mousemove', handleEvent.bind(content));
      content.element.addEventListener('touchmove', handleEvent.bind(content));
      content.element.addEventListener('mouseup', handleEvent.bind(content));
      content.element.addEventListener('mouseleave', handleEvent.bind(content));
      content.element.addEventListener('touchend', handleEvent.bind(content));
    };
  
    function cancelDragging(content) {
      //remove event listeners
      if(content.intervalId) {
        (!window.requestAnimationFrame) ? clearInterval(content.intervalId) : window.cancelAnimationFrame(content.intervalId);
        content.intervalId = false;
      }
      content.element.removeEventListener('mousemove', handleEvent.bind(content));
      content.element.removeEventListener('touchmove', handleEvent.bind(content));
      content.element.removeEventListener('mouseup', handleEvent.bind(content));
      content.element.removeEventListener('mouseleave', handleEvent.bind(content));
      content.element.removeEventListener('touchend', handleEvent.bind(content));
    };
  
    function handleEvent(event) {
      switch(event.type) {
        case 'mousedown':
        case 'touchstart':
          startDrag(this, event);
          break;
        case 'mousemove':
        case 'touchmove':
          drag(this, event);
          break;
        case 'mouseup':
        case 'mouseleave':
        case 'touchend':
          endDrag(this, event);
          break;
      }
    };
  
    function startDrag(content, event) {
      content.dragging = true;
      // listen to drag movements
      initDragging(content);
      content.delta = [parseInt(unify(event).clientX), parseInt(unify(event).clientY)];
      // emit drag start event
      emitSwipeEvents(content, 'dragStart', content.delta, event.target);
    };
  
    function endDrag(content, event) {
      cancelDragging(content);
      // credits: https://css-tricks.com/simple-swipe-with-vanilla-javascript/
      var dx = parseInt(unify(event).clientX), 
        dy = parseInt(unify(event).clientY);
      
      // check if there was a left/right swipe
      if(content.delta && (content.delta[0] || content.delta[0] === 0)) {
        var s = getSign(dx - content.delta[0]);
        
        if(Math.abs(dx - content.delta[0]) > 30) {
          (s < 0) ? emitSwipeEvents(content, 'swipeLeft', [dx, dy]) : emitSwipeEvents(content, 'swipeRight', [dx, dy]);	
        }
        
        content.delta[0] = false;
      }
      // check if there was a top/bottom swipe
      if(content.delta && (content.delta[1] || content.delta[1] === 0)) {
          var y = getSign(dy - content.delta[1]);
  
          if(Math.abs(dy - content.delta[1]) > 30) {
            (y < 0) ? emitSwipeEvents(content, 'swipeUp', [dx, dy]) : emitSwipeEvents(content, 'swipeDown', [dx, dy]);
        }
  
        content.delta[1] = false;
      }
      // emit drag end event
      emitSwipeEvents(content, 'dragEnd', [dx, dy]);
      content.dragging = false;
    };
  
    function drag(content, event) {
      if(!content.dragging) return;
      // emit dragging event with coordinates
      (!window.requestAnimationFrame) 
        ? content.intervalId = setTimeout(function(){emitDrag.bind(content, event);}, 250) 
        : content.intervalId = window.requestAnimationFrame(emitDrag.bind(content, event));
    };
  
    function emitDrag(event) {
      emitSwipeEvents(this, 'dragging', [parseInt(unify(event).clientX), parseInt(unify(event).clientY)]);
    };
  
    function unify(event) { 
      // unify mouse and touch events
      return event.changedTouches ? event.changedTouches[0] : event; 
    };
  
    function emitSwipeEvents(content, eventName, detail, el) {
      var trigger = false;
      if(el) trigger = el;
      // emit event with coordinates
      var event = new CustomEvent(eventName, {detail: {x: detail[0], y: detail[1], origin: trigger}});
      content.element.dispatchEvent(event);
    };
  
    function getSign(x) {
      if(!Math.sign) {
        return ((x > 0) - (x < 0)) || +x;
      } else {
        return Math.sign(x);
      }
    };
  
    window.SwipeContent = SwipeContent;
    
    //initialize the SwipeContent objects
    var swipe = document.getElementsByClassName('js-swipe-content');
    if( swipe.length > 0 ) {
      for( var i = 0; i < swipe.length; i++) {
        (function(i){new SwipeContent(swipe[i]);})(i);
      }
    }
  }());
// File#: _2_carousel
// Usage: codyhouse.co/license
(function() {
    var Carousel = function(opts) {
      this.options = Util.extend(Carousel.defaults , opts);
      this.element = this.options.element;
      this.listWrapper = this.element.getElementsByClassName('carousel__wrapper')[0];
      this.list = this.element.getElementsByClassName('carousel__list')[0];
      this.items = this.element.getElementsByClassName('carousel__item');
      this.initItems = []; // store only the original elements - will need this for cloning
      this.itemsNb = this.items.length; //original number of items
      this.visibItemsNb = 1; // tot number of visible items
      this.itemsWidth = 1; // this will be updated with the right width of items
      this.itemOriginalWidth = false; // store the initial width to use it on resize
      this.selectedItem = 0; // index of first visible item 
      this.translateContainer = 0; // this will be the amount the container has to be translated each time a new group has to be shown (negative)
      this.containerWidth = 0; // this will be used to store the total width of the carousel (including the overflowing part)
      this.ariaLive = false;
      // navigation
      this.controls = this.element.getElementsByClassName('js-carousel__control');
      this.animating = false;
      // autoplay
      this.autoplayId = false;
      this.autoplayPaused = false;
      //drag
      this.dragStart = false;
      // resize
      this.resizeId = false;
      // used to re-initialize js
      this.cloneList = [];
      // store items min-width
      this.itemAutoSize = false;
      // store translate value (loop = off)
      this.totTranslate = 0;
      // modify loop option if navigation is on
      if(this.options.nav) this.options.loop = false;
      // store counter elements (if present)
      this.counter = this.element.getElementsByClassName('js-carousel__counter');
      this.counterTor = this.element.getElementsByClassName('js-carousel__counter-tot');
      initCarouselLayout(this); // get number visible items + width items
      setItemsWidth(this, true); 
      insertBefore(this, this.visibItemsNb); // insert clones before visible elements
      updateCarouselClones(this); // insert clones after visible elements
      resetItemsTabIndex(this); // make sure not visible items are not focusable
      initAriaLive(this); // set aria-live region for SR
      initCarouselEvents(this); // listen to events
      initCarouselCounter(this);
      Util.addClass(this.element, 'carousel--loaded');
    };
    
    //public carousel functions
    Carousel.prototype.showNext = function() {
      showNextItems(this);
    };
  
    Carousel.prototype.showPrev = function() {
      showPrevItems(this);
    };
  
    Carousel.prototype.startAutoplay = function() {
      startAutoplay(this);
    };
  
    Carousel.prototype.pauseAutoplay = function() {
      pauseAutoplay(this);
    };
    
    //private carousel functions
    function initCarouselLayout(carousel) {
      // evaluate size of single elements + number of visible elements
      var itemStyle = window.getComputedStyle(carousel.items[0]),
        containerStyle = window.getComputedStyle(carousel.listWrapper),
        itemWidth = parseFloat(itemStyle.getPropertyValue('width')),
        itemMargin = parseFloat(itemStyle.getPropertyValue('margin-right')),
        containerPadding = parseFloat(containerStyle.getPropertyValue('padding-left')),
        containerWidth = parseFloat(containerStyle.getPropertyValue('width'));
  
      if(!carousel.itemAutoSize) {
        carousel.itemAutoSize = itemWidth;
      }
  
      // if carousel.listWrapper is hidden -> make sure to retrieve the proper width
      containerWidth = getCarouselWidth(carousel, containerWidth);
  
      if( !carousel.itemOriginalWidth) { // on resize -> use initial width of items to recalculate 
        carousel.itemOriginalWidth = itemWidth;
      } else {
        itemWidth = carousel.itemOriginalWidth;
      }
  
      if(carousel.itemAutoSize) {
        carousel.itemOriginalWidth = parseInt(carousel.itemAutoSize);
        itemWidth = carousel.itemOriginalWidth;
      }
      // make sure itemWidth is smaller than container width
      if(containerWidth < itemWidth) {
        carousel.itemOriginalWidth = containerWidth
        itemWidth = carousel.itemOriginalWidth;
      }
      // get proper width of elements
      carousel.visibItemsNb = parseInt((containerWidth - 2*containerPadding + itemMargin)/(itemWidth+itemMargin));
      carousel.itemsWidth = parseFloat( (((containerWidth - 2*containerPadding + itemMargin)/carousel.visibItemsNb) - itemMargin).toFixed(1));
      carousel.containerWidth = (carousel.itemsWidth+itemMargin)* carousel.items.length;
      carousel.translateContainer = 0 - ((carousel.itemsWidth+itemMargin)* carousel.visibItemsNb);
      // flexbox fallback
      if(!flexSupported) carousel.list.style.width = (carousel.itemsWidth + itemMargin)*carousel.visibItemsNb*3+'px';
      
      // this is used when loop == off
      carousel.totTranslate = 0 - carousel.selectedItem*(carousel.itemsWidth+itemMargin);
      if(carousel.items.length <= carousel.visibItemsNb) carousel.totTranslate = 0;
  
      centerItems(carousel); // center items if carousel.items.length < visibItemsNb
      alignControls(carousel); // check if controls need to be aligned to a different element
    };
  
    function setItemsWidth(carousel, bool) {
      for(var i = 0; i < carousel.items.length; i++) {
        carousel.items[i].style.width = carousel.itemsWidth+"px";
        if(bool) carousel.initItems.push(carousel.items[i]);
      }
    };
  
    function updateCarouselClones(carousel) { 
      if(!carousel.options.loop) return;
      // take care of clones after visible items (needs to run after the update of clones before visible items)
      if(carousel.items.length < carousel.visibItemsNb*3) {
        insertAfter(carousel, carousel.visibItemsNb*3 - carousel.items.length, carousel.items.length - carousel.visibItemsNb*2);
      } else if(carousel.items.length > carousel.visibItemsNb*3 ) {
        removeClones(carousel, carousel.visibItemsNb*3, carousel.items.length - carousel.visibItemsNb*3);
      }
      // set proper translate value for the container
      setTranslate(carousel, 'translateX('+carousel.translateContainer+'px)');
    };
  
    function initCarouselEvents(carousel) {
      // listen for click on previous/next arrow
      // dots navigation
      if(carousel.options.nav) {
        carouselCreateNavigation(carousel);
        carouselInitNavigationEvents(carousel);
      }
  
      if(carousel.controls.length > 0) {
        carousel.controls[0].addEventListener('click', function(event){
          event.preventDefault();
          showPrevItems(carousel);
          updateAriaLive(carousel);
        });
        carousel.controls[1].addEventListener('click', function(event){
          event.preventDefault();
          showNextItems(carousel);
          updateAriaLive(carousel);
        });
  
        // update arrow visility -> loop == off only
        resetCarouselControls(carousel);
        // emit custom event - items visible
        emitCarouselActiveItemsEvent(carousel)
      }
      // autoplay
      if(carousel.options.autoplay) {
        startAutoplay(carousel);
        // pause autoplay if user is interacting with the carousel
        carousel.element.addEventListener('mouseenter', function(event){
          pauseAutoplay(carousel);
          carousel.autoplayPaused = true;
        });
        carousel.element.addEventListener('focusin', function(event){
          pauseAutoplay(carousel);
          carousel.autoplayPaused = true;
        });
        carousel.element.addEventListener('mouseleave', function(event){
          carousel.autoplayPaused = false;
          startAutoplay(carousel);
        });
        carousel.element.addEventListener('focusout', function(event){
          carousel.autoplayPaused = false;
          startAutoplay(carousel);
        });
      }
      // drag events
      if(carousel.options.drag && window.requestAnimationFrame) {
        //init dragging
        new SwipeContent(carousel.element);
        carousel.element.addEventListener('dragStart', function(event){
          if(event.detail.origin && event.detail.origin.closest('.js-carousel__control')) return;
          if(event.detail.origin && event.detail.origin.closest('.js-carousel__navigation')) return;
          if(event.detail.origin && !event.detail.origin.closest('.carousel__wrapper')) return;
          Util.addClass(carousel.element, 'carousel--is-dragging');
          pauseAutoplay(carousel);
          carousel.dragStart = event.detail.x;
          animateDragEnd(carousel);
        });
        carousel.element.addEventListener('dragging', function(event){
          if(!carousel.dragStart) return;
          if(carousel.animating || Math.abs(event.detail.x - carousel.dragStart) < 10) return;
          var translate = event.detail.x - carousel.dragStart + carousel.translateContainer;
          if(!carousel.options.loop) {
            translate = event.detail.x - carousel.dragStart + carousel.totTranslate; 
          }
          setTranslate(carousel, 'translateX('+translate+'px)');
        });
      }
      // reset on resize
      window.addEventListener('resize', function(event){
        pauseAutoplay(carousel);
        clearTimeout(carousel.resizeId);
        carousel.resizeId = setTimeout(function(){
          resetCarouselResize(carousel);
          // reset dots navigation
          resetDotsNavigation(carousel);
          resetCarouselControls(carousel);
          setCounterItem(carousel);
          startAutoplay(carousel);
          centerItems(carousel); // center items if carousel.items.length < visibItemsNb
          alignControls(carousel);
          // emit custom event - items visible
          emitCarouselActiveItemsEvent(carousel)
        }, 250)
      });
    };
  
    function showPrevItems(carousel) {
      if(carousel.animating) return;
      carousel.animating = true;
      carousel.selectedItem = getIndex(carousel, carousel.selectedItem - carousel.visibItemsNb);
      animateList(carousel, '0', 'prev');
    };
  
    function showNextItems(carousel) {
      if(carousel.animating) return;
      carousel.animating = true;
      carousel.selectedItem = getIndex(carousel, carousel.selectedItem + carousel.visibItemsNb);
      animateList(carousel, carousel.translateContainer*2+'px', 'next');
    };
  
    function animateDragEnd(carousel) { // end-of-dragging animation
      carousel.element.addEventListener('dragEnd', function cb(event){
        carousel.element.removeEventListener('dragEnd', cb);
        Util.removeClass(carousel.element, 'carousel--is-dragging');
        if(event.detail.x - carousel.dragStart < -40) {
          carousel.animating = false;
          showNextItems(carousel);
        } else if(event.detail.x - carousel.dragStart > 40) {
          carousel.animating = false;
          showPrevItems(carousel);
        } else if(event.detail.x - carousel.dragStart == 0) { // this is just a click -> no dragging
          return;
        } else { // not dragged enought -> do not update carousel, just reset
          carousel.animating = true;
          animateList(carousel, carousel.translateContainer+'px', false);
        }
        carousel.dragStart = false;
      });
    };
  
    function animateList(carousel, translate, direction) { // takes care of changing visible items
      pauseAutoplay(carousel);
      Util.addClass(carousel.list, 'carousel__list--animating');
      var initTranslate = carousel.totTranslate;
      if(!carousel.options.loop) {
        translate = noLoopTranslateValue(carousel, direction);
      }
      setTimeout(function() {setTranslate(carousel, 'translateX('+translate+')');});
      if(transitionSupported) {
        carousel.list.addEventListener('transitionend', function cb(event){
          if(event.propertyName && event.propertyName != 'transform') return;
          Util.removeClass(carousel.list, 'carousel__list--animating');
          carousel.list.removeEventListener('transitionend', cb);
          animateListCb(carousel, direction);
        });
      } else {
        animateListCb(carousel, direction);
      }
      if(!carousel.options.loop && (initTranslate == carousel.totTranslate)) {
        // translate value was not updated -> trigger transitionend event to restart carousel
        carousel.list.dispatchEvent(new CustomEvent('transitionend'));
      }
      resetCarouselControls(carousel);
      setCounterItem(carousel);
      // emit custom event - items visible
      emitCarouselActiveItemsEvent(carousel)
    };
  
    function noLoopTranslateValue(carousel, direction) {
      var translate = carousel.totTranslate;
      if(direction == 'next') {
        translate = carousel.totTranslate + carousel.translateContainer;
      } else if(direction == 'prev') {
        translate = carousel.totTranslate - carousel.translateContainer;
      } else if(direction == 'click') {
        translate = carousel.selectedDotIndex*carousel.translateContainer;
      }
      if(translate > 0)  {
        translate = 0;
        carousel.selectedItem = 0;
      }
      if(translate < - carousel.translateContainer - carousel.containerWidth) {
        translate = - carousel.translateContainer - carousel.containerWidth;
        carousel.selectedItem = carousel.items.length - carousel.visibItemsNb;
      }
      if(carousel.visibItemsNb > carousel.items.length) translate = 0;
      carousel.totTranslate = translate;
      return translate + 'px';
    };
  
    function animateListCb(carousel, direction) { // reset actions after carousel has been updated
      if(direction) updateClones(carousel, direction);
      carousel.animating = false;
      // reset autoplay
      startAutoplay(carousel);
      // reset tab index
      resetItemsTabIndex(carousel);
    };
  
    function updateClones(carousel, direction) {
      if(!carousel.options.loop) return;
      // at the end of each animation, we need to update the clones before and after the visible items
      var index = (direction == 'next') ? 0 : carousel.items.length - carousel.visibItemsNb;
      // remove clones you do not need anymore
      removeClones(carousel, index, false);
      // add new clones 
      (direction == 'next') ? insertAfter(carousel, carousel.visibItemsNb, 0) : insertBefore(carousel, carousel.visibItemsNb);
      //reset transform
      setTranslate(carousel, 'translateX('+carousel.translateContainer+'px)');
    };
  
    function insertBefore(carousel, nb, delta) {
      if(!carousel.options.loop) return;
      var clones = document.createDocumentFragment();
      var start = 0;
      if(delta) start = delta;
      for(var i = start; i < nb; i++) {
        var index = getIndex(carousel, carousel.selectedItem - i - 1),
          clone = carousel.initItems[index].cloneNode(true);
        Util.addClass(clone, 'js-clone');
        clones.insertBefore(clone, clones.firstChild);
      }
      carousel.list.insertBefore(clones, carousel.list.firstChild);
      emitCarouselUpdateEvent(carousel);
    };
  
    function insertAfter(carousel, nb, init) {
      if(!carousel.options.loop) return;
      var clones = document.createDocumentFragment();
      for(var i = init; i < nb + init; i++) {
        var index = getIndex(carousel, carousel.selectedItem + carousel.visibItemsNb + i),
          clone = carousel.initItems[index].cloneNode(true);
        Util.addClass(clone, 'js-clone');
        clones.appendChild(clone);
      }
      carousel.list.appendChild(clones);
      emitCarouselUpdateEvent(carousel);
    };
  
    function removeClones(carousel, index, bool) {
      if(!carousel.options.loop) return;
      if( !bool) {
        bool = carousel.visibItemsNb;
      }
      for(var i = 0; i < bool; i++) {
        if(carousel.items[index]) carousel.list.removeChild(carousel.items[index]);
      }
    };
  
    function resetCarouselResize(carousel) { // reset carousel on resize
      var visibleItems = carousel.visibItemsNb;
      // get new items min-width value
      resetItemAutoSize(carousel);
      initCarouselLayout(carousel); 
      setItemsWidth(carousel, false);
      resetItemsWidth(carousel); // update the array of original items -> array used to create clones
      if(carousel.options.loop) {
        if(visibleItems > carousel.visibItemsNb) {
          removeClones(carousel, 0, visibleItems - carousel.visibItemsNb);
        } else if(visibleItems < carousel.visibItemsNb) {
          insertBefore(carousel, carousel.visibItemsNb, visibleItems);
        }
        updateCarouselClones(carousel); // this will take care of translate + after elements
      } else {
        // reset default translate to a multiple value of (itemWidth + margin)
        var translate = noLoopTranslateValue(carousel);
        setTranslate(carousel, 'translateX('+translate+')');
      }
      resetItemsTabIndex(carousel); // reset focusable elements
    };
  
    function resetItemAutoSize(carousel) {
      if(!cssPropertiesSupported) return;
      // remove inline style
      carousel.items[0].removeAttribute('style');
      // get original item width 
      carousel.itemAutoSize = getComputedStyle(carousel.items[0]).getPropertyValue('width');
    };
  
    function resetItemsWidth(carousel) {
      for(var i = 0; i < carousel.initItems.length; i++) {
        carousel.initItems[i].style.width = carousel.itemsWidth+"px";
      }
    };
  
    function resetItemsTabIndex(carousel) {
      var carouselActive = carousel.items.length > carousel.visibItemsNb;
      var j = carousel.items.length;
      for(var i = 0; i < carousel.items.length; i++) {
        if(carousel.options.loop) {
          if(i < carousel.visibItemsNb || i >= 2*carousel.visibItemsNb ) {
            carousel.items[i].setAttribute('tabindex', '-1');
          } else {
            if(i < j) j = i;
            carousel.items[i].removeAttribute('tabindex');
          }
        } else {
          if( (i < carousel.selectedItem || i >= carousel.selectedItem + carousel.visibItemsNb) && carouselActive) {
            carousel.items[i].setAttribute('tabindex', '-1');
          } else {
            if(i < j) j = i;
            carousel.items[i].removeAttribute('tabindex');
          }
        }
      }
      resetVisibilityOverflowItems(carousel, j);
    };
  
    function startAutoplay(carousel) {
      if(carousel.options.autoplay && !carousel.autoplayId && !carousel.autoplayPaused) {
        carousel.autoplayId = setInterval(function(){
          showNextItems(carousel);
        }, carousel.options.autoplayInterval);
      }
    };
  
    function pauseAutoplay(carousel) {
      if(carousel.options.autoplay) {
        clearInterval(carousel.autoplayId);
        carousel.autoplayId = false;
      }
    };
  
    function initAriaLive(carousel) { // create an aria-live region for SR
      if(!carousel.options.ariaLive) return;
      // create an element that will be used to announce the new visible slide to SR
      var srLiveArea = document.createElement('div');
      Util.setAttributes(srLiveArea, {'class': 'sr-only js-carousel__aria-live', 'aria-live': 'polite', 'aria-atomic': 'true'});
      carousel.element.appendChild(srLiveArea);
      carousel.ariaLive = srLiveArea;
    };
  
    function updateAriaLive(carousel) { // announce to SR which items are now visible
      if(!carousel.options.ariaLive) return;
      carousel.ariaLive.innerHTML = 'Item '+(carousel.selectedItem + 1)+' selected. '+carousel.visibItemsNb+' items of '+carousel.initItems.length+' visible';
    };
  
    function getIndex(carousel, index) {
      if(index < 0) index = getPositiveValue(index, carousel.itemsNb);
      if(index >= carousel.itemsNb) index = index % carousel.itemsNb;
      return index;
    };
  
    function getPositiveValue(value, add) {
      value = value + add;
      if(value > 0) return value;
      else return getPositiveValue(value, add);
    };
  
    function setTranslate(carousel, translate) {
      carousel.list.style.transform = translate;
      carousel.list.style.msTransform = translate;
    };
  
    function getCarouselWidth(carousel, computedWidth) { // retrieve carousel width if carousel is initially hidden
      var closestHidden = carousel.listWrapper.closest('.sr-only');
      if(closestHidden) { // carousel is inside an .sr-only (visually hidden) element
        Util.removeClass(closestHidden, 'sr-only');
        computedWidth = carousel.listWrapper.offsetWidth;
        Util.addClass(closestHidden, 'sr-only');
      } else if(isNaN(computedWidth)){
        computedWidth = getHiddenParentWidth(carousel.element, carousel);
      }
      return computedWidth;
    };
  
    function getHiddenParentWidth(element, carousel) {
      var parent = element.parentElement;
      if(parent.tagName.toLowerCase() == 'html') return 0;
      var style = window.getComputedStyle(parent);
      if(style.display == 'none' || style.visibility == 'hidden') {
        parent.setAttribute('style', 'display: block!important; visibility: visible!important;');
        var computedWidth = carousel.listWrapper.offsetWidth;
        parent.style.display = '';
        parent.style.visibility = '';
        return computedWidth;
      } else {
        return getHiddenParentWidth(parent, carousel);
      }
    };
  
    function resetCarouselControls(carousel) {
      if(carousel.options.loop) return;
      // update arrows status
      if(carousel.controls.length > 0) {
        (carousel.totTranslate == 0) 
          ? carousel.controls[0].setAttribute('disabled', true) 
          : carousel.controls[0].removeAttribute('disabled');
        (carousel.totTranslate == (- carousel.translateContainer - carousel.containerWidth) || carousel.items.length <= carousel.visibItemsNb) 
          ? carousel.controls[1].setAttribute('disabled', true) 
          : carousel.controls[1].removeAttribute('disabled');
      }
      // update carousel dots
      if(carousel.options.nav) {
        var selectedDot = carousel.navigation.getElementsByClassName(carousel.options.navigationItemClass+'--selected');
        if(selectedDot.length > 0) Util.removeClass(selectedDot[0], carousel.options.navigationItemClass+'--selected');
  
        var newSelectedIndex = getSelectedDot(carousel);
        if(carousel.totTranslate == (- carousel.translateContainer - carousel.containerWidth)) {
          newSelectedIndex = carousel.navDots.length - 1;
        }
        Util.addClass(carousel.navDots[newSelectedIndex], carousel.options.navigationItemClass+'--selected');
      }
  
      (carousel.totTranslate == 0 && (carousel.totTranslate == (- carousel.translateContainer - carousel.containerWidth) || carousel.items.length <= carousel.visibItemsNb))
          ? Util.addClass(carousel.element, 'carousel--hide-controls')
          : Util.removeClass(carousel.element, 'carousel--hide-controls');
    };
  
    function emitCarouselUpdateEvent(carousel) {
      carousel.cloneList = [];
      var clones = carousel.element.querySelectorAll('.js-clone');
      for(var i = 0; i < clones.length; i++) {
        Util.removeClass(clones[i], 'js-clone');
        carousel.cloneList.push(clones[i]);
      }
      emitCarouselEvents(carousel, 'carousel-updated', carousel.cloneList);
    };
  
    function carouselCreateNavigation(carousel) {
      if(carousel.element.getElementsByClassName('js-carousel__navigation').length > 0) return;
    
      var navigation = document.createElement('ol'),
        navChildren = '';
  
      var navClasses = carousel.options.navigationClass+' js-carousel__navigation';
      if(carousel.items.length <= carousel.visibItemsNb) {
        navClasses = navClasses + ' is-hidden';
      }
      navigation.setAttribute('class', navClasses);
  
      var dotsNr = Math.ceil(carousel.items.length/carousel.visibItemsNb),
        selectedDot = getSelectedDot(carousel),
        indexClass = carousel.options.navigationPagination ? '' : 'sr-only'
      for(var i = 0; i < dotsNr; i++) {
        var className = (i == selectedDot) ? 'class="'+carousel.options.navigationItemClass+' '+carousel.options.navigationItemClass+'--selected js-carousel__nav-item"' :  'class="'+carousel.options.navigationItemClass+' js-carousel__nav-item"';
        navChildren = navChildren + '<li '+className+'><button class="reset js-tab-focus" style="outline: none;"><span class="'+indexClass+'">'+ (i+1) + '</span></button></li>';
      }
      navigation.innerHTML = navChildren;
      carousel.element.appendChild(navigation);
    };
  
    function carouselInitNavigationEvents(carousel) {
      carousel.navigation = carousel.element.getElementsByClassName('js-carousel__navigation')[0];
      carousel.navDots = carousel.element.getElementsByClassName('js-carousel__nav-item');
      carousel.navIdEvent = carouselNavigationClick.bind(carousel);
      carousel.navigation.addEventListener('click', carousel.navIdEvent);
    };
  
    function carouselRemoveNavigation(carousel) {
      if(carousel.navigation) carousel.element.removeChild(carousel.navigation);
      if(carousel.navIdEvent) carousel.navigation.removeEventListener('click', carousel.navIdEvent);
    };
  
    function resetDotsNavigation(carousel) {
      if(!carousel.options.nav) return;
      carouselRemoveNavigation(carousel);
      carouselCreateNavigation(carousel);
      carouselInitNavigationEvents(carousel);
    };
  
    function carouselNavigationClick(event) {
      var dot = event.target.closest('.js-carousel__nav-item');
      if(!dot) return;
      if(this.animating) return;
      this.animating = true;
      var index = Util.getIndexInArray(this.navDots, dot);
      this.selectedDotIndex = index;
      this.selectedItem = index*this.visibItemsNb;
      animateList(this, false, 'click');
    };
  
    function getSelectedDot(carousel) {
      return Math.ceil(carousel.selectedItem/carousel.visibItemsNb);
    };
  
    function initCarouselCounter(carousel) {
      if(carousel.counterTor.length > 0) carousel.counterTor[0].textContent = carousel.itemsNb;
      setCounterItem(carousel);
    };
  
    function setCounterItem(carousel) {
      if(carousel.counter.length == 0) return;
      var totalItems = carousel.selectedItem + carousel.visibItemsNb;
      if(totalItems > carousel.items.length) totalItems = carousel.items.length;
      carousel.counter[0].textContent = totalItems;
    };
  
    function centerItems(carousel) {
      if(!carousel.options.justifyContent) return;
      Util.toggleClass(carousel.list, 'justify-center', carousel.items.length < carousel.visibItemsNb);
    };
  
    function alignControls(carousel) {
      if(carousel.controls.length < 1 || !carousel.options.alignControls) return;
      if(!carousel.controlsAlignEl) {
        carousel.controlsAlignEl = carousel.element.querySelector(carousel.options.alignControls);
      }
      if(!carousel.controlsAlignEl) return;
      var translate = (carousel.element.offsetHeight - carousel.controlsAlignEl.offsetHeight);
      for(var i = 0; i < carousel.controls.length; i++) {
        carousel.controls[i].style.marginBottom = translate + 'px';
      }
    };
  
    function emitCarouselActiveItemsEvent(carousel) {
      emitCarouselEvents(carousel, 'carousel-active-items', {firstSelectedItem: carousel.selectedItem, visibleItemsNb: carousel.visibItemsNb});
    };
  
    function emitCarouselEvents(carousel, eventName, eventDetail) {
      var event = new CustomEvent(eventName, {detail: eventDetail});
      carousel.element.dispatchEvent(event);
    };
  
    function resetVisibilityOverflowItems(carousel, j) {
      if(!carousel.options.overflowItems) return;
      var itemWidth = carousel.containerWidth/carousel.items.length,
        delta = (window.innerWidth - itemWidth*carousel.visibItemsNb)/2,
        overflowItems = Math.ceil(delta/itemWidth);
  
      for(var i = 0; i < overflowItems; i++) {
        var indexPrev = j - 1 - i; // prev element
        if(indexPrev >= 0 ) carousel.items[indexPrev].removeAttribute('tabindex');
        var indexNext = j + carousel.visibItemsNb + i; // next element
        if(indexNext < carousel.items.length) carousel.items[indexNext].removeAttribute('tabindex');
      }
    };
  
    Carousel.defaults = {
      element : '',
      autoplay : false,
      autoplayInterval: 5000,
      loop: true,
      nav: false,
      navigationItemClass: 'carousel__nav-item',
      navigationClass: 'carousel__navigation',
      navigationPagination: false,
      drag: false,
      justifyContent: false,
      alignControls: false,
      overflowItems: false
    };
  
    window.Carousel = Carousel;
  
    //initialize the Carousel objects
    var carousels = document.getElementsByClassName('js-carousel'),
      flexSupported = Util.cssSupports('align-items', 'stretch'),
      transitionSupported = Util.cssSupports('transition'),
      cssPropertiesSupported = ('CSS' in window && CSS.supports('color', 'var(--color-var)'));
  
    if( carousels.length > 0) {
      for( var i = 0; i < carousels.length; i++) {
        (function(i){
          var autoplay = (carousels[i].getAttribute('data-autoplay') && carousels[i].getAttribute('data-autoplay') == 'on') ? true : false,
            autoplayInterval = (carousels[i].getAttribute('data-autoplay-interval')) ? carousels[i].getAttribute('data-autoplay-interval') : 5000,
            drag = (carousels[i].getAttribute('data-drag') && carousels[i].getAttribute('data-drag') == 'on') ? true : false,
            loop = (carousels[i].getAttribute('data-loop') && carousels[i].getAttribute('data-loop') == 'off') ? false : true,
            nav = (carousels[i].getAttribute('data-navigation') && carousels[i].getAttribute('data-navigation') == 'on') ? true : false,
            navigationItemClass = carousels[i].getAttribute('data-navigation-item-class') ? carousels[i].getAttribute('data-navigation-item-class') : 'carousel__nav-item',
            navigationClass = carousels[i].getAttribute('data-navigation-class') ? carousels[i].getAttribute('data-navigation-class') : 'carousel__navigation',
            navigationPagination = (carousels[i].getAttribute('data-navigation-pagination') && carousels[i].getAttribute('data-navigation-pagination') == 'on') ? true : false,
            overflowItems = (carousels[i].getAttribute('data-overflow-items') && carousels[i].getAttribute('data-overflow-items') == 'on') ? true : false,
            alignControls = carousels[i].getAttribute('data-align-controls') ? carousels[i].getAttribute('data-align-controls') : false,
            justifyContent = (carousels[i].getAttribute('data-justify-content') && carousels[i].getAttribute('data-justify-content') == 'on') ? true : false;
          new Carousel({element: carousels[i], autoplay : autoplay, autoplayInterval : autoplayInterval, drag: drag, ariaLive: true, loop: loop, nav: nav, navigationItemClass: navigationItemClass, navigationPagination: navigationPagination, navigationClass: navigationClass, overflowItems: overflowItems, justifyContent: justifyContent, alignControls: alignControls});
        })(i);
      }
    };
  }());
// File#: _2_dropdown
// Usage: codyhouse.co/license
(function() {
    var Dropdown = function(element) {
      this.element = element;
      this.trigger = this.element.getElementsByClassName('js-dropdown__trigger')[0];
      this.dropdown = this.element.getElementsByClassName('js-dropdown__menu')[0];
      this.triggerFocus = false;
      this.dropdownFocus = false;
      this.hideInterval = false;
      // sublevels
      this.dropdownSubElements = this.element.getElementsByClassName('js-dropdown__sub-wrapper');
      this.prevFocus = false; // store element that was in focus before focus changed
      this.addDropdownEvents();
    };
    
    Dropdown.prototype.addDropdownEvents = function(){
      //place dropdown
      var self = this;
      this.placeElement();
      this.element.addEventListener('placeDropdown', function(event){
        self.placeElement();
      });
      // init dropdown
      this.initElementEvents(this.trigger, this.triggerFocus); // this is used to trigger the primary dropdown
      this.initElementEvents(this.dropdown, this.dropdownFocus); // this is used to trigger the primary dropdown
      // init sublevels
      this.initSublevels(); // if there are additional sublevels -> bind hover/focus events
    };
  
    Dropdown.prototype.placeElement = function() {
      // remove inline style first
      this.dropdown.removeAttribute('style');
      // check dropdown position
      var triggerPosition = this.trigger.getBoundingClientRect(),
        isRight = (window.innerWidth < triggerPosition.left + parseInt(getComputedStyle(this.dropdown).getPropertyValue('width')));
  
      var xPosition = isRight ? 'right: 0px; left: auto;' : 'left: 0px; right: auto;';
      this.dropdown.setAttribute('style', xPosition);
    };
  
    Dropdown.prototype.initElementEvents = function(element, bool) {
      var self = this;
      element.addEventListener('mouseenter', function(){
        bool = true;
        self.showDropdown();
      });
      element.addEventListener('focus', function(){
        self.showDropdown();
      });
      element.addEventListener('mouseleave', function(){
        bool = false;
        self.hideDropdown();
      });
      element.addEventListener('focusout', function(){
        self.hideDropdown();
      });
    };
  
    Dropdown.prototype.showDropdown = function(){
      if(this.hideInterval) clearInterval(this.hideInterval);
      // remove style attribute
      this.dropdown.removeAttribute('style');
      this.placeElement();
      this.showLevel(this.dropdown, true);
    };
  
    Dropdown.prototype.hideDropdown = function(){
      var self = this;
      if(this.hideInterval) clearInterval(this.hideInterval);
      this.hideInterval = setTimeout(function(){
        var dropDownFocus = document.activeElement.closest('.js-dropdown'),
          inFocus = dropDownFocus && (dropDownFocus == self.element);
        // if not in focus and not hover -> hide
        if(!self.triggerFocus && !self.dropdownFocus && !inFocus) {
          self.hideLevel(self.dropdown, true);
          // make sure to hide sub/dropdown
          self.hideSubLevels();
          self.prevFocus = false;
        }
      }, 300);
    };
  
    Dropdown.prototype.initSublevels = function(){
      var self = this;
      var dropdownMenu = this.element.getElementsByClassName('js-dropdown__menu');
      for(var i = 0; i < dropdownMenu.length; i++) {
        var listItems = dropdownMenu[i].children;
        // bind hover
        new menuAim({
          menu: dropdownMenu[i],
          activate: function(row) {
              var subList = row.getElementsByClassName('js-dropdown__menu')[0];
              if(!subList) return;
              Util.addClass(row.querySelector('a'), 'dropdown__item--hover');
              self.showLevel(subList);
          },
          deactivate: function(row) {
              var subList = row.getElementsByClassName('dropdown__menu')[0];
              if(!subList) return;
              Util.removeClass(row.querySelector('a'), 'dropdown__item--hover');
              self.hideLevel(subList);
          },
          submenuSelector: '.js-dropdown__sub-wrapper',
        });
      }
      // store focus element before change in focus
      this.element.addEventListener('keydown', function(event) { 
        if( event.keyCode && event.keyCode == 9 || event.key && event.key == 'Tab' ) {
          self.prevFocus = document.activeElement;
        }
      });
      // make sure that sublevel are visible when their items are in focus
      this.element.addEventListener('keyup', function(event) {
        if( event.keyCode && event.keyCode == 9 || event.key && event.key == 'Tab' ) {
          // focus has been moved -> make sure the proper classes are added to subnavigation
          var focusElement = document.activeElement,
            focusElementParent = focusElement.closest('.js-dropdown__menu'),
            focusElementSibling = focusElement.nextElementSibling;
  
          // if item in focus is inside submenu -> make sure it is visible
          if(focusElementParent && !Util.hasClass(focusElementParent, 'dropdown__menu--is-visible')) {
            self.showLevel(focusElementParent);
          }
          // if item in focus triggers a submenu -> make sure it is visible
          if(focusElementSibling && !Util.hasClass(focusElementSibling, 'dropdown__menu--is-visible')) {
            self.showLevel(focusElementSibling);
          }
  
          // check previous element in focus -> hide sublevel if required 
          if( !self.prevFocus) return;
          var prevFocusElementParent = self.prevFocus.closest('.js-dropdown__menu'),
            prevFocusElementSibling = self.prevFocus.nextElementSibling;
          
          if( !prevFocusElementParent ) return;
          
          // element in focus and element prev in focus are siblings
          if( focusElementParent && focusElementParent == prevFocusElementParent) {
            if(prevFocusElementSibling) self.hideLevel(prevFocusElementSibling);
            return;
          }
  
          // element in focus is inside submenu triggered by element prev in focus
          if( prevFocusElementSibling && focusElementParent && focusElementParent == prevFocusElementSibling) return;
          
          // shift tab -> element in focus triggers the submenu of the element prev in focus
          if( focusElementSibling && prevFocusElementParent && focusElementSibling == prevFocusElementParent) return;
          
          var focusElementParentParent = focusElementParent.parentNode.closest('.js-dropdown__menu');
          
          // shift tab -> element in focus is inside the dropdown triggered by a siblings of the element prev in focus
          if(focusElementParentParent && focusElementParentParent == prevFocusElementParent) {
            if(prevFocusElementSibling) self.hideLevel(prevFocusElementSibling);
            return;
          }
          
          if(prevFocusElementParent && Util.hasClass(prevFocusElementParent, 'dropdown__menu--is-visible')) {
            self.hideLevel(prevFocusElementParent);
          }
        }
      });
    };
  
    Dropdown.prototype.hideSubLevels = function(){
      var visibleSubLevels = this.dropdown.getElementsByClassName('dropdown__menu--is-visible');
      if(visibleSubLevels.length == 0) return;
      while (visibleSubLevels[0]) {
        this.hideLevel(visibleSubLevels[0]);
         }
         var hoveredItems = this.dropdown.getElementsByClassName('dropdown__item--hover');
         while (hoveredItems[0]) {
        Util.removeClass(hoveredItems[0], 'dropdown__item--hover');
         }
    };
  
    Dropdown.prototype.showLevel = function(level, bool){
      if(bool == undefined) {
        //check if the sublevel needs to be open to the left
        Util.removeClass(level, 'dropdown__menu--left');
        var boundingRect = level.getBoundingClientRect();
        if(window.innerWidth - boundingRect.right < 5 && boundingRect.left + window.scrollX > 2*boundingRect.width) Util.addClass(level, 'dropdown__menu--left');
      }
      Util.addClass(level, 'dropdown__menu--is-visible');
      Util.removeClass(level, 'dropdown__menu--is-hidden');
    };
  
    Dropdown.prototype.hideLevel = function(level, bool){
      if(!Util.hasClass(level, 'dropdown__menu--is-visible')) return;
      Util.removeClass(level, 'dropdown__menu--is-visible');
      Util.addClass(level, 'dropdown__menu--is-hidden');
      
      level.addEventListener('transitionend', function cb(event){
        if(event.propertyName != 'opacity') return;
        level.removeEventListener('transitionend', cb);
        Util.removeClass(level, 'dropdown__menu--is-hidden dropdown__menu--left');
        if(bool && !Util.hasClass(level, 'dropdown__menu--is-visible')) level.setAttribute('style', 'width: 0px');
      });
    };
  
    window.Dropdown = Dropdown;
  
    var dropdown = document.getElementsByClassName('js-dropdown');
    if( dropdown.length > 0 ) { // init Dropdown objects
      for( var i = 0; i < dropdown.length; i++) {
        (function(i){new Dropdown(dropdown[i]);})(i);
      }
    }
  }());
// File#: _2_flexi-header
// Usage: codyhouse.co/license
(function() {
    var flexHeader = document.getElementsByClassName('js-f-header');
    if(flexHeader.length > 0) {
      var menuTrigger = flexHeader[0].getElementsByClassName('js-anim-menu-btn')[0],
        firstFocusableElement = getMenuFirstFocusable();
  
      // we'll use these to store the node that needs to receive focus when the mobile menu is closed 
      var focusMenu = false;
  
      menuTrigger.addEventListener('anim-menu-btn-clicked', function(event){
        toggleMenuNavigation(event.detail);
      });
  
      // listen for key events
      window.addEventListener('keyup', function(event){
        // listen for esc key
        if( (event.keyCode && event.keyCode == 27) || (event.key && event.key.toLowerCase() == 'escape' )) {
          // close navigation on mobile if open
          if(menuTrigger.getAttribute('aria-expanded') == 'true' && isVisible(menuTrigger)) {
            focusMenu = menuTrigger; // move focus to menu trigger when menu is close
            menuTrigger.click();
          }
        }
        // listen for tab key
        if( (event.keyCode && event.keyCode == 9) || (event.key && event.key.toLowerCase() == 'tab' )) {
          // close navigation on mobile if open when nav loses focus
          if(menuTrigger.getAttribute('aria-expanded') == 'true' && isVisible(menuTrigger) && !document.activeElement.closest('.js-f-header')) menuTrigger.click();
        }
      });
  
      // listen for resize
      var resizingId = false;
      window.addEventListener('resize', function() {
        clearTimeout(resizingId);
        resizingId = setTimeout(doneResizing, 500);
      });
  
      function getMenuFirstFocusable() {
        var focusableEle = flexHeader[0].getElementsByClassName('f-header__nav')[0].querySelectorAll('[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex]:not([tabindex="-1"]), [contenteditable], audio[controls], video[controls], summary'),
          firstFocusable = false;
        for(var i = 0; i < focusableEle.length; i++) {
          if( focusableEle[i].offsetWidth || focusableEle[i].offsetHeight || focusableEle[i].getClientRects().length ) {
            firstFocusable = focusableEle[i];
            break;
          }
        }
  
        return firstFocusable;
      };
      
      function isVisible(element) {
        return (element.offsetWidth || element.offsetHeight || element.getClientRects().length);
      };
  
      function doneResizing() {
        if( !isVisible(menuTrigger) && Util.hasClass(flexHeader[0], 'f-header--expanded')) {
          menuTrigger.click();
        }
      };
      
      function toggleMenuNavigation(bool) { // toggle menu visibility on small devices
        Util.toggleClass(document.getElementsByClassName('f-header__nav')[0], 'f-header__nav--is-visible', bool);
        Util.toggleClass(flexHeader[0], 'f-header--expanded', bool);
        menuTrigger.setAttribute('aria-expanded', bool);
        if(bool) firstFocusableElement.focus(); // move focus to first focusable element
        else if(focusMenu) {
          focusMenu.focus();
          focusMenu = false;
        }
      };
    }
  }());
// File#: _2_slideshow
// Usage: codyhouse.co/license
(function() {
    var Slideshow = function(opts) {
      this.options = slideshowAssignOptions(Slideshow.defaults , opts);
      this.element = this.options.element;
      this.items = this.element.getElementsByClassName('js-slideshow__item');
      this.controls = this.element.getElementsByClassName('js-slideshow__control'); 
      this.selectedSlide = 0;
      this.autoplayId = false;
      this.autoplayPaused = false;
      this.navigation = false;
      this.navCurrentLabel = false;
      this.ariaLive = false;
      this.moveFocus = false;
      this.animating = false;
      this.supportAnimation = Util.cssSupports('transition');
      this.animationOff = (!Util.hasClass(this.element, 'slideshow--transition-fade') && !Util.hasClass(this.element, 'slideshow--transition-slide') && !Util.hasClass(this.element, 'slideshow--transition-prx'));
      this.animationType = Util.hasClass(this.element, 'slideshow--transition-prx') ? 'prx' : 'slide';
      this.animatingClass = 'slideshow--is-animating';
      initSlideshow(this);
      initSlideshowEvents(this);
      initAnimationEndEvents(this);
    };
  
    Slideshow.prototype.showNext = function() {
      showNewItem(this, this.selectedSlide + 1, 'next');
    };
  
    Slideshow.prototype.showPrev = function() {
      showNewItem(this, this.selectedSlide - 1, 'prev');
    };
  
    Slideshow.prototype.showItem = function(index) {
      showNewItem(this, index, false);
    };
  
    Slideshow.prototype.startAutoplay = function() {
      var self = this;
      if(this.options.autoplay && !this.autoplayId && !this.autoplayPaused) {
        self.autoplayId = setInterval(function(){
          self.showNext();
        }, self.options.autoplayInterval);
      }
    };
  
    Slideshow.prototype.pauseAutoplay = function() {
      var self = this;
      if(this.options.autoplay) {
        clearInterval(self.autoplayId);
        self.autoplayId = false;
      }
    };
  
    function slideshowAssignOptions(defaults, opts) {
      // initialize the object options
      var mergeOpts = {};
      mergeOpts.element = (typeof opts.element !== "undefined") ? opts.element : defaults.element;
      mergeOpts.navigation = (typeof opts.navigation !== "undefined") ? opts.navigation : defaults.navigation;
      mergeOpts.autoplay = (typeof opts.autoplay !== "undefined") ? opts.autoplay : defaults.autoplay;
      mergeOpts.autoplayInterval = (typeof opts.autoplayInterval !== "undefined") ? opts.autoplayInterval : defaults.autoplayInterval;
      mergeOpts.swipe = (typeof opts.swipe !== "undefined") ? opts.swipe : defaults.swipe;
      return mergeOpts;
    };
  
    function initSlideshow(slideshow) { // basic slideshow settings
      // if no slide has been selected -> select the first one
      if(slideshow.element.getElementsByClassName('slideshow__item--selected').length < 1) Util.addClass(slideshow.items[0], 'slideshow__item--selected');
      slideshow.selectedSlide = Util.getIndexInArray(slideshow.items, slideshow.element.getElementsByClassName('slideshow__item--selected')[0]);
      // create an element that will be used to announce the new visible slide to SR
      var srLiveArea = document.createElement('div');
      Util.setAttributes(srLiveArea, {'class': 'sr-only js-slideshow__aria-live', 'aria-live': 'polite', 'aria-atomic': 'true'});
      slideshow.element.appendChild(srLiveArea);
      slideshow.ariaLive = srLiveArea;
    };
  
    function initSlideshowEvents(slideshow) {
      // if slideshow navigation is on -> create navigation HTML and add event listeners
      if(slideshow.options.navigation) {
        // check if navigation has already been included
        if(slideshow.element.getElementsByClassName('js-slideshow__navigation').length == 0) {
          var navigation = document.createElement('ol'),
            navChildren = '';
  
          var navClasses = 'slideshow__navigation js-slideshow__navigation';
          if(slideshow.items.length <= 1) {
            navClasses = navClasses + ' is-hidden';
          } 
          
          navigation.setAttribute('class', navClasses);
          for(var i = 0; i < slideshow.items.length; i++) {
            var className = (i == slideshow.selectedSlide) ? 'class="slideshow__nav-item slideshow__nav-item--selected js-slideshow__nav-item"' :  'class="slideshow__nav-item js-slideshow__nav-item"',
              navCurrentLabel = (i == slideshow.selectedSlide) ? '<span class="sr-only js-slideshow__nav-current-label">Current Item</span>' : '';
            navChildren = navChildren + '<li '+className+'><button class="reset"><span class="sr-only">'+ (i+1) + '</span>'+navCurrentLabel+'</button></li>';
          }
          navigation.innerHTML = navChildren;
          slideshow.element.appendChild(navigation);
        }
        
        slideshow.navCurrentLabel = slideshow.element.getElementsByClassName('js-slideshow__nav-current-label')[0]; 
        slideshow.navigation = slideshow.element.getElementsByClassName('js-slideshow__nav-item');
  
        var dotsNavigation = slideshow.element.getElementsByClassName('js-slideshow__navigation')[0];
  
        dotsNavigation.addEventListener('click', function(event){
          navigateSlide(slideshow, event, true);
        });
        dotsNavigation.addEventListener('keyup', function(event){
          navigateSlide(slideshow, event, (event.key.toLowerCase() == 'enter'));
        });
      }
      // slideshow arrow controls
      if(slideshow.controls.length > 0) {
        // hide controls if one item available
        if(slideshow.items.length <= 1) {
          Util.addClass(slideshow.controls[0], 'is-hidden');
          Util.addClass(slideshow.controls[1], 'is-hidden');
        }
        slideshow.controls[0].addEventListener('click', function(event){
          event.preventDefault();
          slideshow.showPrev();
          updateAriaLive(slideshow);
        });
        slideshow.controls[1].addEventListener('click', function(event){
          event.preventDefault();
          slideshow.showNext();
          updateAriaLive(slideshow);
        });
      }
      // swipe events
      if(slideshow.options.swipe) {
        //init swipe
        new SwipeContent(slideshow.element);
        slideshow.element.addEventListener('swipeLeft', function(event){
          slideshow.showNext();
        });
        slideshow.element.addEventListener('swipeRight', function(event){
          slideshow.showPrev();
        });
      }
      // autoplay
      if(slideshow.options.autoplay) {
        slideshow.startAutoplay();
        // pause autoplay if user is interacting with the slideshow
        slideshow.element.addEventListener('mouseenter', function(event){
          slideshow.pauseAutoplay();
          slideshow.autoplayPaused = true;
        });
        slideshow.element.addEventListener('focusin', function(event){
          slideshow.pauseAutoplay();
          slideshow.autoplayPaused = true;
        });
        slideshow.element.addEventListener('mouseleave', function(event){
          slideshow.autoplayPaused = false;
          slideshow.startAutoplay();
        });
        slideshow.element.addEventListener('focusout', function(event){
          slideshow.autoplayPaused = false;
          slideshow.startAutoplay();
        });
      }
      // detect if external buttons control the slideshow
      var slideshowId = slideshow.element.getAttribute('id');
      if(slideshowId) {
        var externalControls = document.querySelectorAll('[data-controls="'+slideshowId+'"]');
        for(var i = 0; i < externalControls.length; i++) {
          (function(i){externalControlSlide(slideshow, externalControls[i]);})(i);
        }
      }
      // custom event to trigger selection of a new slide element
      slideshow.element.addEventListener('selectNewItem', function(event){
        // check if slide is already selected
        if(event.detail) {
          if(event.detail - 1 == slideshow.selectedSlide) return;
          showNewItem(slideshow, event.detail - 1, false);
        }
      });
    };
  
    function navigateSlide(slideshow, event, keyNav) { 
      // user has interacted with the slideshow navigation -> update visible slide
      var target = ( Util.hasClass(event.target, 'js-slideshow__nav-item') ) ? event.target : event.target.closest('.js-slideshow__nav-item');
      if(keyNav && target && !Util.hasClass(target, 'slideshow__nav-item--selected')) {
        slideshow.showItem(Util.getIndexInArray(slideshow.navigation, target));
        slideshow.moveFocus = true;
        updateAriaLive(slideshow);
      }
    };
  
    function initAnimationEndEvents(slideshow) {
      // remove animation classes at the end of a slide transition
      for( var i = 0; i < slideshow.items.length; i++) {
        (function(i){
          slideshow.items[i].addEventListener('animationend', function(){resetAnimationEnd(slideshow, slideshow.items[i]);});
          slideshow.items[i].addEventListener('transitionend', function(){resetAnimationEnd(slideshow, slideshow.items[i]);});
        })(i);
      }
    };
  
    function resetAnimationEnd(slideshow, item) {
      setTimeout(function(){ // add a delay between the end of animation and slideshow reset - improve animation performance
        if(Util.hasClass(item,'slideshow__item--selected')) {
          if(slideshow.moveFocus) Util.moveFocus(item);
          emitSlideshowEvent(slideshow, 'newItemVisible', slideshow.selectedSlide);
          slideshow.moveFocus = false;
        }
        Util.removeClass(item, 'slideshow__item--'+slideshow.animationType+'-out-left slideshow__item--'+slideshow.animationType+'-out-right slideshow__item--'+slideshow.animationType+'-in-left slideshow__item--'+slideshow.animationType+'-in-right');
        item.removeAttribute('aria-hidden');
        slideshow.animating = false;
        Util.removeClass(slideshow.element, slideshow.animatingClass); 
      }, 100);
    };
  
    function showNewItem(slideshow, index, bool) {
      if(slideshow.items.length <= 1) return;
      if(slideshow.animating && slideshow.supportAnimation) return;
      slideshow.animating = true;
      Util.addClass(slideshow.element, slideshow.animatingClass); 
      if(index < 0) index = slideshow.items.length - 1;
      else if(index >= slideshow.items.length) index = 0;
      // skip slideshow item if it is hidden
      if(bool && Util.hasClass(slideshow.items[index], 'is-hidden')) {
        slideshow.animating = false;
        index = bool == 'next' ? index + 1 : index - 1;
        showNewItem(slideshow, index, bool);
        return;
      }
      // index of new slide is equal to index of slide selected item
      if(index == slideshow.selectedSlide) {
        slideshow.animating = false;
        return;
      }
      var exitItemClass = getExitItemClass(slideshow, bool, slideshow.selectedSlide, index);
      var enterItemClass = getEnterItemClass(slideshow, bool, slideshow.selectedSlide, index);
      // transition between slides
      if(!slideshow.animationOff) Util.addClass(slideshow.items[slideshow.selectedSlide], exitItemClass);
      Util.removeClass(slideshow.items[slideshow.selectedSlide], 'slideshow__item--selected');
      slideshow.items[slideshow.selectedSlide].setAttribute('aria-hidden', 'true'); //hide to sr element that is exiting the viewport
      if(slideshow.animationOff) {
        Util.addClass(slideshow.items[index], 'slideshow__item--selected');
      } else {
        Util.addClass(slideshow.items[index], enterItemClass+' slideshow__item--selected');
      }
      // reset slider navigation appearance
      resetSlideshowNav(slideshow, index, slideshow.selectedSlide);
      slideshow.selectedSlide = index;
      // reset autoplay
      slideshow.pauseAutoplay();
      slideshow.startAutoplay();
      // reset controls/navigation color themes
      resetSlideshowTheme(slideshow, index);
      // emit event
      emitSlideshowEvent(slideshow, 'newItemSelected', slideshow.selectedSlide);
      if(slideshow.animationOff) {
        slideshow.animating = false;
        Util.removeClass(slideshow.element, slideshow.animatingClass);
      }
    };
  
    function getExitItemClass(slideshow, bool, oldIndex, newIndex) {
      var className = '';
      if(bool) {
        className = (bool == 'next') ? 'slideshow__item--'+slideshow.animationType+'-out-right' : 'slideshow__item--'+slideshow.animationType+'-out-left'; 
      } else {
        className = (newIndex < oldIndex) ? 'slideshow__item--'+slideshow.animationType+'-out-left' : 'slideshow__item--'+slideshow.animationType+'-out-right';
      }
      return className;
    };
  
    function getEnterItemClass(slideshow, bool, oldIndex, newIndex) {
      var className = '';
      if(bool) {
        className = (bool == 'next') ? 'slideshow__item--'+slideshow.animationType+'-in-right' : 'slideshow__item--'+slideshow.animationType+'-in-left'; 
      } else {
        className = (newIndex < oldIndex) ? 'slideshow__item--'+slideshow.animationType+'-in-left' : 'slideshow__item--'+slideshow.animationType+'-in-right';
      }
      return className;
    };
  
    function resetSlideshowNav(slideshow, newIndex, oldIndex) {
      if(slideshow.navigation) {
        Util.removeClass(slideshow.navigation[oldIndex], 'slideshow__nav-item--selected');
        Util.addClass(slideshow.navigation[newIndex], 'slideshow__nav-item--selected');
        slideshow.navCurrentLabel.parentElement.removeChild(slideshow.navCurrentLabel);
        slideshow.navigation[newIndex].getElementsByTagName('button')[0].appendChild(slideshow.navCurrentLabel);
      }
    };
  
    function resetSlideshowTheme(slideshow, newIndex) {
      var dataTheme = slideshow.items[newIndex].getAttribute('data-theme');
      if(dataTheme) {
        if(slideshow.navigation) slideshow.navigation[0].parentElement.setAttribute('data-theme', dataTheme);
        if(slideshow.controls[0]) slideshow.controls[0].parentElement.setAttribute('data-theme', dataTheme);
      } else {
        if(slideshow.navigation) slideshow.navigation[0].parentElement.removeAttribute('data-theme');
        if(slideshow.controls[0]) slideshow.controls[0].parentElement.removeAttribute('data-theme');
      }
    };
  
    function emitSlideshowEvent(slideshow, eventName, detail) {
      var event = new CustomEvent(eventName, {detail: detail});
      slideshow.element.dispatchEvent(event);
    };
  
    function updateAriaLive(slideshow) {
      slideshow.ariaLive.innerHTML = 'Item '+(slideshow.selectedSlide + 1)+' of '+slideshow.items.length;
    };
  
    function externalControlSlide(slideshow, button) { // control slideshow using external element
      button.addEventListener('click', function(event){
        var index = button.getAttribute('data-index');
        if(!index || index == slideshow.selectedSlide + 1) return;
        event.preventDefault();
        showNewItem(slideshow, index - 1, false);
      });
    };
  
    Slideshow.defaults = {
      element : '',
      navigation : true,
      // autoplay : false,
      autoplay: true,
      autoplayInterval: 5000,
      swipe: false
    };
  
    window.Slideshow = Slideshow;
    
    //initialize the Slideshow objects
    var slideshows = document.getElementsByClassName('js-slideshow');
    if( slideshows.length > 0 ) {
      for( var i = 0; i < slideshows.length; i++) {
        (function(i){
          var navigation = (slideshows[i].getAttribute('data-navigation') && slideshows[i].getAttribute('data-navigation') == 'off') ? false : true,
            autoplay = (slideshows[i].getAttribute('data-autoplay') && slideshows[i].getAttribute('data-autoplay') == 'on') ? true : false,
            autoplayInterval = (slideshows[i].getAttribute('data-autoplay-interval')) ? slideshows[i].getAttribute('data-autoplay-interval') : 5000,
            swipe = (slideshows[i].getAttribute('data-swipe') && slideshows[i].getAttribute('data-swipe') == 'on') ? true : false;
          new Slideshow({element: slideshows[i], navigation: navigation, autoplay : autoplay, autoplayInterval : autoplayInterval, swipe : swipe});
        })(i);
      }
    }
  }());