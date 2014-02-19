aQuery.define( "main/query", [ "lib/sizzle", "base/extend", "base/typed", "base/array" ], function( $, Sizzle, utilExtend, typed, array, undefined ) {
	"use strict";
	this.describe( "Depend Sizzle1.10.3" );
	$.module[ "lib/js/sizzle" ] = "Sizzle1.10.3";

	var core_deletedIds = [],
		core_concat = core_deletedIds.concat;

	var runtil = /Until$/,
		rparentsprev = /^(?:parents|prev(?:Until|All))/,
		isSimple = /^.[^:#\[\.,]*$/,
		rneedsContext = Sizzle.selectors.match.needsContext,
		// methods guaranteed to produce a unique set when starting from a unique set
		guaranteedUnique = {
			children: true,
			contents: true,
			next: true,
			prev: true
		};

	function winnow( elements, qualifier, keep ) {

		// Can't pass null or undefined to indexOf in Firefox 4
		// Set to 0 to skip string check
		qualifier = qualifier || 0;

		if ( typed.isFun( qualifier ) ) {
			return array.grep( elements, function( ele, i ) {
				var retVal = !! qualifier.call( ele, i, ele );
				return retVal === keep;
			} );

		} else if ( qualifier.nodeType ) {
			return array.grep( elements, function( ele ) {
				return ( ele === qualifier ) === keep;
			} );

		} else if ( typed.isStr( qualifier ) ) {
			var filtered = array.grep( elements, function( ele ) {
				return ele.nodeType === 1;
			} );

			if ( isSimple.test( qualifier ) ) {
				return $.filter( qualifier, filtered, !keep );
			} else {
				qualifier = $.filter( qualifier, filtered );
			}
		}

		return array.grep( elements, function( ele ) {
			return ( array.inArray( ele, qualifier ) >= 0 ) === keep;
		} );
	}
	/**
	 * @exports main/query
	 * @requires module:lib/js/sizzle
	 * @requires module:base/extend
	 * @requires module:base/typed
	 * @requires module:base/array
	 */
	var query = {
		expr: Sizzle.selectors,
		unique: Sizzle.uniqueSort,
		text: Sizzle.getText,

		/**
     * Element contains another.
     * @name contains
     * @memberOf module:main/query
		 * @method
     * @param a {Element}
     * @param b {Element}
     * @returns {Boolean}
		 */
		contains: Sizzle.contains,

		dir: function( ele, dir, until ) {
			var matched = [],
				cur = ele[ dir ];

			while ( cur && cur.nodeType !== 9 && ( until === undefined || cur.nodeType !== 1 || !$( cur ).is( until ) ) ) {
				if ( cur.nodeType === 1 ) {
					matched.push( cur );
				}
				cur = cur[ dir ];
			}
			return matched;
		},

		posterity: function( eles ) {
			/// <summary>获得所有的子元素</summary>
			/// <param name="eles" type="Element/ElementCollection/arr">从元素或元素数组或元素集合中获取</param>
			/// <param name="real" type="Boolean/Null">是否获得真元素，默认为真</param>
			/// <returns type="Array" />
			// if ( typed.isEle( eles ) )
			//   eles = [ eles ];
			return $.getEleByTag( "*", eles );
		},

		elementCollectionToArray: function( eles, real ) {
			/// <summary>把ElementCollection转换成arr[ele]</summary>
			/// <param name="eles" type="ElementCollection">元素集合</param>
			/// <param name="real" type="Boolean/undefined">是否获得真元素，默认为真</param>
			/// <returns type="Array" />
			var list = [];
			if ( typed.isEleConllection( eles ) ) {
				var real = real === undefined ? true : real;
				$.each( eles, function( ele ) {
					if ( real === false )
						list.push( ele );
					else if ( ele.nodeType != 3 && ele.nodeType != 8 )
						list.push( ele );
				}, this );
			}
			return list;
		},

		find: Sizzle,
		filter: function( expr, eles, not ) {
			if ( not ) {
				expr = ":not(" + expr + ")";
			}

			return eles.length === 1 ?
				$.find.matchesSelector( eles[ 0 ], expr ) ? [ eles[ 0 ] ] : [] :
				$.find.matches( expr, eles );
		},

		getEle: function( ele, context ) {
			/// <summary>通过各种筛选获得包含DOM元素的数组</summary>
			/// <param name="ele" type="Element/$/document/str">各种筛选</param>
			/// <param name="ele" type="Element/document/undefined">各种筛选</param>
			/// <returns type="Array" />
			var list = [],
				tmp;
			if ( typed.isStr( ele ) ) {
				ele = $.util.trim( ele );
				if ( /^<.*>$/.test( ele ) ) {
					list = $.elementCollectionToArray( $.createEle( ele ), false );
				} else {
					tmp = context || document;
					list = $.find( ele, tmp.documentElement || context );
				}
			} else if ( typed.isEle( ele ) )
				list = [ ele ];
			else if ( typed.isArr( ele ) ) {
				$.each( ele, function( result ) {
					typed.isEle( result ) && list.push( result );
				}, this );
				list = array.filterSame( list );
			} else if ( ele instanceof $ )
				list = ele.eles;
			else if ( typed.isEleConllection( ele ) ) {
				list = $.elementCollectionToArray( ele, true );
			} else if ( ele === document )
				list = [ ele.documentElement ];
			else if ( ele === window )
				list = [ window ]; //有风险的
			else if ( typed.isDoc( ele ) ) {
				list = [ ele.documentElement ];
			}

			return list;
		},
		getEleByClass: function( className, context ) {
			/// <summary>通过样式名获得DOM元素
			/// <para>返回为ele的arr集合</para>
			/// </summary>
			/// <param name="className" type="String">样式名</param>
			/// <param name="context" type="Element">从元素中获取</param>
			/// <returns type="Array" />
			return $.expr.find[ "CLASS" ]( className, context || document );
		},
		getEleById: function( id, context ) {
			/// <summary>通过ID获得一个DOM元素</summary>
			/// <param name="id" type="String">id</param>
			/// <param name="context" type="Document">document</param>
			/// <returns type="Element" />
			return $.expr.find[ "ID" ]( id, context || document );
		},
		getEleByTag: function( tag, context ) {
			/// <summary>通过标签名获得DOM元素</summary>
			/// <param name="tag" type="String">标签名</param>
			/// <param name="context" type="Element/ElementCollection/Array[Element]">从元素或元素集合中获取</param>
			/// <returns type="Array" />
			return $.expr.find[ "TAG" ]( tag, context || document );
		},

		getSelfIndex: function( ele ) {
			/// <summary>通过序号获得当前DOM元素某个真子DOM元素 从0开始</summary>
			/// <param name="ele" type="Element">dom元素</param>
			/// <returns type="Number" />
			var i = -1,
				node = ele.parentNode.firstChild;
			while ( node ) {
				if ( typed.isEle( node ) && i++ != undefined && node === ele ) {
					break;
				}
				node = node.nextSibling;
			}
			return i;
		},
		iterationPosterity: function( ele, fun ) {
			/// <summary>遍历当前元素的所有子元素并返回符合function条件的DOM元素集合</summary>
			/// <param name="ele" type="Element">DOM元素</param>
			/// <param name="fun" type="Function">筛选的方法</param>
			/// <returns type="Array" />
			return array.grep( $.posterity( ele ), function( child ) {
				return fun( child );
			} );
		},

		map: function( eles, callback, arg ) {
			var value,
				i = 0,
				length = eles.length,
				isArray = typed.isArrlike( eles ),
				ret = [];

			// Go through the array, translating each of the items to their
			if ( isArray ) {
				for ( ; i < length; i++ ) {
					value = callback( eles[ i ], i, arg );

					if ( value != null ) {
						ret[ ret.length ] = value;
					}
				}

				// Go through every key on the object,
			} else {
				for ( i in eles ) {
					value = callback( eles[ i ], i, arg );

					if ( value != null ) {
						ret[ ret.length ] = value;
					}
				}
			}

			// Flatten any nested arrays
			return core_concat.apply( [], ret );
		},

		sibling: function( n, ele ) {
			var r = [];

			for ( ; n; n = n.nextSibling ) {
				if ( n.nodeType === 1 && n !== ele ) {
					r.push( n );
				}
			}

			return r;
		}
	};

	$.extend( query );
	$.expr[ ":" ] = $.expr.pseudos;

	$.fn.extend( {
		posterity: function( query ) {
			/// <summary>返回当前对象的所有子元素</summary>
			/// <param name="str" type="String">字符串query</param>
			/// <param name="real" type="Boolean/Null">是否获得真元素，默认为真</param>
			/// <returns type="self" />
			var posterity = $.posterity( this.eles );
			if ( typed.isStr( query ) ) posterity = $.find( query, posterity );
			return $( posterity );
		},

		eq: function( i ) {
			/// <summary>返回元素序号的新$</summary>
			/// <param name="num1" type="Number/null">序号 缺省返回第一个</param>
			/// <param name="num2" type="Number/null">长度 返回当前序号后几个元素 缺省返回当前序号</param>
			/// <returns type="$" />
			var len = this.length,
				j = +i + ( i < 0 ? len : 0 );
			return j >= 0 && j < len ? $( this[ j ] ) : $( [] );
		},

		filter: function( str ) {
			/// <summary>筛选Element
			/// <para>返回arr第一项为查询语句</para>
			/// <para>返回arr第二项为元素数组</para>
			/// </summary>
			/// <param name="str" type="String/Function">字符串query或者筛选方法</param>
			/// <returns type="$" />

			return $( winnow( this, str, false ) );

		},
		find: function( selector ) {
			/// <summary>查询命令</summary>
			/// <param name="selector" type="String">查询字符串</param>
			/// <returns type="$" />
			var i, ret, self,
				len = this.length;

			if ( typeof selector !== "string" ) {
				self = this;
				return $( $( selector ).filter( function() {
					for ( i = 0; i < len; i++ ) {
						if ( Sizzle.contains( self[ i ], this ) ) {
							return true;
						}
					}
				} ) );
			}

			ret = [];
			for ( i = 0; i < len; i++ ) {
				$.find( selector, this[ i ], ret );
			}

			// Needed because $( selector, context ) becomes $( context ).find( selector )
			ret = $( len > 1 ? $.unique( ret ) : ret );
			ret.selector = ( this.selector ? this.selector + " " : "" ) + selector;
			return ret;
		},

		index: function( ele ) {
			/// <summary>返回当前对象的第一个元素在同辈元素中的index顺序</summary>
			/// <param name="real" type="Boolean/Null">是否获得真元素，默认为真</param>
			/// <returns type="Number" />
			if ( !ele ) {
				return ( this[ 0 ] && this[ 0 ].parentNode ) ? this.first().prevAll().length : -1;
			}

			// index in selector
			if ( typed.isStr( ele ) ) {
				return array.inArray( $( ele ), this[ 0 ] );
			}

			// Locate the position of the desired element
			return array.inArray(
				// If it receives a jQuery object, the first element is used
				this, typed.is$( ele ) ? ele[ 0 ] : ele );
		},
		is: function( str ) {
			/// <summary>返回筛选后的数组是否存在</summary>
			/// <param name="str" type="String">查询字符串</param>
			/// <returns type="Boolean" />
			return !!str && (
				typed.isStr( str ) ?
				rneedsContext.test( str ) ?
				$.find( str, this.context ).index( this[ 0 ] ) >= 0 :
				$.filter( str, this.eles ).length > 0 :
				this.filter( str ).length > 0 );
		},

		map: function( callback ) {
			return $( $.map( this, function( ele, i ) {
				return callback.call( ele, i, ele );
			} ) );
		},

		not: function( selector ) {
			return $( winnow( this, selector, false ) );
		}
	} );

	function sibling( cur, dir ) {
		do {
			cur = cur[ dir ];
		} while ( cur && cur.nodeType !== 1 );

		return cur;
	}

	$.each( {
		parent: function( ele ) {
			var parent = ele.parentNode;
			return parent && parent.nodeType !== 11 ? parent : null;
		},
		parents: function( ele ) {
			return $.dir( ele, "parentNode" );
		},
		parentsUntil: function( ele, i, until ) {
			return $.dir( ele, "parentNode", until );
		},
		next: function( ele ) {
			return sibling( ele, "nextSibling" );
		},
		prev: function( ele ) {
			return sibling( ele, "previousSibling" );
		},
		nextAll: function( ele ) {
			return $.dir( ele, "nextSibling" );
		},
		prevAll: function( ele ) {
			return $.dir( ele, "previousSibling" );
		},
		nextUntil: function( ele, i, until ) {
			return $.dir( ele, "nextSibling", until );
		},
		prevUntil: function( ele, i, until ) {
			return $.dir( ele, "previousSibling", until );
		},
		siblings: function( ele ) {
			return $.sibling( ( ele.parentNode || {} ).firstChild, ele );
		},
		children: function( ele ) {
			return $.sibling( ele.firstChild );
		},
		contents: function( ele ) {
			return $.nodeName( ele, "iframe" ) ?
				ele.contentDocument || ele.contentWindow.document :
				$.merge( [], ele.childNodes );
		}
	}, function( fn, name ) {
		$.fn[ name ] = function( until, selector ) {
			var ret = $.map( this, fn, until );

			if ( !runtil.test( name ) ) {
				selector = until;
			}

			if ( selector && typeof selector === "string" ) {
				ret = $.filter( selector, ret );
			}

			ret = this.length > 1 && !guaranteedUnique[ name ] ? $.unique( ret ) : ret;

			if ( this.length > 1 && rparentsprev.test( name ) ) {
				ret = ret.reverse();
			}

			return $( ret );
		};
	} );

	$.interfaces.achieve( "constructorQuery", function( type, a, b ) {
		return query.getEle( a, b );
	} );

	return query;
} );