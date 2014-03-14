aQuery.define( "main/dom", [ "base/typed", "base/extend", "base/array", "base/support", "main/data", "main/event", "main/query" ], function( $, typed, utilExtend, utilArray, support, utilData, event, query, undefined ) {
	"use strict";
  this.describe( "consult JQuery1.9.1" );
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

	var dom = {
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
					if ( typed.isObj( elem ) ) {
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

		contains: query.contains,

		getHtml: function( ele ) {
			/// <summary>获得元素的innerHTML</summary>
			/// <param name="ele" type="Element">element元素</param>
			/// <returns type="String" />
			return ele.innerHTML;
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

		remove: function( ele, selector, keepData ) {
			/// <summary>把元素从文档流里移除</summary>
			/// <param name="ele" type="Object">对象</param>
			/// <param name="selector" type="String">查询字符串</param>
			/// <param name="keepData" type="Boolean">是否保留数据</param>
			/// <returns type="self" />
			if ( !selector || query.filter( selector, [ ele ] ).length > 0 ) {
				if ( !keepData && ele.nodeType === 1 ) {
					$.each( getAll( ele ), function( ele ) {
						event.clearHandlers( ele );
						utilData.removeData( ele );
					} );
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
				dom.removeChild( ele, ele.childNodes[ i ] );
			}
			return this;
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
		}
	};

	$.fn.extend( {
		clone: function( dataAndEvents, deepDataAndEvents ) {
			dataAndEvents = dataAndEvents == null ? false : dataAndEvents;
			deepDataAndEvents = deepDataAndEvents == null ? dataAndEvents : deepDataAndEvents;
			return this.map( function() {
				return dom.clone( this, dataAndEvents, deepDataAndEvents );
			} );
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

		prepend: function() {
			return this.domManip( arguments, true, function( elem ) {
				if ( this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9 ) {
					this.insertBefore( elem, this.firstChild );
				}
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
					if ( typed.isEle( child ) ) {
						utilData.removeData( child );
						dom.remove( child );
					}
					//移除事件
				} );
				dom.setHtml( ele, str, bool );
			} )

			: dom.getHtml( this[ 0 ] );
		},

		after: function( refChild ) {
			/// <summary>添加某个元素到$后面
			/// </summary>
			/// <param name="refChild" type="String/Element/$">已有元素</param>
			/// <returns type="self" />
			return this.domManip( arguments, false, function( elem ) {
				if ( this.parentNode ) {
					this.parentNode.insertBefore( elem, this.nextSibling );
				}
			} );
		},
		before: function( refChild ) {
			/// <summary>添加某个元素到$前面
			/// </summary>
			/// <param name="father" type="Element/$">父元素</param>
			/// <param name="refChild" type="String/Element/$">已有元素</param>
			/// <returns type="self" />

			return this.domManip( arguments, false, function( elem ) {
				if ( this.parentNode ) {
					this.parentNode.insertBefore( elem, this );
				}
			} );
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

		removeChild: function( child ) {
			/// <summary>删除某个子元素</summary>
			/// <param name="child" type="Number/Element/$"></param>
			/// <returns type="self" />
			var temp;
			if ( typed.isNum( child ) ) this.each( function( ele ) {
				temp = dom.getRealChild( ele, child );
				event.clearHandlers( temp );
				utilData.removeData( temp );
				ele.removeChild( temp );

			} );
			else if ( typed.isEle( child ) ) {
				try {
					event.clearHandlers( child );
					utilData.removeData( child );
					this.eles[ 0 ].removeChild( child );
				} catch ( e ) {}
			} else if ( typed.is$( child ) ) this.each( function( ele ) {
				child.each( function( son ) {
					try {
						event.clearHandlers( son );
						utilData.removeData( son );
						ele.removeChild( son );
					} catch ( e ) {}
				} );
			} );
			return this;
		},
		removeChildren: function() {
			/// <summary>删除所有子元素</summary>
			/// <param name="child" type="Number/Element/$"></param>
			/// <returns type="self" />
			$.each( $.posterity( this.eles ), function( ele ) {
				event.clearHandlers( ele );
				utilData.removeData( ele );
			} );
			return this.each( function( ele ) {
				dom.removeChildren( ele );
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
						utilData.removeData( ele );
						event.clearHandlers( ele );
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
							utilData.removeData( ele1 );
							event.clearHandlers( ele1 );
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
						temp = dom.getRealChild( ele, child );
						ele.replaceChild( newNode, temp );
						utilData.removeData( temp );
						//移除事件
						return false;
					} catch ( e ) {}
				} );
				else if ( typed.isEle( child ) ) this.each( function( ele ) {
					try {
						ele.replaceChild( newNode, child );
						utilData.removeData( child );
						//移除事件
						return false;
					} catch ( e ) {}
				} );
				else if ( typed.is$( child ) ) this.each( function( ele ) {
					child.each( function( son ) {
						try {
							ele.replaceChild( newNode, son );
							utilData.removeData( son );
							//移除事件
							return false;
						} catch ( e ) {}
					} );
				} );
			}, this );
			return this;
		},

		remove: function( selector, keepData ) {
			var elem,
				i = 0;

			for ( ;
				( elem = this[ i ] ) != null; i++ ) {
				dom.remove( elem, selector, keepData );
			}

			return this;
		},

		detach: function( selector ) {
			return this.remove( selector, true );
		},

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
				return this.each( function( index ) {
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
					// if ( hasScripts ) {
					// 	doc = scripts[ scripts.length - 1 ].ownerDocument;

					// 	// Reenable scripts
					// 	query.map( scripts, restoreScript );

					// 	// Evaluate executable scripts on first document insertion
					// 	for ( i = 0; i < hasScripts; i++ ) {
					// 		node = scripts[ i ];
					// 		if ( rscriptType.test( node.type || "" ) && !jQuery._data( node, "globalEval" ) && jQuery.contains( doc, node ) ) {

					// 			if ( node.src ) {
					// 				// Hope ajax is available...
					// 				jQuery.ajax( {
					// 					url: node.src,
					// 					type: "GET",
					// 					dataType: "script",
					// 					async: false,
					// 					global: false,
					// 					"throws": true
					// 				} );
					// 			} else {
					// 				jQuery.globalEval( ( node.text || node.textContent || node.innerHTML || "" ).replace( rcleanScript, "" ) );
					// 			}
					// 		}
					// 	}
					// }

					// Fix #11809: Avoid leaking memory
					fragment = first = null;
				}
			}

			return this;
		},

		replaceWith: function( value ) {
			var isFunc = typed.isFun( value );

			// Make sure that the elements are removed from the DOM before they are inserted
			// this can help fix replacing a parent with child elements
			if ( !isFunc && typeof value !== "string" ) {
				value = $( value ).not( this ).detach();
			}

			return this.domManip( [ value ], true, function( elem ) {
				var next = this.nextSibling,
					parent = this.parentNode;

				if ( parent ) {
					$( this ).remove();
					parent.insertBefore( elem, next );
				}
			} );
		},

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

		wrap: function( html ) {
			var isFunction = typed.isFun( html );

			return this.each( function( ele, i ) {
				$( ele ).wrapAll( isFunction ? html.call( this, i ) : html );
			} );
		},

		unwrap: function() {
			return this.parent().each( function( ele ) {
				if ( !typed.isNode( this, "body" ) ) {
					$( ele ).replaceWith( this.childNodes );
				}
			} ).end();
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