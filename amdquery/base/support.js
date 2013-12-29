aQuery.define( "base/support", [ "base/extend" ], function( $, utilExtend ) {
	"use strict"; //启用严格模式
	this.describe( "Consult from jquery-1.9.1" );
	var support, all, a,
		input, select, fragment,
		opt, eventName, isSupported, i,
		div = document.createElement( "div" );

	// Setup
	div.setAttribute( "className", "t" );
	div.innerHTML = "  <link/><table></table><a href='/a'>a</a><input type='checkbox'/>";

	// Support tests won't run in some limited or non-browser environments
	all = div.getElementsByTagName( "*" );
	a = div.getElementsByTagName( "a" )[ 0 ];
	if ( !all || !a || !all.length ) {
		return {};
	}

	// First batch of tests
	select = document.createElement( "select" );
	opt = select.appendChild( document.createElement( "option" ) );
	input = div.getElementsByTagName( "input" )[ 0 ];

	a.style.cssText = "top:1px;float:left;opacity:.5";
	/**
	 * @pubilc
	 * @exports base/support
	 */
	var support = {
		/**
		 * Support canvas
		 * @type {Boolean}
		 */
		canvas: typeof CanvasRenderingContext2D !== "undefined",
		/**
		 * Support script eval
		 * @type {Boolean}
		 * @default false
		 */
		scriptEval: false,
		/**
		 * Test setAttribute on camelCase class. If it works, we need attrFixes when doing get/setAttribute (ie6/7).
		 * @type {Boolean}
		 */
		getSetAttribute: div.className !== "t",
		/**
		 * IE strips leading whitespace when .innerHTML is used.
		 * @type {Boolean}
		 */
		leadingWhitespace: div.firstChild.nodeType === 3,
		/**
		 * IE will insert them into empty tables.</br>
		 * Make sure that tbody elements aren't automatically inserted.
		 * @type {Boolean}
		 */
		tbody: !div.getElementsByTagName( "tbody" ).length,
		/**
		 * Make sure that link elements get serialized correctly by innerHTML.</br>
		 * This requires a wrapper element in IE.
		 * @type {Boolean}
		 */
		htmlSerialize: !! div.getElementsByTagName( "link" ).length,
		/**
		 * Get the style information from getAttribute.</br>
		 * (IE uses .cssText instead)
		 * @type {Boolean}
		 */
		style: /top/.test( a.getAttribute( "style" ) ),
		/**
		 * Make sure that URLs aren't manipulated.</br>
		 * (IE normalizes it by default).
		 * @type {Boolean}
		 */
		hrefNormalized: a.getAttribute( "href" ) === "/a",
		/**
		 * Make sure that element opacity exists.</br>
		 * (IE uses filter instead).</br>
		 * Use a regex to work around a WebKit issue.
		 * @type {Boolean}
		 */
		opacity: /^0.5/.test( a.style.opacity ),
		/**
		 * Verify style float existence.</br>
		 * (IE uses styleFloat instead of cssFloat).
		 * @type {Boolean}
		 */
		cssFloat: !! a.style.cssFloat,
		/**
		 * Check the default checkbox/radio value ("" on WebKit; "on" elsewhere)
		 * @type {Boolean}
		 */
		checkOn: !! input.value,
		/**
		 * Make sure that a selected-by-default option has a working selected property.</br>
		 * (WebKit defaults to false instead of true, IE too, if it's in an optgroup).
		 * @type {Boolean}
		 */
		optSelected: opt.selected,
		/**
		 * Tests for enctype support on a form.
		 * @type {Boolean}
		 */
		enctype: !! document.createElement( "form" ).enctype,
		/**
		 * Makes sure cloning an html5 element does not cause problems.</br>
		 * Where outerHTML is undefined, this still works.
		 * @type {Boolean}
		 */
		html5Clone: document.createElement( "nav" ).cloneNode( true ).outerHTML !== "<:nav></:nav>",

		// jQuery.support.boxModel DEPRECATED in 1.8 since we don't support Quirks Mode
		boxModel: document.compatMode === "CSS1Compat",

		// Will be defined later
		deleteExpando: true,
		noCloneEvent: true,
		inlineBlockNeedsLayout: false,
		shrinkWrapBlocks: false,
		reliableMarginRight: true,
		boxSizingReliable: true,
		pixelPosition: false
	};

	input.checked = true;
	/**
	 * Make sure checked status is properly cloned.
	 * @type {Boolean}
	 */
	support.noCloneChecked = input.cloneNode( true ).checked;


	select.disabled = true;
	/**
	 * Make sure that the options inside disabled selects aren't marked as disabled.</br>
	 * (WebKit marks them as disabled).
	 * @type {Boolean}
	 */
	support.optDisabled = !opt.disabled;

	// Support: IE<9
	try {
		delete div.test;
	} catch ( e ) {
		/**
		 * Delete Expando
		 * @type {Boolean}
		 */
		support.deleteExpando = false;
	}

	input = document.createElement( "input" );
	input.setAttribute( "value", "" );
	/**
	 * Check if we can trust getAttribute("value").
	 * @type {Boolean}
	 */
	support.input = input.getAttribute( "value" ) === "";

	input.value = "t";
	input.setAttribute( "type", "radio" );
	/**
	 * Check if an input maintains its value after becoming a radio.
	 * @type {Boolean}
	 */
	support.radioValue = input.value === "t";

	// #11217 - WebKit loses check when the name is after the checked attribute
	input.setAttribute( "checked", "t" );
	input.setAttribute( "name", "t" );

	fragment = document.createDocumentFragment();
	fragment.appendChild( input );

	/**
	 * Check if a disconnected checkbox will retain its checked.</br>
	 * Value of true after appended to the DOM (IE6/7)
	 * @type {Boolean}
	 */
	support.appendChecked = input.checked;

	/**
	 * WebKit doesn't clone checked state correctly in fragments
	 * @type {Boolean}
	 */
	support.checkClone = fragment.cloneNode( true ).cloneNode( true ).lastChild.checked;

	if ( div.attachEvent ) {
		div.attachEvent( "onclick", function() {
			/**
			 * Support: IE<9</br>
			 * Opera does not clone events (and typeof div.attachEvent === undefined).</br>
			 * IE9-10 clones events bound via attachEvent, but they don't trigger with .click().</br>
			 * @type {Boolean}
			 */
			support.noCloneEvent = false;
		} );

		div.cloneNode( true ).click();
	}

	/**
	 * Support: IE<9 (lack submit/change bubble), Firefox 17+ (lack focusin event).</br>
	 * Beware of CSP restrictions (https://developer.mozilla.org/en/Security/CSP), test/csp.php
	 * @type {Boolean}
	 * @name submit
	 * @memberof module:base/support
	 */
	/**
	 * Support: IE<9 (lack submit/change bubble), Firefox 17+ (lack focusin event).</br>
	 * Beware of CSP restrictions (https://developer.mozilla.org/en/Security/CSP), test/csp.php
	 * @type {Boolean}
	 * @name change
	 * @memberof module:base/support
	 */
	/**
	 * Support: IE<9 (lack submit/change bubble), Firefox 17+ (lack focusin event).</br>
	 * Beware of CSP restrictions (https://developer.mozilla.org/en/Security/CSP), test/csp.php
	 * @type {Boolean}
	 * @name focusin
	 * @memberof module:base/support
	 */
	for ( i in {
		submit: true,
		change: true,
		focusin: true
	} ) {
		div.setAttribute( eventName = "on" + i, "t" );

		support[ i + "Bubbles" ] = eventName in window || div.attributes[ eventName ].expando === false;
	}

	div.style.backgroundClip = "content-box";
	div.cloneNode( true ).style.backgroundClip = "";
	/**
	 * Clear clone style.
	 * @type {Boolean}
	 */
	support.clearCloneStyle = div.style.backgroundClip === "content-box";

	$.ready( function() {
		var divReset = "padding:0;margin:0;border:0;display:block;box-sizing:content-box;-moz-box-sizing:content-box;-webkit-box-sizing:content-box;",
			body = document.getElementsByTagName( "body" )[ 0 ],
			container,
			marginDiv,
			tds;


		if ( !body ) {
			// Return for frameset docs that don't have a body
			return;
		}

		container = document.createElement( "div" );
		container.style.cssText = "border:0;width:0;height:0;position:absolute;top:0;left:-9999px;margin-top:1px";

		body.appendChild( container ).appendChild( div );

		// Support: IE8
		// Check if table cells still have offsetWidth/Height when they are set
		// to display:none and there are still other visible table cells in a
		// table row; if so, offsetWidth/Height are not reliable for use when
		// determining if an element has been hidden directly using
		// display:none (it is still safe to use offsets if a parent element is
		// hidden; don safety goggles and see bug #4512 for more information).
		div.innerHTML = "<table><tr><td></td><td>t</td></tr></table>";
		tds = div.getElementsByTagName( "td" );
		tds[ 0 ].style.cssText = "padding:0;margin:0;border:0;display:none";
		isSupported = ( tds[ 0 ].offsetHeight === 0 );

		tds[ 0 ].style.display = "";
		tds[ 1 ].style.display = "none";

		/**
		 * Support: IE8.</br>
		 * Check if empty table cells still have offsetWidth/Height
		 * @type {Boolean}
		 */
		support.reliableHiddenOffsets = isSupported && ( tds[ 0 ].offsetHeight === 0 );

		// Check box-sizing and margin behavior
		div.innerHTML = "";
		div.style.cssText = "box-sizing:border-box;-moz-box-sizing:border-box;-webkit-box-sizing:border-box;padding:1px;border:1px;display:block;width:4px;margin-top:1%;position:absolute;top:1%;";
		/**
		 * @type {Boolean}
		 */
		support.boxSizing = ( div.offsetWidth === 4 );
		/**
		 * @type {Boolean}
		 */
		support.doesNotIncludeMarginInBodyOffset = ( body.offsetTop !== 1 );

		// Use window.getComputedStyle because jsdom on node.js will break without it.
		if ( window.getComputedStyle ) {
			/**
			 * @type {Boolean}
			 */
			support.pixelPosition = ( window.getComputedStyle( div, null ) || {} ).top !== "1%";
			/**
			 * @type {Boolean}
			 */
			support.boxSizingReliable = ( window.getComputedStyle( div, null ) || {
				width: "4px"
			} ).width === "4px";

			marginDiv = div.appendChild( document.createElement( "div" ) );
			marginDiv.style.cssText = div.style.cssText = divReset;
			marginDiv.style.marginRight = marginDiv.style.width = "0";
			div.style.width = "1px";
			/**
			 * Check if div with explicit width and no margin-right incorrectly
			 * gets computed margin-right based on width of container.</br>
			 * Fails in WebKit before Feb 2011 nightlies.</br>
			 * WebKit Bug 13343 - getComputedStyle returns wrong value for margin-right.
			 * @type {Boolean}
			 */
			support.reliableMarginRight = !parseFloat( ( window.getComputedStyle( marginDiv, null ) || {} ).marginRight );
		}

		if ( typeof div.style.zoom !== "undefined" ) {
			div.innerHTML = "";
			div.style.cssText = divReset + "width:1px;padding:1px;display:inline;zoom:1";
			/**
			 * Support: IE<8.</br>
			 * Check if natively block-level elements act like inline-block
			 * elements when setting their display to 'inline' and giving
			 * them layout.
			 * @type {Boolean}
			 */
			support.inlineBlockNeedsLayout = ( div.offsetWidth === 3 );

			div.style.display = "block";
			div.innerHTML = "<div></div>";
			div.firstChild.style.width = "5px";
			/**
			 * Support: IE6.</br>
			 * Check if elements with layout shrink-wrap their children.
			 * @type {Boolean}
			 */
			support.shrinkWrapBlocks = ( div.offsetWidth !== 3 );

			if ( support.inlineBlockNeedsLayout ) {
				// Prevent IE 6 from affecting layout for positioned elements #11048
				// Prevent IE from shrinking the body in IE 7 mode #12869
				// Support: IE<8
				body.style.zoom = 1;
			}
		}

		body.removeChild( container );


		// Null elements to avoid leaks in IE
		container = div = tds = marginDiv = null;
	} );

	all = select = fragment = opt = a = input = null;

	var root = document.documentElement,
		script = document.createElement( "script" ),
		id = "_" + $.now();

	script.type = "text/javascript";

	try {
		script.appendChild( document.createTextNode( "window." + id + "=1;" ) );
	} catch ( e ) {}

	root.insertBefore( script, root.firstChild );

	if ( window[ id ] ) {
		support.scriptEval = true;
		delete window[ id ];
	}
	root.removeChild( script );

	root = script = null;

	return support;
} );