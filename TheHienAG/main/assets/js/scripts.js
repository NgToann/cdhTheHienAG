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