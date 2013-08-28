aQuery.define( "main/dom", [ "base/typed", "base/extend", "base/array", "base/support", "base/client", "lib/sizzle", "main/data", "main/event", "main/query" ], function( $, typed, utilExtend, utilArray, support, client, sizzle, data, event, query, undefined ) {
	"use strict"; //启用严格模式
	var rnumnonpx = /^-?(?:\d*\.)?\d+(?!px)[^\d\s]+$/i,
		rmargin = /^margin/,
		rposition = /^(top|right|bottom|left)$/,
		rdisplayswap = /^(none|table(?!-c[ea]).+)/,
		rnumsplit = new RegExp( "^(" + $.reg.core_pnum + ")(.*)$", "i" ),
		rrelNum = new RegExp( "^([+-])=(" + $.reg.core_pnum + ")", "i" ),
		cssExpand = [ "Top", "Right", "Bottom", "Left" ],
		cssShow = {
			position: "absolute",
			visibility: "hidden",
			display: "block"
		},
		cssNumber = {
			"columnCount": true,
			"fillOpacity": true,
			"fontWeight": true,
			"lineHeight": true,
			"opacity": true,
			"orphans": true,
			"widows": true,
			"zIndex": true,
			"zoom": true
		};

	var getStyles,
		curCSS,
		cssProps = {
			float: support.cssFloat ? "cssFloat" : "styleFloat"
		};

	function getWidthOrHeight( ele, name, extra ) {
		var valueIsBorderBox = true,
			val = name === "width" ? ele.offsetWidth : ele.offsetHeight,
			styles = getStyles( ele ),
			isBorderBox = support.boxSizing && $.css( ele, "boxSizing", undefined, styles, false ) === "border-box";

		if ( val <= 0 || val == null ) {
			val = curCSS( ele, name, styles );
			if ( val < 0 || val == null ) {
				val = ele.style[ name ];
			}

			// Computed unit is not pixels. Stop here and return.
			if ( rnumnonpx.test( val ) ) {
				return val;
			}

			// we need the check for style in case a browser which returns unreliable values
			// for getComputedStyle silently falls back to the reliable ele.style
			valueIsBorderBox = isBorderBox && ( support.boxSizingReliable || val === ele.style[ name ] );

			// Normalize "", auto, and prepare for extra
			val = parseFloat( val ) || 0;
		}

		return ( val +
			augmentWidthOrHeight(
				ele,
				name,
				extra || ( isBorderBox ? "border" : "content" ),
				valueIsBorderBox,
				styles ) ) + "px";
	}

	function setPositiveNumber( elem, value, subtract ) {
		var matches = rnumsplit.exec( value );
		return matches ?
		// Guard against undefined "subtract", e.g., when used as in cssHooks
		Math.max( 0, matches[ 1 ] - ( subtract || 0 ) ) + ( matches[ 2 ] || "px" ) :
			value;
	}

	function augmentWidthOrHeight( elem, name, extra, isBorderBox, styles ) {
		var i = extra === ( isBorderBox ? "border" : "content" ) ?
		// If we already have the right measurement, avoid augmentation
		4 :
		// Otherwise initialize for horizontal or vertical properties
		name === "width" ? 1 : 0,

			val = 0;

		for ( ; i < 4; i += 2 ) {
			// both box models exclude margin, so add it if we want it
			if ( extra === "margin" ) {
				val += $.css( elem, extra + cssExpand[ i ], undefined, styles, true );
			}

			if ( isBorderBox ) {
				// border-box includes padding, so remove it if we want content
				if ( extra === "content" ) {
					val -= $.css( elem, "padding" + cssExpand[ i ], undefined, styles, true );
				}

				// at this point, extra isn't border nor margin, so remove border
				if ( extra !== "margin" ) {
					val -= $.css( elem, "border" + cssExpand[ i ] + "Width", undefined, styles, true );
				}
			} else {
				// at this point, extra isn't content, so add padding
				val += $.css( elem, "padding" + cssExpand[ i ], undefined, styles, true );

				// at this point, extra isn't content nor padding, so add border
				if ( extra !== "padding" ) {
					val += $.css( elem, "border" + cssExpand[ i ] + "Width", undefined, styles, true );
				}
			}
		}

		return val;
	}

	function getSize( ele, name, extra ) {
		extra = extra || "content";
		return ele.offsetWidth === 0 && rdisplayswap.test( $.css( ele, "display" ) ) ?
			$.swap( ele, cssShow, function( ) {
				return getWidthOrHeight( ele, name, extra );
			} ) : getWidthOrHeight( ele, name, extra );
	}

	function setSize( ele, name, value, extra ) {
		extra = extra || "content";
		var style = getStyles( ele );
		return setPositiveNumber( ele, value, extra ?
			augmentWidthOrHeight(
				ele,
				name,
				extra,
				support.boxSizing && $.css( ele, "boxSizing", undefined, style, false ) === "border-box",
				style ) : 0 );
	}

	if ( window.getComputedStyle ) {
		//quote from jquery1.9.0
		getStyles = function( elem ) {
			return window.getComputedStyle( elem, null );
		};

		curCSS = function( ele, name, _computed ) {
			var width, minWidth, maxWidth,
				computed = _computed || getStyles( ele ),
				// getPropertyValue is only needed for .css("filter") in IE9, see #12537
				ret = computed ? computed.getPropertyValue( name ) || computed[ name ] : undefined,
				style = ele.style;

			if ( computed ) {

				if ( ret === "" && !$.contains( ele.ownerDocument.documentElement, ele ) ) {
					ret = $.style( ele, name );
				}

				// A tribute to the "awesome hack by Dean Edwards"
				// Chrome < 17 and Safari 5.0 uses "computed value" instead of "used value" for margin-right
				// Safari 5.1.7 (at least) returns percentage for a larger set of values, but width seems to be reliably pixels
				// this is against the CSSOM draft spec: http://dev.w3.org/csswg/cssom/#resolved-values
				if ( rnumnonpx.test( ret ) && rmargin.test( name ) ) {

					// Remember the original values
					width = style.width;
					minWidth = style.minWidth;
					maxWidth = style.maxWidth;

					// Put in the new values to get a computed value out
					style.minWidth = style.maxWidth = style.width = ret;
					ret = computed.width;

					// Revert the changed values
					style.width = width;
					style.minWidth = minWidth;
					style.maxWidth = maxWidth;
				}
			}

			return ret;
		};
	} else if ( document.documentElement.currentStyle ) {
		getStyles = function( ele ) {
			return ele.currentStyle;
		};

		curCSS = function( ele, name, _computed ) {
			var left, rs, rsLeft,
				computed = _computed || getStyles( ele ),
				ret = computed ? computed[ name ] : undefined,
				style = ele.style;

			// Avoid setting ret to empty string here
			// so we don't default to auto
			if ( ret == null && style && style[ name ] ) {
				ret = style[ name ];
			}

			// From the awesome hack by Dean Edwards
			// http://erik.eae.net/archives/2007/07/27/18.54.15/#comment-102291

			// If we're not dealing with a regular pixel number
			// but a number that has a weird ending, we need to convert it to pixels
			// but not position css attributes, as those are proportional to the parent element instead
			// and we can't measure the parent instead because it might trigger a "stacking dolls" problem
			if ( rnumnonpx.test( ret ) && !rposition.test( name ) ) {

				// Remember the original values
				left = style.left;
				rs = ele.runtimeStyle;
				rsLeft = rs && rs.left;

				// Put in the new values to get a computed value out
				if ( rsLeft ) {
					rs.left = ele.currentStyle.left;
				}
				style.left = name === "fontSize" ? "1em" : ret;
				ret = style.pixelLeft + "px";

				// Revert the changed values
				style.left = left;
				if ( rsLeft ) {
					rs.left = rsLeft;
				}
			}

			return ret === "" ? "auto" : ret;
		};
	}

	var nodeNames = "abbr|article|aside|audio|bdi|canvas|data|datalist|details|figcaption|figure|footer|" +
		"header|hgroup|mark|meter|nav|output|progress|section|summary|time|video",
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
			safeFrag = document.createDocumentFragment( );

		if ( safeFrag.createElement ) {
			while ( list.length ) {
				safeFrag.createElement(
					list.pop( )
				);
			}
		}
		return safeFrag;
	}

	function getAll( context, tag ) {
		var elems, elem,
			i = 0,
			found = typeof context.getElementsByTagName !== undefined ? context.getElementsByTagName( tag || "*" ) :
				typeof context.querySelectorAll !== undefined ? context.querySelectorAll( tag || "*" ) :
				undefined;

		if ( !found ) {
			for ( found = [ ], elems = context.childNodes || context;
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
			data.data( elem, "globalEval", !refElements || data.data( refElements[ i ], "globalEval" ) );
		}
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

		nodeName = dest.nodeName.toLowerCase( );

		// IE6-8 copies events bound via attachEvent when using cloneNode.
		if ( !support.noCloneEvent ) {
			event.clearHandlers( dest );

			// Event data gets referenced instead of copied if the expando gets copied too
			dest.removeAttribute( data.expando );
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

		if ( dest.nodeType !== 1 || !data.hasData( src ) ) {
			return;
		}

		var oldData = data.data( src );
		var	curData = data.data( dest );

		event.cloneHandlers( dest, src );

		// if ( curData.data ) {
		$.extend( true, curData, oldData.data );
		// }
	}

	var dom = {
		buildFragment: function( elems, context, scripts, selection ) {
			var j, elem, contains,
				tmp, tag, tbody, wrap,
				l = elems.length,

				// Ensure a safe fragment
				safe = createSafeFragment( context ),

				nodes = [ ],
				i = 0;

			for ( ; i < l; i++ ) {
				elem = elems[ i ];

				if ( elem || elem === 0 ) {

					// Add nodes directly
					if ( typed.isObj( elem ) ) {
						$.merge( nodes, elem.nodeType ? [ elem ] : elem );

						// Convert non-html into a text node
					} else if ( !rhtml.test( elem ) ) {
						nodes.push( context.createTextNode( elem ) );

						// Convert html into DOM nodes
					} else {
						tmp = tmp || safe.appendChild( context.createElement( "div" ) );

						// Deserialize a standard representation
						tag = ( rtagName.exec( elem ) || [ "", "" ] )[ 1 ].toLowerCase( );
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

				contains = dom.contains( elem.ownerDocument, elem );

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

		clone: function( elem, dataAndEvents, deepDataAndEvents ) {
			var destElements, node, clone, i, srcElements,
				inPage = dom.contains( elem.ownerDocument, elem );

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
		css: function( ele, name, value, style, extra ) {
			/// <summary>为元素添加样式</summary>
			/// <param name="ele" type="Element">元素</param>
			/// <param name="name" type="String">样式名</param>
			/// <param name="value" type="str/num">值</param>
			/// <param name="style" type="Object">样式表</param>
			/// <param name="extra" type="Boolean">是否返回num</param>
			/// <returns type="self" />
			if ( !ele || ele.nodeType === 3 || ele.nodeType === 8 || !ele.style ) {
				return;
			}
			style = style || ele.style;

			var originName = $.util.camelCase( name );

			var hooks = cssHooks[ name ] || {};
			name = $.cssProps[ originName ] || ( $.cssProps[ originName ] = dom.vendorPropName( style, originName ) );

			if ( value == undefined ) {
				var val = hooks.get ? hooks.get( ele, name ) : curCSS( ele, name, style );
				if ( extra === "" || extra ) {
					var num = parseFloat( val );
					return extra === true || typed.isNumeric( num ) ? num || 0 : val;
				}
				return val;

			} else {
				var type = typeof value,
					ret;

				// convert relative number strings (+= or -=) to relative numbers. #7345
				if ( type === "string" && ( ret = rrelNum.exec( value ) ) ) {
					value = ( ret[ 1 ] + 1 ) * ret[ 2 ] + parseFloat( $.css( ele, name ) );
					type = "number";
				}

				// Make sure that NaN and null values aren't set. See: #7116
				if ( value == null || type === "number" && isNaN( value ) ) {
					return;
				}

				//If a number was passed in, add 'px' to the (except for certain CSS properties)
				if ( type === "number" && !cssNumber[ originName ] ) {
					value += "px";
				}

				if ( !support.clearCloneStyle && value === "" && name.indexOf( "background" ) === 0 ) {
					style[ name ] = "inherit";
				}

				if ( !hooks || !( "set" in hooks ) || ( value = hooks.set( ele, name, value ) ) !== undefined ) {
					try {
						style[ name ] = value;
					} catch ( e ) {}
				}

				// hooks["set"] ? hooks["set"].call($, ele, value) : (style[name] = value);

				return this;
			}
		},
		curCss: curCSS,
		cssProps: cssProps,
		style: function( ele, type, head ) {
			/// <summary>返回元素样式表中的某个样式</summary>
			/// <param name="ele" type="Element">element元素</param>
			/// <param name="type" type="String">样式名 缺省返回""</param>
			/// <param name="head" type="String">样式名的头 缺省则无</param>
			/// <returns type="String" />
			return dom.styleTable( ele )[ $.util.camelCase( type, head ) ];
		},
		styleTable: function( ele ) {
			/// <summary>返回元素样式表</summary>
			/// <param name="ele" type="Element">dom元素</param>
			/// <returns type="Object" />
			var style;
			if ( document.defaultView && document.defaultView.getComputedStyle ) style = document.defaultView.getComputedStyle( ele, null );
			else {
				style = ele.currentStyle;

			}
			return style;
		},

		contains: sizzle.contains,

		getHeight: function( ele ) {
			/// <summary>获得元素的高度
			/// </summary>
			//  <param name="ele" type="Element">element元素</param>
			/// <returns type="Number" />
			return dom.getWidth( ele, "height" );
		},
		getHtml: function( ele ) {
			/// <summary>获得元素的innerHTML</summary>
			/// <param name="ele" type="Element">element元素</param>
			/// <returns type="String" />
			return ele.innerHTML;
		},
		getInnerH: function( ele ) {
			/// <summary>返回元素的内高度
			/// </summary>
			/// <param name="ele" type="Element">dom元素</param>
			/// <returns type="Number" />
			return parseFloat( getSize( ele, "height", "padding" ) );
		},
		getInnerW: function( ele ) {
			/// <summary>返回元素的内宽度
			/// </summary>
			/// <param name="ele" type="Element">dom元素</param>
			/// <returns type="Number" />
			return parseFloat( getSize( ele, "width", "padding" ) );
		},
		getLastChild: function( ele ) {
			/// <summary>获得当前DOM元素的最后个真DOM元素</summary>
			/// <param name="ele" type="Element">dom元素</param>
			/// <returns type="Element" />
			var x = ele.lastChild;
			while ( x && !typed.isEle( x ) ) {
				x = x.previousSibling;
			}
			return x;
		},
		getLeft: function( ele ) {
			/// <summary>获得元素离左边框的总长度</summary>
			/// <param name="ele" type="Element">dom元素</param>
			/// <returns type="Number" />
			var l = ele.offsetLeft || 0,
				cur = ele.offsetParent;
			while ( cur != null ) {
				l += cur.offsetLeft;
				cur = cur.offsetParent;
			}
			return l;
		},
		getOffsetL: function( ele ) {
			/// <summary>返回元素的左边距离
			/// <para>left:相对于显示部分</para>
			/// </summary>
			/// <returns type="Number" />
			return ele.offsetLeft;
		},
		getOffsetT: function( ele ) {
			/// <summary>返回元素的顶边距离
			/// <para>top:相对于显示部分</para>
			/// </summary>
			/// <returns type="Number" />
			return ele.offsetTop;
		},
		getOpacity: function( ele ) {
			/// <summary>获得ele的透明度</summary>
			/// <param name="ele" type="Element">element元素</param>
			/// <returns type="Number" />

			var o;
			if ( support.opacity ) {
				o = $.styleTable( ele ).opacity;
				if ( o == "" || o == undefined ) {
					o = 1;
				} else {
					o = parseFloat( o );
				}
			} else {
				//return ele.style.filter ? (ele.style.filter.match(/\d+/)[0] / 100) : 1;
				var f = $.styleTable( ele ).filter;
				o = 1;
				if ( f ) {
					o = f.match( /\d+/ )[ 0 ] / 100;
				}

			}
			return o;
		},
		getPageSize: function( ) {
			/// <summary>返回页面大小
			/// <para>obj.width</para>
			/// <para>obj.height</para>
			/// </summary>
			/// <returns type="Object" />
			var pageH = window.innerHeight,
				pageW = window.innerWidth;
			if ( !typed.isNum( pageW ) ) {
				if ( document.compatMode == "CSS1Compat" ) {
					pageH = document.documentElement.clientHeight;
					pageW = document.documentElement.clientWidth;
				} else {
					pageH = document.body.clientHeight;
					pageW = document.body.clientWidth;
				}
			}
			return {
				width: pageW,
				height: pageH
			};
			//            return {
			//                width: window.innerWidth || document.body.clientWidth || document.body.offsetWidth,
			//                height: window.innerHeight || document.body.clientHeight || document.body.offsetHeight
			//            }
		},
		getRealChild: function( father, index ) {
			/// <summary>通过序号获得当前DOM元素某个真子DOM元素</summary>
			/// <param name="father" type="Element">dom元素</param>
			/// <param name="index" type="Number">序号</param>
			/// <returns type="Element" />
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
		getStyles: getStyles,
		getTop: function( ele ) {
			/// <summary>获得元素离上边框的总长度</summary>
			/// <param name="ele" type="Element">dom元素</param>
			/// <returns type="Number" />
			var t = ele.offsetTop || 0,
				cur = ele.offsetParent;
			while ( cur != null ) {
				t += cur.offsetTop;
				cur = cur.offsetParent;
			}
			return t;
		},
		getOuterH: function( ele, bol ) {
			/// <summary>返回元素的外高度
			/// </summary>
			/// <param name="ele" type="Element">dom元素</param>
			/// <param name="bol" type="bol">margin是否计算在内</param>
			/// <returns type="Number" />
			return parseFloat( getSize( ele, "height", bol === true ? "margin" : "border" ) );
		},
		getOuterW: function( ele, bol ) {
			/// <summary>返回元素的外宽度
			/// </summary>
			/// <param name="ele" type="Element">dom元素</param>
			/// <param name="bol" type="bol">margin是否计算在内</param>
			/// <returns type="Number" />
			return parseFloat( getSize( ele, "width", bol === true ? "margin" : "border" ) );
		},
		getWidth: function( ele ) {
			/// <summary>获得元素的宽度
			/// </summary>
			//  <param name="ele" type="Element">element元素</param>
			/// <returns type="Number" />
			var name = arguments[ 1 ] ? "height" : "width",
				bName = name == "width" ? "Width" : "Height";
			if ( typed.isWindow( ele ) ) {
				return ele.document.documentElement[ "client" + bName ];
			}

			// Get document width or height
			if ( ele.nodeType === 9 ) {
				var doc = ele.documentElement;

				// Either scroll[Width/Height] or offset[Width/Height] or client[Width/Height], whichever is greatest
				// unfortunately, this causes bug #3838 in IE6/8 only, but there is currently no good, small way to fix it.
				return Math.max(
					ele.body[ "scroll" + bName ], doc[ "scroll" + bName ],
					ele.body[ "offset" + bName ], doc[ "offset" + bName ],
					doc[ "client" + bName ] );
			}
			return $.css( ele, name );
		},

		hide: function( ele, visible ) {
			/// <summary>隐藏元素</summary>
			/// <param name="ele" type="Element">element元素</param>
			/// <param name="visible" type="Boolean">true:隐藏后任然占据文档流中</param>
			/// <returns type="self" />
			if ( visible ) {
				ele.style.visibility = "hidden";
			} else {
				ele.style.dispaly && $.data( ele, "_visible_display", ele.style.dispaly );
				ele.style.display = "none";
			}

			//a ? this.css({ vi: "hidden" }) : this.css({ d: "none" })
			return this;
		},

		isVisible: function( ele ) {
			/// <summary>返回元素是否可见</summary>
			/// <param name="ele" type="Element">element元素</param>
			/// <returns type="Boolean" />
			var t = $.styleTable( ele );
			if ( t.display == "none" ) {
				return false;
			}
			if ( t.visibility == "hidden" ) {
				return false;
			}
			return true;
		},

		position: function( ele ) {
			/// <summary>返回元素的位置及大小;值都是offset
			/// <para>top:相对于父级</para>
			/// <para>left:相对于父级</para>
			/// <para>width:相对于显示部分</para>
			/// <para>height:相对于显示部分</para>
			/// <para>pageTop:相对于dom</para>
			/// <para>pageLeft:相对于dom</para>
			/// <para>scrollWidth:相对于整个大小</para>
			/// <para>scrollHeight:相对于整个大小</para>
			/// </summary>
			/// <returns type="Object" />
			var h = ele.offsetHeight || ele.clientHeight,
				w = ele.offsetWidth || ele.clientWidth;
			return {
				top: ele.offsetTop,
				left: ele.offsetLeft,
				height: h,
				width: w,
				scrollHeight: Math.max( ele.scrollHeight, h ),
				scrollWidth: Math.max( ele.scrollWidth, w ),
				pageLeft: $.getLeft( ele ),
				pageTop: $.getTop( ele )
			};
		},

		remove: function( ele ) {
			/// <summary>把元素从文档流里移除</summary>
			/// <param name="ele" type="Object">对象</param>
			/// <param name="isDelete" type="Boolean">是否彻底删除</param>
			/// <returns type="self" />
			if ( ele.parentNode ) {
				var parentNode = ele.parentNode;
				parentNode.removeChild( ele );
				if ( client.browser.ie678 ) {
					ele = null;
				}
			}
			return this;
		},
		removeChild: function( ele, child ) {
			/// <summary>删除子元素</summary>
			/// <param name="ele" type="Element"></param>
			/// <param name="child" type="Element"></param>
			/// <returns type="self" />
			ele.removeChild( child );
			return this;
		},
		removeChildren: function( ele ) {
			/// <summary>删除所有子元素</summary>
			/// <param name="ele" type="Element"></param>
			/// <returns type="self" />
			for ( var i = ele.childNodes.length - 1; i >= 0; i-- ) {
				$.removeChild( ele, ele.childNodes[ i ] );
			}
			return this;
		},

		setHeight: function( ele, value ) {
			/// <summary>设置元素的高度
			/// </summary>
			/// <param name="ele" type="Element">element元素</param>
			/// <param name="value" type="Number/String">值</param>
			/// <returns type="self" />
			return $.setWidth( ele, value, "height" );
		},
		setHtml: function( ele, str, bool ) {
			/// <summary>设置元素的innerHTML
			/// <para>IE678的的select.innerHTML("<option></option>")存在问题</para>
			/// <para>bool为true相当于+=这样做是有风险的，除了IE678外的浏览器会重置为过去的文档流</para>
			/// </summary>
			/// <param name="ele" type="Element">element元素</param>
			/// <param name="str" type="String">缺省 则返回innerHTML</param>
			/// <param name="bool" type="Boolean">true添加 false覆盖</param>
			/// <returns type="self" />
			if ( bool == true ) {
				ele.innerHTML += str;
			} else {
				ele.innerHTML = str;
			}
			return this;
		},
		setInterval: function( fun, delay, context ) {
			/// <summary>绑定作用域的Interval一样会返回一个ID以便clear</summary>
			/// <param name="fun" type="Function">方法</param>
			/// <param name="delay" type="Number">时间毫秒为单位</param>
			/// <param name="context" type="Object">作用域缺省为winodw</param>
			/// <returns type="Number" />
			return setInterval( $.bind( fun, context ), delay );
		},
		setOpacity: function( ele, alpha ) {
			/// <summary>改变ele的透明度
			/// </summary>
			/// <param name="ele" type="Element">element元素</param>
			/// <param name="alpha" type="Number">0-1</param>
			/// <returns type="self" />
			alpha = $.between( 0, 1, alpha );
			if ( client.browser.ie678 ) ele.style.filter = "Alpha(opacity=" + ( alpha * 100 ) + ")"; //progid:DXImageTransform.Microsoft.
			else ele.style.opacity = alpha;
			return this;

		},
		setInnerH: function( ele, height ) {
			/// <summary>设置元素的内高度
			/// <para>height:相对于显示部分</para>
			/// </summary>
			/// <param name="ele" type="Element">element元素</param>
			/// <param name="height" type="Number/String">值</param>
			/// <returns type="self" />
			ele.style.height = setSize( ele, "height", height, "padding" );
			return this;
		},
		setInnerW: function( ele, width ) {
			/// <summary>设置元素的内宽度
			/// <para>width:相对于显示部分</para>
			/// </summary>
			/// <param name="ele" type="Element">element元素</param>
			/// <param name="width" type="Number/String">值</param>
			/// <returns type="self" />
			ele.style.width = setSize( ele, "width", width, "padding" );
			return this;
		},
		setOffsetL: function( ele, left ) {
			/// <summary>设置元素左边距
			/// <para>left:相对于显示部分</para>
			/// <para>单位默认为px</para>
			/// </summary>
			/// <param name="ele" type="Element">element元素</param>
			/// <param name="left" type="Number/String/undefined">值 可缺省 缺省则返回</param>
			/// <returns type="self" />
			switch ( typeof left ) {
				case "number":
					left += "px";
					ele.style.left = left;
					break;
				case "string":
					ele.style.left = left;
					break;
			}
			return this;
		},
		setOffsetT: function( ele, top ) {
			/// <summary>设置元素左边距
			/// <para>left:相对于显示部分</para>
			/// <para>单位默认为px</para>
			/// </summary>
			/// <param name="ele" type="Element">element元素</param>
			/// <param name="left" type="Number/String/undefined">值 可缺省 缺省则返回</param>
			/// <returns type="self" />
			switch ( typeof top ) {
				case "number":
					top += "px";
					ele.style.top = top;
					break;
				case "string":
					ele.style.top = top;
					break;
			}

			return this;
		},
		setOuterH: function( ele, height, bol ) {
			/// <summary>设置元素的外高度
			/// </summary>
			/// <param name="ele" type="Element">element元素</param>
			/// <param name="height" type="Number/String">值</param>
			/// <param name="bol" type="Boolean">是否包括margin</param>
			/// <returns type="self" />
			ele.style.height = setSize( ele, "height", height, bol === true ? "margin" : "border" );
			return this;
		},
		setOuterW: function( ele, width, bol ) {
			/// <summary>设置元素的外宽度
			/// </summary>
			/// <param name="ele" type="Element">element元素</param>
			/// <param name="width" type="Number/String">值</param>
			/// <param name="bol" type="Boolean">是否包括margin</param>
			/// <returns type="self" />
			ele.style.width = setSize( ele, "width", width, bol === true ? "margin" : "border" );
			return this;
		},
		show: function( ele ) {
			/// <summary>显示元素</summary>
			/// <param name="ele" type="Element">element元素</param>
			/// <returns type="self" />
			var s = ele.style,
				n = "none",
				h = "hidden",
				nEle, v;
			if ( $.curCss( ele, "display" ) == n ) {
				v = $.data( ele, "_visible_display" );
				if ( !v ) {
					nEle = $.createEle( ele.tagName );
					if ( ele.parentNode ) {
						document.body.appendChild( nEle );
					}
					v = $.curCss( nEle, "display" ) || "";
					document.body.removeChild( nEle );
					nEle = null;
				}

				s.display = v;
			}
			if ( $.curCss( ele, "visibility" ) == h ) {
				s.visibility = "visible";
			}

			return this;
		},
		setWidth: function( ele, value ) {
			/// <summary>设置元素的宽度
			/// </summary>
			/// <param name="ele" type="Element">element元素</param>
			/// <param name="value" type="Number/String">值</param>
			/// <returns type="self" />
			var name = arguments[ 2 ] ? "height" : "width";

			$.css( ele, name, value );

			return this;
		},
		swap: function( ele, options, callback, args ) {
			var ret, name,
				old = {},
				style = ele.style;

			// Remember the old values, and insert the new ones

			for ( name in options ) {
				old[ name ] = style[ name ];
				style[ name ] = options[ name ];
			}

			ret = callback.apply( ele, args || [ ] );

			// Revert the old values
			utilExtend.easyExtend( style, old );

			return ret;
		}
	};

	$.fn.extend( {
		clone: function( dataAndEvents, deepDataAndEvents ) {
			dataAndEvents = dataAndEvents == null ? false : dataAndEvents;
			deepDataAndEvents = deepDataAndEvents == null ? dataAndEvents : deepDataAndEvents;
			return this.map( function( ) {
				return dom.clone( this );
			} );
		},
		css: function( style, value ) {
			/// <summary>添加或获得样式
			/// <para>如果要获得样式 返回为String</para>
			/// <para>fireFox10有个问题，请不要写成带-的形式</para>
			/// </summary>
			/// <param name="style" type="Object/String">obj为赋样式 str为获得一个样式</param>
			/// <param name="value" type="String/Number/undefined">当style是字符串，并且value存在</param>
			/// <returns type="self" />
			// var result, tmp;
			if ( typed.isObj( style ) ) {
				for ( var key in style ) {
					this.each( function( ele ) {
						$.css( ele, key, style[ key ] );
					} );
				}
			} else if ( typed.isStr( style ) ) {
				if ( value === undefined ) {
					return $.css( this[ 0 ], style );
				} else {
					this.each( function( ele ) {
						$.css( ele, style, value );
					} );
				}
			}
			return this;
		},
		curCss: function( name ) {
			/// <summary>返回样式原始值 可能有bug</summary>
			/// <param name="name" type="String">样式名</param>
			/// <returns type="any" />
			return $.curCss( this[ 0 ], name );
		},
		style: function( type, head ) {
			/// <summary>返回第一个元素样式表中的某个样式</summary>
			/// <param name="type" type="String">样式名 缺省返回""</param>
			/// <param name="head" type="String">样式名的头 缺省则无</param>
			/// <returns type="String" />

			return $.style( this[ 0 ], type, head );
		},
		styleTable: function( ) {
			/// <summary>返回第一个元素样式表</summary>
			/// <returns type="Object" />
			return $.styleTable( this[ 0 ] );
		},

		antonymVisible: function( a ) {
			/// <summary>添加兼容滚轮事件</summary>
			/// <param name="a" type="Boolean">如果隐藏，隐藏的种类，true表示任然占据文档流</param>
			/// <returns type="self" />
			if ( this.isVisible( ) ) this.hide( a );
			else this.show( );
			return this;
		},
		append: function( child ) {
			/// <summary>为$的第一个元素添加子元素
			/// <para>字符串是标签名:div</para>
			/// <para>DOM元素</para>
			/// <para>若为$，则为此$第一个元素添加另一个$的所有元素</para>
			/// <para>也可以为这种形式："<span></span><input/>"</para>
			/// <para>select去append("<option></option>")存在问题</para>
			/// <para>$({ i:"abc" }, "option")可以以这样方式实现</para>
			/// </summary>
			/// <param name="child" type="String/Element/$">子元素类型</param>
			/// <returns type="self" />

			var c = child,
				ele = this.eles[ 0 ];
			if ( !c ) return this;
			if ( typed.isStr( c ) ) {
				var str, childNodes, i = 0,
					len;
				str = c.match( /^<\w.+[\/>|<\/\w.>]$/ );
        // 若是写好的html还是使用parse.html
				if ( str ) {
					c = str[ 0 ];
					this.each( function( ele ) {

						childNodes = $.createEle( c );

						for ( i = 0, len = childNodes.length; i < len; i++ ) {
							ele.appendChild( childNodes[ i ] );
						}
						//delete div;
					} );
				}
			} else if ( typed.isEle( c ) || c.nodeType === 3 || c.nodeType === 8 ) ele.appendChild( c );
			else if ( typed.is$( c ) ) {
				c.each( function( son ) {
					ele.appendChild( son );
				} );
			}
			return this;
		},
		appendTo: function( father ) {
			/// <summary>添加当前的$所有元素到最前面
			/// <para>father为$添加的目标为第一个子元素</para>
			/// <para>father为ele则目标就是father</para>
			/// </summary>
			/// <param name="father" type="Element/$">父元素类型</param>
			/// <returns type="self" />
			var f = father;
			if ( typed.isEle( f ) ) {} else if ( typed.is$( f ) ) {
				f = f[ 0 ];
			} else {
				f = null;
			}
			if ( f ) {
				this.each( function( ele ) {
					f.appendChild( ele );
				} );
			}

			return this;
		},

		getLeft: function( ) {
			/// <summary>获得第一个元素离左边框的总长度
			/// <para>left:相对于父级</para>
			/// </summary>
			/// <returns type="Number" />
			return $.getLeft( this[ 0 ] );
		},
		getTop: function( ) {
			/// <summary>获得第一个元素离上边框的总长度
			/// <para>left:相对于父级</para>
			/// </summary>
			/// <returns type="Number" />
			return $.getTop( this[ 0 ] );
		},

		height: function( height ) {
			/// <summary>返回或设置第一个元素的高度
			/// </summary>
			/// <param name="height" type="Number/String">高度</param>
			/// <returns type="Number" />
			return typed.isNul( height ) ? parseFloat( $.getHeight( this[ 0 ] ) ) : this.each( function( ele ) {
				$.setHeight( ele, height );
			} );
		},
		html: function( str, bool ) {
			/// <summary>设置所有元素的innerHTML或返回第一元素的innerHTML
			/// <para>IE678的的select.innerHTML("<option></option>")存在问题</para>
			/// <para>$({ i:"abc" }, "option")可以以这样方式实现</para>
			/// <para>为true相当于+=这样做是有风险的，除了IE678外的浏览器会重置为过去的文档流</para>
			/// <para>获得时返回String</para>
			/// </summary>
			/// <param name="str" type="String">缺省 则返回innerHTML</param>
			/// <param name="bool" type="Boolean">true添加 false覆盖</param>
			/// <returns type="self" />
			return typed.isStr( str ) ?

			this.each( function( ele ) {
				$.each( $.posterity( ele ), function( child ) {
					$.removeData( child );
					$.remove( child );
					//移除事件
				} );
				$.setHtml( ele, str, bool );
			} )

			: $.getHtml( this[ 0 ] );
		},
		hide: function( visible ) {
			/// <summary>设置所有元素隐藏</summary>
			/// <param name="visible" type="Boolean">true:隐藏后任然占据文档流中</param>
			/// <returns type="self" />
			//            a ? this.css({ vi: "hidden" }) : this.css({ d: "none" })
			//            return this;
			return this.each( function( ele ) {
				$.hide( ele, visible );
			} );
		},

		innerHeight: function( height ) {
			/// <summary>返回或设置第一个元素内高度
			/// </summary>
			/// <param name="height" type="Number">高度</param>
			/// <returns type="Number" />
			return !typed.isNul( height ) ? this.each( function( ele ) {
				$.setInnerH( ele, height );
			} ) : $.getInnerH( this[ 0 ] );
		},
		innerWidth: function( width ) {
			/// <summary>返回第一个元素内宽度
			/// </summary>
			/// <param name="height" type="Number">宽度</param>
			/// <returns type="Number" />
			return !typed.isNul( width ) ? this.each( function( ele ) {
				$.setInnerW( ele, width );
			} ) : $.getInnerW( this[ 0 ] );
		},
		//Deprecated
		insertAfter: function( newChild, refChild ) {
			/// <summary>为$的某个元素后面加入子元素
			/// <para>字符串是标签名:div</para>
			/// <para>DOM元素</para>
			/// <para>若为$，则为此$第一个元素添加另一个$的所有元素</para>
			/// <para>也可以为这种形式：<span><span/><input /></para>
			/// <para>select去append("<option></option>")存在问题</para>
			/// <para>$({ i:"abc" }, "option")可以以这样方式实现</para>
			/// </summary>
			/// <param name="newChild" type="String/Element/$">新元素</param>
			/// <param name="refChild" type="String/Element/$">已有元素,若为$则以第一个为准</param>
			/// <returns type="self" />
			return $.insertBefore( newChild, refChild.nextSibling );
		},
		after: function( refChild ) {
			/// <summary>添加当前的$元素到添加到某个元素后面
			/// <para>father为$添加的目标为第一个子元素</para>
			/// <para>father为ele则目标就是father</para>
			/// </summary>
			/// <param name="refChild" type="String/Element/$">已有元素</param>
			/// <returns type="self" />
			return $.before( refChild.nextSibling );
		},
		//Deprecated
		insertBefore: function( newChild, refChild ) {
			/// <summary>为$的某个元素前面加入子元素
			/// <para>字符串是标签名:div</para>
			/// <para>DOM元素</para>
			/// <para>若为$，则为此$第一个元素添加另一个$的所有元素</para>
			/// <para>也可以为这种形式：<span><span/><input /></para>
			/// <para>select去append("<option></option>")存在问题</para>
			/// <para>$({ i:"abc" }, "option")可以以这样方式实现</para>
			/// </summary>
			/// <param name="newChild" type="String/Element/$">新元素</param>
			/// <param name="refChild" type="String/Element/$">已有元素,若为$则以第一个为准</param>
			/// <returns type="self" />
			var ele = this.eles[ 0 ];
			if ( !newChild ) return this;
			if ( typed.is$( refChild ) ) {
				refChild = refChild[ 0 ];
			}
			if ( typed.isStr( newChild ) ) {
				var str, childNodes, i = 0,
					len;
				str = newChild.match( /^<\w.+[\/>|<\/\w.>]$/ );
				if ( str ) {
					newChild = str[ 0 ];
					this.each( function( ele ) {
						childNodes = $.createEle( newChild );
						//div.innerHTML = c;
						for ( i = 0, len = childNodes.length; i < len; i++ ) {
							ele.insertBefore( childNodes[ i ], refChild );
						}
						//delete div;
					} );
				}
			} else if ( typed.isEle( newChild ) || newChild.nodeType === 3 || newChild.nodeType === 8 ) {
				ele.insertBefore( newChild, refChild );
			} else if ( typed.is$( newChild ) ) {
				newChild.each( function( newChild ) {
					ele.insertBefore( newChild, refChild );
				} );
			}
			return this;
		},
		before: function( refChild ) {
			/// <summary>添加当前的$元素到添加到某个元素前面
			/// <para>father为$添加的目标为第一个子元素</para>
			/// <para>father为ele则目标就是father</para>
			/// </summary>
			/// <param name="father" type="Element/$">父元素</param>
			/// <param name="refChild" type="String/Element/$">已有元素</param>
			/// <returns type="self" />

			if ( typed.is$( refChild ) ) {
				refChild = refChild[ 0 ];
			}

			this.each( function( ele ) {
				refChild.parentNode && refChild.parentNode.insertBefore( ele, refChild );
			} );

			return this;
		},
		insertText: function( str ) {
			/// <summary>给当前对象的所有ele插入TextNode</summary>
			/// <param name="str" type="String">字符串</param>
			/// <returns type="self" />
			if ( typed.isStr( str ) && str.length > 0 ) {
				var nodeText;
				this.each( function( ele ) {
					nodeText = document.createTextNode( str );
					ele.appendChild( nodeText );
				} );
			}
			return this;
		},
		isVisible: function( ) {
			/// <summary>返回元素是否可见</summary>
			/// <returns type="Boolean" />
			//            if (this.css("visibility") == "hidden")
			//                return false;
			//            if (this.css("d") == "none")
			//                return false;
			// return true;
			return $.isVisible( this[ 0 ] );
		},

		offsetLeft: function( left ) {
			/// <summary>获得或设置元素left
			/// <para>为数字时则返回this 设置left</para>
			/// <para>单位默认为px</para>
			/// </summary>
			/// <param name="left" type="num/any">宽度</param>
			/// <returns type="self" />
			return typed.isNum( left ) ? this.each( function( ele ) {
				$.setOffsetL( ele, left );
			} ) : $.getOffsetL( this[ 0 ] );
		},
		offsetTop: function( top ) {
			/// <summary>获得或设置元素top
			/// <para>为数字时则返回this 设置top</para>
			/// <para>单位默认为px</para>
			/// </summary>
			/// <param name="top" type="num/any">宽度</param>
			/// <returns type="self" />
			return typed.isNum( top ) ? this.each( function( ele ) {
				$.setOffsetT( ele, top );
			} ) : $.getOffsetT( this[ 0 ] );
		},
		opacity: function( alpha ) {
			/// <summary>设置当前对象所有元素的透明度或获取当前对象第一个元素的透明度
			/// <para>获得时返回Number</para>
			/// </summary>
			/// <param name="alpha" type="Number/null">透明度（0~1）可选，为空为获取透明度</param>
			/// <returns type="self" />
			return typed.isNum( alpha ) ? this.each( function( ele ) {
				$.setOpacity( ele, alpha );
			} ) : $.getOpacity( this[ 0 ] );
		},
		outerHeight: function( height, bol ) {
			/// <summary>返回或设置第一个元素的外高度
			/// </summary>
			/// <param name="height" type="Number">高度</param>
			/// <param name="bol" type="bol">margin是否计算在内</param>
			/// <returns type="Number" />
			if ( arguments.length == 1 && typed.isBol( height ) ) {
				bol = height;
				height = null;
			}
			return typed.isNul( height ) ? $.getOuterH( this[ 0 ], bol ) : this.each( function( ele ) {
				$.setOuterH( ele, height, bol );
			} );
		},
		outerWidth: function( width, bol ) {
			/// <summary>返回或设置第一个元素的外宽度
			/// </summary>
			/// <param name="width" type="Number">宽度</param>
			/// <returns type="Number" />
			if ( arguments.length == 1 && typed.isBol( width ) ) {
				bol = width;
				width = null;
			}
			return typed.isNul( width ) ? $.getOuterW( this[ 0 ], bol ) : this.each( function( ele ) {
				$.setOuterW( ele, width, bol );
			} );
		},

		position: function( ) {
			/// <summary>返回第一个元素的位置及大小;值都是offset
			/// <para>top:相对于父级</para>
			/// <para>left:相对于父级</para>
			/// <para>width:相对于显示部分</para>
			/// <para>height:相对于显示部分</para>
			/// <para>Top:相对于dom</para>
			/// <para>Left:相对于dom</para>
			/// <para>Width:相对于整个大小</para>
			/// <para>Height:相对于整个大小</para>
			/// </summary>
			/// <returns type="Object" />
			return $.position( this[ 0 ] );
		},

		remove: function( ) {
			/// <summary>把所有元素从文档流里移除并且移除所有子元素</summary>
			/// <returns type="self" />
			return this.each( function( ele ) {
				$.each( $.posterity( ele ), function( child ) {
					event.clearHandlers( child );
					$.removeData( child );
				} );
				event.clearHandlers( ele );
				$.removeData( ele );
				$.remove( ele );
			} );
		},
		removeChild: function( child ) {
			/// <summary>删除某个子元素</summary>
			/// <param name="child" type="Number/Element/$"></param>
			/// <returns type="self" />
			var temp;
			if ( typed.isNum( child ) ) this.each( function( ele ) {
				temp = $.getRealChild( ele, child );
				event.clearHandlers( temp );
				$.removeData( temp );
				ele.removeChild( temp );

			} );
			else if ( typed.isEle( child ) ) {
				try {
					event.clearHandlers( child );
					$.removeData( child );
					this.eles[ 0 ].removeChild( child );
				} catch ( e ) {}
			} else if ( typed.is$( child ) ) this.each( function( ele ) {
				child.each( function( son ) {
					try {
						event.clearHandlers( son );
						$.removeData( son );
						ele.removeChild( son );
					} catch ( e ) {}
				} );
			} );
			return this;
		},
		removeChildren: function( ) {
			/// <summary>删除所有子元素</summary>
			/// <param name="child" type="Number/Element/$"></param>
			/// <returns type="self" />
			$.each( $.posterity( this.eles ), function( ele ) {
				event.clearHandlers( ele );
				$.removeData( ele );
			} );
			return this.each( function( ele ) {
				$.removeChildren( ele );
			} );
		},
		replace: function( newChild ) {
			/// <summary>把所有元素替换成新元素</summary>
			/// <param name="newChild" type="Element/$">要替换的元素</param>
			/// <returns type="self" />
			var father;
			if ( typed.isEle( newChild ) ) {
				this.each( function( ele ) {
					father = ele.parentNode;
					try {
						father.replaceChild( newChild, ele );
						$.removeData( ele );
						//移除事件
						return false;
					} catch ( e ) {}
				} );
			} else if ( typed.is$( newChild ) ) {
				this.each( function( ele1 ) {
					father = ele1.parentNode;
					newChild.each( function( ele2 ) {
						try {
							father.replaceChild( ele2, ele1 );
							father.appendChild( ele2 );
							$.removeData( ele1 );
							//移除事件
						} catch ( e ) {}
					} );
				} );
			}
			return this;
		},
		replaceChild: function( newChild, child ) {
			/// <summary>替换子元素</summary>
			/// <param name="newChild" type="Element">新元素</param>
			/// <param name="child" type="Element">要替换的元素</param>
			/// <returns type="self" />
			newChild = $.getEle( newChild );
			var temp;
			$.each( newChild, function( newNode ) {
				if ( typed.isNum( child ) ) this.each( function( ele ) {
					try {
						temp = $.getRealChild( ele, child );
						ele.replaceChild( newNode, temp );
						$.removeData( temp );
						//移除事件
						return false;
					} catch ( e ) {}
				} );
				else if ( typed.isEle( child ) ) this.each( function( ele ) {
					try {
						ele.replaceChild( newNode, child );
						$.removeData( child );
						//移除事件
						return false;
					} catch ( e ) {}
				} );
				else if ( typed.is$( child ) ) this.each( function( ele ) {
					child.each( function( son ) {
						try {
							ele.replaceChild( newNode, son );
							$.removeData( son );
							//移除事件
							return false;
						} catch ( e ) {}
					} );
				} );
			}, this );
			return this;
		},

		scrollHeight: function( ) {
			/// <summary>返回第一个元素的高度
			/// <para>Height:相对于整个大小</para>
			/// </summary>
			/// <returns type="Number" />
			if ( client.browser.ie < 8 ) {
				return dom.swap( this[ 0 ], {
					"overflow": "scroll"
				}, function( ) {
					return this.scrollHeight || 0;
				} );
			}
			return this[ 0 ].scrollHeight || 0;
		},
		scrollWidth: function( ) {
			/// <summary>返回第一个元素的宽度
			/// <para>Width:相对于整个大小</para>
			/// </summary>
			/// <returns type="Number" />
			return this[ 0 ].scrollWidth || 0;
		},

		show: function( ) {
			/// <summary>显示所有元素</summary>
			/// <returns type="self" />
			//            if (this.css("visibility") == "hidden")
			//                this.css({ vi: "visible" });
			//            else if (this.css("d") == "none")
			//                this.css({ d: "" });
			//            return this;
			return this.each( function( ele ) {
				$.show( ele );
			} );
		},

		width: function( width ) {
			/// <summary>返回或设置第一个元素的宽度
			/// </summary>
			/// <param name="width" type="Number/String">宽度</param>
			/// <returns type="Number" />
			return typed.isNul( width ) ? parseFloat( $.getWidth( this[ 0 ] ) ) : this.each( function( ele ) {
				$.setWidth( ele, width );
			} );
		},

		wrapAll: function( html ) {
			if ( typed.isFun( html ) ) {
				return this.each( function( i ) {
					$( this ).wrapAll( html.call( this, i ) );
				} );
			}

			if ( this[ 0 ] ) {
				// The elements to wrap the target around
				var wrap = $( html, this[ 0 ].ownerDocument ).eq( 0 ).clone( true );

				if ( this[ 0 ].parentNode ) {
					wrap.insertBefore( this[ 0 ] );
				}

				wrap.map( function( ) {
					var elem = this;

					while ( elem.firstChild && elem.firstChild.nodeType === 1 ) {
						elem = elem.firstChild;
					}

					return elem;
				} ).append( this );
			}

			return this;
		},

		wrapInner: function( html ) {
			if ( typed.isFun( html ) ) {
				return this.each( function( i ) {
					$( this ).wrapInner( html.call( this, i ) );
				} );
			}

			return this.each( function( ) {
				var self = $( this ),
					contents = self.contents( );

				if ( contents.length ) {
					contents.wrapAll( html );

				} else {
					self.append( html );
				}
			} );
		},

		wrap: function( html ) {
			var isFunction = $.isFun( html );

			return this.each( function( i ) {
				$( this ).wrapAll( isFunction ? html.call( this, i ) : html );
			} );
		},

		unwrap: function( ) {
			return this.parent( ).each( function( ) {
				if ( !typed.isNode( this, "body" ) ) {
					$( this ).replaceWith( this.childNodes );
				}
			} ).end( );
		}
	} );

	var cssHooks = {
		"opacity": {
			"get": dom.getOpacity,
			"set": function( ele, name, value ) {
				dom.setOpacity( ele, value );
			}
		},
		"width": {
			"get": getSize,
			"set": setSize
		},
		"height": {
			"get": getSize,
			"set": setSize
		}
	};

	if ( !support.reliableMarginRight ) {
		cssHooks.marginRight = {
			get: function( elem ) {
				// WebKit Bug 13343 - getComputedStyle returns wrong value for margin-right
				// Work around by temporarily setting element display to inline-block
				return dom.swap( elem, {
						"display": "inline-block"
					},
					curCSS, [ elem, "marginRight" ] );
			}
		};
	}

	dom.cssHooks = cssHooks;

	$.extend( dom );

	// do not extend $
	dom.vendorPropName = function( style, name ) {
		return name;
	};

	$.interfaces.achieve( "constructorDom", function( type, dollar, cssObj, ele, parentNode ) {
		cssObj && dollar.css( cssObj );
		parentNode && ( typed.isEle( parentNode ) || typed.is$( parentNode ) ) && dollar.appendTo( parentNode );
	} );

	return dom;
}, "consult JQuery1.9.1" );