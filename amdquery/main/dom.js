aQuery.define( "main/dom", [ "base/typed", "base/extend", "base/array", "base/support", "main/data", "main/event", "main/query", "main/communicate" ], function( $, typed, utilExtend, utilArray, support, utilData, event, query, communicate, undefined ) {
	"use strict";
	this.describe( "refer JQuery1.9.1" );
	var nodeNames = "abbr|article|aside|audio|bdi|canvas|data|datalist|details|figcaption|figure|footer|" +
		"header|hgroup|mark|meter|nav|output|progress|section|summary|time|video",
		rsingleTag = /^<(\w+)\s*\/?>(?:<\/\1>|)$/,
		rinlineaQuery = / aQuery\d+="(?:null|\d+)"/g,
		rnoshimcache = new RegExp( "<(?:" + nodeNames + ")[\\s/>]", "i" ),
		rleadingWhitespace = /^\s+/,
		rxhtmlTag = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/gi,
		rtagName = /<([\w:]+)/,
		rtbody = /<tbody/i,
		rhtml = /<|&#?\w+;/,
		rnoInnerhtml = /<(?:script|style|link)/i,
		manipulation_rcheckableType = /^(?:checkbox|radio)$/i,
		// checked="checked" or checked
		rchecked = /checked\s*(?:[^=]|=\s*.checked.)/i,
		rscriptType = /^$|\/(?:java|ecma)script/i,
		rscriptTypeMasked = /^true\/(.*)/,
		rcleanScript = /^\s*<!(?:\[CDATA\[|--)|(?:\]\]|--)>\s*$/g,

		// We have to close these tags to support XHTML (#13200)
		wrapMap = {
			option: [ 1, "<select multiple='multiple'>", "</select>" ],
			legend: [ 1, "<fieldset>", "</fieldset>" ],
			area: [ 1, "<map>", "</map>" ],
			param: [ 1, "<object>", "</object>" ],
			thead: [ 1, "<table>", "</table>" ],
			tr: [ 2, "<table><tbody>", "</tbody></table>" ],
			col: [ 2, "<table><tbody></tbody><colgroup>", "</colgroup></table>" ],
			td: [ 3, "<table><tbody><tr>", "</tr></tbody></table>" ],

			// IE6-8 can't serialize link, script, style, or any html5 (NoScope) tags,
			// unless wrapped in a div with non-breaking characters in front of it.
			_default: support.htmlSerialize ? [ 0, "", "" ] : [ 1, "X<div>", "</div>" ]
		},
		safeFragment = createSafeFragment( document ),
		fragmentDiv = safeFragment.appendChild( document.createElement( "div" ) );

	function createSafeFragment( document ) {
		var list = nodeNames.split( "|" ),
			safeFrag = document.createDocumentFragment();

		if ( safeFrag.createElement ) {
			while ( list.length ) {
				safeFrag.createElement(
					list.pop()
				);
			}
		}
		return safeFrag;
	}

	function getAll( context, tag ) {
		var elems, elem,
			i = 0,
			found = typeof context.getElementsByTagName !== "undefined" ? context.getElementsByTagName( tag || "*" ) :
				typeof context.querySelectorAll !== "undefined" ? context.querySelectorAll( tag || "*" ) :
				undefined;

		if ( !found ) {
			for ( found = [], elems = context.childNodes || context;
				( elem = elems[ i ] ) != null; i++ ) {
				if ( !tag || typed.isNode( elem, tag ) ) {
					found.push( elem );
				} else {
					$.merge( found, getAll( elem, tag ) );
				}
			}
		}

		return tag === undefined || tag && typed.isNode( context, tag ) ?
			$.merge( [ context ], found ) :
			found;
	}

	// Used in buildFragment, fixes the defaultChecked property

	function fixDefaultChecked( elem ) {
		if ( manipulation_rcheckableType.test( elem.type ) ) {
			elem.defaultChecked = elem.checked;
		}
	}

	function setGlobalEval( elems, refElements ) {
		var elem,
			i = 0;
		for ( ;
			( elem = elems[ i ] ) != null; i++ ) {
			utilData.set( elem, "globalEval", !refElements || utilData.get( refElements[ i ], "globalEval" ) );
		}
	}

	function findOrAppend( elem, tag ) {
		return elem.getElementsByTagName( tag )[ 0 ] || elem.appendChild( elem.ownerDocument.createElement( tag ) );
	}

	function disableScript( elem ) {
		var attr = elem.getAttributeNode( "type" );
		elem.type = ( attr && attr.specified ) + "/" + elem.type;
		return elem;
	}

	function restoreScript( elem ) {
		var match = rscriptTypeMasked.exec( elem.type );
		if ( match ) {
			elem.type = match[ 1 ];
		} else {
			elem.removeAttribute( "type" );
		}
		return elem;
	}

	function fixCloneNodeIssues( src, dest ) {
		var nodeName, e, data;

		// We do not need to do anything for non-Elements
		if ( dest.nodeType !== 1 ) {
			return;
		}

		nodeName = dest.nodeName.toLowerCase();

		// IE6-8 copies events bound via attachEvent when using cloneNode.
		if ( !support.noCloneEvent ) {
			event.clearHandlers( dest );

			// Event data gets referenced instead of copied if the expando gets copied too
			//dest.removeAttribute( utilData.expando );
		}

		// IE blanks contents when cloning scripts, and tries to evaluate newly-set text
		if ( nodeName === "script" && dest.text !== src.text ) {
			disableScript( dest ).text = src.text;
			restoreScript( dest );

			// IE6-10 improperly clones children of object elements using classid.
			// IE10 throws NoModificationAllowedError if parent is null, #12132.
		} else if ( nodeName === "object" ) {
			if ( dest.parentNode ) {
				dest.outerHTML = src.outerHTML;
			}

			// This path appears unavoidable for IE9. When cloning an object
			// element in IE9, the outerHTML strategy above is not sufficient.
			// If the src has innerHTML and the destination does not,
			// copy the src.innerHTML into the dest.innerHTML. #10324
			if ( support.html5Clone && ( src.innerHTML && !$.util.trim( dest.innerHTML ) ) ) {
				dest.innerHTML = src.innerHTML;
			}

		} else if ( nodeName === "input" && manipulation_rcheckableType.test( src.type ) ) {
			// IE6-8 fails to persist the checked state of a cloned checkbox
			// or radio button. Worse, IE6-7 fail to give the cloned element
			// a checked appearance if the defaultChecked value isn't also set

			dest.defaultChecked = dest.checked = src.checked;

			// IE6-7 get confused and end up setting the value of a cloned
			// checkbox/radio button to an empty string instead of "on"
			if ( dest.value !== src.value ) {
				dest.value = src.value;
			}

			// IE6-8 fails to return the selected option to the default selected
			// state when cloning options
		} else if ( nodeName === "option" ) {
			dest.defaultSelected = dest.selected = src.defaultSelected;

			// IE6-8 fails to set the defaultValue to the correct value when
			// cloning other types of input fields
		} else if ( nodeName === "input" || nodeName === "textarea" ) {
			dest.defaultValue = src.defaultValue;
		}
	}

	function cloneCopyEvent( src, dest ) {

		if ( dest.nodeType !== 1 || !utilData.hasData( src ) ) {
			return;
		}

		var oldData = utilData.get( src );
		var curData = utilData.set( dest, oldData );

		event.cloneHandlers( dest, src );

		// $.extend( true, curData, oldData.data );
	}

	/**
	 * @exports main/dom
	 * @requires module:base/typed
	 * @requires module:base/extend
	 * @requires module:base/array
	 * @requires module:base/support
	 * @requires module:main/data
	 * @requires module:main/event
	 * @requires module:main/query
	 * @borrows module:main/query.contains as contains
	 */
	var dom = {
		/** @inner */
		buildFragment: function( elems, context, scripts, selection ) {
			var j, elem, contains,
				tmp, tag, tbody, wrap,
				l = elems.length,

				// Ensure a safe fragment
				safe = createSafeFragment( context ),

				nodes = [],
				i = 0;

			for ( ; i < l; i++ ) {
				elem = elems[ i ];

				if ( elem || elem === 0 ) {

					// Add nodes directly
					if ( typed.type( elem ) === "object" ) {
						$.merge( nodes, elem.nodeType ? [ elem ] : elem );

						// Convert non-html into a text node
					} else if ( !rhtml.test( elem ) ) {
						nodes.push( context.createTextNode( elem ) );

						// Convert html into DOM nodes
					} else {
						tmp = tmp || safe.appendChild( context.createElement( "div" ) );

						// Deserialize a standard representation
						tag = ( rtagName.exec( elem ) || [ "", "" ] )[ 1 ].toLowerCase();
						wrap = wrapMap[ tag ] || wrapMap._default;

						tmp.innerHTML = wrap[ 1 ] + elem.replace( rxhtmlTag, "<$1></$2>" ) + wrap[ 2 ];

						// Descend through wrappers to the right content
						j = wrap[ 0 ];
						while ( j-- ) {
							tmp = tmp.lastChild;
						}

						// Manually add leading whitespace removed by IE
						if ( !support.leadingWhitespace && rleadingWhitespace.test( elem ) ) {
							nodes.push( context.createTextNode( rleadingWhitespace.exec( elem )[ 0 ] ) );
						}

						// Remove IE's autoinserted <tbody> from table fragments
						if ( !support.tbody ) {

							// String was a <table>, *may* have spurious <tbody>
							elem = tag === "table" && !rtbody.test( elem ) ?
								tmp.firstChild :

							// String was a bare <thead> or <tfoot>
							wrap[ 1 ] === "<table>" && !rtbody.test( elem ) ?
								tmp :
								0;

							j = elem && elem.childNodes.length;
							while ( j-- ) {
								if ( typed.isNode( ( tbody = elem.childNodes[ j ] ), "tbody" ) && !tbody.childNodes.length ) {
									elem.removeChild( tbody );
								}
							}
						}

						$.merge( nodes, tmp.childNodes );

						// Fix #12392 for WebKit and IE > 9
						tmp.textContent = "";

						// Fix #12392 for oldIE
						while ( tmp.firstChild ) {
							tmp.removeChild( tmp.firstChild );
						}

						// Remember the top-level container for proper cleanup
						tmp = safe.lastChild;
					}
				}
			}

			// Fix #11356: Clear elements from fragment
			if ( tmp ) {
				safe.removeChild( tmp );
			}

			// Reset defaultChecked for any radios and checkboxes
			// about to be appended to the DOM in IE 6/7 (#8060)
			if ( !support.appendChecked ) {
				utilArray.grep( getAll( nodes, "input" ), fixDefaultChecked );
			}

			i = 0;
			while ( ( elem = nodes[ i++ ] ) ) {

				// #4087 - If origin and destination elements are the same, and this is
				// that element, do not do anything
				if ( selection && utilArray.inArray( elem, selection ) !== -1 ) {
					continue;
				}

				contains = query.contains( elem.ownerDocument, elem );

				// Append to fragment
				tmp = getAll( safe.appendChild( elem ), "script" );

				// Preserve script evaluation history
				if ( contains ) {
					setGlobalEval( tmp );
				}

				// Capture executables
				if ( scripts ) {
					j = 0;
					while ( ( elem = tmp[ j++ ] ) ) {
						if ( rscriptType.test( elem.type || "" ) ) {
							scripts.push( elem );
						}
					}
				}
			}

			tmp = null;

			return safe;
		},
		/**
		 * Clone element.
		 * @param {Element}
		 * @param {Boolean} [dataAndEvents=false]
		 * @param {Boolean} [deepDataAndEvents=false]
		 * @returns {Element}
		 */
		clone: function( elem, dataAndEvents, deepDataAndEvents ) {
			var destElements, node, clone, i, srcElements,
				inPage = query.contains( elem.ownerDocument, elem );

			if ( support.html5Clone || typed.isXML( elem ) || !rnoshimcache.test( "<" + elem.nodeName + ">" ) ) {
				clone = elem.cloneNode( true );

				// IE<=8 does not properly clone detached, unknown element nodes
			} else {
				fragmentDiv.innerHTML = elem.outerHTML;
				fragmentDiv.removeChild( clone = fragmentDiv.firstChild );
			}

			if ( ( !support.noCloneEvent || !support.noCloneChecked ) &&
				( elem.nodeType === 1 || elem.nodeType === 11 ) && !typed.isXML( elem ) ) {

				// We eschew Sizzle here for performance reasons: http://jsperf.com/getall-vs-sizzle/2
				destElements = getAll( clone );
				srcElements = getAll( elem );

				// Fix all IE cloning issues
				for ( i = 0;
					( node = srcElements[ i ] ) != null; ++i ) {
					// Ensure that the destination node is not null; Fixes #9587
					if ( destElements[ i ] ) {
						fixCloneNodeIssues( node, destElements[ i ] );
					}
				}
			}

			// can not clone ui, consider it
			// Copy the events from the original to the clone
			if ( dataAndEvents ) {
				if ( deepDataAndEvents ) {
					srcElements = srcElements || getAll( elem );
					destElements = destElements || getAll( clone );

					for ( i = 0;
						( node = srcElements[ i ] ) != null; i++ ) {
						cloneCopyEvent( node, destElements[ i ] );
					}
				} else {
					cloneCopyEvent( elem, clone );
				}
			}

			// Preserve script evaluation history
			destElements = getAll( clone, "script" );
			if ( destElements.length > 0 ) {
				setGlobalEval( destElements, !inPage && getAll( elem, "script" ) );
			}

			destElements = srcElements = node = null;

			// Return the cloned set
			return clone;
		},
		/**
		 * HTMLString.
		 * @param {HTMLString}
		 * @param {String|Boolean} [context] - If specified, the fragment will be created in this context, defaults to document.
		 * @param {Boolean} [keepScripts] - If true, will include scripts passed in the html string.
		 * @returns {Array<Element>}
		 */
		parseHTML: function( data, context, keepScripts ) {
			if ( !data || typeof data !== "string" ) {
				return null;
			}
			if ( typeof context === "boolean" ) {
				keepScripts = context;
				context = false;
			}
			context = context || document;

			var parsed = rsingleTag.exec( data ),
				scripts = !keepScripts && [];

			// Single tag
			if ( parsed ) {
				return [ context.createElement( parsed[ 1 ] ) ];
			}

			parsed = dom.buildFragment( [ data ], context, scripts );
			if ( scripts ) {
				$( scripts ).remove();
			}
			return $.merge( [], parsed.childNodes );
		},

		contains: query.contains,

		/**
		 * Clear element data including all sub-elements or clean array of elemnts data.
		 * @param {Element|Array<Element>}
		 * @returns {this}
		 */
		cleanData: function( ele ) {
			var eles;
			if ( typed.isEle( ele ) ) {
				eles = getAll( ele );
			} else if ( typed.isArr( ele ) ) {
				eles = ele;
			}
			$.each( eles, function( ele ) {
				event.clearHandlers( ele );
				utilData.removeData( ele );
			} );
			return this
		},

		/**
		 * Get last child.
		 * @param {Element}
		 * @returns {Element}
		 */
		getLastChild: function( ele ) {
			var x = ele.lastChild;
			while ( x && !typed.isEle( x ) ) {
				x = x.previousSibling;
			}
			return x;
		},
		/**
		 * Get real child by index.
		 * @param {Element}
		 * @param {Number}
		 * @returns {Element}
		 */
		getRealChild: function( father, index ) {
			var i = -1,
				child;
			var ele = father.firstChild;
			while ( ele ) {
				if ( typed.isEle( ele ) && ++i == index ) {
					child = ele;
					break;
				}
				ele = ele.nextSibling;
			}
			return child;
		},
		/**
		 * Remove this element,
		 * @param {Element}
		 * @param {String} - Filter
		 * @param {Boolean} [keepData=false] - Whether keep data.
		 * @returns {this}
		 */
		remove: function( ele, selector, keepData ) {
			if ( !selector || query.filter( selector, [ ele ] ).length > 0 ) {
				if ( !keepData && ele.nodeType === 1 ) {
					dom.cleanData( ele );
				}

				if ( ele.parentNode ) {
					if ( keepData && query.contains( ele.ownerDocument, ele ) ) {
						setGlobalEval( getAll( ele, "script" ) );
					}
					ele.parentNode.removeChild( ele );
				}
			}
			return this;
		},
		/**
		 * Remove child element of this parent element,
		 * @param {Element}
		 * @param {Element}
		 * @param {Boolean} [keepData=false] - Whether keep data.
		 * @returns {this}
		 */
		removeChild: function( ele, child, keepData ) {
			if ( query.contains( ele, child ) ) {
				dom.remove( child, false, keepData );
			}
			return this;
		},
		/**
		 * Remove all child elements of this parent element,
		 * @param {Element}
		 * @param {Boolean} [keepData=false] - Whether keep data.
		 * @returns {this}
		 */
		removeChildren: function( ele, keepData ) {
			for ( var i = ele.childNodes.length - 1; i >= 0; i-- ) {
				dom.remove( ele.childNodes[ i ], false, keepData );
			}
			return this;
		}
	};

	/**
	 * html string "&ltb&gthello&lt/b&gtwait&ltb&gtbye&lt/b&gt"
	 * @typedef {String} HTMLString
	 */

	/**
	 * A function that returns an HTML string, DOM element(s), or aQuery object to insert at the end of each element in the set of matched elements.<br />
	 * Receives the index position of the element in the set and the old HTML value of the element as arguments.<br />
	 * Within the function, this refers to the current element in the set.
	 * @callback DOMElementCallback
	 * @param index {Number}
	 * @param ele {Element|aQuery}
	 */

	/**
	 * A function returning the HTML content to set. <br />
	 * aQuery empties the element before calling the function; use the oldhtml argument to reference the previous content. Within the function, this refers to the current element in the set.
	 * @callback HTMLStringCallback
	 * @param index {Number} - Receives the index position of the element in the set.
	 * @param html {HTMLString} - The old HTML value as arguments.
	 */


	/**
	 * DOM element, array of elements, HTML string, or aQuery object to insert at the end of each element in the set of matched elements.
	 * @typedef {(Element|Array<Element>|aQuery|HTMLString)} DOMArguments
	 */

	$.fn.extend( /** @lends aQuery.prototype */ {
		/**
		 * Clone element.
		 * @param {Boolean} [dataAndEvents=false]
		 * @param {Boolean} [deepDataAndEvents=false]
		 * @returns {this}
		 */
		clone: function( dataAndEvents, deepDataAndEvents ) {
			dataAndEvents = dataAndEvents == null ? false : dataAndEvents;
			deepDataAndEvents = deepDataAndEvents == null ? dataAndEvents : deepDataAndEvents;
			return this.map( function() {
				return dom.clone( this, dataAndEvents, deepDataAndEvents );
			} );
		},
		/**
		 * Insert every element in the set of matched elements to the end of the target.<br />
		 * The .append() and .appendTo() methods perform the same task. The major difference is in the syntax-specifically, in the placement of the content and target. With .append(), the selector expression preceding the method is the container into which the content is inserted. With .appendTo(), on the other hand, the content precedes the method, either as a selector expression or as markup created on the fly, and it is inserted into the target container.
		 * @method appendTo
		 * @memberOf aQuery.prototype
		 * @param target {DOMArguments}
		 * @returns {this}
		 */

		/**
		 * Insert content, specified by the parameter, to the end of each element in the set of matched elements.
		 * @variation 1
		 * @method append
		 * @memberOf aQuery.prototype
		 * @param fn {DOMElementCallback}
		 * @returns {this}
		 */

		/**
		 * Insert content, specified by the parameter, to the end of each element in the set of matched elements.
		 * @param child {DOMArguments}
		 * @param childs {...DOMArguments} - One or more additional arguments.
		 * @returns {this}
		 */
		append: function() {
			return this.domManip( arguments, true, function( ele ) {
				if ( this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9 ) {
					this.appendChild( ele );
				}
			} );
		},
		/**
		 * Insert every element in the set of matched elements to the end of the target.<br />
		 * The .prepend() and .prependTo() methods perform the same task. The major difference is in the syntax-specifically, in the placement of the content and target. With .prepend(), the selector expression preceding the method is the container into which the content is inserted. With .prependTo(), on the other hand, the content precedes the method, either as a selector expression or as markup created on the fly, and it is inserted into the target container.
		 * @method prependTo
		 * @memberOf aQuery.prototype
		 * @param target {DOMArguments}
		 * @returns {this}
		 */

		/**
		 * Insert content, specified by the parameter, to the beginning of each element in the set of matched elements.
		 * @variation 1
		 * @method prepend
		 * @memberOf aQuery.prototype
		 * @param fn {DOMElementCallback}
		 * @returns {this}
		 */

		/**
		 * Insert content, specified by the parameter, to the beginning of each element in the set of matched elements.
		 * @param child {DOMArguments}
		 * @param childs {...DOMArguments} - One or more additional arguments.
		 * @returns {this}
		 */
		prepend: function() {
			return this.domManip( arguments, true, function( ele ) {
				if ( this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9 ) {
					this.insertBefore( ele, this.firstChild );
				}
			} );
		},
		/**
		 * Get the HTML contents of the first element in the set of matched elements.
		 * @variation 1
		 * @method html
		 * @memberOf aQuery.prototype
		 * @returns {String}
		 */

		/**
		 * Set the HTML contents of every matched element.
		 * @param value {HTMLStringCallback|HTMLString}
		 * @returns {this}
		 */
		html: function( value ) {
			var ele = this[ 0 ] || {},
				i = 0,
				l = this.length;
			if ( value === undefined ) {
				return ele.nodeType === 1 ?
					ele.innerHTML.replace( rinlineaQuery, "" ) : undefined;;
			} else if ( typed.isFun( value ) ) {
				var ele;
				for ( ; i < length; i++ ) {
					ele = this[ i ]
					value.call( ele, i, $( ele ).html() );
				}
			} else {
				if ( typeof value === "string" && !rnoInnerhtml.test( value ) &&
					( support.htmlSerialize || !rnoshimcache.test( value ) ) &&
					( support.leadingWhitespace || !rleadingWhitespace.test( value ) ) && !wrapMap[ ( rtagName.exec( value ) || [ "", "" ] )[ 1 ].toLowerCase() ] ) {

					value = value.replace( rxhtmlTag, "<$1></$2>" );

					try {
						for ( ; i < l; i++ ) {
							// Remove element nodes and prevent memory leaks
							ele = this[ i ] || {};
							if ( ele.nodeType === 1 ) {
								dom.cleanData( getAll( ele, false ) );
								ele.innerHTML = value;
							}
						}

						ele = 0;

						// If using innerHTML throws an exception, use the fallback method
					} catch ( e ) {}
				}

				if ( ele ) {
					this.empty().append( value );
				}
			}
			return this;
		},
		/**
		 * Insert every element in the set of matched elements after the target. <br />
		 * The .after() and .insertAfter() methods perform the same task. The major difference is in the syntax-specifically, in the placement of the content and target. With .after(), the selector expression preceding the method is the container after which the content is inserted. With .insertAfter(), on the other hand, the content precedes the method, either as a selector expression or as markup created on the fly, and it is inserted after the target container.
		 * @method insertAfter
		 * @memberOf aQuery.prototype
		 * @param target {DOMArguments}
		 * @returns {this}
		 */

		/**
		 * Insert content, specified by the parameter, after each element in the set of matched elements.
		 * @variation 1
		 * @method after
		 * @memberOf aQuery.prototype
		 * @param fn {function} - function(index)
		 * @returns {this}
		 */

		/**
		 * Insert content, specified by the parameter, after each element in the set of matched elements.
		 * @param refChild {DOMArguments}
		 * @param refChilds {...DOMArguments} - One or more additional arguments.
		 * @returns {this}
		 */
		after: function( refChild ) {
			return this.domManip( arguments, false, function( ele ) {
				if ( this.parentNode ) {
					this.parentNode.insertBefore( ele, this.nextSibling );
				}
			} );
		},
		/**
		 * Insert every element in the set of matched elements before the target. <br />
		 * The .before() and .insertBefore() methods perform the same task. The major difference is in the syntax-specifically, in the placement of the content and target. With .before(), the selector expression preceding the method is the container before which the content is inserted. With .insertBefore(), on the other hand, the content precedes the method, either as a selector expression or as markup created on the fly, and it is inserted before the target container.
		 * @method insertBefore
		 * @memberOf aQuery.prototype
		 * @param target {DOMArguments}
		 * @returns {this}
		 */

		/**
		 * Insert content, specified by the parameter, after each element in the set of matched elements.
		 * @variation 1
		 * @method before
		 * @memberOf aQuery.prototype
		 * @param fn {function} - function(index)
		 * @returns {this}
		 */

		/**
		 * Insert content, specified by the parameter, after each element in the set of matched elements.
		 * @param refChild {DOMArguments}
		 * @param refChilds {...DOMArguments} - One or more additional arguments.
		 * @returns {this}
		 */
		before: function( refChild ) {
			return this.domManip( arguments, false, function( ele ) {
				if ( this.parentNode ) {
					this.parentNode.insertBefore( ele, this );
				}
			} );
		},
		/**
		 * Insert text.
		 * @param {String}
		 * @returns {this}
		 */
		insertText: function( str ) {
			if ( typed.isStr( str ) && str.length > 0 ) {
				var nodeText;
				this.each( function( ele ) {
					nodeText = document.createTextNode( str );
					ele.appendChild( nodeText );
				} );
			}
			return this;
		},
		/**
		 * Remove the set of matched elements from the DOM. <br />
		 * Similar to .empty(), the .remove() method takes elements out of the DOM. Use .remove() when you want to remove the element itself, as well as everything inside it. In addition to the elements themselves, all bound events and aQuery data associated with the elements are removed. To remove the elements without removing data and events, use .detach() instead.
		 * @param {String}
		 * @returns {this}
		 */
		remove: function( selector, keepData ) {
			var ele,
				i = 0;

			for ( ;
				( ele = this[ i ] ) != null; i++ ) {
				dom.remove( ele, selector, keepData );
			}

			return this;
		},
		/**
		 * Remove the set of matched elements from the DOM. <br />
		 * The .detach() method is the same as .remove(), except that .detach() keeps all aQuery data associated with the removed elements. This method is useful when removed elements are to be reinserted into the DOM at a later time.
		 * @param {String}
		 * @returns {this}
		 */
		detach: function( selector ) {
			return this.remove( selector, true );
		},
		/**
		 * Remove all child nodes of the set of matched elements from the DOM.
		 * @returns {this}
		 */
		empty: function() {
			var ele,
				i = 0;

			for ( ;
				( ele = this[ i ] ) != null; i++ ) {
				// Remove eleent nodes and prevent memory leaks
				if ( ele.nodeType === 1 ) {
					dom.cleanData( getAll( ele, false ) );
				}

				// Remove any remaining nodes
				while ( ele.firstChild ) {
					ele.removeChild( ele.firstChild );
				}

				// If this is a select, ensure that it displays empty (#12336)
				// Support: IE<9
				if ( ele.options && typed.isNode( ele, "select" ) ) {
					ele.options.length = 0;
				}
			}

			return this;
		},

		/** @inner */
		domManip: function( args, table, callback ) {
			// Flatten any nested arrays
			args = [].concat.apply( [], args );

			var first, node, hasScripts,
				scripts, doc, fragment,
				i = 0,
				l = this.length,
				set = this,
				iNoClone = l - 1,
				value = args[ 0 ],
				isFunction = typed.isFun( value );

			// We can't cloneNode fragments that contain checked, in WebKit
			if ( isFunction || !( l <= 1 || typeof value !== "string" || support.checkClone || !rchecked.test( value ) ) ) {
				return this.each( function( html, index ) {
					var self = set.eq( index );
					if ( isFunction ) {
						args[ 0 ] = value.call( this, index, table ? self.html() : undefined );
					}
					self.domManip( args, table, callback );
				} );
			}

			if ( l ) {
				fragment = dom.buildFragment( args, this[ 0 ].ownerDocument, false, this );
				first = fragment.firstChild;

				if ( fragment.childNodes.length === 1 ) {
					fragment = first;
				}

				if ( first ) {
					table = table && typed.isNode( first, "tr" );
					scripts = query.map( getAll( fragment, "script" ), disableScript );
					hasScripts = scripts.length;

					// Use the original fragment for the last item instead of the first because it can end up
					// being emptied incorrectly in certain situations (#8070).
					for ( ; i < l; i++ ) {
						node = fragment;

						if ( i !== iNoClone ) {
							node = dom.clone( node, true, true );

							// Keep references to cloned scripts for later restoration
							if ( hasScripts ) {
								$.merge( scripts, getAll( node, "script" ) );
							}
						}

						callback.call(
							table && typed.isNode( this[ i ], "table" ) ?
							findOrAppend( this[ i ], "tbody" ) :
							this[ i ],
							node,
							i
						);
					}

					// not support script
					if ( hasScripts ) {
						doc = scripts[ scripts.length - 1 ].ownerDocument;

						// Reenable scripts
						query.map( scripts, restoreScript );

						// Evaluate executable scripts on first document insertion
						for ( i = 0; i < hasScripts; i++ ) {
							node = scripts[ i ];
							if ( rscriptType.test( node.type || "" ) && !utilData.get( node, "globalEval" ) && query.contains( doc, node ) ) {

								if ( node.src ) {
									// Hope ajax is available...
									communicate.ajax( {
										url: node.src,
										type: "GET",
										dataType: "text",
										async: false,
										complete: function( script ) {
											eval( script );
										}
									} );

								} else {
									$.util.globalEval( ( node.text || node.textContent || node.innerHTML || "" ).replace( rcleanScript, "" ) );
								}
							}
						}
					}

					// Fix #11809: Avoid leaking memory
					fragment = first = null;
				}
			}

			return this;
		},
		/**
		 * Replace each target element with the set of matched elements. <br />
		 * The .replaceAll() method is corollary to .replaceWith(), but with the source and target reversed.
		 * @method replaceAll
		 * @memberOf aQuery.prototype
		 * @param target {DOMArguments}
		 * @returns {this}
		 */

		/**
		 * Replace each element in the set of matched elements with the provided new content and return the set of elements that was removed.
		 * @variation 1
		 * @method prepend
		 * @memberOf aQuery.prototype
		 * @param fn {Function} -  Function(). A function that returns content with which to replace the set of matched elements.
		 * @returns {this}
		 */

		/**
		 * Replace each element in the set of matched elements with the provided new content and return the set of elements that was removed.
		 * @param child {DOMArguments}
		 * @returns {this}
		 */
		replaceWith: function( value ) {
			var isFunc = typed.isFun( value );

			// Make sure that the elements are removed from the DOM before they are inserted
			// this can help fix replacing a parent with child elements
			if ( !isFunc && typeof value !== "string" ) {
				value = $( value ).not( this ).detach();
			}

			return this.domManip( [ value ], true, function( ele ) {
				var next = this.nextSibling,
					parent = this.parentNode;

				if ( parent ) {
					$( this ).remove();
					parent.insertBefore( ele, next );
				}
			} );
		},
		/**
		 * Wrap an HTML structure around all elements in the set of matched elements. <br />
		 * The .wrapAll() function can take any string or object that could be passed to the $() function to specify a DOM structure. This structure may be nested several levels deep, but should contain only one inmost element. The structure will be wrapped around all of the elements in the set of matched elements, as a single group.
		 * @param {DOMArguments}
		 * @returns {this}
		 */
		wrapAll: function( html ) {
			if ( typed.isFun( html ) ) {
				return this.each( function( ele, i ) {
					$( ele ).wrapAll( html.call( this, i ) );
				} );
			}

			if ( this[ 0 ] ) {
				// The elements to wrap the target around
				var wrap = $( html, this[ 0 ].ownerDocument ).eq( 0 ).clone( true );

				if ( this[ 0 ].parentNode ) {
					wrap.insertBefore( this[ 0 ] );
				}

				wrap.map( function() {
					var ele = this;

					while ( ele.firstChild && ele.firstChild.nodeType === 1 ) {
						ele = ele.firstChild;
					}

					return ele;
				} ).append( this );
			}

			return this;
		},
		/**
		 * Wrap an HTML structure around the content of each element in the set of matched elements. <br />
		 * @method wrapInner
		 * @variation 1
		 * @memberOf aQuery.prototype
		 * @param fn {Function} - Function(index)
		 * @returns {this}
		 */

		/**
		 * Wrap an HTML structure around the content of each element in the set of matched elements. <br />
		 * The .wrapInner() function can take any string or object that could be passed to the $() factory function to specify a DOM structure. This structure may be nested several levels deep, but should contain only one inmost element. The structure will be wrapped around the content of each of the elements in the set of matched elements.
		 * @param {DOMArguments}
		 * @returns {this}
		 */
		wrapInner: function( html ) {
			if ( typed.isFun( html ) ) {
				return this.each( function( ele, i ) {
					$( ele ).wrapInner( html.call( this, i ) );
				} );
			}

			return this.each( function( ele ) {
				var self = $( ele ),
					contents = self.contents();

				if ( contents.length ) {
					contents.wrapAll( html );

				} else {
					self.append( html );
				}
			} );
		},
		/**
		 * Wrap an HTML structure around each element in the set of matched elements.
		 * @method wrap
		 * @variation 1
		 * @memberOf aQuery.prototype
		 * @param fn {Function} - Function(index)
		 * @returns {this}
		 */

		/**
		 * Wrap an HTML structure around each element in the set of matched elements. <br />
		 * The .wrap() function can take any string or object that could be passed to the $() factory function to specify a DOM structure. This structure may be nested several levels deep, but should contain only one inmost element. A copy of this structure will be wrapped around each of the elements in the set of matched elements. This method returns the original set of elements for chaining purposes.
		 * @param {DOMArguments}
		 * @returns {this}
		 */
		wrap: function( html ) {
			var isFunction = typed.isFun( html );

			return this.each( function( ele, i ) {
				$( ele ).wrapAll( isFunction ? html.call( this, i ) : html );
			} );
		},
		/**
		 * Remove the parents of the set of matched elements from the DOM, leaving the matched elements in their place.
		 * The .unwrap() method removes the element's parent. This is effectively the inverse of the .wrap() method. The matched elements (and their siblings, if any) replace their parents within the DOM structure.
		 * @returns {this}
		 */
		unwrap: function() {
			this.parent().each( function( ele ) {
				if ( !typed.isNode( this, "body" ) ) {
					$( ele ).replaceWith( this.childNodes );
				}
			} );
			return this;
		}
	} );

	$.each( {
		appendTo: "append",
		prependTo: "prepend",
		insertBefore: "before",
		insertAfter: "after",
		replaceAll: "replaceWith"
	}, function( original, name ) {
		$.fn[ name ] = function( selector ) {
			var elems,
				i = 0,
				ret = [],
				insert = $( selector ),
				last = insert.length - 1;

			for ( ; i <= last; i++ ) {
				elems = i === last ? this : this.clone( true );
				$( insert[ i ] )[ original ]( elems );

				// Modern browsers can apply aQuery collections as arrays, but oldIE needs a .get()
				ret.push.apply( ret, elems.get() );
			}

			return $( ret );
		};
	} );

	$.interfaces.achieve( "constructorDom", function( type, dollar, cssObj, ele, parentNode ) {
		parentNode && ( typed.isEle( parentNode ) || typed.is$( parentNode ) ) && dollar.appendTo( parentNode );
	} );

	return dom;
} );