/*===================amdquery===========================*/
/**
 * @overview AMDQuery JavaScript Library
 * @copyright 2012, Cao Jun
 * @version 0.0.1
 */



( function( window, undefined ) {
	"use strict";
	var
	core_slice = [].slice,
		core_splice = [].splice,
		rsuffix = /\.[^\/\.]*$/g;

	/** @typedef {(DOMDocument|DOMElement)} Element */

	var
	version = "AMDQuery 0.0.1",
		/**
		 * @private
		 * @namespace util
		 */
		util = /** @lends util */ {
			/**
			 * Arguments to Array
			 * @param {Arguments}
			 * @param {Number} [start=0]
			 * @param {Number} [end=arguments.length]
			 * @returns {Array}
			 */
			argToArray: function( arg, start, end ) {
				return core_slice.call( arg, start || 0, end || arg.length );
			},
			/**
			 * Throw error
			 * @param {String} - Error message
			 * @param {String} [type="Error"]
			 * @returns {Error}
			 */
			error: function( info, type ) {
				var s = "";
				if ( info.fn && info.msg ) {
					s = [ "call ", info.fn, "()", " error: ", info.msg ].join( "" );
				} else {
					s = info.toString();
				}
				throw new window[ type || "Error" ]( s );
			},
			/**
			 * b extend a. Return object "a".
			 * @param {Object}
			 * @param {Object}
			 * @returns a
			 */
			extend: function( a, b ) {
				for ( var i in b )
					a[ i ] = b[ i ];
				return a;
			},
			/**
			 * Get config from current javascript tag
			 * @param {String[]} - List of attribute name
			 * @param {Boolean} - If true then asc
			 * @returns {Object}
			 */
			getJScriptConfig: function( list, asc ) {
				var _scripts = document.getElementsByTagName( "script" ),
					_script = _scripts[ asc === true ? 0 : _scripts.length - 1 ],
					i = 0,
					j = 0,
					item, attrs, attr, result = {};
				for ( ; item = list[ i++ ]; ) {
					attrs = ( _script.getAttribute( item ) || "" ).split( /;/ );
					if ( item == "src" ) {
						result[ item ] = attrs[ 0 ];
						break;
					}
					j = 0;
					result[ item ] = {};
					for ( ; attr = attrs[ j++ ]; ) {
						attr = attr.split( /:|=/ );
						if ( attr[ 1 ] ) {
							attr[ 1 ].match( /false|true|1|0/ ) && ( attr[ 1 ] = eval( attr[ 1 ] ) );
							result[ item ][ attr[ 0 ] ] = attr[ 1 ];
						}
					}
				}
				return result;
			},
			/**
			 * Get path of file
			 * @param {String} - like "myFile"
			 * @param {String} [suffix=".js"] - like ".js"
			 * @returns {String}
			 */
			getPath: function( key, suffix ) {
				var _key = key,
					_suffix = suffix,
					_aKey, _url, ma;
				if ( !_suffix ) {
					_suffix = ".js";
				}
				if ( ma = _key.match( rsuffix ) ) {
					_url = _key;
					if ( ma[ ma.length - 1 ] != _suffix ) {
						_url += _suffix;
					}
				} else {
					_url = basePath + "/" + _key + ( _suffix || ".js" );
				}
				if ( /^\//.test( _url ) ) {
					_url = rootPath + _url.replace( /\//, "" );
				} else if ( !/^[a-z]+?:\/\//.test( _url ) ) {
					_url = basePath + "/" + _url;
				}
				return _url;
			},
			/**
			 * Get now in milliseconds
			 * @returns {Number}
			 */
			now: function() {
				return Date.now();
			},
			/**
			 * Remove file suffix. "myFile.js" ==> "myfile"
			 * @param {String}
			 * @returns {String}
			 */
			removeSuffix: function( src ) {
				src = src.replace( /\/$/, "" );
				if ( src.match( rsuffix ) ) {
					src = src.replace( /\.[^\/\.]*$/, "" );
				}

				return src;
			}
		},
		count = 0,
		reg = RegExp,
		pagePath = document.location.toString().replace( /[^\/]+$/, "" ),
		basePath = ( function() {
			var ret = util.getJScriptConfig( [ "src" ] ).src.replace( /\/[^\/]+$/, "" );
			if ( !/^[a-z]+?:\/\//.test( ret ) ) {
				var sl = document.location.toString();
				if ( /^\//.test( ret ) ) {
					ret = sl.replace( /((.*?\/){3}).*$/, "$1" ) + ret.substr( 1 );
				} else {
					ret = sl.replace( /[^\/]+$/, "" ) + ret;
				}
			}
			return ret;
		}() ),
		/** {String} Project root path*/
		rootPath = basePath.replace( /((.*?\/){3}).*$/, "$1" ),
		runTime;

	/**
	 * <h3>
	 * Config of amdquery. <br />
	 * </h3>
	 * @public
	 * @module base/config
	 * @property {object}  config                              - exports.
	 * @property {object}  config.amdquery                     - The amdquery Configuration.
	 * @property {boolean} config.amdquery.debug               - Whether debug, it will be the output log if true.
	 * @property {boolean} config.amdquery.development         - Whether it is a development environment.
	 * @property {string}  config.amdquery.loadingImage        - A image src will be show when amdquery is loading.
	 *
	 * @property {object}  config.amd                          - The AMD Configuration.
	 * @property {boolean} config.amd.detectCR                 - Detect circular dependencies, you should set it true when you develop.
	 * @property {boolean} config.amd.debug                    - It will add "try-catch" when module load if false, so you could not see any error infomation.
	 * @property {number}  config.amd.timeout                  - Timeout of the loading module.
	 * @property {boolean} config.amd.console                  - It will be output log "module [id] ready" if true.
	 *
	 * @property {object}  config.ui                           - The widget-ui Configuration.
	 * @property {boolean} config.ui.initWidget                - Automatic initialization UI.
	 * @property {boolean} config.ui.autoFetchCss              - Automatic fetching CSS.
	 * @property {boolean} config.ui.isTransform3d             - Whether to use transform3d.
	 *
	 * @property {object}  config.module                       - The module Configuration.
	 * @property {object}  config.module.testLogByHTML         - Whether log by HTML when do test.
	 * @property {object}  config.module.compatibleEvent       - Whether compatible event, for example: e.srcElement || e.target.
	 *
	 * @property {object}  config.app                          - The application Configuration.
	 * @property {string}  config.app.src                      - A js file src, main of application.
	 * @property {boolean} config.app.debug                    - Whether debug, it will be the output log if true.
	 * @property {boolean} config.app.development              - Whether it is a development environment.
	 * @property {boolean} config.app.autoFetchCss             - Automatic fetching CSS.
	 * @property {string}  config.app.viewContentID            - ID of view content. "View.js" use it after build and set "config.app.development" false.
	 */

	var _config = {
		amdquery: {
			define: "$",
			debug: false,
			development: true,
			loadingImage: ""
		},
		amd: {
			detectCR: false,
			debug: true,
			timeout: 5000,
			console: false,
		},
		amdVariables: {

		},
		ui: {
			initWidget: false,
			autoFetchCss: true,
			isTransform3d: true
		},
		module: {
			testLogByHTML: false,
			compatibleEvent: false
		},
		app: {
			src: "",
			debug: false,
			development: true,
			autoFetchCss: true,
			viewContentID: ""
		}
	};
	var defineConfig = {};
	if ( typeof aQueryConfig != "undefined" && typeof aQueryConfig === "object" ) {
		defineConfig = aQueryConfig;
	} else {
		defineConfig = util.getJScriptConfig( [ "amdquery", "amd", "amdVariables", "ui", "module", "app" ] );
	}

	util.extend( _config.amdquery, defineConfig.amdquery );
	util.extend( _config.amd, defineConfig.amd );
	util.extend( _config.amdVariables, defineConfig.amdVariables );
	util.extend( _config.ui, defineConfig.ui );
	util.extend( _config.module, defineConfig.module );
	util.extend( _config.app, defineConfig.app );

	/**
	 * You can config global name. See <a target="_top" href="/document/app/asset/source/guide/AMDQuery.html#scrollTo=Reference_AMDQuery">AMDQuery.html</a> <br/>
	 * <strong>aQuery("div")</strong> equivalent to <strong>new aQuery("div")</strong>.
	 * @global
	 * @class
	 * @param {Object|String|Element|Element[]|Function}
	 * @param {String} [tagName="div"] - Tag name if a is a object.
	 * @param {Element} [parent] - Parent Element.
	 * @borrows util.getPath as getPath
	 * @borrows util.now as now
	 * @mixes module:main/query
	 * @example
	 * aQuery(function(){}); // Equivalent to ready(function(){}), see {@link module:base/ready}
	 * // should require("main/query")
	 * aQuery("div"); aQuery("#my"); aQuery(".title") // see {@link http://sizzlejs.com/}
	 * aQuery(div); aQuery([div, div]);
	 * aQuery(aQuery("div")); // another aQuery
	 * // should require("main/css")
	 * aQuery({height:100,width:100},"div"); // create a element "div", style is "height:100px;width:100px"
	 * aQuery(null,"a"); // create a element "a" without style
	 * // should require("main/dom")
	 * aQuery({height:100,width:100},"div", document.body); // create a element "div" and append to "body"
	 * aQuery(null,"div", document.body);
	 */
	var aQuery = function( elem, tagName, parent ) {
		if ( $.forinstance( this ) ) {
			if ( !elem && !tagName ) return;
			if ( ( typeof elem === "object" || elem === undefined || elem === null ) && typeof tagName == "string" ) {
				count++;
				if ( tagName === undefined || tagName === null ) tagName = "div";
				var obj = document.createElement( tagName );
				this.init( [ obj ] );

				$.interfaces.trigger( "constructorCSS", this, elem, tagName, parent );

				$.interfaces.trigger( "constructorDom", this, elem, tagName, parent );

				obj = null;

			} else if ( elem ) {
				var result;
				if ( result = $.interfaces.trigger( "constructorQuery", elem, tagName ) ) {
					count++;
					this.init( result, elem );

				}
			}
		} else if ( typeof elem == "function" ) {
			$.ready( elem );
		} else return new $( elem, tagName, parent );
	},
		$ = aQuery;

	var emptyFn = function() {}, error, logger, info, debug;
	if ( window.console && console.log.bind ) {
		logger = console.log.bind( console );
		error = console.error.bind( console );
		info = console.info.bind( console );
		debug = console.debug.bind( console );
	} else {
		logger = emptyFn;
		error = emptyFn;
		info = emptyFn;
		debug = emptyFn;
	}

	/**
	 * @callback EachCallback
	 * @param {*} - Item.
	 * @param {String|Number} - If iterate array then parameter is index. If iterate object then parameter is key.
	 */

	/**
	 * this is aQuery
	 * @callback AQueryEachCallback
	 * @this aQuery
	 * @param {Element} - element
	 * @param {Number} - index
	 */

	util.extend( $, /** @lends aQuery */ {
		/**
		 * Extend aQuery from Object.
		 * @param {Object}
		 * @returns {this}
		 * @example
		 * aQuery.extend( {
		 *   myFun: function(){}
		 * } );
		 * aQuery.myFun();
		 */
		extend: function( obj ) {
			util.extend( $, obj );
			return this;
		},
		/**
		 * Interfaces namesapce of aQuery. See interfaces.
		 * @private
		 */
		interfaces: {
			/**
			 * @param {String}
			 * @param {Function}
			 * @returns {this}
			 */
			achieve: function( name, fun ) {
				$.interfaces.handlers[ name ] = fun;
				return this;
			},
			/**
			 * @param {String}
			 * @returns {*}
			 */
			trigger: function( name ) {
				var item = $.interfaces.handlers[ name ];
				return item && item.apply( this, arguments );
			},
			handlers: {
				eventHooks: null,
				proxy: null,
				constructorCSS: null,
				constructorDom: null,
				constructorQuery: null
			}

		},
		/** Module map. */
		module: {},
		/**
		 * The return value of this method will be used to determine whether an instance of "aQuery".
		 * @returns "AMDQuery" */
		toString: function() {
			return "AMDQuery";
		},
		/**
		 * Return module infomation. see <a target="_top" href="/document/app/asset/source/guide/AMDQuery.html#scrollTo=AMD">AMDQuery.html</a>
		 * @returns {String}
		 */
		valueOf: function() {
			var info = [ version, "\n" ],
				value, key;
			for ( key in $.module ) {
				value = $.module[ key ];
				info.push( key, " : ", value, "\n" );
			}
			return info.join( "" );
		},
		/** {string} - Directory path of amdquery.js*/
		basePath: basePath,
		/** Get number between min and max.
		 * @param {Number}
		 * @param {Number}
		 * @param {Number}
		 * @returns {Number}
		 * @example
		 * aQuery.between( 1, 10, 5 ); // return 5
		 * aQuery.between( 1, 10, 1 ); // return 1
		 * aQuery.between( 1, 10, 123 ); // return 10
		 */
		between: function( min, max, num ) {
			return Math.max( min, Math.min( max, num ) );
		},
		/** Get number among number1 and number2.
		 * @param {Number}
		 * @param {Number}
		 * @param {Number}
		 * @returns {Number}
		 * @example
		 * aQuery.among( 1, 10, 5 ); // return 5
		 * aQuery.among( 10, 1, 7 ); // return 7
		 * aQuery.among( 10, 1, 123 ); // return 10
		 * aQuery.among( 10, 10, 15 ); // return 10
		 */
		among: function( num1, num2, num ) {
			return num2 > num1 ? $.between( num1, num2, num ) : $.between( num2, num1, num );
		},
		/** Bind context to function.
		 * @param {Function}
		 * @param {Object}
		 * @returns {Function}
		 */
		bind: function( fun, context ) {
			return function() {
				return fun.apply( context || window, arguments );
			};
		},
		/** wrap console.log if exists.
		 * @method logger
		 * @param {...String}
		 */
		logger: logger,
		/** wrap console.debug if exists.
		 * @method debug
		 * @param {...String}
		 */
		debug: debug,
		/** wrap console.info if exists.
		 * @method info
		 * @param {...String}
		 */
		info: info,
		/** wrap console.error if exists.
		 * @method error
		 * @param {...String}
		 */
		error: error,
		/** Create a elemnt by tag name.
		 * @param {String}
		 * @returns {Element}
		 */
		createEle: function( tag ) {
			return document.createElement( tag );
		},
		/** Iterate array or object.
		 * @param {Array|Object}
		 * @param {EachCallback}
		 * @param {Object=} - If context is undefinded, context of callback is each item.
		 * @returns {this}
		 */
		each: function( obj, callback, context ) {
			if ( !obj ) return this;
			var i = 0,
				item, len = obj.length,
				isObj = typeof len != "number" || typeof obj == "function";
			if ( isObj ) {
				for ( item in obj )
					if ( callback.call( context || obj[ item ], obj[ item ], item ) === false ) break;
			} else
				for ( var value = obj[ 0 ]; i < len && callback.call( context || value, value, i ) !== false; value = obj[ ++i ] ) {}
			return this;
		},
		/**
		 * Object is instance of aQuery.
		 * @param {*}
		 * @returns {Boolean}
		 */
		forinstance: function( obj ) {
			return obj instanceof $ || ( obj && obj.toString() == "AMDQuery" );
		},
		/**
		 * Merge second to first. Do not return a new Array but return "first" array.
		 * @param {Array}
		 * @param {Array}
		 * @returns {Array} Return "first"
		 */
		merge: function( first, second ) {
			var l = second.length,
				i = first.length,
				j = 0;

			if ( typeof l === "number" ) {
				for ( ; j < l; j++ ) {
					first[ i++ ] = second[ j ];
				}
			} else {
				while ( second[ j ] !== undefined ) {
					first[ i++ ] = second[ j++ ];
				}
			}

			first.length = i;

			return first;
		},
		getPath: util.getPath,
		now: util.now,
		/** Number RegExp. */
		core_pnum: /[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/.source,
		/** {String} Project root path. */
		rootPath: rootPath,
		/** {String} Page path. */
		pagePath: pagePath,

		/**
		 * @namespace
		 * @borrows util.argToArray as argToArray
		 * @borrows util.removeSuffix as removeSuffix
		 */
		util: {
			argToArray: util.argToArray,

			/**
			 * @param {String}
			 * @param {String} [head]
			 * @returns {String}
			 * @example
			 * aQuery.util.camelCase("margin-left") // return "marginLeft"
			 * aQuery.util.camelCase("border-redius", "webkit") // return "webkitBorderRedius"
			 */
			camelCase: function( name, head ) {
				name.indexOf( "-" ) > 0 ? name = name.toLowerCase().split( "-" ) : name = [ name ];

				head && name.splice( 0, 0, head );

				for ( var i = 1, item; i < name.length; i++ ) {
					item = name[ i ];
					name[ i ] = item.substr( 0, 1 ).toUpperCase() + item.slice( 1 );
				}
				return name.join( "" );
			},
			/**
			 * @param {String}
			 * @returns {String}
			 */
			trim: function( str ) {
				return str.replace( /(^\s*)|(\s*$)/g, "" );
			},
			/**
			 * @param {String}
			 * @param {String} [head]
			 * @returns {String}
			 * @example
			 * aQuery.util.unCamelCase("marginLeft") // return "margin-left"
			 * aQuery.util.unCamelCase("webkitBorderRedius") // return "webkit-border-redius"
			 */
			unCamelCase: function( name, head ) {
				name = name.replace( /([A-Z]|^ms)/g, "-$1" ).toLowerCase();
				head && ( name = head + "-" + name );
				return name;
			},
			/**
			 * Object.is is a proposed addition to the ECMA-262 standard
			 * @param {Object}
			 * @param {Object}
			 * @returns {Boolean}
			 * @example
			 * Object.is("foo", "foo");     // true
			 * Object.is(window, window);   // true
			 *
			 * Object.is("foo", "bar");     // false
			 * Object.is([], []);           // false
			 *
			 * var test = {a: 1};
			 * Object.is(test, test);       // true
			 *
			 * Object.is(null, null);       // true
			 *
			 * // Special Cases
			 * Object.is(0, -0);            // false
			 * Object.is(-0, -0);           // true
			 * Object.is(NaN, 0/0);         // true
			 */
			is: function( v1, v2 ) {
				if ( Object.is ) {
					return Object.is( v1, v2 );
				}
				if ( v1 === 0 && v2 === 0 ) {
					return 1 / v1 === 1 / v2;
				}
				if ( v1 !== v1 ) {
					return v2 !== v2;
				}
				return v1 === v2;
			},
			/**
			 * Object A is equal to Object B.
			 * @param {Object}
			 * @param {Object}
			 * @returns {Boolean}
			 * @example
			 * var a = { foo : { fu : "bar" } };
			 * var b = { foo : { fu : "bar" } };
			 * aQuery.util.isEqual(a, b) //return true
			 */
			isEqual: function( objA, objB ) {
				if ( this.is( objA, objB ) )
					return true;
				if ( objA.constructor !== objB.constructor )
					return false;
				var aMemberCount = 0;
				for ( var a in objA ) {
					if ( !objA.hasOwnProperty( a ) )
						continue;
					if ( typeof objA[ a ] === 'object' && typeof objB[ a ] === 'object' ? !$.util.isEqual( objA[ a ], objB[ a ] ) : objA[ a ] !== objB[ a ] )
						return false;
					++aMemberCount;
				}
				for ( var a in objB )
					if ( objB.hasOwnProperty( a ) )
					--aMemberCount;
				return aMemberCount ? false : true;
			},
			removeSuffix: util.removeSuffix,
			version: version
		}
	} );

	$.fn = $.prototype = /** @lends aQuery.prototype */ {
		/**
		 * Push element.
		 * @param {Element}
		 * @returns {this}
		 */
		push: function( ele ) {
			this.eles.push( ele );
			return this.init( this.eles );
		},
		/**
		 * Pop element.
		 * @returns {aQuery} return new aQuery(popElement)
		 */
		pop: function() {
			var ret = this.eles.pop();
			this.init( this.eles );
			return new $( ret );
		},
		/**
		 * Shift element.
		 * @returns {aQuery} return new aQuery(shiftElement)
		 */
		shift: function() {
			var ret = this.eles.shift();
			this.init( this.eles );
			return new $( ret );
		},
		/**
		 * Unshift element.
		 * @param {Element}
		 * @returns {aQuery} return new aQuery(this.eles.unshift(element))
		 */
		unshift: function( ele ) {
			return new $( this.eles.splice( 0, 0, ele ) );
		},
		/**
		 * Slice element.
		 * @param {Number} start
		 * @param {Number} [end]
		 * @returns {aQuery}
		 */
		slice: function() {
			return new $( core_slice.call( this.eles, arguments ) );
		},
		/**
		 * Splice element.
		 * @param {Number} index
		 * @param {Number} howmany
		 * @param {...*} [items]
		 * @returns {aQuery} return new $( ret )
		 */
		splice: function() {
			var ret = core_splice.call( this.eles, arguments );
			this.init( this.eles );
			return new $( ret );
		},
		/**
		 * @returns {this}
		 */
		reverse: function() {
			this.eles.reverse();
			return this.init( this.eles );
		},
		/**
		 * @param {Function=}
		 * @returns {this}
		 */
		sort: function( fn ) {
			this.eles.sort( fn );
			return this.init( this.eles );
		},
		constructor: $,
		/**
		 * Iterate array of aQuery.
		 * @param {AQueryEachCallback}
		 * @returns {this}
		 */
		each: function( callback ) {
			$.each( this.eles, callback, this );
			return this;
		},
		/**
		 * Extend aQuery prototype from parameters.
		 * @param [...Object]
		 * @returns {aQuery.prototype}
		 * @example
		 * aQuery.fn.extend( {
		 *   myFun: function(){}
		 * } );
		 * new aQuery().myFun();
		 */
		extend: function( params ) {
			for ( var i = 0, len = arguments.length, obj; i < len; i++ ) {
				obj = arguments[ i ];
				util.extend( $.prototype, obj );
			}
			return $.fn;
		},
		/**
		 * Return new aQuery of first element.
		 * @returns {aQuery}
		 */
		first: function() {
			return $( this.eles[ 0 ] );
		},
		/**
		 * @param {Number} [index=0]
		 * @returns {Element}
		 */
		getElement: function( index ) {
			if ( typeof index == "number" && index != 0 ) return this[ index ];
			else return this[ 0 ];
		},
		/**
		 * Return new aQuery of last element.
		 * @returns {aQuery}
		 */
		last: function() {
			return $( this.eles[ this.eles.length - 1 ] || this.eles );
		},
		/**
		 * @param {Element[]}
		 * @param {String=} -"#title", ".cls", "div".
		 * @returns {this}
		 */
		init: function( eles, selector ) {
			this.eles = null;
			this.context = null;
			this.selector = "";

			if ( this.eles ) this.each( function( ele, index ) {
				delete this[ index ];
			} );
			this.eles = eles;

			this.each( function( ele, index ) {
				this[ index ] = ele;
			} );
			this.length = eles.length;

			if ( typeof selector == "string" ) {
				this.selector = selector;
			}

			this.context = this[ 0 ] ? this[ 0 ].ownerDocument : document;
			return this;
		},
		/**
		 * @param {Element}
		 * @returns {Number} - -1 means not found.
		 */
		indexOf: function( ele ) {
			var len;

			for ( len = this.eles.length - 1; len >= 0; len-- ) {
				if ( ele === this.eles[ len ] ) {
					break;
				}
			}

			return len;
		},
		/**
		 * Array length
		 * @type {Number}
		 * @default 0
		 * @instance
		 */
		length: 0,
		selector: "",
		/**
		 * @param {Element[]}
		 * @returns {this}
		 */
		setElement: function( eles ) {
			this.eles = eles;
			return this.init( this.eles );
		},
		/**
		 * Array to stirng.
		 * @returns {String}
		 */
		toString: function() {
			return this.eles.toString();
		},
		/**
		 * Return count of aQuery be created.
		 * @returns {Number}
		 */
		valueOf: function() {
			return count;
		},
		/**
		 * Get a new array of this.eles .
		 * @returns {Array}
		 */
		toArray: function() {
			return core_slice.call( this );
		},
		/**
		 * Get the Nth element in the matched element set OR. <br/>
		 * Get the whole matched element set as a clean array.
		 * @param {?Number}
		 * @returns {Array|Element}
		 */
		get: function( num ) {
			return num == null ?

			// Return a 'clean' array
			this.toArray() :

			// Return just the object
			( num < 0 ? this[ this.length + num ] : this[ num ] );
		}
	};

	function Queue() {
		this.list = [];
	}

	Queue.prototype = {
		constructor: Queue,
		/**
		 * @public
		 * @this module:base/queue.prototype
		 * @method queue
		 * @memberOf module:base/queue.prototype
		 * @param {Function|Function[]} fn - Do some thing.
		 * @param {Object} [context] - Context of fn.
		 * @param {Array} [args] - Args is arguments of fn.
		 * @returns {this}
		 */
		queue: function( fn, context, args ) {
			if ( typeof fn == "function" ) {
				this.list.push( fn );
				if ( this.list[ 0 ] != "inprogress" ) {
					this.dequeue( context, args );
				}
			} else if ( fn && fn.constructor == Array ) {
				this.list = fn;
			}
			return this;
		},
		/**
		 * @public
		 * @method dequeue
		 * @memberOf module:base/queue.prototype
		 * @param {Object} [context=null] - Context of fn.
		 * @param {Array} [args=Array] args - Args is arguments of fn.
		 * @returns {this}
		 */
		dequeue: function( context, args ) {
			var fn = this.list.shift();
			if ( fn && fn === "inprogress" ) {
				fn = this.list.shift();
			}

			if ( fn ) {
				this.list.splice( 0, 0, "inprogress" );
				fn.apply( context || null, args || [] );
			}
			return this;

		},
		/**
		 * @public
		 * @method clearQueue
		 * @memberOf module:base/queue.prototype
		 * @returns {this}
		 */
		clearQueue: function() {
			return this.queue( [] );
		}
	};

	( function( /*require*/) {
		"use strict";
		$.module.require = "AMD";

		var _define, _require, _tempDefine = "__require";
		if ( window.define ) {
			$.logger( "window.define has defined" );
			_define = window.define;
		}
		if ( window.require ) {
			$.logger( "window.require has defined" );
			_require = window.require;
		}

		var requireQueue = new Queue();

		function ClassModule( module, dependencies, factory, status, container, fail ) {
			/**
			 * @memberOf module:base/ClassModule
			 * @constructs module:base/ClassModule
			 * @param {String} module - Module name.
			 * @param {Array} dependencies - Dependencies module.
			 * @param {Function|Object|String|Number|Boolean} [factory] - Module body.
			 * @param {Number} [status=0] - 0:init 1:queue 2:require 3:define 4:ready
			 * @param {String} [container] - Path of js.
			 * @param {Function} [fail] - An function to the fail callback if loading moudle timeout or error.
			 */
			if ( !module ) {
				return;
			}
			this.handlers = {};
			this.module = null;
			this.first = null;
			this.description = "No description";
			this.id = ClassModule.variable( module );
			$.module[ this.id ] = this.description;
			this.reset( dependencies, factory, status, container, fail );
			ClassModule.setModule( this.id, this );

			//this.check();
		}

		util.extend( ClassModule, {
			anonymousID: null,
			requireQueue: requireQueue,
			cache: {},
			/**
			 * A map to path ofmodule file.
			 * @type Object
			 * @memberOf module:base/ClassModule
			 */
			container: {},
			/**
			 * A map to module dependency.
			 * @type Object
			 * @memberOf module:base/ClassModule
			 */
			dependenciesMap: {},
			/**
			 * Check the name is equal to anonymous name which assigned by "require".
			 * @private
			 * @method
			 * @memberOf module:base/ClassModule
			 * @param {String} - Module name.
			 * @throws Will throw an error if the name is not equal anonymousID.
			 * @returns {void}
			 */
			checkName: function( id ) {
				if ( this.anonymousID != null && id.indexOf( "_tempDefine" ) < 0 ) {
					id !== this.anonymousID && util.error( {
						fn: "define",
						msg: "the named " + id + " is not equal require"
					} );
				}
			},
			/**
			 * ClassModule contains the module.
			 * @method
			 * @memberOf module:base/ClassModule
			 * @param {String} - Module name.
			 * @returns {Boolean}
			 */
			contains: function( id ) {
				id = ClassModule.variable( id );
				return !!ClassModule.modules[ id ];
			},
			/**
			 * Detect circle reference.
			 * @method
			 * @memberOf module:base/ClassModule
			 * @param {String} - Module name.
			 * @param {String[]} - Dependent modules.
			 * @returns {String} - Module name.
			 */
			detectCR: function( md, dp ) {
				if ( !md ) {
					return;
				}
				if ( dp && dp.constructor != Array ) {
					return;
				}
				var i, DM, dm, result, l = dp.length,
					dpm = ClassModule.dependenciesMap,
					mdp = ClassModule.mapDependencies;
				for ( i = 0; i < l; i++ ) {
					dm = dp[ i ];
					if ( dm === md ) {
						return dm;
					} //发现循环引用
					if ( !dpm[ md ] ) {
						dpm[ md ] = {};
					}
					if ( !mdp[ dm ] ) {
						mdp[ dm ] = {};
					}
					dpm[ md ][ dm ] = 1;
					mdp[ dm ][ md ] = 1; //建表
				}
				for ( DM in mdp[ md ] ) {
					result = ClassModule.detectCR( DM, dp ); //反向寻找
					if ( result ) {
						return result;
					}
				}
			},
			/**
			 * Wrap with a function.
			 * @method
			 * @memberOf module:base/ClassModule
			 * @param {*} - body.
			 * @returns {Function}
			 */
			funBody: function( body ) {
				//将factory强制转换为function类型，供ClassModule使用
				if ( !body ) {
					body = "";
				}
				switch ( typeof body ) {
					case "function":
						return body;
					case "string":
						return function() {
							return new String( body );
						};
					case "number":
						return function() {
							return new Number( body );
						};
					case "boolean":
						return function() {
							return new Boolean( body );
						};
					default:
						return function() {
							return body;
						};
				}
			},
			/**
			 * Get src of module file.
			 * @method
			 * @memberOf module:base/ClassModule
			 * @param {String} - Module name.
			 * @param {Boolean} [asc=true] - getJScriptConfig option.
			 * @returns {String} - Path.
			 */
			getContainer: function( id, asc ) {
				var src;
				if ( ClassModule.container[ id ] ) {
					src = ClassModule.container[ id ];
				} else {
					src = util.getJScriptConfig( [ "src" ], typeof asc == "boolean" ? asc : true ).src || "it is local"; //或者改成某个字段是 config里的
					id && ( ClassModule.container[ id ] = src );
				}
				return src;
			},
			/**
			 * modify module name to a file path.
			 * @method
			 * @memberOf module:base/ClassModule
			 * @param {String} - Module name.
			 * @param {String} [suffix=".js"]
			 * @returns {String} - Path.
			 */
			getPath: function( key, suffix ) {
				var ret, path, ma;
				key = ClassModule.variable( key );
				if ( path = ClassModule.maps[ key ] ) {} //do not match preffix
				else {
					path = key;
				}

				if ( _config.amd.rootPath ) {
					ma = key.match( /\.[^\/\.]*$/g );
					if ( !ma || ma[ ma.length - 1 ] != suffix ) {
						key += suffix;
					}
					ret = _config.amd.rootPath + key;
				} else {
					ret = util.getPath( path, suffix );
				}

				return ret;
			},
			/**
			 * Get Module with module.
			 * @method
			 * @memberOf module:base/ClassModule
			 * @param {String} - Module name.
			 * @returns {ClassModule}
			 */
			getModule: function( module ) {
				module = ClassModule.variable( module );
				return ClassModule.modules[ module ];
			},
			holdon: {},
			/**
			 * Load dependencies on asynchronous.
			 * @method
			 * @memberOf module:base/ClassModule
			 * @param {String[]} - An array of module name.
			 * @returns {this}
			 */
			loadDependencies: function( dependencies ) {
				var dep = dependencies,
					i = 0,
					len, item, module;
				if ( !dep || dep.constructor == Array || dep.length ) {
					return this;
				}
				setTimeout( function() {
					for ( len = dep.length; i < length; i++ ) {
						item = dep[ i ];
						module = ClassModule.getModule( item );
						if ( !module ) {
							require( item );
						} else if ( module.getStatus() == 2 ) {
							ClassModule.loadDependencies( module.dependencies );
						}
					}
				}, 0 );
				return this;
			},
			/**
			 * Load js file on asynchronous.
			 * @method
			 * @memberOf module:base/ClassModule
			 * @param {String} - Url of js.
			 * @param {String} - Module name.
			 * @param {Function} - An function to the fail callback if loading moudle timeout or error.
			 * @returns {this}
			 */
			loadJs: function( url, id, error ) {
				var module = ClassModule.getModule( id );
				//该模块已经载入过，不再继续加载，主要用于require与define在同一文件
				if ( ClassModule.resource[ url ] || ( module && ( module.getStatus() > 2 ) ) ) {
					return this;
				}

				ClassModule.resource[ url ] = id;

				var script = document.createElement( "script" ),
					head = document.getElementsByTagName( "HEAD" )[ 0 ],
					timeId;

				error && ( script.onerror = function() {
					clearTimeout( timeId );
					error();
				} );

				script.onload = script.onreadystatechange = function() {
					if ( !this.readyState || this.readyState == "loaded" || this.readyState == "complete" ) {
						clearTimeout( timeId );
						head.removeChild( script );
						head = null;
						script = null;
					}
				};

				script.setAttribute( "src", url );
				script.setAttribute( "type", "text/javascript" );
				script.setAttribute( "language", "javascript" );

				timeId = setTimeout( function() {
					error && error();
					head.removeChild( script );
					script = script.onerror = script.onload = error = head = null;
				}, _config.amd.timeout );

				head.insertBefore( script, head.firstChild );
				return this;
			},
			/**
			 * A map be depend.
			 * @type Object
			 * @memberOf module:base/ClassModule
			 */
			mapDependencies: {},
			maps: {},
			modules: {},
			namedModules: {},
			resource: {},
			rootPath: null,
			/**
			 * A map of path variable.
			 * @type Object
			 * @memberOf module:base/ClassModule
			 */
			variableMap: {},
			/**
			 * Variable prefix.
			 * @type String
			 * @default "@"
			 * @memberOf module:base/ClassModule
			 */
			variablePrefix: "@",
			/**
			 * Load js file on asynchronous.
			 * @method
			 * @memberOf module:base/ClassModule
			 * @param {String} - Url of js.
			 * @param {String} - Module name.
			 * @param {Function} - An function to the fail callback if loading moudle timeout or error.
			 * @returns {this}
			 */
			setModule: function( k, v ) {
				!this.getModule( k ) && ( this.modules[ k ] = v );
				return this;
			},
			/**
			 * Status map.
			 * @readonly
			 * @enum {String}
			 * @memberOf module:base/ClassModule
			 */
			statusReflect: {
				/** module created */
				0: "init",
				/** module in queue */
				1: "queue",
				/** module load dependent */
				2: "require",
				/** module is defined */
				3: "define",
				/** module ready */
				4: "ready"
			},
			/**
			 * @desc "@app/controller" to "mypath/app/controller" if match the "@app" in {@link module:base/ClassModule.variableMap} else return self
			 * @method
			 * @memberOf module:base/ClassModule
			 * @param {String} - Module name.
			 * @returns {String}
			 */
			variable: function( ret ) {
				var variableReg = new RegExp( "\\" + ClassModule.variablePrefix + "[^\\/]+", "g" ),
					variables = ret.match( variableReg );

				if ( variables && variables.length ) {
					for ( var i = variables.length - 1, path; i >= 0; i-- ) {
						path = require.variable( variables[ i ] );
						if ( path ) {
							ret = ret.replace( variables[ i ], path );
						}
					}
				}

				return ret;
			}
		} );

		/**
		 * @callback ClassModuleCallback
		 * @this module:base/ClassModule
		 * @param {...*} - An argument array of any object. Any one argument is defined in the module.
		 */

		ClassModule.prototype = /** @lends module:base/ClassModule.prototype */ {
			/**
			 * When completed, the param fn is called.
			 * @method
			 * @param {ClassModuleCallback} - Handler.
			 * @returns {this}
			 */
			addHandler: function( fn ) {
				if ( typeof fn == "function" ) {
					if ( this.status == 4 ) {
						fn.apply( this, this.module );
						return this;
					}
					var h = this.handlers[ this.id ];
					h == undefined && ( h = this.handlers[ this.id ] = [] );
					h.push( fn );
				}
				return this;
			},
			/**
			 * Check status then to do something.
			 * @method
			 * @protected
			 * @returns {this}
			 */
			check: function() {
				var status = this.getStatus(),
					dps = this.dependencies;
				switch ( status ) {
					case 4:
						this.holdReady().trigger();
						break;
					case 3:
						if ( !dps || !dps.length ) {
							this.getReady();
							break;
						}
					case 2:
					case 1:
					case 0:
						if ( dps.length == 1 && dps[ 0 ] === this.id ) {
							break;
						}
					default:
						var aDP = [],
							hd = ClassModule.holdon,
							i = 0,
							sMD, sDP, mDP;
						if ( status > 0 && _config.amd.detectCR == true ) {
							if ( sMD = ClassModule.detectCR( this.id, dps ) ) {
								util.error( {
									fn: "define",
									msg: "There is a circular reference between '" + sMD + "' and '" + dps + "'"
								}, "ReferenceError" );
								return;
							}
						}
						//加入holdon
						for ( ; sDP = dps[ i++ ]; ) { //有依赖自己的情况
							mDP = ClassModule.getModule( sDP );
							if ( !mDP || mDP.getStatus() != 4 ) {
								aDP.push( sDP );
								if ( hd[ sDP ] ) {
									hd[ sDP ].push( this.id );
								} else {
									hd[ sDP ] = [ this.id ];
								}
							}
						}
						//}
						if ( !aDP.length ) {
							//依赖貌似都准备好，尝试转正
							this.getReady();
						} else {
							//ClassModule.setModule(this);
							if ( status >= 2 ) { //深入加载依赖模块 <=1？
								this.loadDependencies();
							}
						}
						break;
				}
				return this;
			},
			constructor: ClassModule,
			/**
			 * Get an array of dependent modules.
			 * @method
			 * @returns {Array.<ModuleInfo>}
			 */
			getDependenciesArray: function() {
				var ret = [];
				if ( _config.amd.detectCR ) {
					var id = this.id,
						MD = ClassModule.dependenciesMap[ id ],
						DM, module = ClassModule.getModule( id );
					/**
					 * @typedef ModuleInfo
					 * @type {object}
					 * @property {String} name - Module name
					 * @property {String} status - Module status
					 * @property {String} container - Module path
					 */
					ret.push( {
						name: id,
						status: module.getStatus( 1 ),
						container: module.container
					} );
					for ( DM in MD ) {
						module = ClassModule.getModule( DM );
						ret.push( {
							name: DM,
							status: module.getStatus( 1 ),
							container: module.container
						} );
					}
				} else {
					$.logger( "getDependenciesArray", "you had to set require.detectCR true for getting map list" );
				}
				return ret;
			},
			/**
			 * Module ready and trigger handler.
			 * @protected
			 * @method
			 */
			getReady: function() {
				if ( this.status == 4 ) {
					return;
				}
				var dps = this.dependencies,
					l = dps.length,
					i = 0,
					dplist = [],
					id = this.id,
					sdp, md, map, exports;

				for ( ; i < l; i++ ) {
					md = ClassModule.getModule( dps[ i ] );
					//如果依赖模块未准备好，或依赖模块中还有待转正的模块，则当前模块也不能被转正
					if ( !md || md.status != 4 ) {
						return false;
					}
					dplist = dplist.concat( md.module );
				}
				this.setStatus( 4 );
				if ( _config.amd.debug ) {
					exports = this.factory.apply( this, dplist ) || {};
				} else {
					try {
						exports = this.factory.apply( this, dplist ) || {};
					} catch ( e ) {}
				}

				exports._AMD = {
					id: id,
					dependencies: dps,
					status: 4,
					//, todo: this.todo
					container: this.container,
					getDependenciesArray: this.getDependenciesArray
				};

				if ( exports && exports.constructor != Array ) {
					exports = [ exports ];
				};
				this.module = exports;
				this.first = exports[ 0 ];
				_config.amd.console && $.logger( "module " + id + " ready" );
				//_getMoudule(id, exports);
				//当传入的模块是已准备好的，开启转正机会
				this.holdReady().trigger();
			},
			/**
			 * Get stats of module.
			 * @method
			 * @param {Boolean} - If true get string else get number.
			 * @returns {Number|String}
			 */
			getStatus: function( isStr ) {
				var s = this.status;
				return isStr == true ? ClassModule.statusReflect[ s ] : s;
			},
			/**
			 * Describe module.
			 * @method
			 * @param {String}
			 * @returns {this}
			 */
			describe: function( content ) {
				this.description = content;
				$.module[ this.id ] = content;
				return this;
			},
			valueOf: function() {
				return this.description;
			},
			/**
			 * Wait module get ready.
			 * @method
			 * @protected
			 * @returns {this}
			 */
			holdReady: function() {
				var md, hd = ClassModule.holdon[ this.id ],
					MD = ClassModule.modules;
				if ( hd && hd.length ) {
					for ( ; md = MD[ hd.shift() ]; ) {
						md.getReady();
					}
				}
				return this;
			},
			/**
			 * Reset property.
			 * @method
			 * @protected
			 * @param {Array} dependencies - Dependencies module.
			 * @param {Function|Object|String|Number|Boolean} [factory] - Module body.
			 * @param {Number} [status=0] - 0:init 1:queue 2:require 3:define 4:ready
			 * @param {String} [container] - Path of js.
			 * @param {Function} [fail] - An function to the fail callback if loading moudle timeout or error.
			 * @returns {this}
			 */
			reset: function( dependencies, factory, status, container, fail ) {
				for ( var i = dependencies.length - 1; i >= 0; i-- ) {
					dependencies[ i ] = ClassModule.variable( dependencies[ i ] );
				}
				this.dependencies = dependencies;
				this.factory = factory;
				this.status = status || 0;
				this.container = container;
				this.fail = fail;
				return this;
			},
			/**
			 * Go to load Module/
			 * @method
			 * @returns {this}
			 */
			load: function() {
				var id = this.id,
					fail = this.fail,
					status = this.getStatus(),
					url;

				if ( id && /^(http(s?):\/\/)/i.test( id ) ) {
					if ( !rsuffix.test( id ) ) {
						url += id + ".js";
					} else {
						url = id;
					}
				} else {
					( url = ClassModule.getPath( id, ".js" ) ) || util.error( {
						fn: "require",
						msg: "Could not load module: " + id + ", Cannot match its URL"
					} );
				}

				//如果当前模块不是已知的具名模块，则设定它为正在处理中的模块，直到它的定义体出现
				//if (!namedModule) { ClassModule.anonymousID = id; } //这边赋值的时候应当是影射的
				this.setStatus( 2 );
				if ( !ClassModule.container[ id ] ) {
					ClassModule.container[ id ] = url;
				}

				if ( ClassModule.cache[ id ] ) {
					ClassModule.cache[ id ]();
				} else {
					ClassModule.loadJs( url, id, fail );
				}
				return this;
			},
			/**
			 * Go to load Dependent.
			 * @method
			 * @returns {this}
			 */
			loadDependencies: function() {
				var dep = this.dependencies,
					i = 0,
					len, item, module;
				if ( !( dep && dep.constructor == Array && dep.length ) ) {
					return this;
				}
				for ( len = dep.length; i < len; i++ ) {
					item = dep[ i ];
					module = ClassModule.getModule( item );
					if ( !module ) {
						require( item );
					}
				}
				return this;
			},
			/**
			 * Module go to launch.
			 * @method
			 * @param {Function} [success] - Ready callback.
			 * @returns {this}
			 */
			launch: function( success ) {
				this.addHandler( success );
				switch ( this.status ) {
					case 0:
						// this.check( );
						var namedModule = ClassModule.namedModules[ this.id ],
							self = this;
						if ( namedModule ) {
							this.load();
						} else {
							this.setStatus( 1 );
							requireQueue.queue( function() {
								if ( !ClassModule.anonymousID ) {
									ClassModule.anonymousID = self.id;
								}
								self.load();
							} );
						}
						break;
					case 4:
						this.check();
						break;

				}

				return this;
			},
			/**
			 * @method
			 * @protected
			 * @param {Number}
			 * @returns {this}
			 */
			setStatus: function( status ) {
				this.status = status;
				return this;
			},
			/**
			 * @method
			 * @protected
			 * @returns {Boolean}
			 */
			isReady: function() {
				return this.status === 4;
			},
			/**
			 * Trigger event.
			 * @method
			 * @protected
			 * @returns {this}
			 */
			trigger: function() {
				var h = this.handlers[ this.id ],
					item;
				if ( h && h.constructor == Array && this.getStatus() == 4 && this.module ) {

					for ( ; h.length && ( item = h.splice( 0, 1 ) ); ) {
						item[ 0 ].apply( this, this.module );
					}

				}
				return this;
			}
		}

		/**
		 * AMD define.
		 * @variation 1
		 * @global
		 * @method define
		 * @param id {*} - Not a string.
		 * @example
		 * define({});
		 * @returns {ClassModule}
		 */

		/**
		 * AMD define.
		 * @variation 2
		 * @global
		 * @method define
		 * @param id {String}
		 * @param factory {*}
		 * @example
		 * define("mymodule", function(){});
		 * @returns {ClassModule}
		 */

		/**
		 * AMD define.
		 * @variation 3
		 * @global
		 * @method define
		 * @param dependencies {string[]} - dependencies.
		 * @param factory {*} - Not a string.
		 * @example
		 * define(["base/array", "base/client"], {});
		 * @returns {ClassModule}
		 */

		/**
		 * AMD define.
		 * @global
		 * @method
		 * @param {String} - Module.
		 * @param {String[]} - If arguments[2] is a factory, it can be any object.
		 * @param {*} factory
		 * @example
		 * define("mymodule", ["base/array", "base/client"], function(){});
		 * @returns {ClassModule}
		 */
		window.define = function( id, dependencies, factory ) {
			var arg = arguments,
				ret, deep, body, container, status;

			switch ( arg.length ) {
				case 0:
					util.error( {
						fn: "window.define",
						msg: id + ":define something that cannot be null"
					}, "TypeError" );
					break;
				case 1:
					body = id;
					id = ClassModule.anonymousID; //_resource[container];
					dependencies = [];
					factory = ClassModule.funBody( body );
					break;
				case 2:
					if ( typeof arg[ 0 ] == "string" ) {
						id = id; //util.getJScriptConfig(["src"], true).src; //_tempId();_amdAnonymousID
						body = dependencies;
						dependencies = [];
					} else if ( arg[ 0 ] && arg[ 0 ].constructor == Array ) {
						var temp = id;
						id = ClassModule.anonymousID; //_resource[container]; // ; //_tempId();
						body = dependencies;
						dependencies = temp;
					} else {
						util.error( {
							fn: "define",
							msg: id + ":The first arguments should be String or Array"
						}, "TypeError" );
					}
					factory = ClassModule.funBody( body );
					break;
				default:
					if ( !( typeof arg[ 0 ] == "string" && arg[ 1 ] && arg[ 1 ].constructor == Array ) ) {
						util.error( {
							fn: "define",
							msg: id + ":two arguments ahead should be String and Array"
						}, "TypeError" );
					}
					factory = ClassModule.funBody( arg[ 2 ] );
			}
			id = ClassModule.variable( id );
			ClassModule.checkName( id );
			container = ClassModule.getContainer( id );
			if ( ret = ClassModule.getModule( id ) ) {
				deep = ret.getStatus();
				//container = deep != 0 ? ClassModule.getContainer(id) : null;
				ret.reset( dependencies, factory, 3, container );
			} else {
				container = RegExp( _tempDefine ).test( id ) ? "inner" : ClassModule.getContainer( id );
				ret = new ClassModule( id, dependencies, factory, 3, container );
			}

			var status = !ClassModule.namedModules[ id ] && deep == 2;

			if ( status ) {
				ClassModule.anonymousID = null;
			}

			ret.check();

			//if (!/_temp_/.test(id)) (container = ClassModule.getContainer(id)); //如果不是require定义的临时
			//执行请求队列
			if ( status ) {
				requireQueue.dequeue();
			}

			return ret;

		};

		define.amd = ClassModule.maps;


		function getTempDefine( module, fail ) {
			//如果请求一组模块则转换为对一个临时模块的定义与请求处理
			var ret;
			if ( module.constructor == Array ) {
				if ( !module.length ) {
					return;
				} else if ( module.length == 1 ) {
					module = module.join( "" );
				} else {
					var de = module;
					module = _tempDefine + ":" + module.join( "," );
					ret = ClassModule.getModule( module ) || define( module, de, function() {
						return util.argToArray( arguments );
					} );
				}
			}

			if ( typeof fail != "function" ) {
				fail = function() {
					util.error( {
						fn: "require",
						msg: module + ":Could not load , Cannot fetch the file"
					} );
				};
			}

			ret = ret || ClassModule.getModule( module ) || new ClassModule( module, [ module ], function() {
				return new String( module );
			}, 0, null, fail );

			return ret;
		}

		/**
		 *
		 * @public
		 * @namespace require
		 * @variation namespace
		 */

		/**
		 * AMD require.
		 * @method require
		 * @global
		 * @param {String} - Module.
		 * @param {ClassModuleCallback}
		 * @param {Function} [fail] - An function to the fail callback if loading moudle timeout or error.
		 * @returns {ClassModule}
		 * @example
		 * require( [ "main/query", "module/location", "ui/swapview", "ui/scrollableview" ], function( query, location ) { } );
		 * require( "main/query", function( query ) { } );
		 * require( "main/query" ).first // Maybe is null;
		 */
		window.require = function( module, success, fail ) {
			if ( !module ) {
				return;
			}

			var ret = getTempDefine( module, fail );

			success && typeof success != "function" && util.error( {
				fn: "require",
				msg: module + ":success should be a Function"
			}, "TypeError" );

			return ret.launch( success );
		};

		util.extend( require, {
			/**
			 * Cache the module.
			 * @memberOf require(namespace)
			 * @param {Object.<String,Function>} - String: module name,Function: moudle factory.
			 * @returns {this}
			 */
			cache: function( cache ) {
				var container = ClassModule.getContainer( null, ClassModule.amdAnonymousID ? true : false );
				//util.extend(ClassModule.cache, a.cache);
				for ( var i in cache ) {
					require.named( i );
					ClassModule.cache[ i ] = cache[ i ];
					ClassModule.container[ i ] = container;
				}
				return this;
			},
			/**
			 * The module named, so we can load it by async.
			 * @memberOf require(namespace)
			 * @param {String|String[]|Object.<String,*>} - String: module name.
			 * @returns {this}
			 */
			named: function( name ) {
				var i, b, n = name;
				if ( n && n.constructor == Array ) {
					for ( i = 0; b = n[ i++ ]; ) {
						ClassModule.namedModules[ b ] = 1;
					}
				} else if ( typeof n == "object" ) {
					for ( var b in n ) {
						ClassModule.namedModules[ b ] = 1;
					}
				} else if ( typeof n == "string" ) {
					ClassModule.namedModules[ n ] = 1;
				}
				return this;
			},
			/**
			 * Reflect path.
			 * @variation 1
			 * @method reflect
			 * @memberOf require(namespace)
			 * @param option {Object.<String,String>} - Object.<String,String>: <"module name", "js path">.
			 * @returns {this}
			 */

			/**
			 * Reflect path.
			 * @memberOf require(namespace)
			 * @param {String} - Module name.
			 * @param {String} [path] - JS path; If "name" is Object then "path" is optional.
			 * @returns {this}
			 */
			reflect: function( name, path ) {
				if ( typeof name == "object" ) {
					for ( var i in name ) {
						ClassModule.maps[ i ] = name[ i ];
					}
				} else if ( typeof name == "string" && typeof path == "string" ) {
					ClassModule.maps[ name ] = path;
				}

				return this;
			},
			/**
			 * @memberOf require(namespace)
			 * @param {String}
			 * @param {String}
			 * @returns {this}
			 * @example
			 * require.variable( "app", "my/path/to/app" )
			 */
			variable: function( name, path ) {
				if ( name.indexOf( ClassModule.variablePrefix ) != 0 ) {
					name = ClassModule.variablePrefix + name;
				}
				if ( path ) {
					ClassModule.variableMap[ name ] = path;
				} else {
					return ClassModule.variableMap[ name ];
				}
			}
		} );

		util.extend( $, /** @lends aQuery */ {
			/**
			 * aQuery define.<br/>
			 * If the last parameter is a function, then first argument of the function is aQuery(namespace).<br/>
			 * see {@link define}<br/>
			 * <a href="/document/app/app.html#navmenu=#AMDQuery!scrollTo=Require_Define" target="_parent">See also.</a>
			 * @param {String} - Module name
			 * @param {String[]|*} - If arguments[2] is a factory, it can be any object.
			 * @param {*} [factory] - Usually, it is function(){} or {}.
			 * @returns {this}
			 */
			define: function( id, dependencies, factory ) {
				var arg = util.argToArray( arguments, 0 ),
					len = arg.length,
					fn = arg[ len - 1 ];

				if ( typeof fn == "function" ) {
					arg[ arg.length - 1 ] = function() {
						var arg = util.argToArray( arguments, 0 );
						arg.splice( 0, 0, aQuery );
						if ( _config.amd.debug ) {
							return fn.apply( this, arg );
						} else {
							try {
								return fn.apply( this, arg );
							} finally {}
						}
					}

					window.define ? window.define.apply( null, arg ) : fn();
				}
				return this;
			},
			/**
			 * aQuery require.<br/>
			 * <a href="/document/app/app.html#navmenu=#AMDQuery!scrollTo=Require_Define" target="_top">See also.</a>
			 * @param {String} - Module.
			 * @param {ClassModuleCallback} - The callback Be call when aQuery ready.
			 * @param {Function} [fail] - An function to the fail callback if loading moudle timeout or error.
			 * @returns {this}
			 */
			require: function( dependencies, success, fail ) {
				window.require && $.ready( function() {
					window.require( dependencies, success, fail )
				} );
				return this;
			}
		} );

		for ( var name in _config.amdVariables ) {
			require.variable( name, _config.amdVariables[ name ] );
		}

		aQuery.define( "base/ClassModule", function( $ ) {
			/**
			 * Module Management
			 * @public
			 * @module base/ClassModule
			 */

			/**
			 * @public
			 * @alias module:base/ClassModule
			 * @constructor
			 */
			var exports = ClassModule;
			$.ClassModule = ClassModule;
			return exports;
		} );

	} )();

	aQuery.define( "base/config", function( $ ) {
		this.describe( "config of amdquery" );
		$.config = _config;
		return _config;
	} );

	aQuery.define( 'base/queue', function( $ ) {
		/**
		 * A module representing a queue.
		 * @public
		 * @module base/queue
		 */

		/**
		 * @public
		 * @alias module:base/queue
		 * @constructor
		 */
		var exports = Queue;
		$.Queue = Queue;
		return exports;
	} );

	aQuery.define( "base/Promise", function( $ ) {
		"use strict";
		this.describe( "Class Promise" );
		var checkArg = function( todo, fail, progress, name ) {
			var arg = util.argToArray( arguments ),
				len = arg.length,
				last = arg[ len - 1 ],
				hasName = typeof last == "string",
				result, i = len,
				begin;

			begin = hasName ? len - 1 : len;
			for ( ; i < 4; i++ ) {
				arg.splice( begin, 0, null );
			}
			return arg;
		},
			random = 0,
			count = 0;

		/**
		 * @see http://wiki.commonjs.org/wiki/Promises/A
		 * @public
		 * @module base/Promise
		 * @example
		 * new Promise(function(){}, function(){})
		 * new Promise(function(){})
		 * new Promise()
		 */

		/**
		 * @inner
		 * @alias module:base/Promise
		 * @constructor
		 */
		var Promise = function( todo, fail, progress ) {
			this.init( todo, fail, progress );
		}


		Promise.prototype = {
			constructor: Promise,
			/**
			 * Do next
			 * @private
			 */
			_next: function( result ) {
				for ( var i = 0, len = this.thens.length, promise; i < len; i++ ) {
					// 依次调用该任务的后续任务
					promise = this.thens[ i ];
					promise.resolve( result );
				}
				return this;
			},
			/**
			 * Push promise.
			 * @private
			 */
			_push: function( nextPromise ) {
				this.thens.push( nextPromise );
				return this;
			},
			/**
			 * Call todo, fail or progress.
			 * @param {String} - Function name.
			 * @param {*}
			 * @returns {*}
			 */
			call: function( name, result ) {
				switch ( name ) {
					case "fail":
					case "progress":
						break;
					case "todo":
					default:
						name = "todo";
				}

				return this[ name ].call( this.context, result );
			},
			/**
			 * Get property
			 * @param {String} - Property name.
			 * @returns {*}
			 */
			get: function( propertyName ) {
				return this[ propertyName ];
			},
			/**
			 * @param {Object} - Context of Promise.
			 * @returns {this}
			 */
			withContext: function( context ) {
				this.context = context;
				return this;
			},
			/**
			 * Then do...
			 * @param {Function} - Todo.
			 * @param {Function} - Fail next.
			 * @param {Function} - Progress.
			 * @returns {Promise}
			 */
			then: function( nextToDo, nextFail, nextProgress ) {
				var promise = new Promise( nextToDo, nextFail, nextProgress );
				if ( this.context !== this ) {
					promise.withContext( this.context );
				}
				promise.parent = this;
				if ( this.state != "todo" ) {
					// 如果当前状态是已完成，则nextOK会被立即调用
					promise.resolve( this.result );
				} else {
					// 否则将会被加入队列中
					this._push( promise );
				}
				return promise;
			},
			/**
			 * @constructs
			 * @param {Function=}
			 * @param {Function=}
			 * @param {Function=}
			 */
			init: function( todo, fail, progress ) {
				var arg = checkArg.apply( this, arguments );

				this.context = this;
				this.__promiseFlag = true;
				this.state = "todo";
				this.result = null;
				this.thens = [];
				this.todo = arg[ 0 ] || function( obj ) {
					return obj;
				};
				this.fail = arg[ 1 ] || null;
				this.progress = arg[ 2 ] || null;
				this.parent = null;
				this.friend = 0;
				this.asyncCount = 0;
				this.id = count++;

				return this;
			},
			/**
			 * Clear property.
			 * @private
			 */
			_clearProperty: function() {
				this.result = null;
				this.thens = [];
				this.todo = null;
				this.fail = null;
				this.progress = null;
				this.parent = null;
				return this;
			},
			/**
			 * Destroy self.
			 * @returns {void}
			 */
			destroy: function() {
				var ancester = this,
					thens = ancester.thens,
					i, len = thens.length,
					result = 0,
					then;
				if ( thens.length ) {
					for ( i = len - 1; i >= 0; i-- ) {
						then = thens[ i ];
						then.destroy();
						then = thens.pop();
						then._clearProperty();
					}
				}
				this._clearProperty();
			},
			/**
			 * @param {*=} - result.
			 * @returns {this}
			 */
			resolve: function( obj ) {
				if ( this.state != "todo" ) {
					// util.error( {
					//   fn: "Promise.resolve",
					//   msg: "already resolved"
					// } )
					return this;
				}

				if ( Promise.forinstance( this.result ) ) {
					this.result.resolve( obj );
					return this;
				} else if ( this.fail ) {
					try {
						this.state = "done";
						this.result = this.call( "todo", obj );

					} catch ( e ) {
						this.state = "fail";
						this.result = this.call( "fail", obj );

					}
				} else {
					this.state = "done";
					this.result = this.call( "todo", obj );

				}

				if ( Promise.forinstance( this.result ) && this.result !== this ) {
					var
					self = this,
						state = this.state,
						callback = function( result ) {
							self.state = state;
							self.result = result;
							self._next( result );
							self = null;
						};

					this.state = "todo";
					this.result.then( callback );
				} else {
					this._next( this.result );
				}
				return this;
			},
			/**
			 * The new promise is siblings.
			 * @param {Function=}
			 * @param {Function=}
			 * @param {Function=}
			 * @returns {Promise}
			 * @example
			 * new Promise().and(todo).and(todo);
			 */
			and: function( todo, fail, progress ) {
				var self = this.parent || this,
					promise = self.then( todo, fail, progress );
				promise.friend = 1;
				self.asyncCount += 1;
				return promise;
			},
			/**
			 * Relative method "and".
			 * @param {Promise} [promise=this]
			 * @param {*=} - result
			 * @returns {Promise}
			 * @example
			 * function delay(ms) {
			 *   return function (obj) {
			 *       var promise = new Promise;
			 *       var self = this;
			 *       setTimeout(function () {
			 *           promise.together(self, obj);
			 *       }, ms);
			 *       return promise;
			 *   };
			 * };
			 * new Promise().and(delay(1000)).and(delay(2000));
			 */
			together: function( promise, obj ) {
				var i = 0,
					parent = promise.parent || this.parent,
					thens = parent.thens,
					len = thens.length,
					then;
				parent.asyncCount = Math.max( --parent.asyncCount, 0 );
				for ( i = 0; i < len; i++ ) {
					then = thens[ i ];
					if ( then.friend ) {
						if ( parent.asyncCount > 0 ) {
							return this;
						}
					}
				}
				for ( i = 0; i < len; i++ ) {
					then = thens[ i ];
					Promise.forinstance( then.result ) && then.result.resolve( obj );
				}
				return this;
			},
			/**
			 * @returns {Boolean}
			 */
			finished: function() {
				return this.state === "done";
			},
			/**
			 * @returns {Boolean}
			 */
			unfinished: function() {
				return this.state === "todo";
			},
			/**
			 * Get root promise.
			 * @returns {Promise}
			 */
			root: function() {
				var parent = this;
				while ( parent.parent ) {
					parent = parent.parent;
				}
				return parent;
			}
		};

		/**
		 * Whether it is "Promise" instances.
		 * @param {Promise}
		 * @returns {Boolean}
		 */
		Promise.forinstance = function( promise ) {
			return promise instanceof Promise || ( promise ? promise.__promiseFlag === true : false );
		}

		return Promise;
	} );

	aQuery.define( "base/ready", [ "base/Promise" ], function( $, Promise ) {
		"use strict";
		this.describe( "Life Cycle of AMDQuery" );

		/**
		 * Life Cycle of AMDQuery.
		 * @public
		 * @module base/ready
		 */

		/**
		 * @public
		 * @alias module:base/ready
		 * @method
		 * @param {Function} - When AMDQuery ready to call the callback function
		 * @example
		 * require("base/ready", function( ready ) {
		 *   ready(function(){
		 *
		 *   });
		 * } );
		 */
		var ready = function( fn ) {
			setTimeout( function() {
				readyPromise.and( fn );
			}, 0 );
		}, readyPromise;

		var loadingImage = _config.amdquery.loadingImage,
			image = $.createEle( "img" ),
			cover = $.createEle( "div" );

		image.style.cssText = "position:absolute;top:50%;left:50%";
		cover.style.cssText = "width:100%;height:100%;position:absolute;top:0;left:0;z-index:10001;background-color:white";

		cover.appendChild( image );


		readyPromise = new Promise( function() {
			// 预处理设置
			if ( _config.app.src ) {
				var src = _config.app.src;
				// _config.ui.initWidget = true;

				src = src.replace( /([\\\/])[^\\\/]*$/, "$1" );
				src = src.replace( /\/$/, "" );

				require.variable( "app", src );
			}
		} ).then( function() { //window.ready first to fix ie
			document.documentElement.style.cssText = "left:100000px;position:absolute";
			var promise = new Promise,
				ready = function( e ) {
					document.body.appendChild( cover );
					document.documentElement.style.cssText = "left:0px";
					// maybe insertBefore

					if ( loadingImage ) {
						image.setAttribute( "src", loadingImage );
					}

					image.style.marginTop = ( -image.offsetHeight ) + "px";
					image.style.marginLeft = ( -image.offsetWidth ) + "px";

					setTimeout( function() {
						// define will be call before this ready
						promise.resolve( e );
					}, 0 );

					if ( document.addEventListener ) {
						document.removeEventListener( "DOMContentLoaded", ready );
					} else if ( document.attachEvent ) {
						document.detachEvent( "onreadystatechange", ready );
					} else {
						document.onload = null;
					}
					ready = null;
				}
			if ( document.addEventListener ) {
				document.addEventListener( "DOMContentLoaded", ready, false );
			} else if ( document.attachEvent ) {
				document.attachEvent( "onreadystatechange", function( e ) {
					if ( document.readyState === "complete" ) {
						ready( e );
					};
				} );
			} else {
				document.onload = ready;
			}

			return promise;
		} ).then( function() {
			var promise = new Promise;
			if ( _config.app.src ) {
				require( _config.app.src, function( Application ) {
					new Application( promise );
				} );
				return promise;
			} else if ( _config.ui.initWidget ) {
				require( "module/Widget", function( Widget ) {
					Widget.initWidgets( document.body, function() {
						promise.resolve();
					} );
				} );
				return promise;
			}
		} ).then( function() {
			document.body.removeChild( cover );
			cover = null;
			image = null;
		} );

		readyPromise.root().resolve();

		return $.ready = ready;
	} );

	window.aQuery = $;

	if ( !window[ _config.amdquery.define ] ) {
		window[ _config.amdquery.define ] = $;
	} else {
		util.error( _config.amdquery.define + " is defined" );
	}

} )( window );

/*=======================================================*/

/*===================base/typed===========================*/
aQuery.define( "base/typed", function( $ ) {
	"use strict";
	this.describe( "Support typeof function" );
	var
	class2type = {},
		hasOwnProperty = class2type.hasOwnProperty,
		toString = class2type.toString;

	$.each( "Boolean Number String Function Array Date RegExp Object Error".split( " " ), function( name, i ) {
		class2type[ "[object " + name + "]" ] = name.toLowerCase();
	} );
	/**
	 * Determine the type of object。
	 * @public
	 * @exports base/typed
	 * @borrows aQuery.forinstance as is$
	 */
	var typed = {
		/**
		 * Is it an element collection?
		 * @param {*}
		 * @returns {Boolean}
		 */
		isEleConllection: function( a ) {
			return typed.isType( a, "[object NodeList]" ) ||
				typed.isType( a, "[object HTMLCollection]" ) ||
				( typed.isNum( a.length ) && !typed.isArr( a.length ) &&
				( a.length > 0 ? typed.isEle( a[ 0 ] ) : true ) &&
				( typed.isObj( a.item ) || typed.isStr( a.item ) ) );
		},
		/**
		 * Is an event of Dom?
		 * @param {*}
		 * @returns {Boolean}
		 */
		isEvent: function( a ) {
			return a && !! ( toString.call( a ).indexOf( "Event" ) > -1 || ( a.type && a.srcElement && a.cancelBubble !== undefined ) || ( a.type && a.target && a.bubbles !== undefined ) )
		},
		/**
		 * Is it arguments?
		 * @param {*}
		 * @returns {Boolean}
		 */
		isArguments: function( a ) {
			return !!a && "callee" in a && this.isNum( a.length );
		},
		/**
		 * Is it a array?
		 * @param {*}
		 * @returns {Boolean}
		 */
		isArr: function( a ) {
			return typed.isType( a, "[object Array]" );
		},
		/**
		 * Does it like a array?
		 * @param {*}
		 * @returns {Boolean}
		 */
		isArrlike: function( obj ) {
			var length = obj.length,
				type = typed.type( obj );

			if ( typed.isWindow( obj ) ) {
				return false;
			}

			if ( obj.nodeType === 1 && length ) {
				return true;
			}

			return type === "array" || type !== "function" &&
				( length === 0 ||
				typeof length === "number" && length > 0 && ( length - 1 ) in obj );
		},
		/**
		 * Is it Boolean?
		 * @param {*}
		 * @returns {Boolean}
		 */
		isBol: function( a ) {
			return typed.isType( a, "[object Boolean]" );
		},
		/**
		 * Is it Date?
		 * @param {*}
		 * @returns {Boolean}
		 */
		isDate: function( a ) {
			return typed.isType( a, "[object Date]" );
		},
		/**
		 * Is it Document?
		 * @param {*}
		 * @returns {Boolean}
		 */
		isDoc: function( a ) {
			return !!toString.call( a ).match( /document/i );
		},
		/**
		 * Is it Element?
		 * @param {*}
		 * @returns {Boolean}
		 */
		isEle: function( a ) {
			if ( !a || a === document ) return false;
			var str = ( a.constructor && a.constructor.toString() ) + Object.prototype.toString.call( a )
			if ( ( str.indexOf( "HTML" ) > -1 && str.indexOf( "Collection" ) == -1 ) || a.nodeType === 1 ) {
				return true;
			}
			return false;
		},
		/**
		 * Is it empty?
		 * @param {*}
		 * @returns {Boolean}
		 * @example
		 * var a = null, b = undefined, c = [], d = {}, e = "";
		 * typed.isEmpty(a); // true
		 * typed.isEmpty(b); // true
		 * typed.isEmpty(c); // true
		 * typed.isEmpty(d); // true
		 * typed.isEmpty(e); // true
		 */
		isEmpty: function( a ) {
			if ( a == null ) return true;
			if ( typed.isArr( a ) || typed.isStr( a ) ) return a.length == 0;
			return typed.isEmptyObj( a );
		},
		/**
		 * Is it empty object?
		 * @param {*}
		 * @returns {Boolean}
		 * @example
		 * var a = [], b = {};
		 * typed.isEmptyObj(a); // true
		 * typed.isEmptyObj(b); // true
		 */
		isEmptyObj: function( obj ) {
			for ( var name in obj ) {
				return false;
			}
			return true;
		},
		/**
		 * Is it Error?
		 * @param {*}
		 * @returns {Boolean}
		 */
		isError: function( a ) {
			return typed.isType( a, "[object Error]" );
		},
		/**
		 * Is it Finite?
		 * @param {*}
		 * @returns {Boolean}
		 */
		isFinite: function( a ) {
			return isFinite( a ) && !isNaN( parseFloat( a ) );
		},
		/**
		 * Is it Function?
		 * @param {*}
		 * @returns {Boolean}
		 */
		isFun: function( a ) {
			return typed.isType( a, "[object Function]" );
		},
		/**
		 * Is it native JSON?
		 * @param {*}
		 * @returns {Boolean}
		 */
		isNativeJSON: function( a ) {
			return window.json && typed.isType( a, "object JSON" );
		},
		/**
		 * Is it not a Number?
		 * @param {*}
		 * @returns {Boolean}
		 */
		isNaN: function( a ) {
			return typed.isNum( a ) && a != +a;
		},
		/**
		 * Is it a Number?
		 * @param {*}
		 * @returns {Boolean}
		 */
		isNum: function( a ) {
			return typed.isType( a, "[object Number]" );
		},
		/**
		 * Is it a Numeric?
		 * @param {*}
		 * @returns {Boolean}
		 * @example
		 * typed.isNum("5"); // false
		 * typed.isNumeric("5"); // true
		 */
		isNumeric: function( a ) {
			return !isNaN( parseFloat( a ) ) && isFinite( a );
		},
		/**
		 * Is it null? "undefined", "null" and "NaN" return true.
		 * @param {*}
		 * @returns {Boolean}
		 */
		isNul: function( a ) {
			return a === undefined || a === null || typed.isNaN( a );
		},
		/**
		 * Is it element node?
		 * @param {*}
		 * @param {String} - Name of node.
		 * @returns {Boolean}
		 */
		isNode: function( ele, name ) {
			return typed.isEle( ele ) ? ( ele.nodeName && ele.nodeName.toUpperCase() === name.toUpperCase() ) : false;
		},
		/**
		 * Is it Object? "undefined" is not Object.
		 * @param {*}
		 * @returns {Boolean}
		 */
		isObj: function( a ) {
			return a !== undefined ? typed.isType( a, "[object Object]" ) : false;
		},
		/**
		 * Is it plain Object?
		 * @param {*}
		 * @returns {Boolean}
		 */
		isPlainObj: function( obj ) {
			if ( !obj || !typed.isObj( obj ) || obj.nodeType || obj.setInterval ) {
				return false;
			}

			// Not own constructor property must be Object
			if ( obj.constructor && !hasOwnProperty.call( obj, "constructor" ) && !hasOwnProperty.call( obj.constructor.prototype, "isPrototypeOf" ) ) {
				return false;
			}

			// Own properties are enumerated firstly, so to speed up,
			// if last one is own, then all properties are own.
			var key;
			for ( key in obj ) {
				break;
			}

			return key === undefined || hasOwnProperty.call( obj, key );
		},
		/**
		 * Is it a RegExp?
		 * @param {*}
		 * @returns {Boolean}
		 */
		isRegExp: function( a ) {
			return typed.isType( a, "[object RegExp]" );
		},
		/**
		 * Is it a String?
		 * @param {*}
		 * @returns {Boolean}
		 */
		isStr: function( a ) {
			return typed.isType( a, "[object String]" );
		},
		/**
		 * @param {*}
		 * @param {String} - like "[object Number]", "[object String]"
		 * @returns {Boolean}
		 * @example
		 * typed.isType( 5, "[object Number]" ) // true
		 */
		isType: function( a, b ) {
			return toString.call( a ) == b;
		},
		/**
		 * It is XML?
		 * @param {*}
		 * @returns {Boolean}
		 */
		isXML: function( ele ) {
			// documentElement is verified for cases where it doesn't yet exist
			// (such as loading iframes in IE - #4833)
			var documentElement = ( ele ? ele.ownerDocument || ele : 0 ).documentElement;

			return documentElement ? documentElement.nodeName !== "HTML" : false;
		},
		/**
		 * It is window?
		 * @param {*}
		 * @returns {Boolean}
		 */
		isWindow: function( a ) {
			return a != null && a == a.window;
		},
		is$: $.forinstance,
		/**
		 * Return object type.
		 * @param {*}
		 * @returns {String}
		 */
		type: function( obj ) {
			if ( obj == null ) {
				return String( obj );
			}
			return typeof obj === "object" || typeof obj === "function" ?
				class2type[ toString.call( obj ) ] || "object" :
				typeof obj;
		}
	};

	return typed;
} );

/*=======================================================*/

/*===================base/extend===========================*/
aQuery.define( "base/extend", [ "base/typed" ], function( $, typed ) {
	"use strict";
	this.describe( "Extend Util" );
	/**
	 * @pubilc
	 * @exports base/extend
	 * @requires module:base/typed
	 */
	var utilExtend = {
		/**
		 * b extend a. Return object "a".
		 * @param {Object}
		 * @param {Object}
		 * @returns {this}
		 */
		easyExtend: function( a, b ) {
			for ( var i in b )
				a[ i ] = b[ i ];
			return this;
		},
		/**
		 *
		 * @param {Object|Boolean} - If parameter is true then recursion.
		 * @param {...Object}
		 * @returns {Object}
		 * @example
		 * var object1 = {
		 *   apple: 0,
		 *   banana: { weight: 52, price: 100 },
		 *   cherry: 97
		 * };
		 * var object2 = {
		 *   banana: { price: 200 },
		 *   durian: 100
		 * };
		 * //Merge object2 into object1
		 * $.extend( object1, object2 );
		 * // output {"apple":0,"banana":{"price":200},"cherry":97,"durian":100}
		 *
		 * var object1 = {
		 *   apple: 0,
		 *   banana: { weight: 52, price: 100 },
		 *   cherry: 97
		 * };
		 * var object2 = {
		 *   banana: { price: 200 },
		 *   durian: 100
		 * };
		 * // Merge object2 into object1, recursively
		 * $.extend( true, object1, object2 );
		 * // output {"apple":0,"banana":{"weight":52,"price":200},"cherry":97,"durian":100}
		 *
		 * var defaults = { validate: false, limit: 5, name: "foo" };
		 * var options = { validate: true, name: "bar" };
		 * // Merge defaults and options, without modifying defaults
		 * var settings = $.extend( {}, defaults, options );
		 * // defaults -- {"validate":false,"limit":5,"name":"foo"}
		 * // options -- {"validate":true,"name":"bar"}
		 * // settings -- {"validate":true,"limit":5,"name":"bar"}
		 */
		extend: function( a ) {
			var target = arguments[ 0 ] || {},
				i = 1,
				length = arguments.length,
				deep = false,
				options, name, src, copy;

			if ( typed.isBol( target ) ) {
				deep = target;
				target = arguments[ 1 ] || {};
				i = 2;
			}

			if ( !typed.isObj( target ) && !typed.isFun( target ) ) { //加了个array && !typed.isArr( target )
				target = {};
			}

			if ( length === i ) {
				target = this;
				--i;
			}

			for ( ; i < length; i++ ) {
				if ( ( options = arguments[ i ] ) != null ) {
					for ( name in options ) {
						if ( "hasOwnProperty" in options ? options.hasOwnProperty( name ) : true ) {
							src = target[ name ];
							copy = options[ name ];

							if ( target === copy ) {
								continue;
							}

							if ( deep && copy && ( typed.isPlainObj( copy ) || typed.isArr( copy ) ) ) {
								var clone = src && ( typed.isPlainObj( src ) || typed.isArr( src ) ) ? src : typed.isArr( copy ) ? [] : {};

								target[ name ] = utilExtend.extend( deep, clone, copy );

							} else if ( copy !== undefined ) {
								target[ name ] = copy;
							}
						}
					}
				}
			}

			return target;

		}
	};


	return utilExtend;
} );

/*=======================================================*/

/*===================base/array===========================*/
aQuery.define( "base/array", [ "base/typed", "base/extend" ], function( $, typed, extend ) {
	"use strict";
	this.describe( "Array Util" );

	var
	indexOf = Array.prototype.indexOf || function( item, i ) {
		var len = this.length;
		i = i || 0;
		if ( i < 0 ) i += len;
		for ( ; i < len; i++ )
			if ( i in this && this[ i ] === item ) return i;
		return -1;
	}, lastIndexOf = Array.prototype.lastIndexOf || function( item, i ) {
		var len = this.length - 1;
		i = i || len;
		if ( i < 0 ) i += len;
		for ( ; i > -1; i-- )
			if ( i in this && this[ i ] === item ) break;
		return i;
	}, push = Array.prototype.push;

	/**
	 * @callback grepCallback
	 * @param {*} - Item.
	 * @param {Number} - Index.
	 * @returns {Boolean}
	 */

	/**
	 * This callback context is parameter of filterArray.
	 * @this {Object}
	 * @callback filterArrayCallback
	 * @param {*} - Item
	 * @param {Number} - Index
	 * @param {Array}
	 * @returns {Boolean}
	 */

	/**
	 * @pubilc
	 * @exports base/array
	 * @requires module:base/typed
	 * @requires module:base/extend
	 */
	var array = {
		/**
		 * Filter Array
		 * @param {Array}
		 * @param {grepCallback}
		 * @param {Boolean} [inv=false] - If inv !== grepCallback() then push.
		 * @param {Array}
		 */
		grep: function( arr, callback, inv ) {
			var retVal,
				ret = [],
				i = 0,
				length = arr.length;
			inv = !! inv;

			// Go through the array, only saving the items
			// that pass the validator function
			for ( ; i < length; i++ ) {
				retVal = !! callback( arr[ i ], i );
				if ( inv !== retVal ) {
					ret.push( arr[ i ] );
				}
			}

			return ret;
		},
		/**
		 * Filter Array. If callback return true then push.
		 * @param {Array}
		 * @param {filterArrayCallback}
		 * @param {Object} [context=item] - filterArrayCallback context. If null then is each item.
		 * @returns {Array}
		 */
		filterArray: function( arr, callback, context ) {
			var ret = [];
			for ( var i = 0, len = arr.length, item; i < len; i++ ) {
				item = arr[ i ];
				callback.call( context || item, item, i, arr ) === true && ret.push( item );
			}
			return ret;
		},
		/**
		 * Excluding the same element in the array
		 * @param {Array}
		 * @returns {Array}
		 */
		filterSame: function( arr ) {
			if ( arr.length > 1 ) {
				for ( var len = arr.length, list = [ arr[ 0 ] ], result = true, i = 1, j = 0; i < len; i++ ) {
					j = 0;
					for ( ; j < list.length; j++ ) {
						if ( arr[ i ] === list[ j ] ) {
							result = false;
							break;
						}
					}
					result && list.push( arr[ i ] );
					result = true;
				}
				return list;
			} else {
				return arr;
			}
		},
		/**
		 * Search the index of elements in the array. -1 means not found.
		 * @param {Array}
		 * @param {*}
		 * @param {Number} [i=0] - Starting Index.
		 * @returns {Number}
		 */
		inArray: function( arr, item, i ) {
			return indexOf.call( arr, item, i );
		},
		/**
		 * Search the index of elements in the array by descending. -1 means not found.
		 * @param {Array}
		 * @param {*}
		 * @param {Number} [i=arr.length-1] - Starting Index.
		 * @returns {Array}
		 */
		lastInArray: function( arr, item, i ) {
			return lastIndexOf.call( arr, item, i );
		},
		/**
		 * Make array.
		 * @param {Array}
		 * @param {Array} [results=Array]
		 * @returns {Array}
		 */
		makeArray: function( array, results ) {
			var result = results || [];

			if ( array ) {
				if ( typed.isNul( array.length ) || typed.isStr( array ) || typed.isFun( array ) || array.setInterval ) {
					push.call( result, array );
				} else {
					result = array.toArray( array );
				}
			}

			return result;
		},
		/**
		 * Some object which has length change to array.
		 * @param {*} - Not a function but has length.
		 * @param {Number} [start=0]
		 * @param {Number} [end=obj.length]
		 * @returns {Array}
		 */
		toArray: function( obj, start, end ) {
			var i = 0,
				list = [],
				len = obj.length;
			if ( !( typed.isNum( len ) && typed.isFun( obj ) ) ) {
				for ( var value = obj[ 0 ]; i < len; value = obj[ ++i ] ) {
					list.push( value );
				}
			}
			return list.slice( startIndex || 0, num2 || len );

		}
	};

	return array;
} );

/*=======================================================*/

/*===================main/object===========================*/
﻿aQuery.define( "main/object", [ "base/typed", "base/array", "base/extend" ], function( $, typed, array, utilExtend ) {
	"use strict";
	this.describe( "Define Class" );
	var
	pushSuperStack = function( self ) {
		var stack;
		if ( !self.__superStack ) {
			self.__superStack = [];
		}

		stack = self.__superStack;

		if ( stack.length ) {
			stack.push( stack[ stack.length - 1 ].prototype.__superConstructor );
		} else {
			stack.push( self.constructor.prototype.__superConstructor );
		}
	},
		popSuperStack = function( self ) {
			var stack = self.__superStack;
			if ( stack.length ) {
				stack.pop();
			}
		},
		_getSuperConstructor = function( self ) {
			var stack = self.__superStack,
				tempConstructor;

			if ( stack && stack.length ) {
				tempConstructor = stack[ stack.length - 1 ];
			} else {
				tempConstructor = self.constructor.prototype.__superConstructor;
			}
			return tempConstructor;
		},
		_superInit = function() {
			var tempConstructor;

			pushSuperStack( this );
			tempConstructor = _getSuperConstructor( this );

			tempConstructor.prototype.init ? tempConstructor.prototype.init.apply( this, arguments ) : tempConstructor.apply( this, arguments );
			popSuperStack( this );
			return this;
		},
		_invoke = function( name, context, args ) {
			var fn = this.prototype[ name ];
			return fn ? fn.apply( context, typed.isArguments( args ) ? args : $.util.argToArray( arguments, 2 ) ) : undefined;
		},
		_getFunctionName = function( fn ) {
			if ( fn.name !== undefined ) {
				return fn.name;
			} else {
				var ret = fn.toString().match( /^function\s*([^\s(]+)/ );
				return ( ret && ret[ 1 ] ) || "";
			}
		},
		_defaultPrototype = {
			init: function() {
				return this;
			}
		},
		defaultValidate = function() {
			return 1;
		},
		inerit = function( Sub, Super, name ) {
			object.inheritProtypeWithParasitic( Sub, Super, name );
			Sub.prototype.__superConstructor = Super;
			Sub.prototype._super = _superInit;
			if ( !Super.invoke ) {
				Super.invoke = _invoke;
			}
		},
		extend = function( Sub, Super ) {
			object.inheritProtypeWithExtend( Sub, Super );
		},

		defaultPurview = "-pu -w -r";

	/**
	 * @callback CollectionEachCallback
   * @param item {*}
   * @param index {Number}
	 */

	/**
	 * This provides methods used for method "object.extend" handling. It will be mixed in constructor.
	 * This methods is static.
	 * @public
	 * @mixin ObjectClassStaticMethods
	 */
	var ObjectClassStaticMethods = /** @lends ObjectClassStaticMethods */ {
		/**
		 * This constructor inherit Super constructor if you define a class which has not inherit Super.
		 * @public
		 * @method
		 * @param {Function} Super - Super constructor.
		 * @returns {this}
		 */
		inherit: function( Super ) {
			inerit( this, Super );
			return this;
		},
		/**
		 * Define a Sub Class. This constructor is Super Class.
		 * @param {Function|String} name - Sub constructor or Sub name.
		 * @param {Object} prototype - Instance methods.
		 * @param {Object} statics - Static methods.
		 * @returns {Function}
		 */
		extend: function( name, prototype, statics ) {
			var arg = $.util.argToArray( arguments );
			if ( typed.isObj( name ) ) {
				arg.splice( 0, 0, _getFunctionName( this ) || name.name || "anonymous" );
			}
			arg.push( this );
			/*arg = [name, prototype, statics, constructor]*/
			return object.extend.apply( object, arg );
		},
		/**
		 * Join Object into prototype.
		 * @param {...Object}
		 * @returns {this}
		 */
		joinPrototype: function() {
			for ( var i = 0, len = arguments.length, obj; i < len; i++ ) {
				obj = arguments[ i ];
				typed.isPlainObj( obj ) && utilExtend.extend( this.prototype, obj );
			}
			return this;
		},
		/**
		 * Determine whether the target is a instance of this constructor or this ancestor constructor.
		 * @param {Object} - A new instance.
		 * @returns {this}
		 */
		forinstance: function( target ) {
			var constructor = this,
				ret = target instanceof this;

			if ( ret == false ) {
				constructor = target.constructor;
				while ( !! constructor ) {
					constructor = constructor.prototype.__superConstructor;
					if ( constructor === target ) {
						ret = true;
						break;
					}
				}
			}
			return ret;
		},
		/**
		 * Create Getter or Setter for this constructor.prototype.

		 * @param {Object<String,Object>|String|Function}
		 */
		createGetterSetter: function( object ) {
			object.createPropertyGetterSetter( this, object );
		},
		/** fn is pointer of this.prototype */
		fn: null
	};

	/**
	 * This provides methods used for method "object.collection" handling. It will be mixed in constructor.prototype
	 * This methods is prototype.
	 * @public
	 * @mixin CollectionClassPrototypeMethods
	 */

	/**
	 * @pubilc
	 * @exports main/object
	 * @requires module:base/typed
	 * @requires module:base/array
	 * @requires module:base/extend
	 */
	var object = {
		/**
		 * Define a Class.
		 * <br /> Mixin {@link ObjectClassStaticMethods} into new Class.
		 * <br /> see {@link module:main/object.createPropertyGetterSetter}
		 * @example
		 * var Super = object.extend( "Super", {
		 *   init: function( name ){
		 *     console.log( "Super", name );
		 *     this.name = name;
		 *   },
		 *   checkName: function( name ){
		 *     console.log( "Super", this.name == name );
		 *     return this.name == name;
		 *   }
		 * }, {
		 *   doSomething: function( ){ };
		 * } );
		 *
		 * function Sub( name ){
		 *   this._super( name );
		 *   this.name = name;
		 *   console.log( "Sub", name );
		 * };
		 *
		 * Super.extend( Sub, { // extend is created by mixin
		 *   checkName: function( name ){
		 *     // The invoke is created by object.extend
		 *     Super.invoke( "checkName", name );
		 *     console.log( "Sub", this.name == name );
		 *     return this.name == name;
		 *   }
		 * }, {
		 *   doSomething: function( ){ };
		 * } );
		 *
		 * var super = new Super( "Lisa" );
		 * // Super Lisa
		 * var sub = new Sub( "Iris" );
		 * // Super Iris
		 * // Sub Iris
		 * sub.checkName( "Iris" );
		 * // Super true
		 * // Sub true
		 * Sub.doSomething();
		 * Super.doSomething();
		 *
		 * //mixin
		 * Sub.joinPrototype( {
		 *   foo: function() {}
		 * }, {
		 *   pad: function() {}
		 * } );
		 * sub.foo();sub.pad();
		 *
		 * Super.forinstance( sub ) // true
		 *
		 * Sub.createGetterSetter( {
		 *   name: "-pa"
		 * } );
		 *
		 * @param {String|Function} - Name or Function.
		 * @param {Object} - Instance methods.
		 * @param {Object} - Static methods.
		 * @param {Function} [Super] - Super Class.
		 * @returns {Function}
		 */
		extend: function( name, prototype, statics, Super ) {
			var anonymous;
			switch ( arguments.length ) {
				case 0:
				case 1:
					return null;
				case 3:
					if ( typeof statics == "function" ) {
						Super = statics;
						statics = null;
					}
					break;
			}

			switch ( typeof name ) {
				case "function":
					anonymous = name;
					break;
				case "string":
					anonymous = ( eval(
            [
              "(function ", name, "() {\n",
              "    this.init.apply(this, arguments);\n",
              "});\n"
            ].join( "" ) ) || eval( "(" + name + ")" ) ) //fix ie678
					break;
				default:
					anonymous = function anonymous() {
						this.init.apply( this, arguments );
					};
			}

			if ( Super ) {
				inerit( anonymous, Super );
			}

			prototype = utilExtend.extend( {}, _defaultPrototype, prototype );
			prototype.constructor = anonymous;

			utilExtend.easyExtend( anonymous.prototype, prototype );

			utilExtend.easyExtend( anonymous, ObjectClassStaticMethods );

			utilExtend.easyExtend( anonymous, statics );

			anonymous.fn = anonymous.prototype;

			return anonymous;
		},
		/**
		 * If model is a function, you should call "this.init()".
		 * <br /> Mixin {@link CollectionClassPrototypeMethods} into new Collection.
		 * @param {String|Function} - If model is a function, then will use model.name. Then class name is name + "Collection".
		 * @param {Object} - Instance methods.
		 * @param {Object} - Static methods.
		 * @param {Function} [Super]
		 */
		Collection: function( model, prototype, statics, Super ) {
			switch ( arguments.length ) {
				case 0:
				case 1:
					return null;
				case 3:
					if ( typeof statics == "function" ) {
						Super = statics;
						statics = null;
					}
					break;
			}

			var CollectionClassPrototypeMethods = /** @lends CollectionClassPrototypeMethods */ {
				/** A constructor of class */
				init: function() {
					this.models = [];
					this.__modelMap = {};
					prototype.init ? prototype.init.apply( this, arguments ) : this.add.apply( this, arguments );
					return this;
				},
				/**
				 * Add model into collection
				 * @param {...model}
				 * @returns {this}
				 */
				add: function( model ) {
					var arg = $.util.argToArray( arguments ),
						len = arg.length,
						i = 0;

					for ( ; i < len; i++ ) {
						model = arg[ i ];
						if ( !this.__modelMap[ model.id ] ) {
							this.models.push( model );
							this.__modelMap[ model.id || ( model.constructor.name + _expendo++ ) ] = model;
						}
					}
					return this;
				},
				/**
				 * Pop model from collection
				 * @returns {model}
				 */
				pop: function() {
					return this.remove( this.models[ this.models.length - 1 ] );
				},
				/**
				 * Remove model from collection
				 * @param {model|Number|String} - String means id. Number means index. model is a model.
				 * @returns {model}
				 */
				remove: function( id ) {
					var model = null,
						i;
					switch ( typeof id ) {
						case "number":
							model = this.models[ id ];
							break;
						case "string":
							model = this.__modelMap[ id ];
							break;
						case "object":
							model = id;
							break;
					}
					if ( model ) {
						this.models.splice( array.inArray( this.models, model ), 1 );
						for ( i in this.__modelMap ) {
							if ( this.__modelMap[ i ] == model ) {
								delete this.__modelMap[ i ];
							}
						}
					}
					return model;
				},
				/**
				 * Get model from collection
				 * @param {String|Number} - String means id. Number means index.
				 * @returns {model}
				 */
				get: function( id ) {
					switch ( typeof id ) {
						case "number":
							model = this.models[ id ];
							break;
						case "string":
							model = this.__modelMap[ id ];
							break;
					}
					return model;
				},
				/**
				 * Clear all model
				 * @returns {this}
				 */
				clear: function() {
					this.models = [];
					this.__modelMap = {};
					return this;
				},
				/**
				 * Iteration the list of model.
				 * @param {CollectionEachCallback}
				 * @param {Object} [context] - Context.
				 * @returns {this}
				 */
				each: function( fn, context ) {
					for ( var i = 0, model = this.models, item; item = model[ i++ ]; )
						fn.call( context || item, item, i );
					return this;
				}
			};

			var _expendo = 0,
				_prototype = utilExtend.extend( {}, prototype, CollectionClassPrototypeMethods ),
				_statics = utilExtend.extend( {}, statics ),
				name = typeof model == "string" ? model : model.name + "Collection";

			return object.extend( name, _prototype, _statics, Super );
		},
		/**
		 * Get the object properties count.
		 * @param {Object}
		 * @param {Boolean} - If true , does not count prototype.
		 * @returns {Number}
		 */
		getObjectPropertiesCount: function( obj, bool ) {
			var count = 0;
			for ( var i in obj ) {
				bool == true ? object.isPrototypeProperty( obj, i ) || count++ : count++;
			}
			return count;
		},
		/**
		 * Does not contain the same memory address, the constructor will not be called multiple times.
		 * @param {Sub}
		 * @param {Super}
		 * @returns {this}
		 */
		inheritProtypeWithExtend: function( Sub, Super ) {
			var con = Sub.prototype.constructor;
			utilExtend.easyExtend( Sub.prototype, Super.prototype );
			Sub.prototype.constructor = con || Super.prototype.constructor;
			return this;
		},
		/**
		 * Use parasitic to inherit prototype. Does not contain the same memory address.
		 * @param {Sub}
		 * @param {Super}
		 * @param {String} - You can see the name of the parent class in the prototype chain instead "Parasitic".
		 * @returns {this}
		 */
		inheritProtypeWithParasitic: function( Sub, Super, name ) {
			if ( !Super ) {
				return this;
			}
			var
			originPrototype = Sub.prototype,
				name = Super.name || name,
				Parasitic = typeof name == "string" ? ( eval( "(function " + name + "() { });" ) || eval( "(" + name + ")" ) ) : function() {};
			Parasitic.prototype = Super.prototype;
			Sub.prototype = new Parasitic();
			//var prototype = Object(Super.prototype);
			//Sub.prototype = prototype;
			utilExtend.easyExtend( Sub.prototype, originPrototype );
			//Sub.prototype.constructor = Sub;

			return this;
		},
		/**
		 * Use classic combination to inherit prototype. Contains the same memory address.
		 * @param {Sub}
		 * @param {Super}
		 * @returns {this}
		 */
		inheritProtypeWithCombination: function( Sub, Super ) {
			Sub.prototype = new Super();
			return this;
		},
		/**
		 * Whether it is the prototype property.
		 * @param {*}
		 * @param {String}
		 * @returns {Boolean}
		 */
		isPrototypeProperty: function( obj, name ) {
			/// <summary>是否是原型对象的属性</summary>
			/// <param name="obj" type="any">任意对象</param>
			/// <param name="name" type="String">属性名</param>
			/// <returns type="Boolean" />
			return "hasOwnProperty" in obj && !obj.hasOwnProperty( name ) && ( name in obj );
		},
		/**
		 * Create Getter or Setter for this constructor.prototype.
		 * @link module:main/object.createPropertyGetterSetter
		 * @example
		 * function Person(){};
		 * // "u" means public, "a" means private.
		 * object.createPropertyGetterSetter(Person, {
		 *  id: "-pu -r",
		 *  name: "-pu -w -r",
		 *  age: "-pa -w -r",
		 *  Weight: "-wa -ru",
		 *  mark: {
		 *    purview: "-wa -ru",
		 *    defaultValue: 0, // set prototype.mark = 0.
		 *    validate: function( mark ){ return mark >= 0 && mark <= 100; } // validate param when setting.
		 *    edit: function( value ){ return value + ""; } // edit value when getting.
		 *  },
		 *  height: function( h ){ return h >= 100 && h <= 220; } // validate param when setting.
		 * } );
		 * var person = new Person();
		 * person.getId();
		 * person.getName(); person.setName();
		 * person._getAge(); person._setAge();
		 * person._getWeight(); person.setWeight();
		 * person.getMark(); // "0"
		 * person._setMark( 110 );
		 * person.getMark(); // "0"
		 * person._setMark( 100 );
		 * person.getMark(); // "100"
		 *
		 * @param {Function} obj - A constructor.
		 * @param {Object<String,Object>|String|Function}
		 * return {obj.prototype}
		 */
		createPropertyGetterSetter: function( obj, object ) {
			if ( !typed.isPlainObj( object ) ) {
				return this;
			}

			return $.each( object, function( value, key ) {
				var purview = defaultPurview,
					validate = defaultValidate,
					defaultValue,
					edit;
				switch ( typeof value ) {
					case "string":
						purview = value;
						break;
					case "object":
						if ( typed.isStr( value.purview ) ) {
							purview = value.purview;
						}
						if ( typed.isFun( value.validate ) ) {
							validate = value.validate;
						}
						if ( typed.isFun( value.edit ) ) {
							edit = value.edit;
						}
						defaultValue = value.defaultValue; //undefinded always undefinded
						break;
					case "function":
						validate = value;
						break;

				}
				this[ key ] = defaultValue;

				var prefix = /\-pa[\s]?/.test( purview ) ? "_" : "",
					setPrefix, getPrefix;

				if ( purview.match( /\-w([u|a])?[\s]?/ ) ) {
					getPrefix = RegExp.$1 == "a" ? "_" : "";
					this[ ( getPrefix || prefix ) + $.util.camelCase( key, "set" ) ] = function( a ) {
						if ( validate.call( this, a ) ) {
							this[ key ] = a;
						} else if ( defaultValidate !== undefined ) {
							this[ key ] = defaultValue;
						}

						return this;
					};
				}
				if ( purview.match( /\-r([u|a])?[\s]?/ ) ) {
					setPrefix = RegExp.$1 == "a" ? "_" : "";
					this[ ( setPrefix || prefix ) + $.util.camelCase( key, "get" ) ] = function() {
						return edit ? edit.call( this, this[ key ] ) : this[ key ];
					};
				}
			}, obj.prototype );
		}
	};

	return object;
} );

/*=======================================================*/

/*===================base/support===========================*/
﻿aQuery.define( "base/support", [ "base/extend" ], function( $, utilExtend ) {
	"use strict";
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
	 * @requires module:base/extend
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
		 * IE will insert them into empty tables.<br/>
		 * Make sure that tbody elements aren't automatically inserted.
		 * @type {Boolean}
		 */
		tbody: !div.getElementsByTagName( "tbody" ).length,
		/**
		 * Make sure that link elements get serialized correctly by innerHTML.<br/>
		 * This requires a wrapper element in IE.
		 * @type {Boolean}
		 */
		htmlSerialize: !! div.getElementsByTagName( "link" ).length,
		/**
		 * Get the style information from getAttribute.<br/>
		 * (IE uses .cssText instead)
		 * @type {Boolean}
		 */
		style: /top/.test( a.getAttribute( "style" ) ),
		/**
		 * Make sure that URLs aren't manipulated.<br/>
		 * (IE normalizes it by default).
		 * @type {Boolean}
		 */
		hrefNormalized: a.getAttribute( "href" ) === "/a",
		/**
		 * Make sure that element opacity exists.<br/>
		 * (IE uses filter instead).<br/>
		 * Use a regex to work around a WebKit issue.
		 * @type {Boolean}
		 */
		opacity: /^0.5/.test( a.style.opacity ),
		/**
		 * Verify style float existence.<br/>
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
		 * Make sure that a selected-by-default option has a working selected property.<br/>
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
		 * Makes sure cloning an html5 element does not cause problems.<br/>
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
	 * Make sure that the options inside disabled selects aren't marked as disabled.<br/>
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
	 * Check if a disconnected checkbox will retain its checked.<br/>
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
			 * Support: IE<9<br/>
			 * Opera does not clone events (and typeof div.attachEvent === undefined).<br/>
			 * IE9-10 clones events bound via attachEvent, but they don't trigger with .click().<br/>
			 * @type {Boolean}
			 */
			support.noCloneEvent = false;
		} );

		div.cloneNode( true ).click();
	}

	/**
	 * Support: IE<9 (lack submit/change bubble), Firefox 17+ (lack focusin event).<br/>
	 * Beware of CSP restrictions (https://developer.mozilla.org/en/Security/CSP), test/csp.php
	 * @type {Boolean}
	 * @name submit
	 * @memberof module:base/support
	 */
	/**
	 * Support: IE<9 (lack submit/change bubble), Firefox 17+ (lack focusin event).<br/>
	 * Beware of CSP restrictions (https://developer.mozilla.org/en/Security/CSP), test/csp.php
	 * @type {Boolean}
	 * @name change
	 * @memberof module:base/support
	 */
	/**
	 * Support: IE<9 (lack submit/change bubble), Firefox 17+ (lack focusin event).<br/>
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
		 * Support: IE8.<br/>
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
			 * gets computed margin-right based on width of container.<br/>
			 * Fails in WebKit before Feb 2011 nightlies.<br/>
			 * WebKit Bug 13343 - getComputedStyle returns wrong value for margin-right.
			 * @type {Boolean}
			 */
			support.reliableMarginRight = !parseFloat( ( window.getComputedStyle( marginDiv, null ) || {} ).marginRight );
		}

		if ( typeof div.style.zoom !== "undefined" ) {
			div.innerHTML = "";
			div.style.cssText = divReset + "width:1px;padding:1px;display:inline;zoom:1";
			/**
			 * Support: IE<8.<br/>
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
			 * Support: IE6.<br/>
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

/*=======================================================*/

/*===================main/data===========================*/
﻿aQuery.define( "main/data", [ "base/extend", "base/typed", "base/support" ], function( $, utilExtend, typed, support, undefined ) {
	"use strict";

	// checks a cache object for emptiness

	function isEmptyDataObject( obj ) {
		var name;
		for ( name in obj ) {

			// if the public data object is empty, the private is still empty
			if ( name === "data" && typed.isEmptyObj( obj[ name ] ) ) {
				continue;
			}
			if ( name !== "toJSON" ) {
				return false;
			}
		}

		return true;
	}

	var
	expando = "AMDQuery" + $.now(),
		uuid = 0,
		windowData = {}, emptyObject = {};
	/**
	 * @pubilc
	 * @exports main/data
	 * @requires module:main/data
	 */
	var exports = {
		/**
		 * @type Array
		 */
		cache: [],
		/**
		 * Quote from jQuery-1.4.1 .
		 * @deprecated
		 */
		data: function( ele, name, data ) {
			if ( !ele || ( ele.nodeName && exports.noData[ ele.nodeName.toLowerCase() ] ) )
				return this;

			ele = ele == window ?
				windowData :
				ele;

			var id = ele[ expando ],
				cache = exports.cache,
				thisCache;

			if ( !name && !id )
				return this;

			if ( !id )
				id = ++uuid;

			if ( typed.isPlainObj( name ) ) {
				ele[ expando ] = id;
				thisCache = cache[ id ] = utilExtend.extend( true, {}, name );
			} else if ( cache[ id ] ) {
				thisCache = cache[ id ];
			} else if ( data === undefined ) {
				thisCache = emptyObject;
			} else {
				thisCache = cache[ id ] = {};
			}

			if ( data !== undefined ) {
				ele[ expando ] = id;
				thisCache[ name ] = data;
			}

			return typed.isStr( name ) ? thisCache[ name ] : thisCache;
		},

		_getTarget: function( ele ) {
			if ( !ele || ( ele.nodeName && exports.noData[ ele.nodeName.toLowerCase() ] ) )
				return null;
			return ele == window ?
				windowData :
				ele;
		},
		/**
		 * Get Data.It maybe return undefined.
		 * @param {Element|window}
		 * @param {String} [name] - If name is undefined then return whole cache.
		 * @returns {undefined|*}
		 */
		get: function( ele, name ) {
			ele = exports._getTarget( ele );
			if ( !ele ) {
				return undefined;
			}
			var id = ele[ expando ],
				cache = exports.cache,
				thisCache;

			if ( id && cache[ id ] ) {
				return name ? cache[ id ][ name ] : cache[ id ];
			} else {
				return undefined;
			}
		},
		/**
		 * Set Data.
		 * @param {Element|window}
		 * @param {String} name
		 * @param {*|Object} - If data is an plain object, then add all properties to cache.
		 * @returns {this}
		 */
		set: function( ele, name, data ) {
			ele = exports._getTarget( ele );
			if ( !ele ) {
				return this;
			}
			var id = ele[ expando ],
				cache = exports.cache,
				thisCache;

			if ( !name && !id )
				return this;

			if ( !id )
				id = ++uuid;

			if ( typed.isPlainObj( name ) ) {
				ele[ expando ] = id;
				thisCache = cache[ id ] = utilExtend.extend( true, {}, name );
			} else if ( cache[ id ] ) {
				thisCache = cache[ id ];
			} else if ( data === undefined ) {
				thisCache = emptyObject;
			} else {
				thisCache = cache[ id ] = {};
			}

			if ( data !== undefined ) {
				ele[ expando ] = id;
				thisCache[ name ] = data;
			}

			return this;
		},
		/** @constant */
		expando: expando,
		/** A hash of Element which does not support data. */
		noData: {
			//quote from jQuery-1.4.1
			"embed": true,
			"object": true,
			"applet": true
		},
		/**
		 * Remove Data.
		 * @param {Element|window}
		 * @param {String} [name] - If name is undefined then remove all.
		 * @returns {this}
		 */
		removeData: function( ele, name ) {
			if ( !ele || ( ele.nodeName && exports.noData[ ele.nodeName.toLowerCase() ] ) )
				return this;

			ele = ele == window ?
				windowData :
				ele;

			var id = ele[ expando ],
				cache = exports.cache,
				thisCache = cache[ id ];

			if ( name ) {
				if ( thisCache ) {
					delete thisCache[ name ];

					if ( typed.isEmptyObj( thisCache ) )
						exports.removeData( ele );

				}

			} else {
				if ( support.deleteExpando ) {
					delete ele[ expando ];
				} else if ( ele.removeAttribute ) {
					ele.removeAttribute( expando );
				} else {
					ele[ expando ] = null;
				}
				delete cache[ id ];
			}
			return this;
		},
		/**
		 * @param {Element|window}
		 * @returns {Boolean}
		 */
		hasData: function( ele ) {
			ele = ele.nodeType ? exports.cache[ ele[ exports.expando ] ] : ele[ exports.expando ];
			return !!ele && !isEmptyDataObject( ele );
		}
	};

	$.fn.extend( /** @lends aQuery.prototype */ {
		/**
		 * Get or set data.
		 * @param {String}
		 * @param {*|Object} [value] - If value is undefined then get data, else if value is plain object then add all properties to cache.
		 * @returns {this|*}
		 */
		data: function( key, value ) {
			if ( key === undefined && this.length ) {
				return exports.get( this[ 0 ] );
			} else if ( typed.isObj( key ) ) {
				return this.each( function( ele ) {
					exports.get( ele, key );
				} );
			}
			return value === undefined ? exports.get( this[ 0 ], key ) : this.each( function( ele ) {
				exports.set( ele, key, value );
			} );
		},
		/**
		 * Remove data.
		 * @param {String} - If key is undefined then remove all.
		 * @returns {this}
		 */
		removeData: function( key ) {
			return this.each( function( ele ) {
				exports.removeData( ele, key );
			} );
		},
		/**
		 * @returns {Boolean}
		 */
		hasData: function() {
			return this[ 0 ] && exports.hasData( this[ 0 ] );
		}
	} );

	return exports;
} );

/*=======================================================*/

/*===================lib/sizzle===========================*/
/*!
 * Sizzle CSS Selector Engine v@VERSION
 * http://sizzlejs.com/
 *
 * Copyright 2013 jQuery Foundation, Inc. and other contributors
 * Released under the MIT license
 * http://jquery.org/license
 *
 * Date: @DATE
 */
(function( window, undefined ) {

var i,
	support,
	cachedruns,
	Expr,
	getText,
	isXML,
	compile,
	outermostContext,
	sortInput,

	// Local document vars
	setDocument,
	document,
	docElem,
	documentIsHTML,
	rbuggyQSA,
	rbuggyMatches,
	matches,
	contains,

	// Instance-specific data
	expando = "sizzle" + -(new Date()),
	preferredDoc = window.document,
	dirruns = 0,
	done = 0,
	classCache = createCache(),
	tokenCache = createCache(),
	compilerCache = createCache(),
	hasDuplicate = false,
	sortOrder = function( a, b ) {
		if ( a === b ) {
			hasDuplicate = true;
			return 0;
		}
		return 0;
	},

	// General-purpose constants
	strundefined = typeof undefined,
	MAX_NEGATIVE = 1 << 31,

	// Instance methods
	hasOwn = ({}).hasOwnProperty,
	arr = [],
	pop = arr.pop,
	push_native = arr.push,
	push = arr.push,
	slice = arr.slice,
	// Use a stripped-down indexOf if we can't use a native one
	indexOf = arr.indexOf || function( elem ) {
		var i = 0,
			len = this.length;
		for ( ; i < len; i++ ) {
			if ( this[i] === elem ) {
				return i;
			}
		}
		return -1;
	},

	booleans = "checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|loop|multiple|open|readonly|required|scoped",

	// Regular expressions

	// Whitespace characters http://www.w3.org/TR/css3-selectors/#whitespace
	whitespace = "[\\x20\\t\\r\\n\\f]",
	// http://www.w3.org/TR/css3-syntax/#characters
	characterEncoding = "(?:\\\\.|[\\w-]|[^\\x00-\\xa0])+",

	// Loosely modeled on CSS identifier characters
	// An unquoted value should be a CSS identifier http://www.w3.org/TR/css3-selectors/#attribute-selectors
	// Proper syntax: http://www.w3.org/TR/CSS21/syndata.html#value-def-identifier
	identifier = characterEncoding.replace( "w", "w#" ),

	// Acceptable operators http://www.w3.org/TR/selectors/#attribute-selectors
	attributes = "\\[" + whitespace + "*(" + characterEncoding + ")" + whitespace +
		"*(?:([*^$|!~]?=)" + whitespace + "*(?:(['\"])((?:\\\\.|[^\\\\])*?)\\3|(" + identifier + ")|)|)" + whitespace + "*\\]",

	// Prefer arguments quoted,
	//   then not containing pseudos/brackets,
	//   then attribute selectors/non-parenthetical expressions,
	//   then anything else
	// These preferences are here to reduce the number of selectors
	//   needing tokenize in the PSEUDO preFilter
	pseudos = ":(" + characterEncoding + ")(?:\\(((['\"])((?:\\\\.|[^\\\\])*?)\\3|((?:\\\\.|[^\\\\()[\\]]|" + attributes.replace( 3, 8 ) + ")*)|.*)\\)|)",

	// Leading and non-escaped trailing whitespace, capturing some non-whitespace characters preceding the latter
	rtrim = new RegExp( "^" + whitespace + "+|((?:^|[^\\\\])(?:\\\\.)*)" + whitespace + "+$", "g" ),

	rcomma = new RegExp( "^" + whitespace + "*," + whitespace + "*" ),
	rcombinators = new RegExp( "^" + whitespace + "*([>+~]|" + whitespace + ")" + whitespace + "*" ),

	rsibling = new RegExp( whitespace + "*[+~]" ),
	rattributeQuotes = new RegExp( "=" + whitespace + "*([^\\]'\"]*)" + whitespace + "*\\]", "g" ),

	rpseudo = new RegExp( pseudos ),
	ridentifier = new RegExp( "^" + identifier + "$" ),

	matchExpr = {
		"ID": new RegExp( "^#(" + characterEncoding + ")" ),
		"CLASS": new RegExp( "^\\.(" + characterEncoding + ")" ),
		"TAG": new RegExp( "^(" + characterEncoding.replace( "w", "w*" ) + ")" ),
		"ATTR": new RegExp( "^" + attributes ),
		"PSEUDO": new RegExp( "^" + pseudos ),
		"CHILD": new RegExp( "^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\(" + whitespace +
			"*(even|odd|(([+-]|)(\\d*)n|)" + whitespace + "*(?:([+-]|)" + whitespace +
			"*(\\d+)|))" + whitespace + "*\\)|)", "i" ),
		"bool": new RegExp( "^(?:" + booleans + ")$", "i" ),
		// For use in libraries implementing .is()
		// We use this for POS matching in `select`
		"needsContext": new RegExp( "^" + whitespace + "*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\(" +
			whitespace + "*((?:-\\d)?\\d*)" + whitespace + "*\\)|)(?=[^-]|$)", "i" )
	},

	rnative = /^[^{]+\{\s*\[native \w/,

	// Easily-parseable/retrievable ID or TAG or CLASS selectors
	rquickExpr = /^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/,

	rinputs = /^(?:input|select|textarea|button)$/i,
	rheader = /^h\d$/i,

	rescape = /'|\\/g,

	// CSS escapes http://www.w3.org/TR/CSS21/syndata.html#escaped-characters
	runescape = new RegExp( "\\\\([\\da-f]{1,6}" + whitespace + "?|(" + whitespace + ")|.)", "ig" ),
	funescape = function( _, escaped, escapedWhitespace ) {
		var high = "0x" + escaped - 0x10000;
		// NaN means non-codepoint
		// Support: Firefox
		// Workaround erroneous numeric interpretation of +"0x"
		return high !== high || escapedWhitespace ?
			escaped :
			// BMP codepoint
			high < 0 ?
				String.fromCharCode( high + 0x10000 ) :
				// Supplemental Plane codepoint (surrogate pair)
				String.fromCharCode( high >> 10 | 0xD800, high & 0x3FF | 0xDC00 );
	};

// Optimize for push.apply( _, NodeList )
try {
	push.apply(
		(arr = slice.call( preferredDoc.childNodes )),
		preferredDoc.childNodes
	);
	// Support: Android<4.0
	// Detect silently failing push.apply
	arr[ preferredDoc.childNodes.length ].nodeType;
} catch ( e ) {
	push = { apply: arr.length ?

		// Leverage slice if possible
		function( target, els ) {
			push_native.apply( target, slice.call(els) );
		} :

		// Support: IE<9
		// Otherwise append directly
		function( target, els ) {
			var j = target.length,
				i = 0;
			// Can't trust NodeList.length
			while ( (target[j++] = els[i++]) ) {}
			target.length = j - 1;
		}
	};
}

function Sizzle( selector, context, results, seed ) {
	var match, elem, m, nodeType,
		// QSA vars
		i, groups, old, nid, newContext, newSelector;

	if ( ( context ? context.ownerDocument || context : preferredDoc ) !== document ) {
		setDocument( context );
	}

	context = context || document;
	results = results || [];

	if ( !selector || typeof selector !== "string" ) {
		return results;
	}

	if ( (nodeType = context.nodeType) !== 1 && nodeType !== 9 ) {
		return [];
	}

	if ( documentIsHTML && !seed ) {

		// Shortcuts
		if ( (match = rquickExpr.exec( selector )) ) {
			// Speed-up: Sizzle("#ID")
			if ( (m = match[1]) ) {
				if ( nodeType === 9 ) {
					elem = context.getElementById( m );
					// Check parentNode to catch when Blackberry 4.6 returns
					// nodes that are no longer in the document #6963
					if ( elem && elem.parentNode ) {
						// Handle the case where IE, Opera, and Webkit return items
						// by name instead of ID
						if ( elem.id === m ) {
							results.push( elem );
							return results;
						}
					} else {
						return results;
					}
				} else {
					// Context is not a document
					if ( context.ownerDocument && (elem = context.ownerDocument.getElementById( m )) &&
						contains( context, elem ) && elem.id === m ) {
						results.push( elem );
						return results;
					}
				}

			// Speed-up: Sizzle("TAG")
			} else if ( match[2] ) {
				push.apply( results, context.getElementsByTagName( selector ) );
				return results;

			// Speed-up: Sizzle(".CLASS")
			} else if ( (m = match[3]) && support.getElementsByClassName && context.getElementsByClassName ) {
				push.apply( results, context.getElementsByClassName( m ) );
				return results;
			}
		}

		// QSA path
		if ( support.qsa && (!rbuggyQSA || !rbuggyQSA.test( selector )) ) {
			nid = old = expando;
			newContext = context;
			newSelector = nodeType === 9 && selector;

			// qSA works strangely on Element-rooted queries
			// We can work around this by specifying an extra ID on the root
			// and working up from there (Thanks to Andrew Dupont for the technique)
			// IE 8 doesn't work on object elements
			if ( nodeType === 1 && context.nodeName.toLowerCase() !== "object" ) {
				groups = tokenize( selector );

				if ( (old = context.getAttribute("id")) ) {
					nid = old.replace( rescape, "\\$&" );
				} else {
					context.setAttribute( "id", nid );
				}
				nid = "[id='" + nid + "'] ";

				i = groups.length;
				while ( i-- ) {
					groups[i] = nid + toSelector( groups[i] );
				}
				newContext = rsibling.test( selector ) && context.parentNode || context;
				newSelector = groups.join(",");
			}

			if ( newSelector ) {
				try {
					push.apply( results,
						newContext.querySelectorAll( newSelector )
					);
					return results;
				} catch(qsaError) {
				} finally {
					if ( !old ) {
						context.removeAttribute("id");
					}
				}
			}
		}
	}

	// All others
	return select( selector.replace( rtrim, "$1" ), context, results, seed );
}

/**
 * Create key-value caches of limited size
 * @returns {Function(string, Object)} Returns the Object data after storing it on itself with
 *	property name the (space-suffixed) string and (if the cache is larger than Expr.cacheLength)
 *	deleting the oldest entry
 */
function createCache() {
	var keys = [];

	function cache( key, value ) {
		// Use (key + " ") to avoid collision with native prototype properties (see Issue #157)
		if ( keys.push( key += " " ) > Expr.cacheLength ) {
			// Only keep the most recent entries
			delete cache[ keys.shift() ];
		}
		return (cache[ key ] = value);
	}
	return cache;
}

/**
 * Mark a function for special use by Sizzle
 * @param {Function} fn The function to mark
 */
function markFunction( fn ) {
	fn[ expando ] = true;
	return fn;
}

/**
 * Support testing using an element
 * @param {Function} fn Passed the created div and expects a boolean result
 */
function assert( fn ) {
	var div = document.createElement("div");

	try {
		return !!fn( div );
	} catch (e) {
		return false;
	} finally {
		// Remove from its parent by default
		if ( div.parentNode ) {
			div.parentNode.removeChild( div );
		}
		// release memory in IE
		div = null;
	}
}

/**
 * Adds the same handler for all of the specified attrs
 * @param {String} attrs Pipe-separated list of attributes
 * @param {Function} handler The method that will be applied
 */
function addHandle( attrs, handler ) {
	var arr = attrs.split("|"),
		i = attrs.length;

	while ( i-- ) {
		Expr.attrHandle[ arr[i] ] = handler;
	}
}

/**
 * Checks document order of two siblings
 * @param {Element} a
 * @param {Element} b
 * @returns {Number} Returns less than 0 if a precedes b, greater than 0 if a follows b
 */
function siblingCheck( a, b ) {
	var cur = b && a,
		diff = cur && a.nodeType === 1 && b.nodeType === 1 &&
			( ~b.sourceIndex || MAX_NEGATIVE ) -
			( ~a.sourceIndex || MAX_NEGATIVE );

	// Use IE sourceIndex if available on both nodes
	if ( diff ) {
		return diff;
	}

	// Check if b follows a
	if ( cur ) {
		while ( (cur = cur.nextSibling) ) {
			if ( cur === b ) {
				return -1;
			}
		}
	}

	return a ? 1 : -1;
}

/**
 * Returns a function to use in pseudos for input types
 * @param {String} type
 */
function createInputPseudo( type ) {
	return function( elem ) {
		var name = elem.nodeName.toLowerCase();
		return name === "input" && elem.type === type;
	};
}

/**
 * Returns a function to use in pseudos for buttons
 * @param {String} type
 */
function createButtonPseudo( type ) {
	return function( elem ) {
		var name = elem.nodeName.toLowerCase();
		return (name === "input" || name === "button") && elem.type === type;
	};
}

/**
 * Returns a function to use in pseudos for positionals
 * @param {Function} fn
 */
function createPositionalPseudo( fn ) {
	return markFunction(function( argument ) {
		argument = +argument;
		return markFunction(function( seed, matches ) {
			var j,
				matchIndexes = fn( [], seed.length, argument ),
				i = matchIndexes.length;

			// Match elements found at the specified indexes
			while ( i-- ) {
				if ( seed[ (j = matchIndexes[i]) ] ) {
					seed[j] = !(matches[j] = seed[j]);
				}
			}
		});
	});
}

/**
 * Detect xml
 * @param {Element|Object} elem An element or a document
 */
isXML = Sizzle.isXML = function( elem ) {
	// documentElement is verified for cases where it doesn't yet exist
	// (such as loading iframes in IE - #4833)
	var documentElement = elem && (elem.ownerDocument || elem).documentElement;
	return documentElement ? documentElement.nodeName !== "HTML" : false;
};

// Expose support vars for convenience
support = Sizzle.support = {};

/**
 * Sets document-related variables once based on the current document
 * @param {Element|Object} [doc] An element or document object to use to set the document
 * @returns {Object} Returns the current document
 */
setDocument = Sizzle.setDocument = function( node ) {
	var doc = node ? node.ownerDocument || node : preferredDoc,
		parent = doc.defaultView;

	// If no document and documentElement is available, return
	if ( doc === document || doc.nodeType !== 9 || !doc.documentElement ) {
		return document;
	}

	// Set our document
	document = doc;
	docElem = doc.documentElement;

	// Support tests
	documentIsHTML = !isXML( doc );

	// Support: IE>8
	// If iframe document is assigned to "document" variable and if iframe has been reloaded,
	// IE will throw "permission denied" error when accessing "document" variable, see jQuery #13936
	// IE6-8 do not support the defaultView property so parent will be undefined
	if ( parent && parent.attachEvent && parent !== parent.top ) {
		parent.attachEvent( "onbeforeunload", function() {
			setDocument();
		});
	}

	/* Attributes
	---------------------------------------------------------------------- */

	// Support: IE<8
	// Verify that getAttribute really returns attributes and not properties (excepting IE8 booleans)
	support.attributes = assert(function( div ) {
		div.className = "i";
		return !div.getAttribute("className");
	});

	/* getElement(s)By*
	---------------------------------------------------------------------- */

	// Check if getElementsByTagName("*") returns only elements
	support.getElementsByTagName = assert(function( div ) {
		div.appendChild( doc.createComment("") );
		return !div.getElementsByTagName("*").length;
	});

	// Check if getElementsByClassName can be trusted
	support.getElementsByClassName = assert(function( div ) {
		div.innerHTML = "<div class='a'></div><div class='a i'></div>";

		// Support: Safari<4
		// Catch class over-caching
		div.firstChild.className = "i";
		// Support: Opera<10
		// Catch gEBCN failure to find non-leading classes
		return div.getElementsByClassName("i").length === 2;
	});

	// Support: IE<10
	// Check if getElementById returns elements by name
	// The broken getElementById methods don't pick up programatically-set names,
	// so use a roundabout getElementsByName test
	support.getById = assert(function( div ) {
		docElem.appendChild( div ).id = expando;
		return !doc.getElementsByName || !doc.getElementsByName( expando ).length;
	});

	// ID find and filter
	if ( support.getById ) {
		Expr.find["ID"] = function( id, context ) {
			if ( typeof context.getElementById !== strundefined && documentIsHTML ) {
				var m = context.getElementById( id );
				// Check parentNode to catch when Blackberry 4.6 returns
				// nodes that are no longer in the document #6963
				return m && m.parentNode ? [m] : [];
			}
		};
		Expr.filter["ID"] = function( id ) {
			var attrId = id.replace( runescape, funescape );
			return function( elem ) {
				return elem.getAttribute("id") === attrId;
			};
		};
	} else {
		// Support: IE6/7
		// getElementById is not reliable as a find shortcut
		delete Expr.find["ID"];

		Expr.filter["ID"] =  function( id ) {
			var attrId = id.replace( runescape, funescape );
			return function( elem ) {
				var node = typeof elem.getAttributeNode !== strundefined && elem.getAttributeNode("id");
				return node && node.value === attrId;
			};
		};
	}

	// Tag
	Expr.find["TAG"] = support.getElementsByTagName ?
		function( tag, context ) {
			if ( typeof context.getElementsByTagName !== strundefined ) {
				return context.getElementsByTagName( tag );
			}
		} :
		function( tag, context ) {
			var elem,
				tmp = [],
				i = 0,
				results = context.getElementsByTagName( tag );

			// Filter out possible comments
			if ( tag === "*" ) {
				while ( (elem = results[i++]) ) {
					if ( elem.nodeType === 1 ) {
						tmp.push( elem );
					}
				}

				return tmp;
			}
			return results;
		};

	// Class
	Expr.find["CLASS"] = support.getElementsByClassName && function( className, context ) {
		if ( typeof context.getElementsByClassName !== strundefined && documentIsHTML ) {
			return context.getElementsByClassName( className );
		}
	};

	/* QSA/matchesSelector
	---------------------------------------------------------------------- */

	// QSA and matchesSelector support

	// matchesSelector(:active) reports false when true (IE9/Opera 11.5)
	rbuggyMatches = [];

	// qSa(:focus) reports false when true (Chrome 21)
	// We allow this because of a bug in IE8/9 that throws an error
	// whenever `document.activeElement` is accessed on an iframe
	// So, we allow :focus to pass through QSA all the time to avoid the IE error
	// See http://bugs.jquery.com/ticket/13378
	rbuggyQSA = [];

	if ( (support.qsa = rnative.test( doc.querySelectorAll )) ) {
		// Build QSA regex
		// Regex strategy adopted from Diego Perini
		assert(function( div ) {
			// Select is set to empty string on purpose
			// This is to test IE's treatment of not explicitly
			// setting a boolean content attribute,
			// since its presence should be enough
			// http://bugs.jquery.com/ticket/12359
			div.innerHTML = "<select><option selected=''></option></select>";

			// Support: IE8
			// Boolean attributes and "value" are not treated correctly
			if ( !div.querySelectorAll("[selected]").length ) {
				rbuggyQSA.push( "\\[" + whitespace + "*(?:value|" + booleans + ")" );
			}

			// Webkit/Opera - :checked should return selected option elements
			// http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
			// IE8 throws error here and will not see later tests
			if ( !div.querySelectorAll(":checked").length ) {
				rbuggyQSA.push(":checked");
			}
		});

		assert(function( div ) {

			// Support: Opera 10-12/IE8
			// ^= $= *= and empty values
			// Should not select anything
			// Support: Windows 8 Native Apps
			// The type attribute is restricted during .innerHTML assignment
			var input = doc.createElement("input");
			input.setAttribute( "type", "hidden" );
			div.appendChild( input ).setAttribute( "t", "" );

			if ( div.querySelectorAll("[t^='']").length ) {
				rbuggyQSA.push( "[*^$]=" + whitespace + "*(?:''|\"\")" );
			}

			// FF 3.5 - :enabled/:disabled and hidden elements (hidden elements are still enabled)
			// IE8 throws error here and will not see later tests
			if ( !div.querySelectorAll(":enabled").length ) {
				rbuggyQSA.push( ":enabled", ":disabled" );
			}

			// Opera 10-11 does not throw on post-comma invalid pseudos
			div.querySelectorAll("*,:x");
			rbuggyQSA.push(",.*:");
		});
	}

	if ( (support.matchesSelector = rnative.test( (matches = docElem.webkitMatchesSelector ||
		docElem.mozMatchesSelector ||
		docElem.oMatchesSelector ||
		docElem.msMatchesSelector) )) ) {

		assert(function( div ) {
			// Check to see if it's possible to do matchesSelector
			// on a disconnected node (IE 9)
			support.disconnectedMatch = matches.call( div, "div" );

			// This should fail with an exception
			// Gecko does not error, returns false instead
			matches.call( div, "[s!='']:x" );
			rbuggyMatches.push( "!=", pseudos );
		});
	}

	rbuggyQSA = rbuggyQSA.length && new RegExp( rbuggyQSA.join("|") );
	rbuggyMatches = rbuggyMatches.length && new RegExp( rbuggyMatches.join("|") );

	/* Contains
	---------------------------------------------------------------------- */

	// Element contains another
	// Purposefully does not implement inclusive descendent
	// As in, an element does not contain itself
	contains = rnative.test( docElem.contains ) || docElem.compareDocumentPosition ?
		function( a, b ) {
			var adown = a.nodeType === 9 ? a.documentElement : a,
				bup = b && b.parentNode;
			return a === bup || !!( bup && bup.nodeType === 1 && (
				adown.contains ?
					adown.contains( bup ) :
					a.compareDocumentPosition && a.compareDocumentPosition( bup ) & 16
			));
		} :
		function( a, b ) {
			if ( b ) {
				while ( (b = b.parentNode) ) {
					if ( b === a ) {
						return true;
					}
				}
			}
			return false;
		};

	/* Sorting
	---------------------------------------------------------------------- */

	// Document order sorting
	sortOrder = docElem.compareDocumentPosition ?
	function( a, b ) {

		// Flag for duplicate removal
		if ( a === b ) {
			hasDuplicate = true;
			return 0;
		}

		var compare = b.compareDocumentPosition && a.compareDocumentPosition && a.compareDocumentPosition( b );

		if ( compare ) {
			// Disconnected nodes
			if ( compare & 1 ||
				(!support.sortDetached && b.compareDocumentPosition( a ) === compare) ) {

				// Choose the first element that is related to our preferred document
				if ( a === doc || contains(preferredDoc, a) ) {
					return -1;
				}
				if ( b === doc || contains(preferredDoc, b) ) {
					return 1;
				}

				// Maintain original order
				return sortInput ?
					( indexOf.call( sortInput, a ) - indexOf.call( sortInput, b ) ) :
					0;
			}

			return compare & 4 ? -1 : 1;
		}

		// Not directly comparable, sort on existence of method
		return a.compareDocumentPosition ? -1 : 1;
	} :
	function( a, b ) {
		var cur,
			i = 0,
			aup = a.parentNode,
			bup = b.parentNode,
			ap = [ a ],
			bp = [ b ];

		// Exit early if the nodes are identical
		if ( a === b ) {
			hasDuplicate = true;
			return 0;

		// Parentless nodes are either documents or disconnected
		} else if ( !aup || !bup ) {
			return a === doc ? -1 :
				b === doc ? 1 :
				aup ? -1 :
				bup ? 1 :
				sortInput ?
				( indexOf.call( sortInput, a ) - indexOf.call( sortInput, b ) ) :
				0;

		// If the nodes are siblings, we can do a quick check
		} else if ( aup === bup ) {
			return siblingCheck( a, b );
		}

		// Otherwise we need full lists of their ancestors for comparison
		cur = a;
		while ( (cur = cur.parentNode) ) {
			ap.unshift( cur );
		}
		cur = b;
		while ( (cur = cur.parentNode) ) {
			bp.unshift( cur );
		}

		// Walk down the tree looking for a discrepancy
		while ( ap[i] === bp[i] ) {
			i++;
		}

		return i ?
			// Do a sibling check if the nodes have a common ancestor
			siblingCheck( ap[i], bp[i] ) :

			// Otherwise nodes in our document sort first
			ap[i] === preferredDoc ? -1 :
			bp[i] === preferredDoc ? 1 :
			0;
	};

	return doc;
};

Sizzle.matches = function( expr, elements ) {
	return Sizzle( expr, null, null, elements );
};

Sizzle.matchesSelector = function( elem, expr ) {
	// Set document vars if needed
	if ( ( elem.ownerDocument || elem ) !== document ) {
		setDocument( elem );
	}

	// Make sure that attribute selectors are quoted
	expr = expr.replace( rattributeQuotes, "='$1']" );

	if ( support.matchesSelector && documentIsHTML &&
		( !rbuggyMatches || !rbuggyMatches.test( expr ) ) &&
		( !rbuggyQSA     || !rbuggyQSA.test( expr ) ) ) {

		try {
			var ret = matches.call( elem, expr );

			// IE 9's matchesSelector returns false on disconnected nodes
			if ( ret || support.disconnectedMatch ||
					// As well, disconnected nodes are said to be in a document
					// fragment in IE 9
					elem.document && elem.document.nodeType !== 11 ) {
				return ret;
			}
		} catch(e) {}
	}

	return Sizzle( expr, document, null, [elem] ).length > 0;
};

Sizzle.contains = function( context, elem ) {
	// Set document vars if needed
	if ( ( context.ownerDocument || context ) !== document ) {
		setDocument( context );
	}
	return contains( context, elem );
};

Sizzle.attr = function( elem, name ) {
	// Set document vars if needed
	if ( ( elem.ownerDocument || elem ) !== document ) {
		setDocument( elem );
	}

	var fn = Expr.attrHandle[ name.toLowerCase() ],
		// Don't get fooled by Object.prototype properties (jQuery #13807)
		val = fn && hasOwn.call( Expr.attrHandle, name.toLowerCase() ) ?
			fn( elem, name, !documentIsHTML ) :
			undefined;

	return val === undefined ?
		support.attributes || !documentIsHTML ?
			elem.getAttribute( name ) :
			(val = elem.getAttributeNode(name)) && val.specified ?
				val.value :
				null :
		val;
};

Sizzle.error = function( msg ) {
	throw new Error( "Syntax error, unrecognized expression: " + msg );
};

/**
 * Document sorting and removing duplicates
 * @param {ArrayLike} results
 */
Sizzle.uniqueSort = function( results ) {
	var elem,
		duplicates = [],
		j = 0,
		i = 0;

	// Unless we *know* we can detect duplicates, assume their presence
	hasDuplicate = !support.detectDuplicates;
	sortInput = !support.sortStable && results.slice( 0 );
	results.sort( sortOrder );

	if ( hasDuplicate ) {
		while ( (elem = results[i++]) ) {
			if ( elem === results[ i ] ) {
				j = duplicates.push( i );
			}
		}
		while ( j-- ) {
			results.splice( duplicates[ j ], 1 );
		}
	}

	return results;
};

/**
 * Utility function for retrieving the text value of an array of DOM nodes
 * @param {Array|Element} elem
 */
getText = Sizzle.getText = function( elem ) {
	var node,
		ret = "",
		i = 0,
		nodeType = elem.nodeType;

	if ( !nodeType ) {
		// If no nodeType, this is expected to be an array
		for ( ; (node = elem[i]); i++ ) {
			// Do not traverse comment nodes
			ret += getText( node );
		}
	} else if ( nodeType === 1 || nodeType === 9 || nodeType === 11 ) {
		// Use textContent for elements
		// innerText usage removed for consistency of new lines (see #11153)
		if ( typeof elem.textContent === "string" ) {
			return elem.textContent;
		} else {
			// Traverse its children
			for ( elem = elem.firstChild; elem; elem = elem.nextSibling ) {
				ret += getText( elem );
			}
		}
	} else if ( nodeType === 3 || nodeType === 4 ) {
		return elem.nodeValue;
	}
	// Do not include comment or processing instruction nodes

	return ret;
};

Expr = Sizzle.selectors = {

	// Can be adjusted by the user
	cacheLength: 50,

	createPseudo: markFunction,

	match: matchExpr,

	attrHandle: {},

	find: {},

	relative: {
		">": { dir: "parentNode", first: true },
		" ": { dir: "parentNode" },
		"+": { dir: "previousSibling", first: true },
		"~": { dir: "previousSibling" }
	},

	preFilter: {
		"ATTR": function( match ) {
			match[1] = match[1].replace( runescape, funescape );

			// Move the given value to match[3] whether quoted or unquoted
			match[3] = ( match[4] || match[5] || "" ).replace( runescape, funescape );

			if ( match[2] === "~=" ) {
				match[3] = " " + match[3] + " ";
			}

			return match.slice( 0, 4 );
		},

		"CHILD": function( match ) {
			/* matches from matchExpr["CHILD"]
				1 type (only|nth|...)
				2 what (child|of-type)
				3 argument (even|odd|\d*|\d*n([+-]\d+)?|...)
				4 xn-component of xn+y argument ([+-]?\d*n|)
				5 sign of xn-component
				6 x of xn-component
				7 sign of y-component
				8 y of y-component
			*/
			match[1] = match[1].toLowerCase();

			if ( match[1].slice( 0, 3 ) === "nth" ) {
				// nth-* requires argument
				if ( !match[3] ) {
					Sizzle.error( match[0] );
				}

				// numeric x and y parameters for Expr.filter.CHILD
				// remember that false/true cast respectively to 0/1
				match[4] = +( match[4] ? match[5] + (match[6] || 1) : 2 * ( match[3] === "even" || match[3] === "odd" ) );
				match[5] = +( ( match[7] + match[8] ) || match[3] === "odd" );

			// other types prohibit arguments
			} else if ( match[3] ) {
				Sizzle.error( match[0] );
			}

			return match;
		},

		"PSEUDO": function( match ) {
			var excess,
				unquoted = !match[5] && match[2];

			if ( matchExpr["CHILD"].test( match[0] ) ) {
				return null;
			}

			// Accept quoted arguments as-is
			if ( match[3] && match[4] !== undefined ) {
				match[2] = match[4];

			// Strip excess characters from unquoted arguments
			} else if ( unquoted && rpseudo.test( unquoted ) &&
				// Get excess from tokenize (recursively)
				(excess = tokenize( unquoted, true )) &&
				// advance to the next closing parenthesis
				(excess = unquoted.indexOf( ")", unquoted.length - excess ) - unquoted.length) ) {

				// excess is a negative index
				match[0] = match[0].slice( 0, excess );
				match[2] = unquoted.slice( 0, excess );
			}

			// Return only captures needed by the pseudo filter method (type and argument)
			return match.slice( 0, 3 );
		}
	},

	filter: {

		"TAG": function( nodeNameSelector ) {
			var nodeName = nodeNameSelector.replace( runescape, funescape ).toLowerCase();
			return nodeNameSelector === "*" ?
				function() { return true; } :
				function( elem ) {
					return elem.nodeName && elem.nodeName.toLowerCase() === nodeName;
				};
		},

		"CLASS": function( className ) {
			var pattern = classCache[ className + " " ];

			return pattern ||
				(pattern = new RegExp( "(^|" + whitespace + ")" + className + "(" + whitespace + "|$)" )) &&
				classCache( className, function( elem ) {
					return pattern.test( typeof elem.className === "string" && elem.className || typeof elem.getAttribute !== strundefined && elem.getAttribute("class") || "" );
				});
		},

		"ATTR": function( name, operator, check ) {
			return function( elem ) {
				var result = Sizzle.attr( elem, name );

				if ( result == null ) {
					return operator === "!=";
				}
				if ( !operator ) {
					return true;
				}

				result += "";

				return operator === "=" ? result === check :
					operator === "!=" ? result !== check :
					operator === "^=" ? check && result.indexOf( check ) === 0 :
					operator === "*=" ? check && result.indexOf( check ) > -1 :
					operator === "$=" ? check && result.slice( -check.length ) === check :
					operator === "~=" ? ( " " + result + " " ).indexOf( check ) > -1 :
					operator === "|=" ? result === check || result.slice( 0, check.length + 1 ) === check + "-" :
					false;
			};
		},

		"CHILD": function( type, what, argument, first, last ) {
			var simple = type.slice( 0, 3 ) !== "nth",
				forward = type.slice( -4 ) !== "last",
				ofType = what === "of-type";

			return first === 1 && last === 0 ?

				// Shortcut for :nth-*(n)
				function( elem ) {
					return !!elem.parentNode;
				} :

				function( elem, context, xml ) {
					var cache, outerCache, node, diff, nodeIndex, start,
						dir = simple !== forward ? "nextSibling" : "previousSibling",
						parent = elem.parentNode,
						name = ofType && elem.nodeName.toLowerCase(),
						useCache = !xml && !ofType;

					if ( parent ) {

						// :(first|last|only)-(child|of-type)
						if ( simple ) {
							while ( dir ) {
								node = elem;
								while ( (node = node[ dir ]) ) {
									if ( ofType ? node.nodeName.toLowerCase() === name : node.nodeType === 1 ) {
										return false;
									}
								}
								// Reverse direction for :only-* (if we haven't yet done so)
								start = dir = type === "only" && !start && "nextSibling";
							}
							return true;
						}

						start = [ forward ? parent.firstChild : parent.lastChild ];

						// non-xml :nth-child(...) stores cache data on `parent`
						if ( forward && useCache ) {
							// Seek `elem` from a previously-cached index
							outerCache = parent[ expando ] || (parent[ expando ] = {});
							cache = outerCache[ type ] || [];
							nodeIndex = cache[0] === dirruns && cache[1];
							diff = cache[0] === dirruns && cache[2];
							node = nodeIndex && parent.childNodes[ nodeIndex ];

							while ( (node = ++nodeIndex && node && node[ dir ] ||

								// Fallback to seeking `elem` from the start
								(diff = nodeIndex = 0) || start.pop()) ) {

								// When found, cache indexes on `parent` and break
								if ( node.nodeType === 1 && ++diff && node === elem ) {
									outerCache[ type ] = [ dirruns, nodeIndex, diff ];
									break;
								}
							}

						// Use previously-cached element index if available
						} else if ( useCache && (cache = (elem[ expando ] || (elem[ expando ] = {}))[ type ]) && cache[0] === dirruns ) {
							diff = cache[1];

						// xml :nth-child(...) or :nth-last-child(...) or :nth(-last)?-of-type(...)
						} else {
							// Use the same loop as above to seek `elem` from the start
							while ( (node = ++nodeIndex && node && node[ dir ] ||
								(diff = nodeIndex = 0) || start.pop()) ) {

								if ( ( ofType ? node.nodeName.toLowerCase() === name : node.nodeType === 1 ) && ++diff ) {
									// Cache the index of each encountered element
									if ( useCache ) {
										(node[ expando ] || (node[ expando ] = {}))[ type ] = [ dirruns, diff ];
									}

									if ( node === elem ) {
										break;
									}
								}
							}
						}

						// Incorporate the offset, then check against cycle size
						diff -= last;
						return diff === first || ( diff % first === 0 && diff / first >= 0 );
					}
				};
		},

		"PSEUDO": function( pseudo, argument ) {
			// pseudo-class names are case-insensitive
			// http://www.w3.org/TR/selectors/#pseudo-classes
			// Prioritize by case sensitivity in case custom pseudos are added with uppercase letters
			// Remember that setFilters inherits from pseudos
			var args,
				fn = Expr.pseudos[ pseudo ] || Expr.setFilters[ pseudo.toLowerCase() ] ||
					Sizzle.error( "unsupported pseudo: " + pseudo );

			// The user may use createPseudo to indicate that
			// arguments are needed to create the filter function
			// just as Sizzle does
			if ( fn[ expando ] ) {
				return fn( argument );
			}

			// But maintain support for old signatures
			if ( fn.length > 1 ) {
				args = [ pseudo, pseudo, "", argument ];
				return Expr.setFilters.hasOwnProperty( pseudo.toLowerCase() ) ?
					markFunction(function( seed, matches ) {
						var idx,
							matched = fn( seed, argument ),
							i = matched.length;
						while ( i-- ) {
							idx = indexOf.call( seed, matched[i] );
							seed[ idx ] = !( matches[ idx ] = matched[i] );
						}
					}) :
					function( elem ) {
						return fn( elem, 0, args );
					};
			}

			return fn;
		}
	},

	pseudos: {
		// Potentially complex pseudos
		"not": markFunction(function( selector ) {
			// Trim the selector passed to compile
			// to avoid treating leading and trailing
			// spaces as combinators
			var input = [],
				results = [],
				matcher = compile( selector.replace( rtrim, "$1" ) );

			return matcher[ expando ] ?
				markFunction(function( seed, matches, context, xml ) {
					var elem,
						unmatched = matcher( seed, null, xml, [] ),
						i = seed.length;

					// Match elements unmatched by `matcher`
					while ( i-- ) {
						if ( (elem = unmatched[i]) ) {
							seed[i] = !(matches[i] = elem);
						}
					}
				}) :
				function( elem, context, xml ) {
					input[0] = elem;
					matcher( input, null, xml, results );
					return !results.pop();
				};
		}),

		"has": markFunction(function( selector ) {
			return function( elem ) {
				return Sizzle( selector, elem ).length > 0;
			};
		}),

		"contains": markFunction(function( text ) {
			return function( elem ) {
				return ( elem.textContent || elem.innerText || getText( elem ) ).indexOf( text ) > -1;
			};
		}),

		// "Whether an element is represented by a :lang() selector
		// is based solely on the element's language value
		// being equal to the identifier C,
		// or beginning with the identifier C immediately followed by "-".
		// The matching of C against the element's language value is performed case-insensitively.
		// The identifier C does not have to be a valid language name."
		// http://www.w3.org/TR/selectors/#lang-pseudo
		"lang": markFunction( function( lang ) {
			// lang value must be a valid identifier
			if ( !ridentifier.test(lang || "") ) {
				Sizzle.error( "unsupported lang: " + lang );
			}
			lang = lang.replace( runescape, funescape ).toLowerCase();
			return function( elem ) {
				var elemLang;
				do {
					if ( (elemLang = documentIsHTML ?
						elem.lang :
						elem.getAttribute("xml:lang") || elem.getAttribute("lang")) ) {

						elemLang = elemLang.toLowerCase();
						return elemLang === lang || elemLang.indexOf( lang + "-" ) === 0;
					}
				} while ( (elem = elem.parentNode) && elem.nodeType === 1 );
				return false;
			};
		}),

		// Miscellaneous
		"target": function( elem ) {
			var hash = window.location && window.location.hash;
			return hash && hash.slice( 1 ) === elem.id;
		},

		"root": function( elem ) {
			return elem === docElem;
		},

		"focus": function( elem ) {
			return elem === document.activeElement && (!document.hasFocus || document.hasFocus()) && !!(elem.type || elem.href || ~elem.tabIndex);
		},

		// Boolean properties
		"enabled": function( elem ) {
			return elem.disabled === false;
		},

		"disabled": function( elem ) {
			return elem.disabled === true;
		},

		"checked": function( elem ) {
			// In CSS3, :checked should return both checked and selected elements
			// http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
			var nodeName = elem.nodeName.toLowerCase();
			return (nodeName === "input" && !!elem.checked) || (nodeName === "option" && !!elem.selected);
		},

		"selected": function( elem ) {
			// Accessing this property makes selected-by-default
			// options in Safari work properly
			if ( elem.parentNode ) {
				elem.parentNode.selectedIndex;
			}

			return elem.selected === true;
		},

		// Contents
		"empty": function( elem ) {
			// http://www.w3.org/TR/selectors/#empty-pseudo
			// :empty is only affected by element nodes and content nodes(including text(3), cdata(4)),
			//   not comment, processing instructions, or others
			// Thanks to Diego Perini for the nodeName shortcut
			//   Greater than "@" means alpha characters (specifically not starting with "#" or "?")
			for ( elem = elem.firstChild; elem; elem = elem.nextSibling ) {
				if ( elem.nodeName > "@" || elem.nodeType === 3 || elem.nodeType === 4 ) {
					return false;
				}
			}
			return true;
		},

		"parent": function( elem ) {
			return !Expr.pseudos["empty"]( elem );
		},

		// Element/input types
		"header": function( elem ) {
			return rheader.test( elem.nodeName );
		},

		"input": function( elem ) {
			return rinputs.test( elem.nodeName );
		},

		"button": function( elem ) {
			var name = elem.nodeName.toLowerCase();
			return name === "input" && elem.type === "button" || name === "button";
		},

		"text": function( elem ) {
			var attr;
			// IE6 and 7 will map elem.type to 'text' for new HTML5 types (search, etc)
			// use getAttribute instead to test this case
			return elem.nodeName.toLowerCase() === "input" &&
				elem.type === "text" &&
				( (attr = elem.getAttribute("type")) == null || attr.toLowerCase() === elem.type );
		},

		// Position-in-collection
		"first": createPositionalPseudo(function() {
			return [ 0 ];
		}),

		"last": createPositionalPseudo(function( matchIndexes, length ) {
			return [ length - 1 ];
		}),

		"eq": createPositionalPseudo(function( matchIndexes, length, argument ) {
			return [ argument < 0 ? argument + length : argument ];
		}),

		"even": createPositionalPseudo(function( matchIndexes, length ) {
			var i = 0;
			for ( ; i < length; i += 2 ) {
				matchIndexes.push( i );
			}
			return matchIndexes;
		}),

		"odd": createPositionalPseudo(function( matchIndexes, length ) {
			var i = 1;
			for ( ; i < length; i += 2 ) {
				matchIndexes.push( i );
			}
			return matchIndexes;
		}),

		"lt": createPositionalPseudo(function( matchIndexes, length, argument ) {
			var i = argument < 0 ? argument + length : argument;
			for ( ; --i >= 0; ) {
				matchIndexes.push( i );
			}
			return matchIndexes;
		}),

		"gt": createPositionalPseudo(function( matchIndexes, length, argument ) {
			var i = argument < 0 ? argument + length : argument;
			for ( ; ++i < length; ) {
				matchIndexes.push( i );
			}
			return matchIndexes;
		})
	}
};

Expr.pseudos["nth"] = Expr.pseudos["eq"];

// Add button/input type pseudos
for ( i in { radio: true, checkbox: true, file: true, password: true, image: true } ) {
	Expr.pseudos[ i ] = createInputPseudo( i );
}
for ( i in { submit: true, reset: true } ) {
	Expr.pseudos[ i ] = createButtonPseudo( i );
}

// Easy API for creating new setFilters
function setFilters() {}
setFilters.prototype = Expr.filters = Expr.pseudos;
Expr.setFilters = new setFilters();

function tokenize( selector, parseOnly ) {
	var matched, match, tokens, type,
		soFar, groups, preFilters,
		cached = tokenCache[ selector + " " ];

	if ( cached ) {
		return parseOnly ? 0 : cached.slice( 0 );
	}

	soFar = selector;
	groups = [];
	preFilters = Expr.preFilter;

	while ( soFar ) {

		// Comma and first run
		if ( !matched || (match = rcomma.exec( soFar )) ) {
			if ( match ) {
				// Don't consume trailing commas as valid
				soFar = soFar.slice( match[0].length ) || soFar;
			}
			groups.push( tokens = [] );
		}

		matched = false;

		// Combinators
		if ( (match = rcombinators.exec( soFar )) ) {
			matched = match.shift();
			tokens.push({
				value: matched,
				// Cast descendant combinators to space
				type: match[0].replace( rtrim, " " )
			});
			soFar = soFar.slice( matched.length );
		}

		// Filters
		for ( type in Expr.filter ) {
			if ( (match = matchExpr[ type ].exec( soFar )) && (!preFilters[ type ] ||
				(match = preFilters[ type ]( match ))) ) {
				matched = match.shift();
				tokens.push({
					value: matched,
					type: type,
					matches: match
				});
				soFar = soFar.slice( matched.length );
			}
		}

		if ( !matched ) {
			break;
		}
	}

	// Return the length of the invalid excess
	// if we're just parsing
	// Otherwise, throw an error or return tokens
	return parseOnly ?
		soFar.length :
		soFar ?
			Sizzle.error( selector ) :
			// Cache the tokens
			tokenCache( selector, groups ).slice( 0 );
}

function toSelector( tokens ) {
	var i = 0,
		len = tokens.length,
		selector = "";
	for ( ; i < len; i++ ) {
		selector += tokens[i].value;
	}
	return selector;
}

function addCombinator( matcher, combinator, base ) {
	var dir = combinator.dir,
		checkNonElements = base && dir === "parentNode",
		doneName = done++;

	return combinator.first ?
		// Check against closest ancestor/preceding element
		function( elem, context, xml ) {
			while ( (elem = elem[ dir ]) ) {
				if ( elem.nodeType === 1 || checkNonElements ) {
					return matcher( elem, context, xml );
				}
			}
		} :

		// Check against all ancestor/preceding elements
		function( elem, context, xml ) {
			var data, cache, outerCache,
				dirkey = dirruns + " " + doneName;

			// We can't set arbitrary data on XML nodes, so they don't benefit from dir caching
			if ( xml ) {
				while ( (elem = elem[ dir ]) ) {
					if ( elem.nodeType === 1 || checkNonElements ) {
						if ( matcher( elem, context, xml ) ) {
							return true;
						}
					}
				}
			} else {
				while ( (elem = elem[ dir ]) ) {
					if ( elem.nodeType === 1 || checkNonElements ) {
						outerCache = elem[ expando ] || (elem[ expando ] = {});
						if ( (cache = outerCache[ dir ]) && cache[0] === dirkey ) {
							if ( (data = cache[1]) === true || data === cachedruns ) {
								return data === true;
							}
						} else {
							cache = outerCache[ dir ] = [ dirkey ];
							cache[1] = matcher( elem, context, xml ) || cachedruns;
							if ( cache[1] === true ) {
								return true;
							}
						}
					}
				}
			}
		};
}

function elementMatcher( matchers ) {
	return matchers.length > 1 ?
		function( elem, context, xml ) {
			var i = matchers.length;
			while ( i-- ) {
				if ( !matchers[i]( elem, context, xml ) ) {
					return false;
				}
			}
			return true;
		} :
		matchers[0];
}

function condense( unmatched, map, filter, context, xml ) {
	var elem,
		newUnmatched = [],
		i = 0,
		len = unmatched.length,
		mapped = map != null;

	for ( ; i < len; i++ ) {
		if ( (elem = unmatched[i]) ) {
			if ( !filter || filter( elem, context, xml ) ) {
				newUnmatched.push( elem );
				if ( mapped ) {
					map.push( i );
				}
			}
		}
	}

	return newUnmatched;
}

function setMatcher( preFilter, selector, matcher, postFilter, postFinder, postSelector ) {
	if ( postFilter && !postFilter[ expando ] ) {
		postFilter = setMatcher( postFilter );
	}
	if ( postFinder && !postFinder[ expando ] ) {
		postFinder = setMatcher( postFinder, postSelector );
	}
	return markFunction(function( seed, results, context, xml ) {
		var temp, i, elem,
			preMap = [],
			postMap = [],
			preexisting = results.length,

			// Get initial elements from seed or context
			elems = seed || multipleContexts( selector || "*", context.nodeType ? [ context ] : context, [] ),

			// Prefilter to get matcher input, preserving a map for seed-results synchronization
			matcherIn = preFilter && ( seed || !selector ) ?
				condense( elems, preMap, preFilter, context, xml ) :
				elems,

			matcherOut = matcher ?
				// If we have a postFinder, or filtered seed, or non-seed postFilter or preexisting results,
				postFinder || ( seed ? preFilter : preexisting || postFilter ) ?

					// ...intermediate processing is necessary
					[] :

					// ...otherwise use results directly
					results :
				matcherIn;

		// Find primary matches
		if ( matcher ) {
			matcher( matcherIn, matcherOut, context, xml );
		}

		// Apply postFilter
		if ( postFilter ) {
			temp = condense( matcherOut, postMap );
			postFilter( temp, [], context, xml );

			// Un-match failing elements by moving them back to matcherIn
			i = temp.length;
			while ( i-- ) {
				if ( (elem = temp[i]) ) {
					matcherOut[ postMap[i] ] = !(matcherIn[ postMap[i] ] = elem);
				}
			}
		}

		if ( seed ) {
			if ( postFinder || preFilter ) {
				if ( postFinder ) {
					// Get the final matcherOut by condensing this intermediate into postFinder contexts
					temp = [];
					i = matcherOut.length;
					while ( i-- ) {
						if ( (elem = matcherOut[i]) ) {
							// Restore matcherIn since elem is not yet a final match
							temp.push( (matcherIn[i] = elem) );
						}
					}
					postFinder( null, (matcherOut = []), temp, xml );
				}

				// Move matched elements from seed to results to keep them synchronized
				i = matcherOut.length;
				while ( i-- ) {
					if ( (elem = matcherOut[i]) &&
						(temp = postFinder ? indexOf.call( seed, elem ) : preMap[i]) > -1 ) {

						seed[temp] = !(results[temp] = elem);
					}
				}
			}

		// Add elements to results, through postFinder if defined
		} else {
			matcherOut = condense(
				matcherOut === results ?
					matcherOut.splice( preexisting, matcherOut.length ) :
					matcherOut
			);
			if ( postFinder ) {
				postFinder( null, results, matcherOut, xml );
			} else {
				push.apply( results, matcherOut );
			}
		}
	});
}

function matcherFromTokens( tokens ) {
	var checkContext, matcher, j,
		len = tokens.length,
		leadingRelative = Expr.relative[ tokens[0].type ],
		implicitRelative = leadingRelative || Expr.relative[" "],
		i = leadingRelative ? 1 : 0,

		// The foundational matcher ensures that elements are reachable from top-level context(s)
		matchContext = addCombinator( function( elem ) {
			return elem === checkContext;
		}, implicitRelative, true ),
		matchAnyContext = addCombinator( function( elem ) {
			return indexOf.call( checkContext, elem ) > -1;
		}, implicitRelative, true ),
		matchers = [ function( elem, context, xml ) {
			return ( !leadingRelative && ( xml || context !== outermostContext ) ) || (
				(checkContext = context).nodeType ?
					matchContext( elem, context, xml ) :
					matchAnyContext( elem, context, xml ) );
		} ];

	for ( ; i < len; i++ ) {
		if ( (matcher = Expr.relative[ tokens[i].type ]) ) {
			matchers = [ addCombinator(elementMatcher( matchers ), matcher) ];
		} else {
			matcher = Expr.filter[ tokens[i].type ].apply( null, tokens[i].matches );

			// Return special upon seeing a positional matcher
			if ( matcher[ expando ] ) {
				// Find the next relative operator (if any) for proper handling
				j = ++i;
				for ( ; j < len; j++ ) {
					if ( Expr.relative[ tokens[j].type ] ) {
						break;
					}
				}
				return setMatcher(
					i > 1 && elementMatcher( matchers ),
					i > 1 && toSelector(
						// If the preceding token was a descendant combinator, insert an implicit any-element `*`
						tokens.slice( 0, i - 1 ).concat({ value: tokens[ i - 2 ].type === " " ? "*" : "" })
					).replace( rtrim, "$1" ),
					matcher,
					i < j && matcherFromTokens( tokens.slice( i, j ) ),
					j < len && matcherFromTokens( (tokens = tokens.slice( j )) ),
					j < len && toSelector( tokens )
				);
			}
			matchers.push( matcher );
		}
	}

	return elementMatcher( matchers );
}

function matcherFromGroupMatchers( elementMatchers, setMatchers ) {
	// A counter to specify which element is currently being matched
	var matcherCachedRuns = 0,
		bySet = setMatchers.length > 0,
		byElement = elementMatchers.length > 0,
		superMatcher = function( seed, context, xml, results, expandContext ) {
			var elem, j, matcher,
				setMatched = [],
				matchedCount = 0,
				i = "0",
				unmatched = seed && [],
				outermost = expandContext != null,
				contextBackup = outermostContext,
				// We must always have either seed elements or context
				elems = seed || byElement && Expr.find["TAG"]( "*", expandContext && context.parentNode || context ),
				// Use integer dirruns iff this is the outermost matcher
				dirrunsUnique = (dirruns += contextBackup == null ? 1 : Math.random() || 0.1);

			if ( outermost ) {
				outermostContext = context !== document && context;
				cachedruns = matcherCachedRuns;
			}

			// Add elements passing elementMatchers directly to results
			// Keep `i` a string if there are no elements so `matchedCount` will be "00" below
			for ( ; (elem = elems[i]) != null; i++ ) {
				if ( byElement && elem ) {
					j = 0;
					while ( (matcher = elementMatchers[j++]) ) {
						if ( matcher( elem, context, xml ) ) {
							results.push( elem );
							break;
						}
					}
					if ( outermost ) {
						dirruns = dirrunsUnique;
						cachedruns = ++matcherCachedRuns;
					}
				}

				// Track unmatched elements for set filters
				if ( bySet ) {
					// They will have gone through all possible matchers
					if ( (elem = !matcher && elem) ) {
						matchedCount--;
					}

					// Lengthen the array for every element, matched or not
					if ( seed ) {
						unmatched.push( elem );
					}
				}
			}

			// Apply set filters to unmatched elements
			matchedCount += i;
			if ( bySet && i !== matchedCount ) {
				j = 0;
				while ( (matcher = setMatchers[j++]) ) {
					matcher( unmatched, setMatched, context, xml );
				}

				if ( seed ) {
					// Reintegrate element matches to eliminate the need for sorting
					if ( matchedCount > 0 ) {
						while ( i-- ) {
							if ( !(unmatched[i] || setMatched[i]) ) {
								setMatched[i] = pop.call( results );
							}
						}
					}

					// Discard index placeholder values to get only actual matches
					setMatched = condense( setMatched );
				}

				// Add matches to results
				push.apply( results, setMatched );

				// Seedless set matches succeeding multiple successful matchers stipulate sorting
				if ( outermost && !seed && setMatched.length > 0 &&
					( matchedCount + setMatchers.length ) > 1 ) {

					Sizzle.uniqueSort( results );
				}
			}

			// Override manipulation of globals by nested matchers
			if ( outermost ) {
				dirruns = dirrunsUnique;
				outermostContext = contextBackup;
			}

			return unmatched;
		};

	return bySet ?
		markFunction( superMatcher ) :
		superMatcher;
}

compile = Sizzle.compile = function( selector, group /* Internal Use Only */ ) {
	var i,
		setMatchers = [],
		elementMatchers = [],
		cached = compilerCache[ selector + " " ];

	if ( !cached ) {
		// Generate a function of recursive functions that can be used to check each element
		if ( !group ) {
			group = tokenize( selector );
		}
		i = group.length;
		while ( i-- ) {
			cached = matcherFromTokens( group[i] );
			if ( cached[ expando ] ) {
				setMatchers.push( cached );
			} else {
				elementMatchers.push( cached );
			}
		}

		// Cache the compiled function
		cached = compilerCache( selector, matcherFromGroupMatchers( elementMatchers, setMatchers ) );
	}
	return cached;
};

function multipleContexts( selector, contexts, results ) {
	var i = 0,
		len = contexts.length;
	for ( ; i < len; i++ ) {
		Sizzle( selector, contexts[i], results );
	}
	return results;
}

function select( selector, context, results, seed ) {
	var i, tokens, token, type, find,
		match = tokenize( selector );

	if ( !seed ) {
		// Try to minimize operations if there is only one group
		if ( match.length === 1 ) {

			// Take a shortcut and set the context if the root selector is an ID
			tokens = match[0] = match[0].slice( 0 );
			if ( tokens.length > 2 && (token = tokens[0]).type === "ID" &&
					support.getById && context.nodeType === 9 && documentIsHTML &&
					Expr.relative[ tokens[1].type ] ) {

				context = ( Expr.find["ID"]( token.matches[0].replace(runescape, funescape), context ) || [] )[0];
				if ( !context ) {
					return results;
				}
				selector = selector.slice( tokens.shift().value.length );
			}

			// Fetch a seed set for right-to-left matching
			i = matchExpr["needsContext"].test( selector ) ? 0 : tokens.length;
			while ( i-- ) {
				token = tokens[i];

				// Abort if we hit a combinator
				if ( Expr.relative[ (type = token.type) ] ) {
					break;
				}
				if ( (find = Expr.find[ type ]) ) {
					// Search, expanding context for leading sibling combinators
					if ( (seed = find(
						token.matches[0].replace( runescape, funescape ),
						rsibling.test( tokens[0].type ) && context.parentNode || context
					)) ) {

						// If seed is empty or no tokens remain, we can return early
						tokens.splice( i, 1 );
						selector = seed.length && toSelector( tokens );
						if ( !selector ) {
							push.apply( results, seed );
							return results;
						}

						break;
					}
				}
			}
		}
	}

	// Compile and execute a filtering function
	// Provide `match` to avoid retokenization if we modified the selector above
	compile( selector, match )(
		seed,
		context,
		!documentIsHTML,
		results,
		rsibling.test( selector )
	);
	return results;
}

// One-time assignments

// Sort stability
support.sortStable = expando.split("").sort( sortOrder ).join("") === expando;

// Support: Chrome<14
// Always assume duplicates if they aren't passed to the comparison function
support.detectDuplicates = hasDuplicate;

// Initialize against the default document
setDocument();

// Support: Webkit<537.32 - Safari 6.0.3/Chrome 25 (fixed in Chrome 27)
// Detached nodes confoundingly follow *each other*
support.sortDetached = assert(function( div1 ) {
	// Should return 1, but returns 4 (following)
	return div1.compareDocumentPosition( document.createElement("div") ) & 1;
});

// Support: IE<8
// Prevent attribute/property "interpolation"
// http://msdn.microsoft.com/en-us/library/ms536429%28VS.85%29.aspx
if ( !assert(function( div ) {
	div.innerHTML = "<a href='#'></a>";
	return div.firstChild.getAttribute("href") === "#" ;
}) ) {
	addHandle( "type|href|height|width", function( elem, name, isXML ) {
		if ( !isXML ) {
			return elem.getAttribute( name, name.toLowerCase() === "type" ? 1 : 2 );
		}
	});
}

// Support: IE<9
// Use defaultValue in place of getAttribute("value")
if ( !support.attributes || !assert(function( div ) {
	div.innerHTML = "<input/>";
	div.firstChild.setAttribute( "value", "" );
	return div.firstChild.getAttribute( "value" ) === "";
}) ) {
	addHandle( "value", function( elem, name, isXML ) {
		if ( !isXML && elem.nodeName.toLowerCase() === "input" ) {
			return elem.defaultValue;
		}
	});
}

// Support: IE<9
// Use getAttributeNode to fetch booleans when getAttribute lies
if ( !assert(function( div ) {
	return div.getAttribute("disabled") == null;
}) ) {
	addHandle( booleans, function( elem, name, isXML ) {
		var val;
		if ( !isXML ) {
			return (val = elem.getAttributeNode( name )) && val.specified ?
				val.value :
				elem[ name ] === true ? name.toLowerCase() : null;
		}
	});
}

// EXPOSE
if ( typeof define === "function" && define.amd ) {
	define("lib/sizzle",function() {
    /**
     * @module lib/sizzle
     */
    return Sizzle;
  });
} else {
	window.Sizzle = Sizzle;
}
// EXPOSE

})( window );


/*=======================================================*/

/*===================main/query===========================*/
﻿aQuery.define( "main/query", [ "lib/sizzle", "base/extend", "base/typed", "base/array" ], function( $, Sizzle, utilExtend, typed, array, undefined ) {
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
	 * @callback queryMapCallback
	 * @param {DOMElement}
	 * @param {Number} - Index in array.
	 * @param {*} - Any object which is the third parameter of function "map".
	 */

	/**
	 * @exports main/query
	 * @requires module:lib/sizzle
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
		/**
		 * Get the all posterity elements.
		 * @param {Element}
		 * @returns {Array<Element>}
		 */
		posterity: function( eles ) {
			return $.getElesByTag( "*", eles );
		},
		/**
		 * Element collection transform to element array.
		 * @param {DOMElementCollection}
		 * @param {Boolean} [real=true] - If ture means the element node type must be 3 or 8.
		 * @returns {Array<Element>}
		 */
		elementCollectionToArray: function( eles, real ) {
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
		/**
		 * Find element of array.
		 * @name find
		 * @memberOf module:main/query
		 * @method
		 * @param selector {String} - see {@link https://github.com/jquery/sizzle}
		 * @returns {Array<Element>}
		 */
		find: Sizzle,
		/**
		 * Find element of array.
		 * @param selector {String}
		 * @param {Element|Array<Element>} [eles] - context
		 * @param {Boolean} [not=false] - If true selector be ":not(" + selector + ")" so returns another result.
		 * @returns {Array<Element>}
		 */
		filter: function( selector, eles, not ) {
			if ( not ) {
				selector = ":not(" + selector + ")";
			}

			return eles.length === 1 ?
				$.find.matchesSelector( eles[ 0 ], selector ) ? [ eles[ 0 ] ] : [] :
				$.find.matches( selector, eles );
		},
		/**
		 * Get element of array.
		 * @param selector {String|Element|aQuery}
		 * @param {Element} [context]
		 * @returns {Array<Element>}
		 */
		getEle: function( ele, context ) {
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
		/**
		 * Get elements of array by class name.
		 * @param {String}
		 * @param {Element} [context=DOMElement]
		 * @returns {Array<Element>}
		 */
		getElesByClass: function( className, context ) {
			return $.expr.find[ "CLASS" ]( className, context || document );
		},
		/**
		 * Get element by ID.
		 * @param {String}
		 * @param {Element} [context=DOMElement]
		 * @returns {Element}
		 */
		getEleById: function( ID, context ) {
			return $.expr.find[ "ID" ]( ID, context || document )[0];
		},
		/**
		 * Get elements of array by tag name.
		 * @param {String}
		 * @param {Element} [context=DOMElement]
		 * @returns {Array<Element>}
		 */
		getElesByTag: function( tag, context ) {
			return $.expr.find[ "TAG" ]( tag, context || document );
		},
		/**
		 * Get elements index in siblings.
		 * @param {Element}
		 * @returns {Number}
		 */
		getSelfIndex: function( ele ) {
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
		/**
		 * Iteration all of posterity elements.
		 * @param {Element}
		 * @returns {Array} - Returns the parameter "ele".
		 */
		iterationPosterity: function( ele, fun ) {
			return array.grep( $.posterity( ele ), function( child ) {
				return fun( child );
			} );
		},
		/**
		 * Iteration elements by function.
		 * @param {DOMElementCollection|Arrasy<DOMElement>}
		 * @param {queryMapCallback}
		 * @param {*} - It is function`s arguments.
		 * @returns {Array} - Returns the parameter "ele".
		 */
		map: function( eles, fn, arg ) {
			var value,
				i = 0,
				length = eles.length,
				isArray = typed.isArrlike( eles ),
				ret = [];

			// Go through the array, translating each of the items to their
			if ( isArray ) {
				for ( ; i < length; i++ ) {
					value = fn( eles[ i ], i, arg );

					if ( value != null ) {
						ret[ ret.length ] = value;
					}
				}

				// Go through every key on the object,
			} else {
				for ( i in eles ) {
					value = fn( eles[ i ], i, arg );

					if ( value != null ) {
						ret[ ret.length ] = value;
					}
				}
			}

			// Flatten any nested arrays
			return core_concat.apply( [], ret );
		},
		/**
		 * Get sibling element from "n" util "ele".
		 * @param {DOMElement} - From next sibling of this.
		 * @param {DOMElement} - Until this.
		 * @returns {Array<DOMElement>}
		 */
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

	$.fn.extend( /** @lends aQuery.prototype */ {
		/**
		 * Get a new aQuery object by all posterity elements which was found by selector.
		 * @param {String}
		 * @returns {aQuery}
		 */
		posterity: function( selector ) {
			var posterity = $.posterity( this.eles );
			if ( typed.isStr( selector ) ) posterity = $.find( selector, posterity );
			return $( posterity );
		},
		/**
		 * Get a new aQuery object by index.
		 * @param {String}
		 * @returns {aQuery}
		 */
		eq: function( i ) {
			var len = this.length,
				j = +i + ( i < 0 ? len : 0 );
			return j >= 0 && j < len ? $( this[ j ] ) : $( [] );
		},
		/**
		 * Filter elements by selector.
		 * @param {String}
		 * @returns {aQuery}
		 */
		filter: function( selector ) {
			return $( winnow( this, selector, false ) );
		},
		/**
		 * Find elements by selector.
		 * @param {String}
		 * @returns {aQuery}
		 */
		find: function( selector ) {
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
		/**
		 * Search for a given element from among the matched elements.
		 * <br/> If no argument is passed to the .index() method, the return value is an integer indicating the position of the first element within the jQuery object relative to its sibling elements.
		 * <br/> If .index() is called on a collection of elements and a DOM element or aQuery object is passed in, .index() returns an integer indicating the position of the passed element relative to the original collection.
		 * <br/> If a selector string is passed as an argument, .index() returns an integer indicating the position of the first element within the jQuery object relative to the elements matched by the selector. If the element is not found, .index() will return -1.
		 * @param {String|aQuery|DOMElement|Array<DOMElement>} [ele]
		 * @returns {Number}
		 */
		index: function( ele ) {
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
		/**
		 * Check the current matched set of elements against a selector, element, or jQuery object and return true if at least one of these elements matches the given arguments.
		 * <br /> A string containing a selector expression to match elements against.
		 * <br /> A function used as a test for the set of elements. It accepts one argument, index, which is the element's index in the aQuery collection.Within the function, this refers to the current DOM element.
		 * <br /> An existing aQuery object to match the current set of elements against.
		 * <br /> One or more elements to match the current set of elements against.
		 * @param {String|aQuery|Function|DOMElement}
		 * @returns {Boolean}
		 */
		is: function( selector ) {
			return !!selector && (
				typed.isStr( selector ) ?
				rneedsContext.test( selector ) ?
				$.find( selector, this.context ).index( this[ 0 ] ) >= 0 :
				$.filter( selector, this.eles ).length > 0 :
				this.filter( selector ).length > 0 );
		},
		/**
		 * Iteration elements by function.
		 * @param {queryMapCallback}
		 * @returns {aQuery}
		 */
		map: function( callback ) {
			return $( $.map( this, function( ele, i ) {
				return callback.call( ele, i, ele );
			} ) );
		},
		/**
		 * Reject the result to an aQuery object.
		 * @param {String}
		 * @returns {aQuery}
		 */
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

	$.each( /** @lends aQuery.prototype */ {
		/**
		 * Get the parent of each element in the current set of matched elements, optionally filtered by a selector.
		 * @param [selector] {String}
		 * @returns {aQuery}
		 */
		parent: function( ele ) {
			var parent = ele.parentNode;
			return parent && parent.nodeType !== 11 ? parent : null;
		},
		/**
		 * Get the ancestors of each element in the current set of matched elements, optionally filtered by a selector.
		 * @param [selector] {String}
		 * @returns {aQuery}
		 */
		parents: function( ele ) {
			return $.dir( ele, "parentNode" );
		},
		/**
		 * Get the ancestors of each element in the current set of matched elements, optionally filtered by a selector.
		 * @param selector {String|Element}
		 * @param [filter] {String}
		 * @returns {aQuery}
		 */
		parentsUntil: function( ele, i, until ) {
			return $.dir( ele, "parentNode", until );
		},
		/**
		 * Get the immediately following sibling of each element in the set of matched elements. If a selector is provided, it retrieves the next sibling only if it matches that selector.
		 * @param [selector] {String}
		 * @returns {aQuery}
		 */
		next: function( ele ) {
			return sibling( ele, "nextSibling" );
		},
		/**
		 * Get the immediately preceding sibling of each element in the set of matched elements, optionally filtered by a selector.
		 * @param [selector] {String}
		 * @returns {aQuery}
		 */
		prev: function( ele ) {
			return sibling( ele, "previousSibling" );
		},
		/**
		 * Get all following siblings of each element in the set of matched elements, optionally filtered by a selector.
		 * @param [selector] {String}
		 * @returns {aQuery}
		 */
		nextAll: function( ele ) {
			return $.dir( ele, "nextSibling" );
		},
		/**
		 * Get all preceding siblings of each element in the set of matched elements, optionally filtered by a selector.
		 * @param [selector] {String}
		 * @returns {aQuery}
		 */
		prevAll: function( ele ) {
			return $.dir( ele, "previousSibling" );
		},
		/**
		 * Get all following siblings of each element up to but not including the element matched by the selector, DOM node, or jQuery object passed.
		 * @param selector {String|Element}
		 * @param [filter] {String}
		 * @returns {aQuery}
		 */
		nextUntil: function( ele, i, until ) {
			return $.dir( ele, "nextSibling", until );
		},
		/**
		 * Get all preceding siblings of each element up to but not including the element matched by the selector, DOM node, or jQuery object.
		 * @param selector {String|Element}
		 * @param [filter] {String}
		 * @returns {aQuery}
		 */
		prevUntil: function( ele, i, until ) {
			return $.dir( ele, "previousSibling", until );
		},
		/**
		 * Get the siblings of each element in the set of matched elements, optionally filtered by a selector.
		 * @param [selector] {String}
		 * @returns {aQuery}
		 */
		siblings: function( ele ) {
			return $.sibling( ( ele.parentNode || {} ).firstChild, ele );
		},
		/**
		 * Get the children of each element in the set of matched elements, optionally filtered by a selector.
		 * @param [selector] {String}
		 * @returns {aQuery}
		 */
		children: function( ele ) {
			return $.sibling( ele.firstChild );
		},
		/**
		 * Get the children of each element in the set of matched elements, including text and comment nodes.
		 * @returns {aQuery}
		 */
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

/*=======================================================*/

/*===================base/client===========================*/
﻿aQuery.define( "base/client", [ "base/extend" ], function( $, extend ) {
	this.describe( "Cline of Browser" );
	/**
	 * @public
	 * @requires module:base/extend
	 * @module base/client
	 * @property {object} browser
	 * @property {Boolean} [browser.opera=false]
	 * @property {Boolean} [browser.chrome=false]
	 * @property {Boolean} [browser.safari=false]
	 * @property {Boolean} [browser.kong=false]
	 * @property {Boolean} [browser.firefox=false]
	 * @property {Boolean} [browser.ie=false]
	 * @property {Boolean} [browser.ie678=false]
	 *
	 * @property {object} engine
	 * @property {Boolean} [engine.opera=false]
	 * @property {Boolean} [engine.webkit=false]
	 * @property {Boolean} [engine.khtml=false]
	 * @property {Boolean} [engine.gecko=false]
	 * @property {Boolean} [engine.ie=false]
	 * @property {Boolean} [engine.ie678=false]
	 *
	 * @property {object} system
	 * @property {Boolean} [system.win=null]
	 * @property {Boolean} [system.mac=null]
	 * @property {Boolean} [system.linux=null]
	 * @property {Boolean} [system.iphone=null]
	 * @property {Boolean} [system.ipod=null]
	 * @property {Boolean} [system.ipad=null]
	 * @property {Boolean} [system.pad=null]
	 * @property {Boolean} [system.nokian=null]
	 * @property {Boolean} [system.winMobile=null]
	 * @property {Boolean} [system.androidMobile=null]
	 * @property {Boolean} [system.ios=null]
	 * @property {Boolean} [system.wii=null]
	 * @property {Boolean} [system.ps=null]
	 * @example
	 * if (client.system.win){}
	 */
	var client = {
		browser: {
			opera: false,
			chrome: false,
			safari: false,
			kong: false,
			firefox: false,
			ie: false,
			ie678: "v" == "/v"
		},
		engine: {
			opera: false,
			webkit: false,
			khtml: false,
			gecko: false,
			ie: false,
			ie678: "v" == "/v"
		},
		system: {
			win: null,
			mac: null,
			linux: null,
			iphone: null,
			ipod: null,
			ipad: null,
			pad: null,
			nokian: null,
			winMobile: null,
			androidMobile: null,
			ios: null,
			wii: null,
			ps: null
		},
		language: ""
	};

	var reg = RegExp,
		ua = navigator.userAgent,
		p = navigator.platform || "",
		_browser = client.browser,
		_engine = client.engine,
		_system = client.system;

	client.language = ( navigator.browserLanguage || navigator.language ).toLowerCase();

	_system.win = p.indexOf( "Win" ) == 0;
	if ( _system.win ) {
		if ( /Win(?:dows)? ([^do]{2})\s?(\d+\.\d+)?/.test( ua ) ) {
			if ( reg.$1 == "NT" ) {
				switch ( reg.$2 ) {
					case "5.0":
						_system.win = "2000";
						break;
					case "5.1":
						_system.win = "XP";
						break;
					case "6.0":
						_system.win = "Vista";
						break;
					default:
						_system.win = "NT";
						break;
				}
			} else if ( reg.$1 ) {
				_system.win = "ME";
			} else {
				_system.win = reg.$1;
			}
		}
	}

	_system.mac = p.indexOf( "Mac" ) == 0;
	_system.linux = p.indexOf( "Linux" ) == 0;
	_system.iphone = ua.indexOf( "iPhone" ) > -1;
	_system.ipod = ua.indexOf( "iPod" ) > -1;
	_system.ipad = ua.indexOf( "iPad" ) > -1;
	_system.pad = ua.indexOf( "pad" ) > -1;
	_system.nokian = ua.indexOf( "NokiaN" ) > -1;
	_system.winMobile = _system.win == "CE";
	_system.androidMobile = /Android/.test( ua );
	_system.ios = false;
	_system.wii = ua.indexOf( "Wii" ) > -1;
	_system.ps = /playstation/i.test( ua );

	_system.x11 = p == "X11" || ( p.indexOf( "Linux" ) == 0 );
	_system.appleMobile = _system.iphone || _system.ipad || _system.ipod;
	_system.mobile = _system.appleMobile || _system.androidMobile || /AppleWebKit.*Mobile./.test( ua ) || _system.winMobile;
	//alert(ua)
	if ( /OS [X ]*(\d*).(\d*)/.test( ua ) ) {
		_system.ios = parseFloat( reg.$1 + "." + reg.$2 );
	}
	if ( window.opera ) {
		_engine.opera = _browser.opera = parseFloat( window.opera.version() );
	} else if ( /AppleWebKit\/(\S+)/.test( ua ) ) {
		_engine.webkit = parseFloat( reg.$1 );
		if ( /Chrome\/(\S+)/.test( ua ) ) {
			_browser.chrome = parseFloat( reg.$1 );
		} else if ( /Version\/(\S+)/.test( ua ) ) {
			_browser.safari = parseFloat( reg.$1 );
		} else {
			var _safariVer = 1,
				wit = _engine.webkit;
			if ( _system.mac ) {
				if ( wit < 100 ) {
					_safariVer = 1;
				} else if ( wit == 100 ) {
					_safariVer = 1.1;
				} else if ( wit <= 125 ) {
					_safariVer = 1.2;
				} else if ( wit < 313 ) {
					_safariVer = 1.3;
				} else if ( wit < 420 ) {
					_safariVer = 2;
				} else if ( wit < 529 ) {
					_safariVer = 3;
				} else if ( wit < 533.18 ) {
					_safariVer = 4;
				} else if ( wit < 536.25 ) {
					_safariVer = 5;
				} else {
					_safariVer = 6;
				}
			} else if ( _system.win ) {
				if ( wit == 5 ) {
					_safariVer = 5;
				} else if ( wit < 529 ) {
					_safariVer = 3;
				} else if ( wit < 531.3 ) {
					_safariVer = 4;
				} else {
					_safariVer = 5;
				}
			} else if ( _system.appleMobile ) {
				if ( wit < 526 ) {
					_safariVer = 3;
				} else if ( wit < 531.3 ) {
					_safariVer = 4;
				} else if ( wit < 536.25 ) {
					_safariVer = 5;
				} else {
					_safariVer = 6;
				}
			}
			_browser.safari = _safariVer;
		}
	} else if ( /KHTML\/(\S+)/.test( ua ) || /Konquersor\/([^;]+)/.test( ua ) ) {
		_engine.khtml = _browser.kong = parseFloat( reg.$1 );
	} else if ( /rv:([^\)]+)\) Gecko\/\d{8}/.test( ua ) ) {
		_engine.gecko = parseFloat( reg.$1 );
		//确定是不是Firefox
		if ( /Firefox\/(\S+)/.test( ua ) ) {
			_browser.firefox = parseFloat( reg.$1 );
		}
	} else if ( /MSIE([^;]+)/.test( ua ) ) {
		_engine.ie = _browser.ie = parseFloat( reg.$1 );
	}
	if ( "\v" == "v" ) {
		_engine.ie678 = _browser.ie678 = _browser.ie;
	}

	return client;
} );

/*=======================================================*/

/*===================main/CustomEvent===========================*/
﻿aQuery.define( "main/CustomEvent", [ "base/extend", "main/object" ], function( $, utilExtend, object, undefined ) {
	"use strict";
	this.describe( "A custom event" );
	/**
	 * Be defined by object.extend.
   * Each function can not repeat to add into CustomEvent.
	 * @constructor
	 * @exports main/CustomEvent
	 * @requires module:main/object
	 * @mixes ObjectClassStaticMethods
	 */
	var CustomEvent = object.extend( "CustomEvent", /** @lends module:main/CustomEvent.prototype */ {
		constructor: CustomEvent,
		/** @constructs module:main/CustomEvent */
		init: function() {
			this.__handlers = {};
			return this;
		},
		/**
		 * Add a handler.
		 * @param {String} - "mousedown" or "mousedown mouseup"
		 * @param {Function}
		 * @returns {this}
		 */
		on: function( type, handler ) {
			return this.addHandler( type, handler );
		},
		/**
		 * Add a handler once.
		 * @param {String} - "mousedown" or "mousedown mouseup"
		 * @param {Function}
		 * @param {Function} - Inner.
		 * @returns {this}
		 */
		once: function( type, handler, proxy ) {
			var self = this,
				proxyName = this._getOnceProxyName( type );
			if ( handler[ proxyName ] ) {
				return this;
			}
			handler[ proxyName ] = function() {
				self.off( type, handler );
				delete handler[ proxyName ];
				handler.apply( this, arguments );
				handler = null;
				proxy && proxy();
				proxy = null;
			};
			return this.on( type, handler );
		},
		_getOnceProxyName: function( name ) {
			return "__" + name + "proxy";
		},
		/**
		 * Add a handler.
		 * @param {String} - "mousedown" or "mousedown mouseup"
		 * @param {Function}
		 * @returns {this}
		 */
		addHandler: function( type, handler ) {
			var types = type.split( " " ),
				i = types.length - 1;
			for ( ; i >= 0; i-- ) {
				this._addHandler( types[ i ], handler );
			}
			return this;
		},
		_addHandler: function( type, handler ) {
			var handlers = this.__handlers[ type ];
			if ( !handlers ) {
				this.__handlers[ type ] = handlers = [];
			}
			if ( this.hasHandler( type, handler, handlers ) == -1 ) {
				handlers.push( handler );
			}
			return this;
		},
		/**
		 * Clear handlers.
		 * @param {String} [type] - If type is undefined, then clear all handler. If string can be used like "mousedown" or "mousedown mouseup".
		 * @returns {this}
		 */
		clear: function( type ) {
			return this.clearHandlers( type );
		},
		/**
		 * Clear handlers.
		 * @param {String} [type] - If type is undefined, then clear all handler. If string can be used like "mousedown" or "mousedown mouseup".
		 * @returns {this}
		 */
		clearHandlers: function( type ) {
			if ( type ) {
				var types = type.split( " " ),
					i = types.length - 1,
					item;
				for ( ; i >= 0; i-- ) {
					item = types[ i ];
					delete this.__handlers[ item ];
				}
			} else {
				this.__handlers = {};
			}
			return this;
		},
		/**
		 * Return handlers.
		 * @param {String=} - If type is null then return whole handlers object.
		 * @returns {Array|Object}
		 */
		getHandlers: function( type ) {
			return type ? this.__handlers[ type ] || [] : this.__handlers;
		},
		/**
		 * Return index of handlers array. -1 means not found.
		 * @param {String}
		 * @param {Function}
		 * @param {Array<Function>} [handlers]
		 * @returns {Number}
		 */
		hasHandler: function( type, handler, handlers ) {
			handlers = handlers || this.getHandlers( type );
			var i = 0,
				j = -1,
				len;
			if ( handlers instanceof Array && handlers.length ) {
				for ( len = handlers.length; i < len; i++ ) {
					if ( handlers[ i ] === handler ) {
						j = i;
						break;
					}
				}
			}
			return j;
		},
		/**
		 * There are not any event then return true.
		 * @returns {Boolean}
		 */
		isEmpty: function() {
			for ( var i in this.__handlers ) {
				return false;
			}
			return true;
		},
		/**
		 * Trigger an event.
		 * @param {String} - "mousedown" or "mousedown mouseup"
		 * @param {Context}
		 * @param {...*} [args]
		 * @returns {this}
		 */
		trigger: function( type, target, args ) {
			var types = type.split( " " ),
				i = 0,
				len = types.length;
			for ( ; i < len; i++ ) {
				this._trigger( types[ i ], target, args );
			}
			return this;
		},
		_trigger: function( type, target ) {
			var handlers = this.getHandlers( type ),
				onceProxyName = this._getOnceProxyName( type );
			if ( handlers instanceof Array && handlers.length ) {
				for ( var i = 0, len = handlers.length, arg = $.util.argToArray( arguments, 2 ), handler; i < len; i++ ) {
					handler = handlers[ i ];

					if ( handler[ onceProxyName ] ) {
						handler = handler[ onceProxyName ];
					}

					handler.apply( target, arg );
				}
			}
			return this;
		},
		/**
		 * Remove handler.
		 * @param {String}
		 * @param {Function}
		 * @returns {this}
		 */
		off: function( type, handler ) {
			return this.removeHandler( type, handler );
		},
		/**
		 * Remove handler.
		 * @param {String} - "mousedown" or "mousedown mouseup"
		 * @param {Function}
		 * @returns {this}
		 */
		removeHandler: function( type, handler ) {
			var types = type.split( " " ),
				i = types.length - 1;
			for ( ; i >= 0; i-- ) {
				this._removeHandler( types[ i ], handler );
			}
			return this;
		},
		/** @returns {CustomEvent} */
		clone: function() {
			var customEvent = new CustomEvent(),
				name, list, i, len;

			for ( name in this.getHandlers() ) {
				list = this.getHandlers( name );
				len = list.length;
				for ( i = 0; i < len; i++ ) {
					customEvent.on( name, list[ i ] );
				}
			}

			return customEvent;
		},
		_removeHandler: function( type, handler ) {
			var handlers = this.getHandlers( type ),
				i = this.hasHandler( type, handler, handlers );
			if ( i > -1 ) {
				handlers.splice( i, 1 );
			}
			if ( handlers.length === 0 ) {
				delete this.__handlers[ type ];
			}
			return this;
		},
	} );

	return CustomEvent;
} );

/*=======================================================*/

/*===================main/event===========================*/
﻿aQuery.define( "main/event", [ "base/config", "base/typed", "base/extend", "base/client", "base/array", "main/query", "main/CustomEvent", "main/data" ], function( $, config, typed, utilExtend, client, array, query, CustomEvent, utilData, undefined ) {
	"use strict";
	var mouse = "contextmenu click dblclick mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave mousewheel DOMMouseScroll".split( " " ),
		/*DOMMouseScroll firefox*/
		mutation = "load unload error".split( " " ),
		html = "blur focus focusin focusout".split( " " ),
		key = "keydown keypress keyup".split( " " ),
		other = "resize scroll change select submit DomNodeInserted DomNodeRemoved".split( " " ),
		// _eventNameList = [].concat( mouse, mutation, html, key, other ),
		domEventList = {},
		eventHooks = {
			type: function( type ) {
				var temp;
				switch ( type ) {
					case "focus":
						if ( client.browser.ie ) type += "in";
						break;
					case "blur":
						if ( client.browser.ie ) type = "focusout";
						break;
					case "touchwheel":
						type = "mousewheel";
						if ( client.browser.firefox ) type = "DOMMouseScroll";
						break;
					case "mousewheel":
						if ( client.browser.firefox ) type = "DOMMouseScroll";
						break;
				}
				if ( ( temp = $.interfaces.trigger( "eventHooks", type ) ) ) type = temp;
				return type;
			},
			compatibleEvent: function( e ) {
				var eventDoc = event.document;
				e.getCharCode = function() {
					eventDoc.getCharCode( this );
				};
				e.preventDefault || ( e.preventDefault = function() {
					this.returnValue = false;
				} );
				e.stopPropagation || ( e.stopPropagation = function() {
					this.cancelBubble = true;
				} );
				e.getButton = function() {
					eventDoc.getButton( this );
				};
			},
			/**
			 * @inner
			 * Proxy of event handler.
			 * @param {Function}
			 * @returns {Function}
			 */
			proxy: function( fn ) {
				if ( !fn.__proxy ) {
					var temp;
					fn.__proxy = function( e ) {
						var evt = event.document.getEvent( e ),
							target = this;

						if ( typed.isEvent( evt ) ) {
							target = event.document.getTarget( e );
							if ( ( temp = $.interfaces.trigger( "proxy", evt, target ) ) ) {
								evt = temp.event;
								target = temp.target;
							}
							config.module.compatibleEvent && eventHooks.compatibleEvent( evt );
						}

						fn.call( target, evt || {} );
					};
					fn.__proxy.count = 1;
				} else {
					fn.__proxy.count++;
				}
				return fn.__proxy;
			},
			/**
			 * @inner
			 * Destroy proxy.
			 * @param {Function}
			 */
			destroyProxy: function( fn ) {
				if ( fn.__proxy && --fn.__proxy.count === 0 ) {
					delete fn.__proxy;
				}
			}
		},
		_handlersKey = "__handlersKey",
		_toggleKey = "__toggleKey",
		i = 0,
		len;

	/**
	 * Export event util.
	 * <br /> It create bus to send or listion message for aQuery life-cycle.
	 * @exports main/event
	 * @requires module:base/config
	 * @requires module:base/typed
	 * @requires module:base/extend
	 * @requires module:base/client
	 * @requires module:base/array
	 * @requires module:main/query
	 * @requires module:main/CustomEvent
	 * @requires module:main/data
	 */
	var event = {
		/**
		 * Add an event Handler to element.
		 * @param {Element|window}
		 * @param {String} - "click", "swap.down"
		 * @param {Function}
		 * @returns {this}
		 */
		addHandler: function( ele, type, fn ) {
			if ( typed.isEle( ele ) || typed.isWindow( ele ) ) {
				var customEvent, proxy, item, types = type.split( " " ),
					i = types.length - 1;

				customEvent = event._initHandler( ele );

				for ( ; i >= 0; i-- ) {
					item = types[ i ];
					if ( customEvent.hasHandler( item, fn ) == -1 && domEventList[ item ] ) {
						item = eventHooks.type( item );
						proxy = eventHooks.proxy( fn, this );
						event.document._addHandler( ele, item, proxy );
					}
				}

				type && fn && customEvent.addHandler( type, fn );
			}
			return this;
		},
		/**
		 * Add a event Handler to element and do once.
		 * <br /> It will remove handler after done.
		 * @param {Element|window}
		 * @param {String} - "click", "swap.down"
		 * @param {Function}
		 * @returns {this}
		 */
		once: function( ele, type, fn ) {
			if ( ( typed.isEle( ele ) || typed.isWindow( ele ) ) ) {
				var customEvent = event._initHandler( ele ),
					types = type.split( " " ),
					i = types.length - 1,
					item;

				for ( ; i >= 0; i-- ) {
					item = types[ i ];
					if ( customEvent.hasHandler( item, fn ) == -1 ) {
						this._once( ele, item, fn );
					}
				}

			}
			return this;
		},
		_once: function( ele, type, fn ) {
			var customEvent = event._initHandler( ele ),
				proxy = function() {
					if ( domEventList[ type ] ) {
						var todo = eventHooks.proxy( fn, event );
						var typeHook = eventHooks.type( type );
						todo.apply( this, arguments );
						eventHooks.destroyProxy( fn );
						event.document.removeHandler( ele, typeHook, proxy );
						customEvent.removeHandler( type, fn );
						event._destroyHandler( ele );
						proxy = null;
					}
				};

			if ( domEventList[ type ] ) {
				var typeHook = eventHooks.type( type );
				event.document.addHandler( ele, typeHook, proxy );
				customEvent.addHandler( type, fn );
			} else {
				customEvent.once( type, fn, function() {
					event._destroyHandler( ele );
				} );
			}
		},
		/**
		 * Remove an event Handler from element.
		 * @param {Element|window}
		 * @param {String} - "click", "swap.down"
		 * @param {Function}
		 * @returns {this}
		 */
		removeHandler: function( ele, type, fn ) {
			if ( typed.isEle( ele ) || typed.isWindow( ele ) ) {
				var customEvent = utilData.get( ele, _handlersKey ),
					proxy = fn.__proxy || fn,
					types = type.split( " " ),
					i = types.length - 1,
					item;

				for ( ; i >= 0; i-- ) {
					item = types[ i ];
					if ( domEventList[ item ] ) {
						item = eventHooks.type( item );
						eventHooks.destroyProxy( fn );
						event.document._removeHandler( ele, item, proxy );
					}
				}

				if ( customEvent && type && fn ) {
					customEvent.removeHandler( type, fn );
					event._destroyHandler( ele );
				}

			}
			return this;
		},
		/**
		 * Remove all event Handler from element.
		 * @param {Element|window}
		 * @param {String} [type] - If type is undefined then clear all handlers.
		 * @returns {this}
		 */
		clearHandlers: function( ele, type ) {
			if ( typed.isEle( ele ) || typed.isWindow( ele ) ) {
				var customEvent = utilData.get( ele, _handlersKey );
				if ( !customEvent ) {
					return this;
				}
				var handlerMap = customEvent.getHandlers(),
					map = {},
					j = 0,
					len = 0,
					i, item, fn;

				if ( type ) {
					var types = type.split( " " ),
						z = types.length - 1;
					for ( ; z >= 0; z-- ) {
						item = types[ z ];
						if ( item in handlerMap ) {
							map[ item ] = 1;
						}
					}
				} else {
					map = handlerMap;
				}

				for ( i in map ) {
					item = customEvent.getHandlers( i );
					for ( j = 0, len = item.length; j < len; j++ ) {
						fn = item[ j ];
						domEventList[ i ] && event.removeHandler( ele, i, fn );
					}
				}
				customEvent.clearHandlers( type );
				event._destroyHandler( ele );
			}
			return this;
		},
		/**
		 * Clone the current element`s handler to another element.
		 * <br /> Wraning: ele will clear handlers.
		 * @param {Element|window} - Target Element
		 * @param {Element|window} - Source Element.
		 * @returns {this}
		 */
		cloneHandlers: function( tarEle, srcEle ) {
			var customEvent = utilData.get( srcEle, _handlersKey );
			if ( customEvent ) {
				var handlerMap = customEvent.getHandlers(),
					j = 0,
					len = 0,
					i, item, fn;
				event.clearHandlers( tarEle );

				for ( i in handlerMap ) {
					item = customEvent.getHandlers( i );
					for ( j = 0, len = item.length; j < len; j++ ) {
						fn = item[ j ];
						event.addHandler( tarEle, i, fn );
					}
				}
			}
			return this;
		},
		/**
		 * Has the element an event handler.
		 * @param {Element|window}
		 * @param {String}
		 * @param {Function}
		 * @returns {Number} fn - "-1" means has not.
		 */
		hasHandler: function( ele, type, fn ) {
			if ( typed.isEle( ele ) || typed.isWindow( ele ) ) {
				var customEvent = utilData.get( ele, _handlersKey );
				if ( customEvent ) {
					return customEvent.hasHandler( type, fn );
				}
			}
			return -1;
		},
		/**
		 * Return handlers.
		 * @param {Element|window}
		 * @param {String=} - If type is null then return whole handlers object.
		 * @returns {Array|Object|null}
		 */
		getHandlers: function( ele, type ) {
			if ( typed.isEle( ele ) || typed.isWindow( ele ) ) {
				var customEvent = utilData.get( ele, _handlersKey );
				if ( customEvent ) {
					var handlers = customEvent.getHandlers( type );
					return handlers.length ? handlers : null;
				}
			}
			return null;
		},
		/**
		 * @namespace
		 */
		document: {
			/**
			 * Add an event handler to element.
			 * @param {Element|window}
			 * @param {String}
			 * @param {Funtion}
			 */
			addHandler: function( ele, type, fn ) {
				var types = type.split( " " ),
					i = types.length - 1;
				for ( ; i >= 0; i-- ) {
					this._addHandler( ele, types[ i ], fn );
				}
			},
			_addHandler: function( ele, type, fn ) {
				if ( ele.addEventListener ) ele.addEventListener( type, fn, false ); //事件冒泡
				else if ( ele.attachEvent ) ele.attachEvent( "on" + type, fn );
				else {
					ele[ "on" + type ] = fn;
					ele = null;
				}
			},
			/**
			 * Add a event Handler to element and do once.
			 * @param {Element|window}
			 * @param {String}
			 * @param {Funtion}
			 */
			once: function( ele, type, fn ) {
				var self = this,
					fnproxy = function() {
						self._removeHandler( ele, type, fnproxy );
						fn.apply( this, arguments );
					};
				return this._addHandler( ele, type, fnproxy );
			},
			/**
			 * Remove an event Handler from element.
			 * @param {Element|window}
			 * @param {String}
			 * @param {Funtion}
			 */
			removeHandler: function( ele, type, fn ) {
				var types = type.split( " " ),
					i = types.length - 1;
				for ( ; i >= 0; i-- ) {
					this._removeHandler( ele, types[ i ], fn );
				}
			},
			_removeHandler: function( ele, type, fn ) {
				if ( ele.removeEventListener ) ele.removeEventListener( type, fn, false );
				else if ( ele.detachEvent ) ele.detachEvent( "on" + type, fn );
				else ele[ "on" + type ] = null;
			},
			/**
			 * Create an event object.
			 * @param {String} - The type of event
			 * @param {Event}
			 */
			createEvent: function( type ) {
				var e;
				if ( document.createEvent ) {
					e = document.createEvent( type );
				} else if ( document.createEventObject ) {
					e = document.createEventObject();
				}
				return e;
			},
			/**
			 * Dispatch an event.
			 * @param {Element|window} - Dispatch an event from this element.
			 * @param {Event}
			 * @param {String} - The type of event
			 */
			dispatchEvent: function( ele, event, type ) {
				if ( ele.dispatchEvent ) {
					ele.dispatchEvent( event );
				} else if ( ele.fireEvent ) {
					ele.fireEvent( "on" + type, event, false );
				}
			},
			/**
			 * Get char code.
			 * @param {Event}
			 * @returns {Number}
			 */
			getCharCode: function( e ) {
				return ( e.keyCode ? e.keyCode : ( e.which || e.charCode ) ) || 0;
			},
			/**
			 * Get event.
			 * @param {Event}
			 * @returns {Event}
			 */
			getEvent: function( e ) {
				return e || window.event;
			},
			/**
			 * Get event target.
			 * @param {Event}
			 * @returns {Element|window}
			 */
			getTarget: function( e ) {
				return e.srcElement || e.target;
			},
			imitation: {
				_keySettings: {
					bubbles: true,
					cancelable: true,
					view: document.defaultView,
					detail: 0,
					ctrlKey: false,
					altKey: false,
					shiftKey: false,
					metaKey: false,
					keyCode: 0,
					charCode: 0
				},
				eventList: domEventList,
				_editKeyCharCode: function( setting ) {
					var code = event.document.getCharCode( setting );
					delete setting.charCode;
					delete setting.keyCode;
					delete setting.which;

					if ( client.engine.webkit ) {
						setting.charCode = code;
					} else if ( client.engine.ie ) {
						setting.charCode = code;
					} else {
						setting.keyCode = setting.which = code;
					}
				},
				/**
				 * Trigger Element keyboard event.
				 * @param {Element|window}
				 * @param {String}
				 * @param {Object}
				 */
				key: function( ele, type, paras ) {
					var eventF = event.document,
						createEvent = eventF.createEvent,
						settings = utilExtend.extend( {}, eventF.imitation._keySettings, paras ),
						opt = settings,
						e, i, name;
					eventF.imitation._editKeyCharCode( settings );
					if ( client.browser.firefox ) {
						e = createEvent( "KeyEvents" );
						e.initKeyEvent( type, opt.bubbles, opt.cancelable, opt.view, opt.ctrlKey, opt.altKey, opt.shiftKey, opt.metaKey, opt.keyCode, opt.charCode );
					} else if ( client.browser.ie678 ) {
						e = createEvent();
						for ( i in settings ) {
							e[ i ] = settings[ i ];
						}
					} else {
						name = "Events";
						client.browser.safari && client.browser.safari < 3 && ( name = "UIEvents" );
						e = createEvent( name );
						e.initEvent( type, settings.bubbles, settings.cancelable );
						delete settings.bubbles;
						delete settings.cancelable;

						for ( i in settings ) {
							e[ i ] = settings[ i ];
						}
					}
					eventF.dispatchEvent( ele, e, type );

				},
				_mouseSettings: {
					bubbles: true,
					cancelable: true,
					view: document.defaultView,
					detail: 0,
					screenX: 0,
					screenY: 0,
					clientX: 0,
					clientY: 0,
					ctrlKey: false,
					altKey: false,
					metaKey: false,
					shiftKey: false,
					button: 0,
					relatedTarget: null
				},
				/**
				 * Trigger Element mouse event.
				 * @param {Element|window}
				 * @param {String}
				 * @param {Object}
				 */
				mouse: function( ele, type, paras ) {
					var eventF = event.document,
						createEvent = eventF.createEvent,
						settings = utilExtend.extend( {}, eventF.imitation._mouseSettings, paras ),
						e, i = settings;
					if ( client.browser.safari && client.browser.safari < 3 ) {
						e = createEvent( "UIEvents" );
						e.initEvent( type, settings.bubbles, settings.cancelable );
						delete settings.bubbles;
						delete settings.cancelable;
						for ( i in settings ) {
							e[ i ] = settings[ i ];
						}
					} else if ( client.browser.ie678 ) {
						e = createEvent();
						for ( i in settings ) {
							e[ i ] = settings[ i ];
						}
					} else {
						e = createEvent( "MouseEvents" );
						e.initMouseEvent( type, i.bubbles, i.cancelable, i.view, i.detail, i.screenX, i.screenY, i.clientX, i.clientY, i.ctrlKey, i.altKey, i.metaKey, i.shiftKey, i.button, i.relatedTarget );
					}
					eventF.dispatchEvent( ele, e, type );

				},
				_htmlSettings: {
					bubbles: true,
					cancelable: true
				},
				/**
				 * Trigger Element HTML event. Like: blur focus focusin focusout.
				 * @param {Element|window}
				 * @param {String}
				 * @param {Object}
				 */
				html: function( ele, type, paras ) {
					var eventF = event.document,
						createEvent = eventF.createEvent,
						settings = utilExtend.extend( {}, eventF.imitation._htmlSettings, paras ),
						e, i = settings;

					if ( client.browser.ie678 ) {
						e = createEvent();
						for ( i in settings ) {
							e[ i ] = settings[ i ];
						}
					} else {
						e = createEvent( "HTMLEvents" );
						e.initEvent( type, settings.bubbles, settings.cancelable );
						delete settings.bubbles;
						delete settings.cancelable;
						for ( i in settings ) {
							e[ i ] = settings[ i ];
						}
					}

					eventF.dispatchEvent( ele, e, type );

				}
			},
			/**
			 * Prevent default.
			 * @param {Event}
			 */
			preventDefault: function( e ) {
				if ( e.preventDefault ) e.preventDefault();
				else e.returnValue = false;
			},
			/**
			 * Stop propagation.
			 * @param {Event}
			 */
			stopPropagation: function( e ) {
				if ( e.stopPropagation ) e.stopPropagation();
				else e.cancelBubble = true;
			},
			/**
			 * Get button code from mouse clicking.
			 * @param {Event}
			 * @param {Number}
			 */
			getButton: function( e ) {
				if ( document.implementation.hasFeature( "MouseEvents", "2.0" ) ) return e.button;
				else {
					switch ( e.button ) {
						case 0:
						case 1:
						case 3:
						case 5:
						case 7:
							return 0;
						case 2:
						case 6:
							return 2;
						case 4:
							return 1;
					}
				}
			},
			/**
			 * Add an event handler to element.
			 * @param {Element|window}
			 * @param {String}
			 * @param {Funtion}
			 */
			on: function( ele, type, fn ) {
				return this.addHandler( ele, type, fn );
			},
			/**
			 * Remove an event handler from element.
			 * @param {Element|window}
			 * @param {String}
			 * @param {Funtion}
			 */
			off: function( ele, type, fn ) {
				return this.removeHandler( ele, type, fn );
			}
		},

		/**
		 * Listen error form window.
		 * @returns {this}
		 */
		error: function() {
			event.document.addHandler( window, "error", function( e, url, line ) {
				var msg = e.message || "no message",
					filename = e.filename || e.sourceURL || e.stacktrace || url;
				line = e.lineno || e.lineNumber || e.number || e.lineNumber || e.line || line;
				$.logger( "line", line, "message", msg, "at", filename );
			} );
			return this;
		},

		_initHandler: function( ele ) {
			var data = utilData.get( ele, _handlersKey );
			if ( !data ) {
				data = new CustomEvent();
				utilData.set( ele, _handlersKey, data );
			}
			return data;
		},
		_destroyHandler: function( ele ) {
			var data = utilData.get( ele, _handlersKey );
			if ( data && data.isEmpty() ) {
				utilData.removeData( ele, _handlersKey );
				if ( !utilData.hasData( ele ) ) {
					utilData.removeData( ele );
				}
			}
			return data;
		},
		/**
		 * Remove toggle event.
		 * @variation 1
		 * @memberOf module:main/event
		 * @method toggle
		 * @example
		 * $("#a").toggle();
		 * @returns {this}
		 */

		/**
		 * Toggle event.
		 * @param {Element|window}
		 * @param {...Function} - Handelrs.
		 * @returns {this}
		 * @example
		 * var test1 = $("#a")[0];
		 * event.toggle(test1, function() {
		 *   alert(1);
		 * }, function() {
		 *   alert(2);
		 * });
		 */
		toggle: function( ele, funParas ) {
			var arg = $.util.argToArray( arguments, 1 ),
				index = 0,
				data;
			if ( arg.length > 1 ) {
				if ( data = utilData.get( ele, _toggleKey ) ) {
					arg = data.arg.concat( arg );
					index = data.index;
				}

				utilData.set( ele, _toggleKey, {
					index: index,
					arg: arg
				} );

				event.addHandler( ele, "click", this._toggle );
			} else {
				utilData.removeData( ele, _toggleKey );
				event.removeHandler( ele, "click", this._toggle );
			}
			return this;
		},
		_toggle: function( e ) {
			var self = event.document.getTarget( e ),
				data = utilData.get( self, _toggleKey ),
				arg = data.arg,
				len = arg.length,
				index = data.index % len;

			arg[ index ].call( self, e );
			utilData.set( self, _toggleKey, {
				index: index + 1,
				arg: arg
			} );
		},
		/**
		 * Trigger an native or custom event.
		 * @example
		 * var test1 = $("#a");
		 * var fn1 = function(str) {
		 *   $.logger(typed.isEvent(str));
		 *   $.logger({}.toString.call(str));
		 * }
		 * test1.on("mousedown", fn1);
		 * test1.trigger("mousedown", {
		 *   screenX: 4
		 * });
		 * test1.on("my.test1", fn1);
		 * test1.trigger("my.test1", {
		 *   screenX: 5
		 * });
		 * @param {Element|window}
		 * @param {String}
		 * @param {Object} - Function context.
		 * @param {...Object} - If you trigger a document event, the parameter must be a {}.
		 * @returns {this}
		 */
		trigger: function( ele, type, context, paras ) {
			if ( typed.isEle( ele ) || typed.isWindow( ele ) ) {
				var data;
				if ( data = domEventList[ type ] ) {
					type = eventHooks.type( type );
					typed.isFun( data ) ? data( ele, type, paras ) : $.logger( "trigger", "triggering" + type + " is not supported" );
				} else if ( data = utilData.get( ele, _handlersKey ) ) {
					data.trigger.apply( data, [ type, context ].concat( $.util.argToArray( arguments, 3 ) ) );
				}
			}
			return this;
		}
	};

	utilExtend.easyExtend( event, {
		/**
		 * Alias addHandler.
		 * @memberOf module:main/event
		 * @method
		 * @param {Element|window}
		 * @param {String} - "click", "swap.down"
		 * @param {Function}
		 * @returns {this}
		 */
		on: event.addHandler,
		/**
		 * Alias removeHandler.
		 * @memberOf module:main/event
		 * @method
		 * @param {Element|window}
		 * @param {String} - "click", "swap.down"
		 * @param {Function}
		 * @returns {this}
		 */
		off: event.removeHandler,
		/**
		 * Alias clearHandlers.
		 * @memberOf module:main/event
		 * @method
		 * @param {Element|window}
		 * @param {String} [type] - If type is undefined then clear all handlers.
		 * @returns {this}
		 */
		clear: event.clearHandlers
	} );

	var bus = new CustomEvent();

	$.extend( /** @lends aQuery */ {
		/**
		 * Add an event Handler to bus.
		 * @param {String} - "click", "swap.down"
		 * @param {Function}
		 * @returns {this}
		 */
		addHandler: function( type, fn ) {
			bus.addHandler( type, fn );
			return this;
		},
		/**
		 * Remove an event Handler from bus.
		 * @param {String} - "click", "swap.down"
		 * @param {Function}
		 * @returns {this}
		 */
		removeHandler: function( type, fn ) {
			bus.removeHandler( type, fn );
		},
		/**
		 * Clear all event Handler from bus.
		 * @param {String} - "click", "swap.down"
		 * @returns {this}
		 */
		clearHandlers: function( type ) {
			bus.clearHandlers( type );
			return this;
		},
		/**
		 * Has the element an event handler.
		 * @param {String} - "click", "swap.down"
		 * @param {Function}
		 * @returns {this}
		 */
		hasHandler: function( type, fn ) {
			return bus.hasHandler( type, fn );
		},
		/**
		 * Trigger an event to bus.
		 * @param {Element|window}
		 * @param {String}
		 * @param {Object} - Function context.
		 * @param {...Object}
		 * @returns {this}
		 */
		trigger: function() {
			bus.trigger.apply( bus, arguments );
			return this;
		},
		/**
		 * Add a event Handler to element and do once.
		 * <br /> It will remove handler after done.
		 * @param {String} - "click", "swap.down"
		 * @param {Function}
		 * @returns {this}
		 */
		once: function( type, fn ) {
			bus.once( type, fn );
			return this;
		},

		/** {CustomEvent} */
		bus: bus,

		/**
		 * Add "ajaxStart" event Handler to bus.
		 * @param {Function}
		 * @returns {this}
		 */
		ajaxStart: function( fn ) {
			return $.addHandler( "ajaxStart", fn );
		},
		/**
		 * Add "ajaxStop" event Handler to bus.
		 * @param {Function}
		 * @returns {this}
		 */
		ajaxStop: function( fn ) {
			return $.addHandler( "ajaxStop", fn );
		},
		/**
		 * Add "ajaxTimeout" event Handler to bus.
		 * @param {Function}
		 * @returns {this}
		 */
		ajaxTimeout: function( fn ) {
			return $.addHandler( "ajaxTimeout", fn );
		},
		/**
		 * Add "getJSStart" event Handler to bus.
		 * @param {Function}
		 * @returns {this}
		 */
		getJSStart: function( fn ) {
			return $.addHandler( "jsonpStart", fn );
		},
		/**
		 * Add "jsonpStop" event Handler to bus.
		 * @param {Function}
		 * @returns {this}
		 */
		jsonpStop: function( fn ) {
			return $.addHandler( "jsonpStop", fn );
		},
		/**
		 * Add "jsonpTimeout" event Handler to bus.
		 * @param {Function}
		 * @returns {this}
		 */
		jsonpTimeout: function( fn ) {
			return $.addHandler( "jsonpTimeout", fn );
		},
	} );

	$.extend( {
		/**
		 * Add an event Handler to bus.
		 * @memberOf aQuery
		 * @param {String} - "click", "swap.down"
		 * @param {Function}
		 * @returns {this}
		 */
		on: $.addHandler,
		/**
		 * Remove an event Handler from bus.
		 * @memberOf aQuery
		 * @param {String} - "click", "swap.down"
		 * @param {Function}
		 * @returns {this}
		 */
		off: $.removeHandler,
		/**
		 * Clear all event Handler from bus.
		 * @memberOf aQuery
		 * @param {String} - "click", "swap.down"
		 * @param {Function}
		 * @returns {this}
		 */
		clear: $.clearHandlers
	} );


	$.fn.extend( /** @lends aQuery.prototype */ {
		/**
		 * Add an event Handler to elements.
		 * @param {String} - "click", "swap.down"
		 * @param {Function}
		 * @returns {this}
		 */
		addHandler: function( type, fn ) {
			if ( !typed.isStr( type ) || !( typed.isFun( fn ) || fn === null ) ) return this;
			return this.each( function( ele ) {
				event.addHandler( ele, type, fn );
			} );
		},
		/**
		 * Add a event Handler to elements and do once.
		 * <br /> It will remove handler after done.
		 * @param {String} - "click", "swap.down"
		 * @param {Function}
		 * @returns {this}
		 */
		once: function( type, fn ) {
			if ( !typed.isStr( type ) || !( typed.isFun( fn ) || fn === null ) ) return this;
			return this.each( function( ele ) {
				event.once( ele, type, fn );
			} );
		},
		/**
		 * Clear all event Handler from elements.
		 * @param {String} - "click", "swap.down"
		 * @returns {this}
		 */
		clearHandlers: function( type ) {
			return this.each( function( ele ) {
				event.clearHandlers( ele, type );
			} );
		},
		/**
		 * Delegate children event handler from parentNode.
		 * @param {String} - "div>a"
		 * @param {String} - "click", "swap.down"
		 * @param {Function}
		 * @returns {this}
		 */
		delegate: function( selector, type, fn ) {
			return this.each( function( parentNode ) {
				event.addHandler( parentNode, type, function( e ) {
					var
					eleCollection = query.find( selector, parentNode ),
						target = event.document.getTarget( e ),
						ret = array.inArray( eleCollection || [], target );

					if ( ret > -1 ) {
						fn.call( target, e );
					}

				} );
			} );
		},
		/**
		 * Remove an event Handler from elements.
		 * @param {String} - "click", "swap.down"
		 * @param {Function}
		 * @returns {this}
		 */
		removeHandler: function( type, fn ) {
			if ( !typed.isStr( type ) || !typed.isFun( fn ) ) return this;
			return this.each( function( ele ) {
				event.removeHandler( ele, type, fn );
			} );
		},
		_initHandler: function() {
			return this.each( function( ele ) {
				event._initHandler( ele );
			} );
		},
		/**
		 * Toggle event.
		 * @example
		 * var test1 = $("#a");
		 * test1.toggle(function() {
		 *   alert(1)
		 * }, function() {
		 *   alert(2)
		 * });
		 * @param {Element|window}
		 * @param {...Function} - Handelrs.
		 * @returns {this}
		 */
		toggle: function( funParas ) {
			var arg = typed.isArr( funParas ) ? funParas : $.util.argToArray( arguments, 0 ),
				temp, i = 0,
				ele;
			for ( ; ele = this.eles[ i++ ]; ) {
				temp = arg.concat();
				temp.splice( 0, 0, ele );
				event.toggle.apply( event, temp );
			}
			return this;
		},
		/**
		 * Trigger an event from elements.
		 * @param {String}
		 * @param {Object} - Function context.
		 * @param {...Object}
		 * @returns {this}
		 */
		trigger: function( type, context ) {
			var arg = $.util.argToArray( arguments );
			return this.each( function( ele ) {
				event.trigger.apply( null, [ ele ].concat( arg ) );
			} );
		},
		/**
		 * Add "blur" event handler to elements.
		 * @param {Function}
		 * @returns {this}
		 */
		blur: function( fn ) {
			return this.addHandler( "blur", fn );
		},
		/**
		 * Add "focus" event handler to elements.
		 * @param {Function}
		 * @returns {this}
		 */
		focus: function( fn ) {
			return this.addHandler( "focus", fn );
		},
		/**
		 * Add "focusin" event handler to elements.
		 * @param {Function}
		 * @returns {this}
		 */
		focusin: function( fn ) {
			return this.addHandler( "focusin", fn );
		},
		/**
		 * Add "focusout" event handler to elements.
		 * @param {Function}
		 * @returns {this}
		 */
		focusout: function( fn ) {
			return this.addHandler( "focusout", fn );
		},
		/**
		 * Add "load" event handler to elements.
		 * @param {Function}
		 * @returns {this}
		 */
		load: function( fn ) {
			return this.addHandler( "load", fn );
		},
		/**
		 * Add "resize" event handler to elements.
		 * @param {Function}
		 * @returns {this}
		 */
		resize: function( fn ) {
			return this.addHandler( "resize", fn );
		},
		/**
		 * Add "resize" event handler to elements.
		 * @param {Function}
		 * @returns {this}
		 */
		scroll: function( fn ) {
			return this.addHandler( "scroll", fn );
		},
		/**
		 * Add "unload" event handler to elements.
		 * @param {Function}
		 * @returns {this}
		 */
		unload: function( fn ) {
			return this.addHandler( "unload", fn );
		},
		/**
		 * Add "click" event handler to elements.
		 * @param {Function}
		 * @returns {this}
		 */
		click: function( fn ) {
			return this.addHandler( "click", fn );
		},
		/**
		 * Add "dblclick" event handler to elements.
		 * @param {Function}
		 * @returns {this}
		 */
		dblclick: function( fn ) {
			return this.addHandler( "dblclick", fn );
		},
		/**
		 * Add "mousedown" event handler to elements.
		 * @param {Function}
		 * @returns {this}
		 */
		mousedown: function( fn ) {
			return this.addHandler( "dblclick", fn );
		},
		/**
		 * Add "mouseup" event handler to elements.
		 * @param {Function}
		 * @returns {this}
		 */
		mouseup: function( fn ) {
			return this.addHandler( "mouseup", fn );
		},
		/**
		 * Add "mousemove" event handler to elements.
		 * @param {Function}
		 * @returns {this}
		 */
		mousemove: function( fn ) {
			return this.addHandler( "mousemove", fn );
		},
		/**
		 * Add "mouseover" event handler to elements.
		 * @param {Function}
		 * @returns {this}
		 */
		mouseover: function( fn ) {
			return this.addHandler( "mouseover", fn );
		},
		/**
		 * Add "mouseout" event handler to elements.
		 * @param {Function}
		 * @returns {this}
		 */
		mouseout: function( fn ) {
			return this.addHandler( "mouseout", fn );
		},
		/**
		 * Add "mouseenter" event handler to elements.
		 * @param {Function}
		 * @returns {this}
		 */
		mouseenter: function( fn ) {
			return this.addHandler( "mouseover", function( e ) {
				fn.apply( this, arguments );
				event.document.stopPropagation( e );
			} );
		},
		/**
		 * Add "mouseleave" event handler to elements.
		 * @param {Function}
		 * @returns {this}
		 */
		mouseleave: function( fn ) {
			return this.blur( "mouseout", function( e ) {
				fn.apply( this, arguments );
				event.document.stopPropagation( e );
			} );
		},
		/**
		 * Add "mousewheel" event handler to elements.
		 * @param {Function}
		 * @returns {this}
		 */
		mousewheel: function( fn ) {
			return this.addHandler( "mousewheel", function( e ) {
				e = event.document.getEvent( e );
				var delta = 0;
				if ( e.wheelDelta ) delta = e.wheelDelta / 120;
				if ( e.detail ) delta = -e.detail / 3;
				delta = Math.round( delta );
				if ( delta ) fn.call( this, delta );
				event.document.stopPropagation( e );
			} );
		},
		/**
		 * Add "touchwheel" event handler to elements.
		 * @param {Function}
		 * @returns {this}
		 */
		touchwheel: function( fn ) {
			return this.addHandler( "mousewheel", function( e ) {
				e = event.document.getEvent( e );
				var delta = 0,
					direction = "y";
				if ( e.wheelDelta ) {
					delta = e.wheelDelta;
					if ( e.wheelDeltaX ) {
						direction = "x";
					}
					if ( e.wheelDeltaY ) {
						direction = "y";
					}
				} else if ( e.detail ) {
					delta = -e.detail * 40; //40也许太多
				}
				if ( e.axis ) {
					direction = e.axis == 1 ? "x" : "y";
				}
				e.delta = delta;
				e.direction = direction;

				event.document.stopPropagation( e );
				event.document.preventDefault( e );

				// if (e.type == "DOMMouseScroll") {
				//     e.type = "mousewheel";
				// };
				fn.call( this, e );
			} );
		},
		/**
		 * Add "change" event handler to elements.
		 * @param {Function}
		 * @returns {this}
		 */
		change: function( fn ) {
			return this.addHandler( "mouseout", fn );
		},
		/**
		 * Add "select" event handler to elements.
		 * @param {Function}
		 * @returns {this}
		 */
		select: function( fn ) {
			return this.addHandler( "mouseout", fn );
		},
		/**
		 * Add "submit" event handler to elements.
		 * @param {Function}
		 * @returns {this}
		 */
		submit: function( fn ) {
			return this.addHandler( "mouseout", fn );
		},
		/**
		 * Add "keydown" event handler to elements.
		 * @param {Function}
		 * @returns {this}
		 */
		keydown: function( fn ) {
			return this.addHandler( "keydown", function( e ) {
				client.browser.firefox && e.keyCode || ( e.keyCode = e.which );
				e.charCode === undefined && ( e.charCode = e.keyCode );
				fn.call( this, e );
			} );
		},
		/**
		 * Add "keypress" event handler to elements.
		 * @param {Function}
		 * @returns {this}
		 */
		keypress: function( fn ) {
			return this.addHandler( "keypress", function( e ) {
				client.browser.firefox && e.keyCode || ( e.keyCode = e.which );
				e.charCode === undefined && ( e.charCode = e.keyCode );
				fn.call( this, e, String.fromCharCode( e.charCode ) );
			} );
		},
		/**
		 * Add "keyup" event handler to elements.
		 * @param {Function}
		 * @returns {this}
		 */
		keyup: function( fn ) {
			return this.addHandler( "mouseout", fn );
		},
		/**
		 * Add "keyup" event handler to elements.
		 * @param {Function}
		 * @returns {this}
		 */
		error: function( fn ) {
			return this.addHandler( "error", fn );
		}
	} );

	$.fn.extend( {
		on: $.fn.addHandler,
		off: $.fn.removeHandler,
		clear: $.fn.clearHandlers
	} );

	for ( i = 0, len = mouse.length; i < len; i++ ) {
		domEventList[ mouse[ i ] ] = event.document.imitation.mouse;
	}
	for ( i = 0, len = mutation.length; i < len; i++ ) {
		domEventList[ mutation[ i ] ] = 1;
	}
	for ( i = 0, len = key.length; i < len; i++ ) {
		domEventList[ key[ i ] ] = event.document.imitation.key;
	}
	for ( i = 0, len = html.length; i < len; i++ ) {
		domEventList[ html[ i ] ] = event.document.imitation.html;
	}
	for ( i = 0, len = other.length; i < len; i++ ) {
		domEventList[ other[ i ] ] = 1;
	}

	return event;
} );

/*=======================================================*/

/*===================main/attr===========================*/
﻿aQuery.define( "main/attr", [ "base/typed", "base/extend", "base/support" ], function( $, typed, utilExtend, support, undefined ) {
	"use strict";
	//暂不要那么多hooks
	var fixSpecified = {
		name: true,
		id: true,
		coords: true
	},
		propFix = {
			tabindex: "tabIndex",
			readonly: "readOnly",
			"for": "htmlFor",
			"class": "className",
			maxlength: "maxLength",
			cellspacing: "cellSpacing",
			cellpadding: "cellPadding",
			rowspan: "rowSpan",
			colspan: "colSpan",
			usemap: "useMap",
			frameborder: "frameBorder",
			contenteditable: "contentEditable"
		}, rboolean = /^(?:autofocus|autoplay|async|checked|controls|defer|disabled|hidden|loop|multiple|open|readonly|required|scoped|selected)$/i;
	/**
	 * @exports main/attr
	 * @requires module:base/typed
	 * @requires module:base/extend
	 * @requires module:base/support
	 */
	var attrUtil = {
		/**
		 * @param {Element}
		 * @param {String}
		 * @returns {String}
		 */
		getAttr: function( ele, name ) {
			var ret;
			if ( !support.getSetAttribute ) {
				ret = ele.getAttributeNode( name );
				return ret && ( fixSpecified[ name ] ? ret.nodeValue !== "" : ret.specified ) ?
					ret.nodeValue :
					undefined;
			}
			return ( ret = ele.getAttributeNode( name ) ) ? ret.nodeValue : undefined;
		},
		/**
		 * Exception select, checkbox, radio. <br/>
		 * If select is multiple choice, then return "America|England"
		 * @param {Element}
		 * @returns {String}
		 */
		getVal: function( ele ) {
			var type = ele.type.toUpperCase(),
				result;
			if ( typed.isNode( ele, "select" ) ) {
				result = ele.value;
				if ( typed.isNul( result ) || ele.multiple == true ) {
					result = [];
					$( ele ).posterity( ":selected" ).each( function( ele ) {
						result.push( ele.innerHTML );
					} );
					result = result.join( "|" );
				}
				return result;
			} else if ( typed.isNode( ele, "select" ) && ( type == "CHECKBOX" || type == "RADIO" ) )
				return ele.checked.toString();
			else
				return ele.value.toString();
		},
		/**
		 * @param {Element}
		 * @param {String}
		 * @returns {this}
		 */
		removeAttr: function( ele, key ) {
			var propName, attrNames, name, l, isBool, i = 0;

			if ( key && ele.nodeType === 1 ) {
				attrNames = key.toLowerCase().split( /\s+/ );
				l = attrNames.length;

				for ( ; i < l; i++ ) {
					name = attrNames[ i ];

					if ( name ) {
						propName = propFix[ name ] || name;
						isBool = rboolean.test( name );

						if ( !isBool ) {
							attrUtil.setAttr( ele, name, "" );
						}
						ele.removeAttribute( support.getSetAttribute ? name : propName );

						if ( isBool && propName in ele ) {
							ele[ propName ] = false;
						}
					}
				}
			}
			return this;
		},
		/**
		 * @param {Element}
		 * @param {String}
		 * @param {String|Number}
		 * @returns {this}
		 */
		setAttr: function( ele, name, value ) {
			if ( value == null ) {
				return attrUtil.removeAttr( ele, name );
			}
			if ( !support.getSetAttribute ) {
				var ret = ele.getAttributeNode( name );
				if ( !ret ) {
					ret = document.createAttribute( name );
					ele.setAttributeNode( ret );
				}
				ret.nodeValue = value + "";
			} else {
				ele.setAttribute( name, value );
			}
			return this;
		},
		/**
		 * Exception select, checkbox, radio. <br/>
		 * If select is multiple choice and value equals inner HTML of one element.
		 * @param {Element}
		 * @param {String|Boolean|Number}
		 * @returns {this}
		 */
		setVal: function( ele, value ) {
			var type = ele.type.toUpperCase();
			if ( typed.isNode( ele, "select" ) ) {
				if ( typed.isStr( value ) || typed.isNum( value ) )
					value = [ value ];
				$( ele ).find( "option" ).each( function( ele ) {
					ele.selected = false;
				} ).each( function( ele, index ) {
					$.each( value, function( val ) {
						if ( index === val || ele.innerHTML === val )
							ele.selected = true;
					}, this );
				} );
			} else if ( typed.isNode( ele, "input" ) && ( type == "CHECKBOX" || type == "RADIO" ) ) {
				if ( value === "checked" || value === "true" || value === true )
					ele.checked = true;
				else
					ele.value = value.toString();
			} else
				ele.value = value.toString();
			return this;
		}
	};

	$.fn.extend( /** @lends aQuery.prototype */ {
		/**
		 * Set or get attribute.
		 * @example
		 * $("#img").attr({
		 *   width: "100px",
		 *   height: "100px"
		 * }).attr("title", "Flower");
		 * $("#div1").attr("title", "Hello");
		 * $("#div2").attr("title", "World");
		 * $("#div1, #div2").attr("title"); // return "Hello"
		 * @param {String|Object}
		 * @param {String|Number} [value]
		 * @returns {this|String}
		 */
		attr: function( attr, value ) {
			if ( typed.isObj( attr ) ) {
				for ( var i in attr ) {
					this.each( function( ele ) {
						attrUtil.setAttr( ele, i, attr[ i ] );
					} );
				}
			} else if ( typed.isStr( attr ) ) {
				if ( value == undefined ) {
					return attrUtil.getAttr( this[ 0 ], attr );
				} else {
					this.each( function( ele ) {
						attrUtil.setAttr( ele, attr, value );
					} );
				}
			}
			return this;
		},
		/**
		 * Remove attribute.
		 * @param {String}
		 * @returns {this}
		 */
		removeAttr: function( name ) {
			return this.each( function( ele ) {
				attrUtil.removeAttr( ele, name );
			} );
		},
		/**
		 * Get or set value.
		 * @param {String|Boolean|Number} [value]
		 * @returns {this|String}
		 */
		val: function( value ) {
			return value ? this.each( function( ele ) {
				attrUtil.setVal( ele, value );
			} ) : attrUtil.getVal( this[ 0 ] );
		}
	} );

	return attrUtil;
} );

/*=======================================================*/

/*===================module/src===========================*/
﻿aQuery.define( "module/src", [ "base/typed", "base/extend", "base/client" ], function( $, typed, utilExtend, client, undefined ) {
	"use strict";
	var
	hasOwnProperty = Object.prototype.hasOwnProperty,
		src = {
			href: function( ele, options ) {
				/// <summary>加载有href的元素</summary>
				/// <para>str options.href：不可缺省</para>
				/// <para>fun optiosn.complete:回调函数</para>
				/// <para>obj options.context:complete的作用域</para>
				/// <para>num options.timeout:超时时间。缺省为10000</para>
				/// <para>fun options.timeoutFun:超时后的事件</para>
				/// <para>fun options.error:错误函数</para>
				/// <param name="ele" type="Element">元素</param>
				/// <param name="options" type="Object">参数</param>
				/// <returns type="self" />
				var opt = utilExtend.extend( {}, src.hrefSetting, options );
				return src.src( ele, opt, "href" );
			},
			hrefSetting: {
				href: ""
			},

			link: function( options ) {
				/// <summary>加载link元素</summary>
				/// <para>str options.href：不可缺省</para>
				/// <para>link没有回调函数</para>
				/// <param name="options" type="Object">参数</param>
				/// <returns type="self" />
				var _link = document.createElement( "link" ),
					_head = document.getElementsByTagName( "HEAD" ).item( 0 ),
					opt = utilExtend.extend( {}, src.linkSetting, options );
				_link.rel = opt.rel;
				_link.type = opt.type;
				src.href( _link, opt );
				_head.appendChild( _link );
				return this;
			},
			linkSetting: {
				rel: "stylesheet",
				href: "",
				type: "text/css"
			},

			src: function( ele, options ) {
				/// <summary>加载有src的元素</summary>
				/// <para>str options.src：不可缺省</para>
				/// <para>fun optiosn.complete:回调函数</para>
				/// <para>obj options.context:complete的作用域</para>
				/// <para>num options.timeout:超时时间。缺省为10000</para>
				/// <para>fun options.timeoutFun:超时后的事件</para>
				/// <para>fun options.error:错误函数</para>
				/// <param name="ele" type="Element">元素</param>
				/// <param name="options" type="Object">参数</param>
				/// <returns type="self" />
				var property = arguments[ 2 ] || "src";
				if ( !typed.isEle( ele ) || ( !hasOwnProperty.call( ele, property ) && ele[ property ] === undefined ) ) {
					return this;
				}
				ele.onload = null;
				ele.setAttribute( property, "" );
				var o = utilExtend.extend( {}, $.srcSetting, options ),
					timeId;

				ele.onload = function() {
					clearTimeout( timeId );
					o.complete && o.complete.call( o.context || this, this );
					ele = timeId = o = null;
				};
				ele.onerror = function( e ) {
					clearTimeout( timeId );
					o.error && o.timeoutFun.call( ele, e );
					ele = o = timeId = null;
				};

				if ( o.timeout ) {
					timeId = setTimeout( function() {
						o.timeoutFun && o.timeoutFun.call( ele, o );
						ele = o = timeId = null;
					}, o.timeout );
				}
				ele.setAttribute( property, o[ property ] );

				return this;

			},
			srcSetting: {
				error: function( e ) {
					$.logger( "aQuery.src", ( this.src || "(empty)" ) + "of " + this.tagName + " getting error:" + e.toString() );
				},
				timeout: false,
				timeoutFun: function( o ) {
					$.logger( "aQuery.src", ( o.url || "(empty)" ) + "of " + this.tagName + "is timeout:" + ( o.timeout / 1000 ) + "second" );
				},
				src: ""
			}
		};

	$.fn.extend( {
		href: function( options ) {
			/// <summary>加载有href的元素</summary>
			/// <para>str options.href：不可缺省</para>
			/// <para>fun optiosn.complete:回调函数</para>
			/// <para>obj options.context:complete的作用域</para>
			/// <para>num options.timeout:超时时间。缺省为10000</para>
			/// <para>fun options.timeoutFun:超时后的事件</para>
			/// <para>fun options.error:错误函数</para>
			/// <returns type="self" />
			return this.each( function( ele ) {
				$.href( ele, options );
			} );
		},

		src: function( options ) {
			/// <summary>加载有src的元素</summary>
			/// <para>str options.src：不可缺省</para>
			/// <para>fun optiosn.complete:回调函数</para>
			/// <para>obj options.context:complete的作用域</para>
			/// <para>num options.timeout:超时时间。缺省为10000</para>
			/// <para>fun options.timeoutFun:超时后的事件</para>
			/// <para>fun options.error:错误函数</para>
			/// <returns type="self" />
			return this.each( function( ele ) {
				$.src( ele, options );
			} );
		}
	} );

	$.extend( src );

	return src;
} );

/*=======================================================*/

/*===================module/utilEval===========================*/
﻿aQuery.define( "module/utilEval", [ "base/typed", "base/support" ], function( $, typed, support ) {
	return {
		evalBasicDataType: function( str ) {
			/// <summary>如果是基本数据类型就eval</summary>
			/// <param name="s" type="String"></param>
			/// <returns type="any" />
			if ( typed.isStr( str ) && /(^(-?\d+)(\.\d+)?$)|true|false|undefined|null|NaN|Infinite/.test( str ) ) {
				return eval( str );
			}
			return str;
		},

		functionEval: function( s, context ) {
			/// <summary>使用Funciont来eval</summary>
			/// <param name="s" type="String"></param>
			/// <param name="context" type="Object">作用域</param>
			/// <returns type="any" />
			return ( new Function( "return " + s ) ).call( context );
		},

		globalEval: function( data, notRemove ) {
			///	<summary>
			///	把一段String用js的方式声明为全局的
			///	</summary>
			/// <param name="data" type="String">数据</param>
			/// <param name="remove" type="Boolean">是否移除</param>
			/// <returns type="XMLHttpRequest" />

			if ( data && /\S/.test( data ) ) {
				// Inspired by code by Andrea Giammarchi
				// http://webreflection.blogspot.com/2007/08/global-scope-evaluation-and-dom.html
				var head = document.getElementsByTagName( "head" )[ 0 ] || document.documentElement,
					script = document.createElement( "script" );

				script.type = "text/javascript";

				if ( support.scriptEval ) {
					script.appendChild( document.createTextNode( data ) );
				} else {
					script.text = data;
				}

				// Use insertBefore instead of appendChild to circumvent an IE6 bug.
				// This arises when a base node is used (#2709).
				head.insertBefore( script, head.firstChild );
				notRemove || head.removeChild( script );
			}
			return this;
		}
	};
} );

/*=======================================================*/

/*===================module/Widget===========================*/
﻿aQuery.define( "module/Widget", [
  "base/config",
  "base/typed",
  "base/extend",
  "base/array",
  "main/data",
  "main/query",
  "main/event",
  "main/attr",
  "main/object",
  "module/src",
  "module/utilEval"
 ], function(
	$,
	config,
	typed,
	utilExtend,
	array,
	utilData,
	query,
	event,
	attr,
	object,
	src,
	utilEval,
	undefined ) {
	"use strict";

	var prefix = "amdquery";

	function getWidgetsName( eles ) {
		var widgetNames = [],
			widgetMap = {};

		eles = $( eles );

		eles.each( function( ele ) {
			var attrNames = Widget.getAttrWidgets( ele ),
				len = attrNames.length,
				widgetName,
				widgetPath,
				temp,
				i = 0;
			for ( ; i < len; i++ ) {
				widgetName = attrNames[ i ];
				if ( widgetName ) {

					widgetPath = widgetName.replace( ".", "/" );

					if ( !widgetMap[ widgetName ] ) {
						widgetNames.push( widgetPath );

						widgetMap[ widgetName ] = true;
					}
				}
			}

		} );

		return widgetNames;
	}


	function Widget( obj, target ) {
		/// <summary>组件的默认基类</summary>
		/// <para></para>
		/// <param name="obj" type="Object">构造函数</param>
		/// <param name="target" type="$">$对象</param>
		/// <returns type="Widget" />

		this.init( obj.target );
	}

	Widget.AllowPublic = 1;
	Widget.AllowReturn = 2;

	Widget.initFirst = 2;

	Widget.detectEventName = "widget.detect";

	var booleanExtend = function( a, b ) {
		for ( var i in b ) {
			if ( b[ i ] === 0 || b[ i ] === false ) {
				a[ i ] = 0;
			} else {
				if ( typed.isBol( a[ i ] ) || typed.isNum( a[ i ] ) ) {

				} else {
					a[ i ] = b[ i ];
				}
			}
		}
	},
		_extendAttr = function( key, constructor, booleanCheck ) {
			/*出了option 其他应该扩展到prototype上*/
			var subValue = constructor.prototype[ key ],
				superConstructor = constructor.prototype.__superConstructor,
				superValue = superConstructor.prototype[ key ],
				newValue = {};

			var extend;

			utilExtend.easyExtend( newValue, superValue );

			if ( !typed.isNul( subValue ) ) {
				if ( booleanCheck ) {
					extend = booleanExtend;
				} else {
					extend = utilExtend.easyExtend;
				}
				extend( newValue, subValue );
			}

			constructor.prototype[ key ] = newValue;
		},
		_initOptionsPurview = function( constructor ) {
			var proto = constructor.prototype,
				getter = {},
				setter = {},
				options = proto.options || {},
				i;

			utilExtend.easyExtend( getter, proto.getter );
			utilExtend.easyExtend( setter, proto.setter );

			for ( i in options ) {
				if ( getter[ i ] === undefined ) {
					getter[ i ] = 1;
				}
				if ( setter[ i ] === undefined ) {
					setter[ i ] = 1;
				}
			}

			proto.getter = getter;

			proto.setter = setter;
		},
		extendTemplate = function( tName, prototype, statics ) {
			if ( typed.isObj( statics ) ) {
				return Widget.extend( tName, prototype, statics, this.ctor );
			} else {
				return Widget.extend( tName, prototype, this.ctor );
			}
		},
		invokeTemplate = function() {
			return this.ctor.invoke.apply( this.ctor, arguments );
		};


	object.extend( Widget, {
		addTag: function() {
			var tag = this.toString(),
				optionAttr = this.widgetNameSpace + "-" + this.widgetName,
				optionTag = this.target.attr( optionAttr ),
				widgetAttr = prefix + "-widget",
				widgetTag = this.target.attr( widgetAttr );

			if ( typed.isNul( widgetTag ) ) {
				this.target.attr( widgetAttr, tag );
			} else {
				var reg = new RegExp( "(\\W|^)" + tag + "(\\W|$)" ),
					result = widgetTag.match( reg ),
					symbol = widgetTag.length ? ";" : "";

				if ( !result || !result[ 0 ] ) {
					widgetTag = widgetTag.replace( /\W$/, "" ) + symbol + tag + ";";
					this.target.attr( widgetAttr, widgetTag );
				}
			}

			if ( !optionTag ) {
				this.target.attr( optionAttr, "" );
			}

			return this;
		},
		removeTag: function() {
			var tag = this.toString(),
				optionAttr = this.widgetNameSpace + "-" + this.widgetName,
				optionTag = this.target.attr( optionAttr ),
				widgetAttr = prefix + "-widget",
				widgetTag = this.target.attr( widgetAttr );

			if ( typed.isNul( widgetTag ) ) {
				var reg = new RegExp( "(\\W|^)" + tag + "(\\W|$)", "g" );
				widgetTag = widgetTag.replace( reg, ";" ).replace( /^\W/, "" );
				this.target.attr( widgetAttr, widgetTag );
			}

			if ( optionTag === "" ) {
				this.target.removeAttr( optionAttr );
			}

			return this;
		},
		checkAttr: function() {
			var key, attr, value, item, result = {}, i = 0,
				j = 0,
				len = 0,
				events,
				widgetName = this.widgetName,
				eventNames = this.customEventName;
			/*check event*/
			for ( i = 0, len = eventNames.length; i < len; i++ ) {
				item = eventNames[ i ];
				key = this.widgetNameSpace + "-" + widgetName + "-" + item;
				attr = this.target.attr( key );
				if ( attr !== undefined ) {
					events = attr.split( ";" );
					for ( j = events.length - 1; j >= 0; j-- ) {
						value = events[ j ].split( ":" );
						result[ item ] = utilEval.functionEval( value[ 0 ], value[ 1 ] || window );
					}
				}
			}

			attr = this.target.attr( this.widgetNameSpace + "-" + widgetName ) || this.target.attr( this.widgetName );

			/*check options*/
			if ( typed.isStr( attr ) ) {
				attr = attr.split( /;|,/ );
				for ( i = 0, len = attr.length; i < len; i++ ) {
					item = attr[ i ].split( ":" );
					if ( item.length == 2 ) {
						key = item[ 0 ];
						if ( /^#((?:[\w\u00c0-\uFFFF-]|\\.)+)/.test( item[ 1 ] ) ) {
							result[ key ] = $( item[ 1 ] )[ 0 ];
						} else if ( this.options[ key ] !== undefined ) {
							result[ key ] = utilEval.evalBasicDataType( item[ 1 ] );
						} else if ( array.inArray( this.customEventName, key ) > -1 ) {
							result[ key ] = utilEval.functionEval( item[ 1 ], $ );
						}
					}
				}
			}

			return result;
		},
		_doAfterInit: function() {

		},
		create: function() {},
		detect: function() {
			return this;
		},
		layout: function() {
			return this;
		},
		resize: function() {
			return this;
		},
		container: null,
		constructor: Widget,
		destroy: function() {
			/*应当返回原先的状态*/

			//this.destroyChildren();
			this.disable();
			this.removeTag();
			var i = 0,
				name;
			for ( i = this.customEventName.length - 1; i >= 0; i-- ) {
				this.target.clearHandlers( this.widgetEventPrefix + "." + this.customEventName[ i ] );
			}

			if ( this.container && this.options.removeContainer ) $( this.container ).remove();

			for ( i in this ) {
				name = i;
				if ( !object.isPrototypeProperty( this, name ) && ( this[ name ] = null ) ) delete this[ name ];
			}

			return this;
		},
		able: function() {
			this.options.disabled ? this.disable() : this.enable();
			return this;
		},
		disable: function() {
			this.options.disabled = true;
			return this;
		},
		enable: function() {
			this.options.disabled = false;
			return this;
		},

		init: function( obj, target ) {
			var proto = this.constructor.prototype;


			this.options = {};
			utilExtend.easyExtend( this.options, proto.options );

			target._initHandler();
			this.target = target;
			this.addTag();
			//obj高于元素本身属性
			obj = typed.isPlainObj( obj ) ? obj : {};
			var ret = {};
			utilExtend.extend( ret, this.checkAttr(), obj );
			this.option( ret );
			return this;
		},
		instanceofWidget: function( item ) {
			var constructor = item;
			if ( typed.isStr( item ) ) {
				constructor = Widget.get( item );
			}
			if ( typed.isFun( constructor ) ) {
				return constructor.forinstance ? constructor.forinstance( this ) : ( this instanceof constructor );
			}
			return false;
		},
		equals: function( item ) {
			if ( this.forinstance( item ) ) {
				return this.getElement() === item.getElement() && this[ this.widgetName ]( "getSelf" ) === item[ this.widgetName ]( "getSelf" );
			}
			return false;
		},
		option: function( key, value ) {
			if ( typed.isObj( key ) ) {
				for ( var name in key ) {
					this.setOption( name, key[ name ] );
				}
			} else if ( value === undefined ) {
				return this.getOption( key );
			} else if ( typed.isStr( key ) ) {
				this.setOption( key, value );
			}
		},
		customEventName: [],
		options: {
			disabled: 0
		},
		getter: {
			disabled: 1
		},
		setter: {
			disabled: 0
		},
		publics: {
			disable: Widget.AllowPublic,
			enable: Widget.AllowPublic,
			toString: Widget.AllowReturn,
			getSelf: Widget.AllowReturn,
			instanceofWidget: Widget.AllowReturn,
			equals: Widget.AllowReturn,
			beSetter: Widget.AllowReturn,
			beGetter: Widget.AllowReturn,
			render: Widget.AllowPublic,
			detect: Widget.AllowPublic,
			resize: Widget.AllowPublic,
			layout: Widget.AllowPublic
		},
		getEventName: function( name ) {
			return this.widgetEventPrefix + "." + name;
		},
		render: function() {},
		_initHandler: function() {},
		// _getInitHandler: function( Super, context ) {
		//   var originEvent = this.event;
		//   Super.invoke( "_initHandler", context );
		//   var superEvent = this.event;
		//   this.event = originEvent;
		//   return superEvent;
		// },

		_isEventName: function( name ) {
			return array.inArray( this.customEventName, name ) > -1;
		},
		setOption: function( key, value ) {
			if ( this.beSetter( key ) && this.options[ key ] !== undefined ) {
				this.doSpecialSetter( key, value );
			} else if ( this._isEventName( key ) ) {
				var eventName = this.getEventName( key );
				if ( typed.isFun( value ) ) {
					this.target.on( eventName, value );
				} else if ( value === null ) {
					this.target.clearHandlers( eventName );
				}
			}
		},
		getOption: function( key ) {
			if ( this.beGetter( key ) ) {
				return this.doSpecialGetter( key );
			} else {
				if ( this.options[ key ] !== undefined ) {
					throw ( "widget:" + this.toString() + " can not get option " + key + "; please check getter" );
				} else {
					throw ( "widget:" + this.toString() + " option " + key + " is undefined; please check options" );
				}
				return undefined;
			}
		},
		doSpecialGetter: function( key ) {
			var fn = this[ $.util.camelCase( key, "_get" ) ];
			return typed.isFun( fn ) ? fn.call( this ) : this.options[ key ];
		},
		doSpecialSetter: function( key, value ) {
			var flag = "__" + key + "OptionInitFirstFlag";
			if ( this.setter[ key ] === Widget.initFirst ) {
				if ( this[ flag ] ) {
					return;
				} else {
					this[ flag ] = true;
				}
			}
			var fn = this[ $.util.camelCase( key, "_set" ) ];
			typed.isFun( fn ) ? fn.call( this, value ) : ( this.options[ key ] = value );
		},
		beGetter: function( key ) {
			return !!this.getter[ key ];
		},
		beSetter: function( key ) {
			return !!this.setter[ key ];
		},
		toString: function() {
			return "ui.widget";
		},
		getSelf: function() {
			return this;
		},
		widgetEventPrefix: "",
		//将来做事件用
		widgetName: "Widget",

		widgetNameSpace: "ui",

		initIgnore: false,

		initIndex: 0
	}, {
		extend: function( name, prototype, statics, Super ) {
			/// <summary>为$添加部件
			/// <para>作为类得constructor可以这样</para>
			/// <para>function TimePicker(obj, target, base){</para>
			/// <para>      base.call(this, obj, target);</para>
			/// <para>}</para>
			/// <para>方法会被传入3个参数。obj为初始化参数、target为$的对象、base为Widget基类</para>
			/// <para>prototype应当实现的属性:container:容器 options:参数 target:目标$ publics:对外公开的方法 widgetEventPrefix:自定义事件前缀</para>
			/// <para>prototype应当实现的方法:返回类型 方法名 this create, this init, this render,Object event</para>
			/// <para>prototype.publics为对外公开的方法，父类覆盖子类遵从于private</para>
			/// <para>prototype.returns 为对外共开方法是否返回一个自己的值 否则将会默认返回原 $对象</para>
			/// <para>prototype.options为参数子类扩展父类</para>
			/// <para>prototype.getter属性器，子类扩展与父类，但遵从于private</para>
			/// <para>prototype.setter属性器，子类扩展与父类，但遵从于private</para>
			/// <para>prototype.customEventName事件列表，子类覆盖父类</para>
			/// <para>对外公开的方法返回值不能为this只能使用getSelf</para>
			/// </summary>
			/// <param name="name" type="String">格式为"ui.scorePicker"ui为命名空间，scorePicer为方法名，若有相同会覆盖</param>
			/// <param name="prototype" type="Object">类的prototype 或者是基widget的name</param>
			/// <param name="statics" type="Object">类的静态方法</param>
			/// <param name="Super" type="Function/undefined">基类</param>
			/// <returns type="Function" />
			//consult from jQuery.ui
			if ( !typed.isStr( name ) ) return null;
			name = name.split( "." );
			var nameSpace = name[ 0 ];
			name = name[ 1 ];


			if ( !nameSpace || !name ) return;
			if ( !Widget[ nameSpace ] ) Widget[ nameSpace ] = {};

			if ( typed.isFun( arguments[ arguments.length - 1 ] ) ) {
				Super = arguments[ arguments.length - 1 ];
			} else {
				Super = Widget;
			}

			if ( !typed.isObj( statics ) ) {
				statics = {};
			}

			var Ctor = object.extend( name, prototype, Super );
			Ctor.prototype.widgetName = name;
			Ctor.prototype.widgetNameSpace = nameSpace;

			Widget[ nameSpace ][ name ] = Ctor;

			/*如果当前prototype没有定义setter和getter将自动生成*/
			_initOptionsPurview( Ctor );

			_extendAttr( "publics", Ctor, prototype, true );
			_extendAttr( "options", Ctor );

			/*遵从父级为false 子集就算设为ture 最后也会为false*/
			_extendAttr( "getter", Ctor, true );
			_extendAttr( "setter", Ctor, true );


			var key = nameSpace + "." + name + $.now();

			var widget = function( a, b, c ) {
				/// <summary>对当前$的所有元素初始化某个UI控件或者修改属性或使用其方法</summary>
				/// <para>返回option属性或returns方法时，只返回第一个对象的</para>
				/// <param name="a" type="Object/String">初始化obj或属性名:option或方法名</param>
				/// <param name="b" type="String/nul">属性option子属性名</param>
				/// <param name="c" type="any">属性option子属性名的值</param>
				/// <returns type="self" />
				var result = this,
					arg = arguments;
				this.each( function( ele ) {
					var data = utilData.get( ele, key ); //key = nameSpace + "." + name,
					if ( data === undefined || data === null ) {
						//完全调用基类的构造函数 不应当在构造函数 create render
						if ( a !== "destroy" ) {
							data = new Ctor( a, $( ele ) );
							utilData.set( ele, key, data );
							data._doAfterInit(); //跳出堆栈，在flex这种会用到
						}
					} else {
						if ( a === "destroy" ) {
							data[ a ].call( data );
							$.removeData( ele, key );
						} else if ( typed.isObj( a ) ) {
							data.option( a );
							data.render();
						} else if ( typed.isStr( a ) ) {
							if ( a === "option" ) {
								if ( c !== undefined ) {
									/*若可set 则全部set*/
									data.option( b, c );
									data.render();
								} else {
									/*若可get 则返回第一个*/
									result = data.option( b, c );
									return false;
								}
							} else if ( !! data.publics[ a ] ) {
								var temp = data[ a ].apply( data, $.util.argToArray( arg, 1 ) );
								if ( data.publics[ a ] == Widget.AllowReturn ) {
									result = temp;
									return false;
								}
							}
						}
					}
				} );
				return result;
			};

			widget.ctor = Ctor;

			widget.extend = extendTemplate;

			widget.invoke = invokeTemplate;

			utilExtend.easyExtend( widget, statics );


			var destroyWidget = function() {
				this.each( function( ele ) {
					var data = utilData.get( ele, key );
					if ( data ) {
						data.destroy.call( data );
						$.removeData( ele, key );
					}
				} );
			};

			// add init function to $.prototype
			if ( !$.fn[ name ] ) {
				$.fn[ name ] = widget;
				$.fn[ $.util.camelCase( name, "destroy" ) ] = destroyWidget;
			}

			var initName = $.util.camelCase( name, nameSpace );

			$.fn[ initName ] = widget;

			$.fn[ $.util.camelCase( initName, "destroy" ) ] = destroyWidget;

			return widget;
		},
		hasWidget: function( item ) {
			return !!this.getAttrWidgets( item ).length;
		},
		is: function( widgetName, item ) {
			/// <summary>是否含某个widget实例</summary>
			/// <param name="item" type="$"></param>
			/// <param name="name" type="String">widget名字 如ui.navmenu</param>
			/// <returns type="Boolean" />
			var $item = $( item );
			if ( !$item.length ) {
				return false;
			}
			var widgetTag = $item.attr( prefix + "-widget" );
			return !typed.isNul( $item.attr( widgetName.replace( ".", "-" ) ) ) && !typed.isNul( widgetTag ) && widgetTag.indexOf( widgetName ) > -1;
		},
		get: function( name ) {
			/// <summary>获得某个widget</summary>
			/// <param name="name" type="String">widget名字</param>
			/// <returns type="Function" />
			var tName = name.split( "." ),
				tNameSpace = tName[ 0 ];
			tName = tName[ 1 ];
			return Widget[ tNameSpace ][ tName ];
		},
		findWidgets: function( parent ) {
			return query.find( "*[" + prefix + "-widget]", parent.parentNode || parent );
		},
		getAttrWidgets: function( ele ) {
			var value = attr.getAttr( ele, prefix + "-widget" ),
				attrNames = typed.isStr( value ) && value !== "" ? value.split( /;|,/ ) : [],
				ret = [],
				widgetName = "",
				i;
			for ( i = attrNames.length - 1; i >= 0; i-- ) {
				widgetName = attrNames[ i ];
				if ( widgetName ) {
					if ( widgetName.indexOf( "." ) < 0 ) {
						ret.push( "ui." + widgetName );
					} else {
						ret.push( widgetName );
					}
				}

			}

			return ret;
		},
		fetchCSS: function( path ) {
			if ( config.ui.autoFetchCss && config.app.development ) {
				src.link( {
					href: $.getPath( path, ".css" )
				} );
			}
		},
		_renderWidget: function( ele, funName ) {
			var widgetNames = Widget.getAttrWidgets( ele ),
				i, widgetName, key, widgetCtor, ret = [];

			for ( i = widgetNames.length - 1; i >= 0; i-- ) {
				widgetName = widgetNames[ i ];
				widgetCtor = Widget.get( widgetName );
				if ( widgetCtor && widgetCtor.prototype.initIgnore === true ) {
					continue;
				}

				ret.push( {
					widgetName: widgetName,
					index: ( widgetCtor && widgetCtor.prototype.initIndex ) || 0
				} );

			}

			var order;
			if ( funName === "destroy" ) {
				order = function( a, b ) {
					return b.index - a.index;
				};
			} else {
				order = function( a, b ) {
					return a.index - b.index;
				};
			}

			ret.sort( order );

			for ( i = ret.length - 1; i >= 0; i-- ) {
				widgetName = ret[ i ].widgetName.split( "." );
				key = $.util.camelCase( widgetName[ 1 ], widgetName[ 0 ] );
				if ( $.fn[ key ] ) {
					$( ele )[ key ]( funName || "" );
				}
			}

			return this;
		},
		triggerDetectToParent: function( target ) {
			var eventName = Widget.detectEventName;
			if ( target ) {
				$( target ).parents().each( function( ele ) {
					if ( Widget.hasWidget( ele ) ) {
						config.ui.debug && $.logger( "triggerDetectToParent", ele );
						$( ele ).trigger( eventName, ele, {
							type: eventName
						} );
					}
				} );
			}
		},
		initWidgets: function( target, callback ) {
			var eles = Widget.findWidgets( target );
			var widgetNames = getWidgetsName( eles );

			if ( widgetNames.length ) {
				require( widgetNames, function() {
					for ( var i = 0, len = eles.length; i < len; i++ ) {
						Widget._renderWidget( eles[ i ] );
					}
					Widget.triggerDetectToParent( target );
					if ( typed.isFun( callback ) ) callback();
				} );
			} else {
				if ( typed.isFun( callback ) ) callback();
			}
			return this;
		},
		destroyWidgets: function( target, callback ) {
			var eles = Widget.findWidgets( target ).reverse();
			var widgetNames = getWidgetsName( eles );

			if ( widgetNames.length ) {
				require( widgetNames, function() {
					for ( var i = 0, len = eles.length; i < len; i++ ) {
						Widget._renderWidget( eles[ i ], "destroy" );
					}
					Widget.triggerDetectToParent( target );
					if ( typed.isFun( callback ) ) callback();
				} );
			} else {
				if ( typed.isFun( callback ) ) callback();
			}
			return this;
		}
	} );

	$.fn.extend( {
		isWidget: function( widgetName ) {
			return Widget.is( widgetName, this[ 0 ] );
		},
		findWidgets: function( widgetName, selector ) {
			var widgetsEle = [],
				i = 0,
				ret = [],
				item,
				len;
			this.each( function( ele ) {
				widgetsEle = widgetsEle.concat( Widget.findWidgets( ele ) );
			} );

			widgetsEle = query.filter( selector || "*", widgetsEle );
			len = widgetsEle.length;
			for ( ; i < len; i++ ) {
				item = widgetsEle[ i ];
				if ( Widget.is( widgetName, item ) ) {
					ret.push( item );
				}
			}
			return $( ret );
		}
	} );

	// if ( !config.app.development && config.ui.autoFetchCss ) {
	// 	src.link( {
	// 		href: $.getPath( "ui/css/amdquery-widget", ".css" )
	// 	} );
	// }

	return Widget;
} );

/*=======================================================*/

/*===================main/class===========================*/
﻿aQuery.define( "main/class", [ "base/extend", "base/support" ], function( $, utilExtend, support, undefined ) {
	"use strict";
	/**
	 * @name replaceClass
	 * @private
	 * @method
	 * @param {Element} ele
	 * @param {String} oldClassName
	 * @param {String} newClassName
	 * @returns {this}
	 */
	function replaceClass( ele, oldClassName, newClassName ) {
		oldClassName && ( ele.className = ele.className.replace( oldClassName, newClassName ) );
		return this;
	};

	/**
	 * @pubilc
	 * @exports main/class
	 * @requires module:base/extend
	 * @requires module:base/support
	 * @borrows replaceClass as replaceClass
	 */
	var cls;

	if ( support.classList ) {
		cls = /** @lends module:main/class */ {
			/**
			 * @param {Element}
			 * @param {String}
			 * @returns {this}
			 */
			addClass: function( ele, className ) {
				className != "" && ele.classList.add( className );
				return this;
			},
			/**
			 * @param {Element}
			 * @param {String}
			 * @returns {Boolean}
			 */
			containsClass: function( ele, className ) {
				return ele.classList.contains( className );
			},
			/**
			 * @param {Element}
			 * @param {String}
			 * @returns {this}
			 */
			removeClass: function( ele, className ) {
				className != "" && ele.classList.remove( className );
				return this;
			},
			/**
			 * If className exists then remove, if className does not exists then add.
			 * @param {Element}
			 * @param {String}
			 * @returns {this}
			 */
			toggleClass: function( ele, className ) {
				className != "" && ele.classList.toggle( className );
				return this;
			},
			replaceClass: replaceClass,
			/**
			 * return class length.
			 * @param {Element}
			 * @returns {Number}
			 */
			classLength: function( ele ) {
				return ele.classList.length;
			},
			/**
			 * If className exists then remove, if className does not exists then add.
			 * @param {Element}
			 * @param {Number}
			 * @returns {String}
			 */
			getClassByIndex: function( ele, index ) {
				return ele.classList.item( index );
			}
		};
	} else {
		cls = {
			addClass: function( ele, className ) {
				if ( !cls.containsClass( ele, className ) ) {
					var str = " ";
					if ( ele.className.length == 0 ) str = "";
					ele.className += str + className;
				}

				return this;
			},
			containsClass: function( ele, className ) {
				var reg = new RegExp( "(\\s|^)" + className + "(\\s|$)" ),
					result = ele.className.match( reg );
				return !!( result && result[ 0 ] );
			},
			removeClass: function( ele, className ) {
				if ( cls.containsClass( ele, className ) ) {
					var reg = new RegExp( "(\\s|^)" + className + "(\\s|$)" );
					ele.className = ele.className.replace( reg, " " );
				}
				return this;
			},
			toggleClass: function( ele, className ) {
				cls.containsClass( ele, className ) ? cls.removeClass( ele, className ) : cls.addClass( ele, className );
				return this;
			},
			replaceClass: replaceClass,
			classLength: function( ele ) {
				return ( $.util.trim( ele.className ).split( " " ) ).length;
			},
			getClassByIndex: function( ele, index ) {
				return ( $.util.trim( ele.className ).split( " " ) )[ index ] || null;
			}
		};
	}

	$.fn.extend( /** @lends aQuery.prototype */ {
		/**
		 * @param {String}
		 * @returns {this}
		 */
		addClass: function( className ) {
			return this.each( function( ele ) {
				cls.addClass( ele, className );
			}, this );
		},
		/**
		 * @param {String}
		 * @returns {Boolean}
		 */
		containsClass: function( className ) {
			return cls.containsClass( this[ 0 ], className );
		},
		/**
		 * @param {String}
		 * @returns {this}
		 */
		removeClass: function( className ) {
			return this.each( function( ele ) {
				cls.removeClass( ele, className );
			} );
		},
		/**
		 * @param {String}
		 * @returns {this}
		 */
		toggleClass: function( className ) {
			return this.each( function( ele ) {
				cls.toggleClass( ele, className );
			} );
		},
		/**
		 * @param {String}
		 * @param {String}
		 * @returns {this}
		 */
		replaceClass: function( oldClassName, newClassName ) {
			return this.each( function( ele ) {
				cls.replaceClass( ele, oldClassName, newClassName );
			} );
		},
		/**
		 * @returns {Number}
		 */
		classLength: function() {
			return cls.classLength( this[ 0 ] );
		},
		/**
		 * @param {Number}
		 * @returns {String}
		 */
		getClassByIndex: function( index ) {
			return cls.getClassByIndex( this[ 0 ], index );
		}
	} );

	return cls;
} );

/*=======================================================*/

/*===================main/css===========================*/
aQuery.define( "main/css", [ "base/typed", "base/extend", "base/array", "base/support", "base/client", "main/data", "main/query" ], function( $, typed, utilExtend, utilArray, support, client, utilData, query, undefined ) {
	"use strict";
	this.describe( "consult JQuery1.9.1" );
	var rnumnonpx = /^-?(?:\d*\.)?\d+(?!px)[^\d\s]+$/i,
		rmargin = /^margin/,
		rposition = /^(top|right|bottom|left)$/,
		rrelNum = new RegExp( "^([+-])=(" + $.core_pnum + ")", "i" ),
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

	var css = {
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
			name = $.cssProps[ originName ] || ( $.cssProps[ originName ] = css.vendorPropName( style, originName ) );

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
			return css.styleTable( ele )[ $.util.camelCase( type, head ) ];
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

		contains: query.contains,

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
		getStyles: getStyles,


		hide: function( ele, visible ) {
			/// <summary>隐藏元素</summary>
			/// <param name="ele" type="Element">element元素</param>
			/// <param name="visible" type="Boolean">true:隐藏后任然占据文档流中</param>
			/// <returns type="self" />
			if ( visible ) {
				ele.style.visibility = "hidden";
			} else {
				ele.style.dispaly && utilData.set( ele, "_visible_display", ele.style.dispaly );
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

		setOpacity: function( ele, alpha ) {
			/// <summary>改变ele的透明度
			/// </summary>
			/// <param name="ele" type="Element">element元素</param>
			/// <param name="alpha" type="Number">0-1</param>
			/// <returns type="self" />
			alpha = $.between( 0, 1, alpha );
			if ( support.opacity ) ele.style.opacity = alpha;
			else ele.style.filter = "Alpha(opacity=" + ( alpha * 100 ) + ")"; //progid:DXImageTransform.Microsoft.
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
				v = utilData.get( ele, "_visible_display" );
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
		swap: function( ele, options, callback, args ) {
			var ret, name,
				old = {},
				style = ele.style;

			// Remember the old values, and insert the new ones

			for ( name in options ) {
				old[ name ] = style[ name ];
				style[ name ] = options[ name ];
			}

			ret = callback.apply( ele, args || [] );

			// Revert the old values
			utilExtend.easyExtend( style, old );

			return ret;
		}
	};

	$.fn.extend( {
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
		styleTable: function() {
			/// <summary>返回第一个元素样式表</summary>
			/// <returns type="Object" />
			return $.styleTable( this[ 0 ] );
		},

		antonymVisible: function( a ) {
			/// <summary>添加兼容滚轮事件</summary>
			/// <param name="a" type="Boolean">如果隐藏，隐藏的种类，true表示任然占据文档流</param>
			/// <returns type="self" />
			if ( this.isVisible() ) this.hide( a );
			else this.show();
			return this;
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
		isVisible: function() {
			/// <summary>返回元素是否可见</summary>
			/// <returns type="Boolean" />
			//            if (this.css("visibility") == "hidden")
			//                return false;
			//            if (this.css("d") == "none")
			//                return false;
			// return true;
			return $.isVisible( this[ 0 ] );
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

		show: function() {
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
		}

	} );

	var cssHooks = {
		"opacity": {
			"get": css.getOpacity,
			"set": function( ele, name, value ) {
				css.setOpacity( ele, value );
			}
		}
	};

	if ( !support.reliableMarginRight ) {
		cssHooks.marginRight = {
			get: function( elem ) {
				// WebKit Bug 13343 - getComputedStyle returns wrong value for margin-right
				// Work around by temporarily setting element display to inline-block
				return css.swap( elem, {
						"display": "inline-block"
					},
					curCSS, [ elem, "marginRight" ] );
			}
		};
	}

	css.cssHooks = cssHooks;

	$.extend( css );

	// do not extend $
	css.vendorPropName = function( style, name ) {
		return name;
	};

	$.interfaces.achieve( "constructorCSS", function( type, dollar, cssObj, ele ) {
		cssObj && dollar.css( cssObj );
	} );

	return css;
} );

/*=======================================================*/

/*===================main/position===========================*/
aQuery.define( "main/position", [ "base/typed", "base/extend", "base/support", "base/client", "main/css" ], function( $, typed, utilExtend, support, client, css, undefined ) {
	"use strict";
	this.describe( "consult JQuery1.9.1" );
	var rnumnonpx = /^-?(?:\d*\.)?\d+(?!px)[^\d\s]+$/i,
		rnumsplit = new RegExp( "^(" + $.core_pnum + ")(.*)$", "i" ),
		cssExpand = [ "Top", "Right", "Bottom", "Left" ],
		rdisplayswap = /^(none|table(?!-c[ea]).+)/,
		cssShow = {
			position: "absolute",
			visibility: "hidden",
			display: "block"
		};

	var getStyles = css.getStyles;

	var curCSS = css.curCss;

	function getWidthOrHeight( ele, name, extra ) {
		var valueIsBorderBox = true,
			val = name === "width" ? ele.offsetWidth : ele.offsetHeight,
			styles = getStyles( ele ),
			isBorderBox = support.boxSizing && css.css( ele, "boxSizing", undefined, styles, false ) === "border-box";

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
				val += css.css( elem, extra + cssExpand[ i ], undefined, styles, true );
			}

			if ( isBorderBox ) {
				// border-box includes padding, so remove it if we want content
				if ( extra === "content" ) {
					val -= css.css( elem, "padding" + cssExpand[ i ], undefined, styles, true );
				}

				// at this point, extra isn't border nor margin, so remove border
				if ( extra !== "margin" ) {
					val -= css.css( elem, "border" + cssExpand[ i ] + "Width", undefined, styles, true );
				}
			} else {
				// at this point, extra isn't content, so add padding
				val += css.css( elem, "padding" + cssExpand[ i ], undefined, styles, true );

				// at this point, extra isn't content nor padding, so add border
				if ( extra !== "padding" ) {
					val += css.css( elem, "border" + cssExpand[ i ] + "Width", undefined, styles, true );
				}
			}
		}

		return val;
	}

	function getSize( ele, name, extra ) {
		extra = extra || "content";
		return ele.offsetWidth === 0 && rdisplayswap.test( css.css( ele, "display" ) ) ?
			$.swap( ele, cssShow, function() {
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
				support.boxSizing && css.css( ele, "boxSizing", undefined, style, false ) === "border-box",
				style ) : 0 );
	}

	var position = {
		getPageSize: function() {
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
		},

		getHeight: function( ele ) {
			/// <summary>获得元素的高度
			/// </summary>
			//  <param name="ele" type="Element">element元素</param>
			/// <returns type="Number" />
			return position.getWidth( ele, "height" );
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
			return css.css( ele, name );
		},

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

		setHeight: function( ele, value ) {
			/// <summary>设置元素的高度
			/// </summary>
			/// <param name="ele" type="Element">element元素</param>
			/// <param name="value" type="Number/String">值</param>
			/// <returns type="self" />
			return $.setWidth( ele, value, "height" );
		},
		setWidth: function( ele, value ) {
			/// <summary>设置元素的宽度
			/// </summary>
			/// <param name="ele" type="Element">element元素</param>
			/// <param name="value" type="Number/String">值</param>
			/// <returns type="self" />
			var name = arguments[ 2 ] ? "height" : "width";

			css.css( ele, name, value );

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
		}
	};

	$.extend( position );

	$.fn.extend( {
		width: function( width ) {
			/// <summary>返回或设置第一个元素的宽度
			/// </summary>
			/// <param name="width" type="Number/String">宽度</param>
			/// <returns type="Number" />
			return typed.isNul( width ) ? parseFloat( $.getWidth( this[ 0 ] ) ) : this.each( function( ele ) {
				$.setWidth( ele, width );
			} );
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

		getLeft: function() {
			/// <summary>获得第一个元素离左边框的总长度
			/// <para>left:相对于父级</para>
			/// </summary>
			/// <returns type="Number" />
			return $.getLeft( this[ 0 ] );
		},
		getTop: function() {
			/// <summary>获得第一个元素离上边框的总长度
			/// <para>left:相对于父级</para>
			/// </summary>
			/// <returns type="Number" />
			return $.getTop( this[ 0 ] );
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

		scrollHeight: function() {
			/// <summary>返回第一个元素的高度
			/// <para>Height:相对于整个大小</para>
			/// </summary>
			/// <returns type="Number" />
			var height = this.height();
			return css.swap( this[ 0 ], {
				"overflow": "scroll"
			}, function() {
				return Math.max( height, this.scrollHeight || 0 );
			} );
		},
		scrollWidth: function() {
			/// <summary>返回第一个元素的宽度
			/// <para>Width:相对于整个大小</para>
			/// </summary>
			/// <returns type="Number" />
			var width = this.width();
			return css.swap( this[ 0 ], {
				"overflow": "scroll"
			}, function() {
				return Math.max( width, this.scrollWidth || 0 );
			} );
		}

	} );

	utilExtend.extend( true, css.cssHooks, {
		"width": {
			"get": getSize,
			"set": setSize
		},
		"height": {
			"get": getSize,
			"set": setSize
		}
	} );


	return position;
} );

/*=======================================================*/

/*===================main/dom===========================*/
﻿aQuery.define( "main/dom", [ "base/typed", "base/extend", "base/array", "base/support", "main/data", "main/event", "main/query" ], function( $, typed, utilExtend, utilArray, support, utilData, event, query, undefined ) {
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
				$.removeChild( ele, ele.childNodes[ i ] );
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
						$.removeData( child );
						$.remove( child );
					}
					//移除事件
				} );
				$.setHtml( ele, str, bool );
			} )

			: $.getHtml( this[ 0 ] );
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
		removeChildren: function() {
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
						$.clearHandlers( ele );
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
							$.clearHandlers( ele1 );
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

	$.extend( dom );

	$.interfaces.achieve( "constructorDom", function( type, dollar, cssObj, ele, parentNode ) {
		parentNode && ( typed.isEle( parentNode ) || typed.is$( parentNode ) ) && dollar.appendTo( parentNode );
	} );

	return dom;
} );

/*=======================================================*/

/*===================animation/FX===========================*/
﻿aQuery.define( "animation/FX", [ "base/typed", "base/array", "main/css", "main/object" ], function( $, typed, array, css, object, undefined ) {
	"use strict";
	var rfxnum = /^([+-]=)?([\d+-.]+)(.*)$/;

	var FX = object.extend( "FX", {
		start: function() {

			FX.timers.push( this );
			this.startTime = $.now();

			FX.tick();
		},
		init: function( ele, options, value, name ) {
			this.ele = ele;
			this.options = options;
			this.easing = options.easing;
			this.delay = options.delay || 0;
			this.duration = options.duration;
			this.name = name;
			//this.isComplete = isComplete == undefined ? 1 : isComplete;
			var ret = this.getStartEnd( value );
			this.from = ret.start;
			this.end = ret.end;
			this.unit = ret.unit;
			this.percent = 0;
			options.isStart && this.start();

			return this;
		},
		cur: function() {
			return FX.cur( this.ele, this.name );
		},
		constructor: FX,

		getPercent: function() {
			return parseInt( ( this.percent || 0 ) * 100 ) / 100;
		},
		getStartEnd: function( val ) {
			return FX.getStartEnd.call( this, val, this.ele, this.name );
		},

		specialUnit: function( start, end, unit ) {
			return FX.specialUnit( start, end, unit, this.ele, this.name );
		},
		step: function( goToEnd ) {
			var pauseTime;
			if ( !typed.isBol( goToEnd ) ) {
				pauseTime = goToEnd || 0;
			}
			var t = $.now() - pauseTime,
				opt = this.options;

			if ( goToEnd === true || t > this.startTime + this.delay + this.duration || this.end === this.from ) {
				//this.tick = opt.duration;
				this.nowPos = this.end;
				//opt.curCount -= 1;
				this.update();
				if ( --opt.curCount <= 0 ) {
					if ( this.options.display != null ) {
						// Reset the overflow
						this.ele.style.overflow = opt.overflow;

						this.ele.style.display = opt.display;

						if ( this.ele.display === "none" ) {
							this.ele.style.display = "block";
						}
					}
					FX.invokeCompelete( opt.complete, this.ele, opt );
				}
				this.stop();
			} else {
				var n = t - this.startTime,
					pos;
				if ( n > this.delay ) {
					pos = this.easing( n - this.delay, 0, 1, this.duration );
					this.percent = pos;
					this.nowPos = this.from + ( ( this.end - this.from ) * pos );
					this.update();
				}
			}
		},
		stop: function() {
			var index = array.inArray( FX.timers, this );
			index > -1 && FX.timers.splice( index, 1 );
		},

		update: function( nowPos ) {
			nowPos = nowPos == undefined ? this.nowPos.toFixed( 2 ) : nowPos;
			css.css( this.ele, this.name, nowPos + this.unit );
		},

		isInDelay: function() {
			return new Date() - this.startTime < this.delay;
		}
	}, {
		invokeCompelete: function( completes, context, opt ) {
			for ( var i = completes.length - 1; i >= 0; i-- ) {
				completes[ i ].call( context, opt );
			}
		},
		fast: 200,
		slow: 600,
		normal: 400,
		speeds: function( type ) {
			switch ( type ) {
				case "slow":
					return FX.slow;
				case "fast":
					return FX.fast;
				default:
				case "normal":
					return FX.normal;
			}
		},

		hooks: {},

		cur: function( ele, name ) {
			//var ele = this.ele;

			if ( ele[ name ] != null && ( !ele.style || ele.style[ name ] == null ) ) {
				return ele[ name ];
			}
			var r;
			r = parseFloat( css.css( ele, name ) );
			r = r !== undefined && r > -10000 ? r : parseFloat( css.curCss( ele, name ) ) || 0;
			return r !== "auto" ? r : 0;
		},

		getDelay: function( d ) {
			if ( typed.isStr( d ) ) {
				d = FX.speeds( d );
			} else if ( typed.isNul( d ) || !typed.isNum( d ) ) {
				d = 0;
			}
			return d;
		},
		getDuration: function( d ) {
			if ( typed.isNul( d ) || !typed.isNum( d ) ) {
				d = FX.speeds( d );
			}
			return d;
		},
		getStartEnd: function( val, ele, name ) {
			var parts = rfxnum.exec( val ),
				start = this.cur( ele, name ),
				end = val,
				unit = "";

			if ( parts ) {
				var end = parseFloat( parts[ 2 ] );
				unit = parts[ 3 ]; //|| "px"
				//this.unit = unit;

				if ( unit !== "" && unit !== "px" && unit !== "deg" ) {
					start = this.specialUnit( start, end, unit, ele, name );
				}

				if ( parts[ 1 ] ) {
					end = ( ( parts[ 1 ] === "-=" ? -1 : 1 ) * end ) + start;
				}
			}
			return {
				start: start,
				end: end,
				unit: unit
			};
		},

		specialUnit: function( start, end, unit, ele, name ) {
			ele.style[ name ] = ( end || 1 ) + unit; //?
			start = ( ( end || 1 ) / FX.cur( ele, name ) ) * start;
			ele.style[ name ] = start + unit;
			return start;
		},
		stop: function() {},

		timers: [],

		tick: function() {}
	} );

	return FX;
} );

/*=======================================================*/

/*===================module/Thread===========================*/
﻿aQuery.define( "module/Thread", [ "main/CustomEvent", "base/extend", "main/object" ], function( $, CustomEvent, utilExtend, object ) {
	"use strict";
	/// <summary>创造一个新进程
	/// <para>num obj.delay:延迟多少毫秒</para>
	/// <para>num obj.duration:持续多少毫米</para>
	/// <para>num obj.sleep:睡眠多少豪秒</para>
	/// <para>num obj.interval 如果interval存在 则fps无效 isAnimFram也无效
	/// <para>num obj.fps:每秒多少帧</para>
	/// <para>fun obj.fun:要执行的方法</para>
	/// <para>bol obj.isAnimFram:是否使用新动画函数，使用后将无法初始化fps</para>
	/// <para>可以调用addHandler方法添加事件</para>
	/// <para>事件类型:start、stop、delay、sleepStar,sleepStop</para>
	/// </summary>
	/// <param name="obj" type="Object">属性</param>
	/// <param name="paras" type="paras[]">作用域所用参数</param>
	/// <returns type="Thread" />

	var requestAnimFrame = window.requestAnimationFrame ||
		window.webkitRequestAnimationFrame ||
		window.mozRequestAnimationFrame ||
		window.oRequestAnimationFrame ||
		window.msRequestAnimationFrame ||
		function( complete ) {
			return setTimeout( complete, 13 ); //其实是1000/60
	},
		cancelRequestAnimFrame = window.cancelAnimationFrame ||
			window.webkitCancelRequestAnimationFrame ||
			window.mozCancelRequestAnimationFrame ||
			window.oCancelRequestAnimationFrame ||
			window.msCancelRequestAnimationFrame ||
			clearTimeout;

	var Thread = CustomEvent.extend( "Thread", {
		init: function( obj, paras ) {
			/// <summary>初始化参数 初始化参数会停止进程</summary>
			/// <param name="obj" type="Object">进程参数</param>
			/// <param name="paras" type="paras:[any]">计算参数</param>
			/// <returns type="self" />
			//this.stop();
			this._super();
			utilExtend.extend( this, Thread._defaultSetting, obj );
			this.id = this.id || $.now();
			this.args = $.util.argToArray( arguments, 1 );

			return this.setFps()
				.setDuration( this.duration );
		},
		create: function() {
			return this;
		},
		render: function() {
			return this;
		},

		start: function() {
			/// <summary>启动</summary>
			/// <returns type="self" />
			if ( this.runFlag == false ) {
				Thread.count += 1;
				this.runFlag = true;
				var self = this;
				if ( this.delay > 0 ) {
					self.status = "delay";
					self.trigger( "delay", self, {
						type: "delay"
					} );
				}
				setTimeout( function() {
					self.status = "start";
					self.trigger( "start", self, {
						type: "start"
					} );
					//self.pauseTime += self.delay;

					self.begin = $.now();
					self._interval.call( self );
				}, this.delay );
			}
			return this;
		},

		_interval: function() {
			/// <summary>私有</summary>
			var self = this,
				every = function() {
					if ( self.runFlag === false || ( self.tick >= self.duration && !self.forever ) ) {
						every = null;
						return self.stop();
					}
					if ( self.sleepFlag ) {
						self.sleep();
						return;
					}
					self.status = "run";

					self.tick = $.now() - self.begin - self.pauseTime;

					self.forever ? self._run.call( self, self.tick, self.fps ) : self._run.call( self, self.tick, self.duration );
					var power = self.power;
					self.timerId = power( every, self.fps );
				};

			every();
		},

		_run: function( step, duration ) {
			/// <summary>私有</summary>
			//if (this.sleepTime > 0) return;
			//this.status = "run";
			this._executor( step, duration );
		},

		resume: function() {
			/// <summary>唤醒进程</summary>
			/// <param name="time" type="Number">毫秒</param>
			/// <returns type="Thread" />
			if ( this.isSleep() ) {
				var n = $.now();
				this.pauseTime += n - ( this.sleepBeginTime || 0 );
				this.sleepStopTime = n;
				this.status = "run";
				this.sleepFlag = false;
				this.trigger( "sleepStop", this, {
					type: "sleepStop"
				} );
				this._interval();
			}
			return this;
		},

		stop: function() {
			/// <summary>停止进程</summary>
			/// <returns type="self" />
			if ( this.runFlag == true ) {
				this.tick = this.sleepTime = this.pauseTime = 0;
				this.sleepBeginTime = null;
				this.sleepId = null;
				this.begin = null;
				this.status = "stop";
				Thread.count -= 1;
				this.runFlag = false;
				var clear = this.clear;
				clear( this.timerId );
				this.trigger( "stop", this, {
					type: "stop"
				} );
			}
			return this;
		},

		_executor: function( a, b ) {
			/// <summary>内部</summary>
			this.fun.apply( this, [ a, b ].concat( this.args ) ) === false && this.stop();
		},

		isRun: function() {
			/// <summary>是否在运行</summary>
			/// <returns type="Boolean" />
			return this.runFlag;
		},
		isSleep: function() {
			/// <summary>是否在睡眠</summary>
			/// <returns type="Boolean" />
			return this.status == "sleep"; //(this.sleepFlag && this.sleepTime > 0);
		},

		getDely: function() {
			/// <summary>获得延迟启动时间</summary>
			/// <returns type="Number" />
			return this.dely;
		},
		setDely: function( delay ) {
			/// <summary>设置延迟启动时间</summary>
			/// <param name="time" type="Number">毫秒</param>
			/// <returns type="self" />
			this.delay = delay || this.delay || 0;
			return this;
		},

		setDuration: function( duration ) {
			/// <summary>设置持续时间</summary>
			/// <param name="time" type="Number">毫秒</param>
			/// <returns type="self" />
			var status = this.getStatus();
			this.stop();
			if ( duration == undefined || duration == NaN || ( typeof duration == "number" && duration > 0 ) ) {
				//this.duration = o.duration;
				this.forever = false;
			} else {
				this.duration = NaN;
				this.forever = true;
			}
			status == "run" && this.start();
			return this;
		},
		getDuration: function() {
			/// <summary>获得持续时间</summary>
			/// <para>NaN表示无限</para>
			/// <returns type="Number" />
			return this.duration;
		},
		setFps: function() {
			/// <summary>设置帧值</summary>
			/// <returns type="Number" />
			var status = this.getStatus();
			this.stop();

			if ( this.interval == null && this.isAnimFrame == true ) {
				this.power = requestAnimFrame;
				this.clear = cancelRequestAnimFrame;
				this.fps = Thread.fps;
			} else {
				this.power = setTimeout;
				this.clear = clearTimeout;
				this.fps = this.interval || ( 1000 / this.fps ) || Thread.fps;
			}

			this.fps = Math.round( this.fps );

			status == "run" && this.start();
			return this;
		},
		getFps: function() {
			/// <summary>获得帧值</summary>
			/// <returns type="Number" />
			return this.fps;
		},
		getPercent: function() {
			/// <summary>获得百分比进度</summary>
			/// <para>返回值是NaN时说明duration是0并且是永远运行的</para>
			/// <returns type="Number" />
			var percent = parseInt( this.tick / this.duration * 100 ) / 100;
			return percent != NaN ? Math.min( 1, percent ) : percent;
		},

		getStatus: function() {
			/// <summary>获得运行状态</summary>
			/// <para>"delay"</para>
			/// <para>"start"</para>
			/// <para>"sleep"</para>
			/// <para>"stop"</para>
			/// <para>"run"</para>
			/// <returns type="String" />
			return this.status;
		},
		getTick: function() {
			/// <summary>获得时值</summary>
			/// <returns type="Number" />
			return this.tick;
		},

		getPauseTime: function() {
			/// <summary>获得暂停的时间值</summary>
			/// <returns type="Number" />
			return this.pauseTime;
		},
		setSleepTime: function( sleepTime ) {
			/// <summary>设置睡眠时间</summary>
			/// <param name="sleepTime" type="Number">毫秒</param>
			/// <returns type="self" />
			if ( sleepTime ) {
				this.sleepTime = sleepTime;
				this.sleepFlag = true;
			}
			return this;
		},
		getSleepTime: function( isCount ) {
			/// <summary>获得当前睡眠时间值</summary>
			/// <returns type="Number" />
			return this.sleepTime;
		},
		sleep: function( sleeTime ) {
			/// <summary>设置睡眠时间 只有在非睡眠时间有用</summary>
			/// <param name="sleepTime" type="Number">毫秒</param>
			/// <param name="time" type="Number">毫秒</param>
			/// <returns type="self" />
			var status = this.getStatus();
			if ( sleeTime ) {
				return this.setSleepTime( sleeTime );
			}
			if ( this.sleepTime == 0 ) {
				return this;
			}
			this.status = "sleep";
			this.trigger( "sleepBegin", self, {
				type: "sleepBegin"
			} );
			var self = this;
			clearTimeout( this.sleepId );
			this.sleepBeginTime = $.now();
			self.sleepId = setTimeout( function() {
				self.sleepId && self.resume();
			}, self.sleepTime );

			return this;
		}
	}, {
		cancelRequestAnimFrame: cancelRequestAnimFrame,
		count: 0,

		fps: 13,

		requestAnimFrame: requestAnimFrame,

		_defaultSetting: {
			runFlag: false,
			forever: false,
			sleepFlag: false,
			power: setTimeout,
			clear: clearTimeout,
			status: "stop",
			args: [],
			tick: 0,
			sleepTime: 0,
			pauseTime: 0,
			sleepId: null,
			begin: null,
			timerId: null,
			fun: function() {},
			interval: null,
			isAnimFrame: true,
			duration: NaN,
			id: ""
		}
	} );

	object.createPropertyGetterSetter( Thread, {
		args: "-pu -r -w",
		timeId: "-pa -r",
		sleepId: "-pa -r",
		interval: "-pu -r",
		isAnimFrame: "-pu -r",
		id: "-pu -r"
	} );

	return Thread;
} );

/*=======================================================*/

/*===================animation/tween===========================*/
﻿aQuery.define( "animation/tween", [ "base/typed" ], function( $, typed, undefined ) {
	"use strict";
	var math = Math,
		// pi = math.PI,
		pow = math.pow,
		// sin = math.sin,
		sqrt = math.sqrt,
		abs = math.abs,
		cos = math.cos,
		tween = {
			getFun: function( name ) {
				var fun;
				if ( typed.isFun( name ) ) {
					fun = name;
				} else if ( typed.isStr( name ) ) {
					name = name.split( "." );
					fun = this;
					$.each( name, function( str ) {
						if ( fun ) {
							fun = fun[ str ];
						} else {
							fun = null;
							return false;
						}
					}, this );
				}
				return fun || this.linear;
			},
			linear: function( t, b, c, d ) {
				return t / d;
			},
			swing: function( t, b, c, d ) {
				return 0.5 - cos( t / d * math.PI ) / 2;
			},
			ease: function( t, b, c, d ) {
				t /= d;
				var q = 0.07813 - t / 2,
					Q = sqrt( 0.0066 + q * q ),
					x = Q - q,
					X = pow( abs( x ), 1 / 3 ) * ( x < 0 ? -1 : 1 ),
					y = -Q - q,
					Y = pow( abs( y ), 1 / 3 ) * ( y < 0 ? -1 : 1 );
				t = X + Y + 0.25;
				return pow( 1 - t, 2 ) * 3 * t * 0.1 + ( 1 - t ) * 3 * t * t + t * t * t;
			},
			easeIn: function( t, b, c, d ) {
				return pow( t / d, 1.7 );
			},
			easeOut: function( t, b, c, d ) {
				return pow( t / d, 0.48 );
			},
			easeInOut: function( t, b, c, d ) {
				t /= d;
				var q = 0.48 - t / 1.04,
					Q = sqrt( 0.1734 + q * q ),
					x = Q - q,
					X = pow( abs( x ), 1 / 3 ) * ( x < 0 ? -1 : 1 ),
					y = -Q - q,
					Y = pow( abs( y ), 1 / 3 ) * ( y < 0 ? -1 : 1 );
				t = X + Y + 0.5;
				return ( 1 - t ) * 3 * t * t + t * t * t;
			},
			cubicBezier: function( t, b, c, d, x1, y1, x2, y2 ) { /*include Ext.js*/
				x1 = $.between( 0, 1, x1 || 0 );
				y1 = $.between( 0, 1, y1 || 0 );
				x2 = $.between( 0, 1, x2 || 1 );
				y2 = $.between( 0, 1, y2 || 10 );
				var time = t / d;
				var cx = 3 * x1,
					bx = 3 * ( x2 - x1 ) - cx,
					ax = 1 - cx - bx,
					cy = 3 * y1,
					by = 3 * ( y2 - y1 ) - cy,
					ay = 1 - cy - by;

				function sampleCurveX( t ) {
					return ( ( ax * t + bx ) * t + cx ) * t;
				}

				function solve( x, epsilon ) {
					var t = solveCurveX( x, epsilon );
					return ( ( ay * t + by ) * t + cy ) * t;
				}

				function solveCurveX( x, epsilon ) {
					var t0, t1, t2, x2, d2, i;
					for ( t2 = x, i = 0; i < 8; i++ ) {
						x2 = sampleCurveX( t2 ) - x;
						if ( Math.abs( x2 ) < epsilon ) {
							return t2;
						}
						d2 = ( 3 * ax * t2 + 2 * bx ) * t2 + cx;
						if ( Math.abs( d2 ) < 1e-6 ) {
							break;
						}
						t2 = t2 - x2 / d2;
					}
					t0 = 0;
					t1 = 1;
					t2 = x;
					if ( t2 < t0 ) {
						return t0;
					}
					if ( t2 > t1 ) {
						return t1;
					}
					while ( t0 < t1 ) {
						x2 = sampleCurveX( t2 );
						if ( Math.abs( x2 - x ) < epsilon ) {
							return t2;
						}
						if ( x > x2 ) {
							t0 = t2;
						} else {
							t1 = t2;
						}
						t2 = ( t1 - t0 ) / 2 + t0;
					}
					return t2;
				}

				return solve( time, 1 / ( 200 * d ) );

			}
		};

	$.tween = tween;

	return tween;

} );

/*=======================================================*/

/*===================animation/animate===========================*/
﻿aQuery.define( "animation/animate", [ "base/typed", "base/extend", "base/queue", "main/data", "animation/FX", "module/Thread", "animation/tween" ], function( $, typed, utilExtend, Queue, utilData, FX, Thread, tween, undefined ) {
	"use strict";
	FX.tick = function() {
		if ( thread.getStatus() === "run" ) return;
		thread.start();
	};

	FX.stop = function() {
		//        clearInterval(timerId);
		//        timerId = null
		thread.stop();
	};

	var originComplete = function() {
		$( this ).dequeue(); // this is ele
	};

	var timers = FX.timers,
		thread = new Thread( {
			isAnimFrame: true, //will be use AnimFrame

			duration: 0, //will be go forever

			fun: function() {
				for ( var i = 0, c; c = timers[ i++ ]; ) {
					c.step( thread.pauseTime );
				}

				if ( !timers.length ) {
					FX.stop();
				}
			}
		} ),
		animate = function( ele, property, option ) {
			var opt = {}, p, isElement = typed.isEle( ele ),
				hidden = isElement && $( ele ).isVisible(),
				//self = ele,
				count = 0,
				defaultEasing = option.easing;

			utilExtend.easyExtend( opt, option );

			for ( p in property ) {
				var name = $.util.camelCase( p );
				if ( p !== name ) {
					property[ name ] = property[ p ];
					//把值复制给$.util.camelCase转化后的属性
					delete property[ p ];
					//删除已经无用的属性
					p = name;
				}
				if ( property[ p ] === "hide" && hidden || property[ p ] === "show" && !hidden ) {
					return opt.complete.call( ele );
				}

				if ( ( p === "height" || p === "width" ) && ele.style ) {
					opt.display = ele.style.display; //$.css(ele, "display");

					opt.overflow = ele.style.overflow;

					ele.style.display = "block"; //是否对呢？
				}

				count++;
			}

			if ( opt.overflow != null ) {
				ele.style.overflow = "hidden";
			}

			opt.curAnim = utilExtend.extend( {}, property );
			opt.curCount = count;
			opt.isStart = 1;

			$.each( property, function( value, key ) {
				opt.easing = opt.specialEasing && opt.specialEasing[ key ] ? $.getAnimationEasing( opt.specialEasing[ key ] ) : defaultEasing;
				if ( typed.isFun( FX.hooks[ key ] ) ) {
					return FX.hooks[ key ]( ele, opt, value, key );
				}
				new FX( ele, opt, value, key );
			} );

			return true;
		};
	thread.stop = function() {
		$.each( timers, function( item ) {
			if ( item ) {
				item.stop();
				$( item.ele ).dequeue();
			}
		} );

		Thread.prototype.stop.call( this );
	};

	$.extend( {
		animate: function( ele, property, option ) {
			/// <summary>给所有元素添加一个动画
			/// <para>obj property:{ width: "50em", top: "+=500px" }</para>
			/// <para>需要插件{transform3d: { translateX: "+=100px", translateY: "+=100px"}}</para>
			/// <para>obj option</para>
			/// <para>num/str option.duration:持续时间 也可输入"slow","fast","normal"</para>
			/// <para>fun option.complete:结束时要执行的方法</para>
			/// <para>str/fun option.easing:tween函数的路径:"quad.easeIn"或者直接的方法</para>
			/// <para>默认只有linear。需要其他的函数，需要添加插件。或者添加方法到$.tween</para>
			/// <para>bol option.queue:是否进入队列，默认是true。不进入队列将立即执行</para>
			/// </summary>
			/// <param name="ele" type="Element">dom元素</param>
			/// <param name="property" type="Object">样式属性</param>
			/// <param name="option" type="Object">参数</param>
			/// <returns type="self" />
			option = $._getAnimateOpt( option );

			if ( typed.isEmptyObj( property ) ) {
				return option.complete( ele );
			} else {
				if ( option.queue === false ) {
					animate( ele, property, option );
				} else {
					$.queue( ele, "fx", function() {
						animate( ele, property, option );
						$.dequeue( ele, [ ele ] );
						property = option = null;
					} );
					//                    var queue = $.queue(ele, "fx", function (ele, dequeue) {
					//                        animate(ele, property, option);
					//                        dequeue();
					//                        property = option = null;
					//                    });

					//                    if (queue[0] !== "inprogress") {
					//                        $.dequeue(ele, "fx");
					//                    }
				}
			}
			return this;
		},
		stopAnimation: function( ele, isDequeue ) {
			/// <summary>停止当前元素当前动画</summary>
			/// <returns type="self" />
			for ( var timers = FX.timers, i = timers.length - 1; i >= 0; i-- ) {
				if ( timers[ i ].ele === ele ) {
					timers.splice( i, 1 );
				}
			}
			isDequeue && $.dequeue( ele );
			return this;
		},

		animationPower: thread,

		clearQueue: function( ele, type ) {
			return $.queue( ele, type || "fx", [] );
		},

		dequeue: function( ele, type ) {
			//quote from jQuery-1.4.1
			type = type || "fx";
			var q = $.queue( ele, type );

			return q.dequeue( ele, [ ele ] );

		},

		_originComplete: originComplete,

		_getAnimateOpt: function( opt ) {
			opt = opt || {};
			var duration = FX.getDuration( opt.duration ),
				delay = FX.getDelay( opt.delay ),
				ret,
				tCompelete;
			if ( typed.isArr( opt.complete ) ) {
				tCompelete = opt.complete;
				if ( tCompelete[ 0 ] !== originComplete ) {
					tCompelete.splice( 0, 0, originComplete );
				}
			} else if ( typed.isFun( opt.complete ) ) {
				tCompelete = [ opt.complete, originComplete ];
			} else {
				tCompelete = [ originComplete ];
			}
			ret = {
				delay: delay,
				duration: duration,
				easing: $.getAnimationEasing( opt.easing, opt.para ),
				specialEasing: opt.specialEasing,
				complete: tCompelete,
				queue: opt.queue === false ? false : true
			};
			return ret;
		},
		getAnimationEasing: function( easing, para ) {
			var ret = tween.getFun( easing );
			if ( para && para.length ) {
				return function( t, b, c, d ) {
					ret.apply( tween, [ t, b, c, d ].concat( para ) );
				};
			}
			return ret;

		},

		queue: function( ele, type, fn ) {
			//quote from jQuery-1.4.1
			if ( !ele ) {
				return;
			}

			type = ( type || "fx" ) + "queue";
			var q = utilData.get( ele, type );

			if ( !q ) {
				q = new Queue()
				utilData.set( ele, type, q );
			}

			return q.queue( fn, ele, [ ele ] );
			//return q;
		}

		//, timers: timers
	} );
	$.fn.extend( {
		animate: function( property, option ) {
			/// <summary>给所有元素添加一个动画
			/// <para>obj property:{ width: "50em", top: "+=500px" }</para>
			/// <para>需要插件{transform3d: { translateX: "+=100px", translateY: "+=100px"}}</para>
			/// <para>obj option</para>
			/// <para>num/str option.duration:持续时间 也可输入"slow","fast","normal"</para>
			/// <para>fun option.complete:结束时要执行的方法</para>
			/// <para>str/fun option.easing:tween函数的路径:"quad.easeIn"或者直接的方法</para>
			/// <para>默认只有linear。需要其他的函数，需要添加插件。或者添加方法到$.tween</para>
			/// <para>bol option.queue:是否进入队列，默认是true。不进入队列将立即执行</para>
			/// </summary>
			/// <param name="property" type="Object">样式属性</param>
			/// <param name="option" type="Object">参数</param>
			/// <returns type="self" />
			option = $._getAnimateOpt( option );

			if ( typed.isEmptyObj( property ) ) {
				return this.each( option.complete );
			} else {
				return this[ option.queue === false ? "each" : "queue" ]( function( ele ) {
					animate( ele, property, option );
				} );
			}
			//return this; //提供注释
		},
		stopAnimation: function( isDequeue ) {
			/// <summary>停止当前元素当前动画</summary>
			/// <param name="isDequeue" type="Boolean">是否继续之后的动画</param>
			/// <returns type="self" />

			return this.each( function( ele ) {
				$.stopAnimation( ele, isDequeue );
			} );
		},

		dequeue: function( type ) {
			//quote from jQuery-1.4.1
			return this.each( function( ele ) {
				$.dequeue( ele, type );
			} );
		},

		queue: function( type, data ) {
			//quote from jQuery-1.4.1
			if ( !typed.isStr( type ) ) {
				data = type;
				type = "fx";
			}

			if ( data === undefined ) {
				return $.queue( this[ 0 ], type );
			}
			return this.each( function( ele ) {
				$.queue( ele, type, data );
				// var queue = $.queue( ele, type, data );

				//                if (type === "fx" && queue[0] !== "inprogress") {
				//                    $.dequeue(ele, type);
				//                }
			} );
		}
	} );

} );

/*=======================================================*/

/*===================html5/css3===========================*/
﻿aQuery.define( "html5/css3", [ "base/support", "base/extend", "base/typed", "base/client", "base/array", "main/css" ], function( $, support, utilExtend, typed, client, array, css2, undefined ) {
	"use strict";
  this.describe("HTML5 CSS3");
	var css3Head = ( function() {
		var head = "";
		if ( client.engine.ie )
			head = "ms";
		else if ( client.engine.webkit || client.system.mobile )
			head = "webkit";
		else if ( client.engine.gecko )
			head = "Moz";
		else if ( client.engine.opera )
			head = "O";
		return head;
	} )(),
		transformCssName = "",
		transitionCssName = "",
		hasCss3 = false,
		hasTransform = false,
		hasTransform3d = false,
		hasTransition = false,
		domStyle = document.documentElement.style,
		getCss3Support = function( type ) {
			return ( $.util.camelCase( type ) in domStyle || $.util.camelCase( type, css3Head ) in domStyle );
		},
		css3Support = ( function() {
			var result = {};

			result.css3 = hasCss3 = getCss3Support( "boxShadow" );

			if ( "transform" in domStyle ) {
				transformCssName = "transform";
			} else if ( ( css3Head + "Transform" ) in domStyle ) {
				transformCssName = css3Head + "Transform";
			}
			result.transform = hasTransform = !! transformCssName;

			if ( hasTransform ) {
				hasTransform3d = getCss3Support( "transformStyle" );
			}

			result.transform3d = hasTransform3d;

			result.animation = getCss3Support( "animationName" );

			if ( "transition" in domStyle ) {
				transitionCssName = "transition";
			} else if ( ( css3Head + "Transition" ) in domStyle ) {
				transitionCssName = css3Head + "Transition";
			}
			result.transition = hasTransition = !! transitionCssName;

			try {
				domStyle.background = "-" + css3Head + "-linear-gradient" + "(left, white, black)";
				result.gradientGrammar = domStyle.background.indexOf( "gradient" ) > -1;
				domStyle.background = "";
			} catch ( e ) {

			}

			return result;
		} )(),
		isFullCss = function( value ) {
			return value != "" && value !== "none" && value != null;
		};

	if ( hasTransform ) {
		var transformReg = {
			translate3d: /translate3d\([^\)]+\)/,
			translate: /translate\([^\)]+\)/,
			rotate: /rotate\([^\)]+\)/,
			rotateX: /rotateX\([^\)]+\)/,
			rotateY: /rotateY\([^\)]+\)/,
			rotateZ: /rotateZ\([^\)]+\)/,
			scale: /scale\([^\)]+\)/,
			scaleX: /scaleX\([^\)]+\)/,
			scaleY: /scaleY\([^\)]+\)/,
			skew: /skew\([^\)]+\)/
		},
			transform3dNameMap = {
				translateX: 1,
				translateY: 2,
				translateZ: 3,
				scaleX: 1,
				scaleY: 1

			},
			editScale = function( obj ) {
				var sx = obj.sx != undefined ? obj.sx : obj.scaleX || 1,
					sy = obj.sy != undefined ? obj.sy : obj.scaleY || 1;

				return [
					"scale(", Math.max( 0, sx ),
					",", Math.max( 0, sy ), ") "
					];
			},
			editTranslate3d = function( obj ) {
				return [ "translate3d(",
					obj.tx != undefined ? obj.tx + "px" : obj.translateX || 0, ", ",
					obj.ty != undefined ? obj.ty + "px" : obj.translateY || 0, ", ",
					obj.tz != undefined ? obj.tz + "px" : obj.translateZ || 0, ") " ]
			},
			editRotate3d = function( obj ) {
				return [ "rotateX(", obj.rx != undefined ? obj.rx + "deg" : obj.rotateX || 0, ") ",
					"rotateY(", obj.ry != undefined ? obj.ry + "deg" : obj.rotateY || 0, ") ",
					"rotateZ(", obj.rz != undefined ? obj.rz + "deg" : obj.rotateZ || 0, ") " ]
			},
			regTransform = /[^\d\w\.\-\+]+/,
			getTransformValue = function( transform, name ) {
				var result = [],
					transType = transform.match( transformReg[ name ] );
				if ( transType ) {
					result = transType[ 0 ].replace( ")", "" ).split( regTransform );
				}
				return result;
			},
			getTransformValues = function( transform ) {
				var result = [];
				transform = transform.split( ") " );
				$.each( transform, function( value ) {
					result.push( value.replace( ")", "" ).split( regTransform ) );
				} );
				return result;
			},
			editCss3Type = function( name ) {
				var temp, unit = "";
				switch ( name ) {
					case "transform":
						name = this.transform;
						break;
					case "transform3d":
						name = this.transform3d;
						break;
					case "transformOrigin":
						name = this.transformOrigin;
						break;
				}
				if ( ( temp = $.interfaces.trigger.call( this, "editCss3Type", name ) ) ) {
					name = temp.name;
					unit = temp.unit;
				}
				return {
					name: name,
					unit: unit
				};
			};
	}
	if ( hasTransition ) {
		var getTransitionValue = function( transition, name ) {
			var result = {}, temp, transType = transition.match( name + ".*," );
			if ( transType ) {
				temp = transType[ 0 ].replace( ",", "" ).split( " " );
				result.name = temp[ 0 ];
				result.duration = temp[ 1 ];
				result[ "function" ] = temp[ 2 ];
				result.delay && ( result.delay = temp[ 3 ] );
			}
			return result;
		},
			getTransitionValues = function( transition ) {
				var result = [],
					temp;
				$.each( transition.split( /,\s?/ ), function( transType ) {
					temp = transType.split( " " );
					temp = {
						name: temp[ 0 ],
						duration: temp[ 1 ],
						"function": temp[ 2 ]
					};
					temp.delay && ( temp.delay = temp[ 3 ] );
					result[ temp.name ] = temp;
					result.push( temp );
				} );
				return result;
			};
	}

	$.interfaces.handlers.editCss3Type = null;

	css2.vendorPropName = function( style, name ) {

		// shortcut for names that are not vendor prefixed
		if ( name in style ) {
			return name;
		}

		// check for vendor prefixed names
		var capName = name.charAt( 0 ).toUpperCase() + name.slice( 1 ),
			origName = name;
		name = css3Head + capName;
		if ( name in style ) {
			return name;
		}

		return origName;
	};

	var css3 = {
		transformCssName: transformCssName,
		transitionCssName: transitionCssName,
		getTransformStyleNameUnCamelCase: function() {
			var ret = $.util.unCamelCase( transformCssName );
			return transformCssName ?
				( ret.indexOf( "-" ) > -1 ? "-" + ret : ret ) :
				transformCssName;
		},
		getTransitionStyleNameUnCamelCase: function() {
			var ret = $.util.unCamelCase( transitionCssName );
			return transitionCssName ?
				( ret.indexOf( "-" ) > -1 ? "-" + ret : ret ) :
				transitionCssName;
		},
		addTransition: function( ele, style ) {
			/// <summary>添加transition属性
			/// <para>可以如下方式设置</para>
			/// <para>$.addTransition(ele, "background-color 1s linear")</para>
			/// <para>$.addTransition(ele, {name:"width"}) 为obj时可缺省duration,function</para>
			/// <para>$.addTransition(ele, [{name:"width",duration:"1s",function:"linear"}, {name:"height"])</para>
			/// <para>$.addTransition(ele, ["background-color 1s linear", "width 1s linear"])</para>
			/// </summary>
			/// <param name="ele" type="Element">元素</param>
			/// <param name="style" type="Array/Object/String">值得数组或值</param>
			/// <returns type="self" />
			return $.setTransition( ele, style, css2.css( ele, transitionCssName ) );
		},
		bindTransition: function( ele, style ) {
			/// <summary>添加transition属性并绑定事件
			/// <para>可以如下方式设置</para>
			/// <para>[{ name: "background-color", duration: "1s", "function": "linear"</para>
			/// <para>       , events: {</para>
			/// <para>           mouseover: "#ff0"</para>
			/// <para>           , mouseout: "#00f"</para>
			/// <para>       }</para>
			/// <para>       , toggle: ["#ff0", "#00f"]</para>
			/// <para>}]）</para>
			/// </summary>
			/// <param name="ele" type="Element">元素</param>
			/// <param name="style" type="Array/Object">值得数组或值</param>
			/// <returns type="self" />
			var eleObj = $( ele );
			if ( !typed.isArr( style ) ) {
				style = [ style ];
			}
			$.each( style, function( item ) {
				$.each( item.events, function( value, name ) {
					eleObj.addHandler( name, function() {
						css2.css( this, $.util.camelCase( item.name ), value );
					} );
				} );
				if ( item.toggle ) {
					var arr = [ ele ];
					$.each( item.toggle, function( value, index ) {
						arr.push( function() {
							css2.css( this, $.util.camelCase( item.name, item.head ), value );
						} );
					} );
					$.toggle.apply( this, arr );
				}
			} );
			return $.setTransition( ele, style, css2.css( ele, transitionCssName ) );
		},

		css3: function( ele, name, value ) {
			/// <summary>css3的操作，不需要加浏览器特殊头。如果可以，还是使用css和自己加头的方式，性能更高。
			/// <para>头可以如此获得$.css3Head</para>
			/// </summary>
			/// <param name="ele" type="Element">元素</param>
			/// <param name="name" type="String">样式名</param>
			/// <param name="value" type="String/Number/undefined">值</param>
			/// <returns type="self" />
			if ( hasCss3 ) {
				return css2.css( ele, $.util.camelCase( name, css3Head ), value );
			}
			return this;
		},
		css3Head: css3Head,
		css3Style: function( ele, name ) {
			/// <summary>返回样式表css3的属性，其实是默认加了个head</summary>
			/// <param name="ele" type="Element">元素</param>
			/// <param name="name" type="String">样式名</param>
			/// <returns type="self" />
			return css2.style( ele, name, css3Head );
		},

		getCss3Support: function( type ) {
			/// <summary>是否支持css3的某个特性</summary>
			/// <param name="type" type="String">元素</param>
			/// <returns type="Boolean" />
			return getCss3Support( type );
		},
		getTransform: function( ele, name ) {
			/// <summary>transform有顺序之别 获得transform样式
			/// <para>头可以如此获得$.css3Head</para>
			/// <para>[["translate", "50px", "50px"], ["rotate", "30deg"], ["skew", "30deg", "30deg"]]</para>
			/// <para>如果name存在[["translate", "50px", "50px"]]</para>
			/// <para>如果name不为空则Object只有name那个选项</para>
			/// <para>如果name不是transform的属性名 则返回{"notIn":null}</para>
			/// </summary>
			/// <param name="ele" type="Element">元素</param>
			/// <param name="name" type="String">样式名 缺省则返回所有的</param>
			/// <returns type="Array" />
			var result = [];
			if ( hasTransform ) {
				var transform = css2.css( ele, transformCssName ),
					temp, index = -1;
				if ( isFullCss( transform ) ) {
					if ( typed.isStr( name ) ) {
						temp = getTransformValue( transform, name );
						result.push( temp );
					} else {
						result = getTransformValues( transform );
					}
				}
			}
			return result;
		},
		getTransform3d: function( ele, toNumber ) {
			/// <summary>获得css3d
			/// <para>返回的 Object属性</para>
			/// <para>num obj.rotateX:x轴旋转</para>
			/// <para>num obj.rotateY:y轴旋转</para>
			/// <para>num obj.rotateZ:z轴旋转</para>
			/// <para>num obj.translateX:x轴位移</para>
			/// <para>num obj.translateY:y轴位移</para>
			/// <para>num obj.translateZ:z轴位移</para>
			/// <para>num obj.scaleX:缩放（范围0到1）</para>
			/// <para>num obj.scaleY:缩放（范围0到1）</para>
			/// </summary>
			/// <param name="ele" type="Element">元素</param>
			/// <param name="toNumber" type="Boolean">是否直接把返回的结果转为数字</param>
			/// <returns type="Object" />
			var obj = {};
			if ( hasTransform3d ) {
				obj = {
					rotateX: 0,
					rotateY: 0,
					rotateZ: 0,
					translateX: 0,
					translateY: 0,
					translateZ: 0,
					scaleX: 1,
					scaleY: 1
				};
				var transform = css2.css( ele, transformCssName ),
					result, i;
				if ( isFullCss( transform ) ) {
					result = getTransformValue( transform, "rotateX" );
					result.length && ( obj.rotateX = result[ 1 ] );
					result = getTransformValue( transform, "rotateY" );
					result.length && ( obj.rotateY = result[ 1 ] );
					result = getTransformValue( transform, "rotateZ" );
					result.length && ( obj.rotateZ = result[ 1 ] );
					result = getTransformValue( transform, "scale" );
					result.length && ( obj.scaleX = result[ 1 ] ) && ( obj.scaleY = result[ 2 ] );
					result = getTransformValue( transform, "translate3d" );
					if ( result.length ) {
						obj.translateX = result[ 1 ];
						obj.translateY = result[ 2 ];
						obj.translateZ = result[ 3 ];
					}

					if ( toNumber === true ) {
						for ( i in obj ) {
							obj[ i ] = parseFloat( obj[ i ] );
						}
					}
				}
			}

			return obj;
		},
		getTransform3dByName: function( ele, name, toNumber ) {
			/// <summary>获得css3d
			/// </summary>
			/// <param name="ele" type="Element">元素</param>
			/// <param name="name" type="String">属性名</param>
			/// <param name="toNumber" type="Boolean">是否直接把返回的结果转为数字</param>
			/// <returns type="Object" />
			var result = null,
				index;
			if ( hasTransform3d ) {
				var transform = css2.css( ele, transformCssName );

				if ( isFullCss( transform ) ) {
					switch ( name ) {
						case "translateX":
						case "translateY":
						case "translateZ":
							result = getTransformValue( transform, "translate3d" );
							index = transform3dNameMap[ name ];
							break;
						case "rotateX":
						case "rotateY":
						case "rotateZ":
							result = getTransformValue( transform, name );
							index = 1;
							break;
						case "scaleX":
						case "scaleY":
							result = getTransformValue( transform, "scale" );
							index = transform3dNameMap[ name ];
							break;
					}
				}
			}

			return result && result.length ? ( toNumber === true ? parseFloat( result[ index ] ) : result[ index ] ) : null;
		},
		getTransformOrigin: function( ele ) {
			/// <summary>返回元素的运动的基点(参照点)。返回值是百分比。
			/// <para>transform–origin(x,y)</para>
			/// <para>return {x:x,y:y}</para>
			/// <para>x也可指定字符值参数: left,center,right.</para>
			/// <para>y也可指定字符值参数: top,center,right.</para>
			/// <para>left == 0%,center == 50%,right == 100%</para>
			/// <para>top == 0%,center == 50%,right == 100%</para>
			/// </summary>
			/// <param name="ele" type="Element">元素</param>
			/// <returns type="Object" />
			var result = {};
			if ( hasTransform ) {
				var origin = ele.style[ transformCssName + "Origin" ];
				if ( origin ) {
					origin = origin.split( " " );
					result.x = origin[ 0 ];
					result.y = origin[ 1 ];
				}
			}
			return result;
		},
		getTransition: function( ele, name ) {
			/// <summary>获得transition样式
			/// <para>[{name:"width",duration:"1s",function:"leaner"},{name:"height",duration:"1s",function:"linear"}]</para>
			/// <para>如果name是transition包含的</para>
			/// <para>返回数组只有name那个选项[{name:"width",duration:"1s",function:"leaner"}]</para>
			/// <para>如果name不是transition包含的 则返回[{}]</para>
			/// <para>返回的result是数组，但是也可以使用result[name]得到确切的某个name</para>
			/// </summary>
			/// <param name="ele" type="Element">元素</param>
			/// <param name="name" type="String">transition包含的样式名 缺省则返回所有的</param>
			/// <returns type="Array" />
			var result = [];
			if ( hasTransform ) {
				var transition = css2.css( ele, transitionCssName ),
					temp, index = -1;
				if ( isFullCss( transition ) ) {
					if ( typed.isStr( name ) ) {
						temp = getTransitionValue( transition, name );

						result.push( temp );
						result[ name ] = temp;
					} else {
						result = getTransitionValues( transition );
					}
				}
			}
			return result;
		},

		initTransform3d: function( ele, perspective, perspectiveOrigin ) {
			/// <summary>初始化css3d这样它的子元素才能被set3d</summary>
			/// <param name="ele" type="Element">元素</param>
			/// <param name="perspective" type="Number">井深</param>
			/// <param name="perspectiveOrigin" type="String">视角；如:"50% 50%"</param>
			/// <returns type="self" />
			if ( hasTransform3d ) {
				var style = ele.style;
				style[ css3Head + "TransformStyle" ] = "preserve-3d";
				style[ css3Head + "Perspective" ] = perspective || 300;
				style[ css3Head + "PerspectiveOrigin" ] = perspectiveOrigin || "50% 50%";
			}
			return this;
		},

		linearGradient: function( ele, option ) {
			/// <summary>设置线性渐变
			/// <para>str option.orientation</para>
			/// <para>arr option.colorStops</para>
			/// <para>num option.colorStops[0].stop</para>
			/// <para>str option.colorStops[0].color</para>
			/// </summary>
			/// <param name="ele" type="Element">元素</param>
			/// <param name="obj" type="Object">参数</param>
			/// <returns type="self" />
			var str = [],
				type = "backgroundImage";
			if ( option.defaultColor ) {
				ele.style.background = option.defaultColor;
			}
			if ( css3Support.gradientGrammar ) {
				str.push( "-", css3Head, "-linear-gradient", "(" );
				str.push( option.orientation.normal || option.orientation );
				$.each( option.colorStops, function( value, index ) {
					str.push( ",", value.color );
				} );
			} else if ( client.browser.chrome > 10 || client.browser.safari >= 5.1 || client.system.mobile ) {
				str.push( "-webkit-gradient", "(linear," );
				str.push( option.orientation.webkit );
				$.each( option.colorStops, function( value, index ) {
					str.push( ",", "color-stop", "(", value.stop, ",", value.color, ")" );
				} );
			}
			//            else if (client.browser.firefox >= 3.63) {
			//                str.push("-moz-linear-gradient", "(");
			//                str.push(option.orientation.moz);
			//                $.each(option.colorStops, function (value, index) {
			//                    str.push(",", value.color);
			//                });
			//            }
			else if ( client.browser.ie == 10 ) {
				str.push( "-ms-linear-gradient", "(" );
				str.push( option.orientation.ms, "," );
				$.each( option.colorStops, function( value, index ) {
					str.push( ",", value.color, " ", value.stop * 100, "%" );
				} );
				str.push( ",turquoise" );
			} else if ( client.browser.ie == 9 ) {
				str.push( "progid:DXImageTransform.Microsoft.gradient", "(" );
				str.push( "startColorstr=", "'", option.colorStops[ 0 ].color, "'" );
				str.push( ",", "endColorstr=", "'", option.colorStops[ option.colorStops.length - 1 ].color, "'" );
				type = "filter";
			}
			//            else if (client.browser.opera >= 11.1) {
			//                str.push("-o-linear-gradient", "(");
			//                str.push(option.orientation.o);
			//                $.each(option.colorStops, function (value, index) {
			//                    str.push(",", value.color);
			//                });
			//            }
			str.push( ")" );
			ele.style[ type ] = str.join( "" );
			return this;
		},

		radialGradient: function( ele, option ) {
			/// <summary>设置径向渐变
			/// <para>str option.radial</para>
			/// <para>arr option.colorStops</para>
			/// <para>num option.colorStops[0].stop</para>
			/// <para>str option.colorStops[0].color</para>
			/// </summary>
			/// <param name="ele" type="Element">元素</param>
			/// <param name="obj" type="Object">参数</param>
			/// <returns type="self" />
			var str = [];
			if ( option.defaultColor ) {
				ele.style.background = option.defaultColor;
			}
			if ( css3Support.gradientGrammar ) {
				str.push( "-", css3Head, "-radial-gradient", "(" );
				str.push( option.radial.normal.x || option.radial.x, " ", option.radial.normal.y || option.radial.y );
				$.each( option.colorStops, function( value, index ) {
					str.push( ",", value.color, " ", value.stop * 100, "%" );
				} );
			} else if ( client.browser.chrome > 10 || client.browser.safari >= 5.1 || client.system.mobile ) {
				str.push( "-webkit-gradient", "(radial" );
				$.each( option.radial.webkit, function( value, index ) {
					str.push( ",", value.x, " ", value.y, ",", value.r );
				} );
				$.each( option.colorStops, function( value, index ) {
					str.push( ",", "color-stop", "(", value.stop, ",", value.color, ")" );
				} );
			} else if ( client.browser.ie == 10 ) {
				str.push( "-ms-linear-gradient", "(" );
				str.push( option.radial.ms.x, ",", "circle cover" );
				$.each( option.colorStops, function( value, index ) {
					str.push( ",", value.color, " ", value.stop * 100, "%" );
				} );
				str.push( ",turquoise" );
			} else if ( client.browser.opera >= 11.6 ) {
				str.push( "-o-radial-gradient", "(" );
				$.each( option.radial.o, function( value, index ) {
					str.push( value.x, " ", value.y, "," );
				} );
				var stop = option.colorStops,
					temp;
				temp = stop.splice( 0, 1 )[ 0 ];
				str.push( temp.color, " " );
				temp = stop.splice( stop.length - 1, 1 )[ 0 ];
				$.each( stop, function( value, index ) {
					str.push( ",", value.color, " ", value.stop * 100, "%" );
				} );
				str.push( ",", temp.color );
			}
			str.push( ")" );
			ele.style.backgroundImage = str.join( "" );
			return this;
		},
		removeTransition: function( ele, style ) {
			/// <summary>移除transition属性
			/// <para>可以如下方式设置</para>
			/// <para>$.removeTransition(ele, "background-color")</para>
			/// <para>$.removeTransition(ele, ["background-color", "width"])</para>
			/// <para>$.removeTransition(ele, {name:"background-color"})</para>
			/// <para>$.removeTransition(ele, [{name:"width"},"height"])</para>
			/// </summary>
			/// <param name="ele" type="Element">元素</param>
			/// <param name="style" type="String/Array/undefined">值得数组或值</param>
			/// <returns type="self" />
			var list, transition = css2.css( ele, transitionCssName ),
				match, n = arguments[ 2 ] || "";
			if ( style == undefined ) {
				transition = "";
			} else if ( typed.isStr( style ) ) {
				list = [ style ];
			} else if ( array.inArray( style ) ) {
				list = style;
			} else if ( typed.isObj( style ) ) {
				list = style.name && [ style.name ];
			}

			$.each( list, function( item ) {
				match = transition.match( ( item || item.name ) + ".+?(\\D,|[^,]$)" );
				if ( match ) {
					if ( n && match[ 1 ] && match[ 1 ].indexOf( "," ) > -1 ) {
						n += ",";
					}
					transition = transition.replace( match[ 0 ], n );
				}
			} );
			return css2.css( ele, transitionCssName, transition );
		},
		replaceTransition: function( ele, name, value ) {
			/// <summary>覆盖transition属性
			/// <para>可以如下方式设置</para>
			/// <para>$.replaceTransition(ele, "background-color","background-color 2s linear")</para>
			/// </summary>
			/// <param name="ele" type="Element">元素</param>
			/// <param name="style" type="String">值得数组或值</param>
			/// <param name="style" type="String">值得数组或值</param>
			/// <returns type="self" />
			return $.removeTransition( ele, name, value );
		},

		setRotate3d: function( ele, obj ) {
			/// <summary>设置所有元素的css3d旋转
			/// <para>num rx:x轴旋转 不带单位</para>
			/// <para>num ry:y轴旋转</para>
			/// <para>num rz:z轴旋转</para>
			/// <para>num rotateX:x轴旋转 带单位</para>
			/// <para>num rotateY:y轴旋转</para>
			/// <para>num rotateZ:z轴旋转</para>
			/// </summary>
			/// <param name="ele" type="Element">元素</param>
			/// <param name="obj" type="Object">参数</param>
			/// <returns type="self" />
			if ( !obj || !hasTransform3d ) return this;

			var origin = $.getTransform3d( ele ),
				temp = {
					rotateX: origin.rotateX,
					rotateY: origin.rotateY,
					rotateZ: origin.rotateZ
				};
			utilExtend.easyExtend( obj, temp );

			ele.style[ transformCssName ] = editRotate3d( obj ).join( "" );
		},
		setScale: function( ele, obj ) {
			/// <summary>设置css3d scale缩放 3d和普通都一样
			/// <para>num scale:缩放（范围0到1）</para>
			/// </summary>
			/// <param name="ele" type="Element">元素</param>
			/// <param name="obj" type="Object">参数</param>
			/// <returns type="self" />
			if ( !obj || !hasTransform3d ) return this;

			var origin = $.getTransform3d( ele ),
				temp = {
					scaleX: origin.scaleX,
					scaleY: origin.scaleY
				};
			utilExtend.easyExtend( obj, temp );

			css2.css( ele, transformCssName, editScale( obj ).join( "" ) );
			return this;
		},
		setTransform: function( ele, style ) {
			/// <summary>设置transform属性 transform有顺序之别
			/// <para>头可以如此获得$.css3Head</para>
			/// <para>数组形式为[["translate","30px","30px"],["skew","30px","30px"]]</para>
			/// </summary>
			/// <param name="ele" type="Element">元素</param>
			/// <param name="style" type="Array">样式名数组或样式名</param>
			/// <returns type="self" />
			if ( hasTransform && typed.isArr( style ) ) {
				var result = [];

				$.each( style, function( value, index ) {
					if ( transformReg[ value[ 0 ] ] ) {
						result.push( value[ 0 ], "(", value.slice( 1, value.length ).join( "," ), ") " );
					}
				}, this );

				css2.css( ele, transformCssName, result.join( "" ) );
			}
			return this;
		},
		setTransform3d: function( ele, obj ) {
			/// <summary>设置css3d 默认是先translate ==> rotate ==> scale
			/// <para>如果要改变顺序 请使用setTransform</para>
			/// <para>设置的Object属性:</para>
			/// <para>num obj.rx:x轴旋转 不带单位</para>
			/// <para>num obj.ry:y轴旋转</para>
			/// <para>num obj.rz:z轴旋转</para>
			/// <para>num obj.tx:x轴位移</para>
			/// <para>num obj.ty:y轴位移</para>
			/// <para>num obj.tz:z轴位移</para>
			/// <para>num obj.sx:缩放（范围0到1）</para>
			/// <para>num obj.sy:缩放（范围0到1）</para>
			/// <para>num obj.rotateX:x轴旋转 带单位</para>
			/// <para>num obj.rotateY:y轴旋转</para>
			/// <para>num obj.rotateZ:z轴旋转</para>
			/// <para>num obj.translateX:x轴位移</para>
			/// <para>num obj.translateY:y轴位移</para>
			/// <para>num obj.translateZ:z轴位移</para>
			/// <para>num obj.scaleX:缩放（范围0到1）</para>
			/// <para>num obj.scaleY:缩放（范围0到1）</para>
			/// </summary>
			/// <param name="ele" type="Element">元素</param>
			/// <param name="obj" type="Object">参数</param>
			/// <returns type="self" />
			if ( !obj || !hasTransform3d ) return this;
			obj = utilExtend.extend( $.getTransform3d( ele ), obj );
			css2.css( ele, transformCssName, editTranslate3d( obj ).concat( editRotate3d( obj ) ).concat( editScale( obj ) ).join( "" ) );
			return this;
		},
		setTransformByCurrent: function( ele, style ) {
			/// <summary>设置transform属性 transform有顺序之别
			/// <para>如果已有transform样式，将会按照原先顺序赋值 没有的将按顺序push进去</para>
			/// <para>数组形式为[["translate","30px","30px"],["skew","30px","30px"]]</para>
			/// <para>若其中一个为空，则结果是原值[["translate","","30px"]]</para>
			/// </summary>
			/// <param name="style" type="Array">样式名数组</param>
			/// <returns type="self" />
			if ( hasTransform && style ) {
				var transform = $.getTransform( ele ),
					pushList = [],
					len1 = style.length,
					len2 = transform.length,
					len3 = 0,
					item1 = null,
					item2 = null,
					item3 = null,
					i = len1 - 1,
					j = len2 - 1,
					z = 0;

				for ( ; i > -1; i-- ) {
					item1 = style[ i ];
					if ( transformReg[ item1[ 0 ] ] ) {
						for ( ; j > -1; j-- ) {
							item2 = transform[ j ];
							if ( item1[ 0 ] == item2[ 0 ] ) {
								z = 1;
								len3 = item1.length;
								for ( ; z < len3; z++ ) {
									item3 = item1[ z ];
									if ( !typed.isEmpty( item3 ) )
										item2[ z ] = item3;
								}
								break;
							}
						}
						if ( z == 0 ) {
							pushList.push( item1 );
						}
						z = 0; //初始化是否找到
					} else {
						style.splice( i, 1 );
					}
				}


				transform = transform.concat( pushList );

				// $.each(style, function (value) {
				//     transform.push(value)
				// });

				$.setTransform( ele, transform );
			}
			return this;
		},
		setTransformOrigin: function( ele, style ) {
			/// <summary>用来设置元素的运动的基点(参照点).默认为元素中心点.
			/// <para>transform–origin(x,y)</para>
			/// <para>style.x style.y</para>
			/// <para>x也可指定字符值参数: left,center,right.</para>
			/// <para>y也可指定字符值参数: top,center,right.</para>
			/// <para>left == 0%,center == 50%,right == 100%</para>
			/// <para>top == 0%,center == 50%,right == 100%</para>
			/// </summary>
			/// <param name="ele" type="Element">元素</param>
			/// <param name="style" type="Object">参数</param>
			/// <returns type="self" />
			if ( hasTransform && style ) {
				css2.css( ele, transformCssName + "Origin", [ style.x || "left", " ", style.y || "top" ].join( "" ) );
			}
			return this;
		},
		setTransition: function( ele, style ) {
			/// <summary>设置transition属性
			/// <para>可以如下方式设置</para>
			/// <para>$.setTransition(ele, "background-color 1s linear")</para>
			/// <para>$.setTransition(ele, {name:"width"}) 为obj时可缺省duration,function</para>
			/// <para>$.setTransition(ele, [{name:"width",duration:"1s",function:"linear"}, {name:"height"])</para>
			/// <para>$.setTransition(ele, ["background-color 1s linear", "width 1s linear"])</para>
			/// </summary>
			/// <param name="ele" type="Element">元素</param>
			/// <param name="style" type="Array/Object/String">值得数组或值</param>
			/// <returns type="self" />
			if ( hasTransition ) {
				var result = "",
					origin = arguments[ 2 ] ? arguments[ 2 ] : ""; //原始origin一样的 替换掉 或许不应该改由浏览器自己控制
				if ( typed.isStr( style ) ) {
					result = style;
				} else if ( typed.isObj( style ) ) {
					style.name && ( result = [ $.util.unCamelCase( value.name, value.head ), style.duration || "1s", style[ "function" ] || "linear", style.delay || ""
          ].join( " " ) );
				} else if ( typed.isArr( style ) ) {
					var list = [];
					$.each( style, function( value ) {
						if ( typed.isStr( value ) ) {
							list.push( value );
						} else if ( typed.isObj( value ) ) {
							value.name && list.push( [ $.util.unCamelCase( value.name, value.head ), value.duration || "1s", value[ "function" ] || "linear", value.delay || ""
              ].join( " " ) );
						}
					} );
					result = list.join( "," );
				}
				if ( origin.replace( /\s/g, "" ).indexOf( result.replace( /\s/g, "" ) ) < 0 ) {
					css2.css( ele, transitionCssName, ( origin ? origin + "," : "" ) + result );
				}
			}
			return this;
		},
		setTranslate3d: function( ele, obj ) {
			/// <summary>设置css3d的translate3d
			/// <para>num tx:x轴位移 不带单位</para>
			/// <para>num ty:y轴位移</para>
			/// <para>num tz:z轴位移</para>
			/// <para>num translateX:x轴位移 带单位</para>
			/// <para>num translateY:y轴位移</para>
			/// <para>num translateZ:z轴位移</para>
			/// </summary>
			/// <param name="ele" type="Element">元素</param>
			/// <param name="obj" type="Object">参数</param>
			/// <returns type="self" />
			if ( !obj || !hasTransform3d ) return this;
			var origin = $.getTransform3d( ele ),
				temp = {
					translateX: origin.translateX,
					translateY: origin.translateY,
					translateZ: origin.translateZ
				};
			utilExtend.easyExtend( obj, temp );

			css2.css( ele, transformCssName, editTranslate3d( obj ).join( "" ) );
			return this;
		}
	};
	utilExtend.easyExtend( support, css3Support );
	$.extend( css3 );
	$.fn.extend( {
		addTransition: function( style ) {
			/// <summary>添加transition属性
			/// <para>可以如下方式设置</para>
			/// <para>$.addTransition(ele, "background-color 1s linear")</para>
			/// <para>$.addTransition(ele, {name:"width"}) 为obj时可缺省duration,function</para>
			/// <para>$.addTransition(ele, [{name:"width",duration:"1s",function:"linear"}, {name:"height"])</para>
			/// <para>$.addTransition(ele, ["background-color 1s linear", "width 1s linear"])</para>
			/// </summary>
			/// <param name="ele" type="Element">元素</param>
			/// <param name="style" type="Array/Object/String">值得数组或值</param>
			/// <returns type="self" />
			return this.each( function( ele ) {
				$.addTransition( ele, style );
			} );
		},
		bindTransition: function( style ) {
			/// <summary>添加transition属性并绑定事件
			/// <para>可以如下方式设置</para>
			/// <para>[{ name: "background-color", duration: "1s", "function": "linear"</para>
			/// <para>       , events: {</para>
			/// <para>           mouseover: "#ff0"</para>
			/// <para>           , mouseout: "#00f"</para>
			/// <para>       }</para>
			/// <para>       , toggle: ["#ff0", "#00f"]</para>
			/// <para>}]）</para>
			/// </summary>
			/// <param name="style" type="Array/Object">值得数组或值</param>
			/// <returns type="self" />
			return this.each( function( ele ) {
				$.bindTransition( ele, style );
			} );
		},
		css3: function( style, value ) {
			/// <summary>css3的操作，不需要加浏览器特殊头。如果可以，还是使用css和自己加头的方式，性能更高。
			/// <para>头可以如此获得$.css3Head</para>
			/// <para>如果要获得样式 返回为String 返回为第一元素</para>
			/// </summary>
			/// <param name="style" type="Object/String">obj为赋样式 str为获得一个样式</param>
			/// <param name="value" type="String/Number/undefined">当为style为string时 存在则赋值 不存在则返回值</param>
			/// <returns type="self" />
			if ( !hasCss3 ) {
				return this;
			}
			var b = style,
				result, tmp;
			if ( typed.isObj( b ) ) {
				for ( var i in b ) {
					result = editCss3Type.call( this, i );
					this.each( function( ele ) {
						if ( typed.isFun( result.name ) )
							result.name.call( this, b[ i ] );
						else
							result.name && $.css3( ele, result.name, b[ i ] + result.unit );
					} )
				}
			} else if ( typed.isStr( b ) ) {
				result = editCss3Type.call( this, b );
				if ( value === undefined ) {
					if ( typed.isFun( result.name ) )
						return result.name.call( this );
					else
						return $.css3( this[ 0 ], result.name );
				} else {
					this.each( function( ele ) {
						if ( typed.isFun( result.name ) )
							result.name.call( this, value );
						else
							result.name && $.css3( ele, result.name, value + result.unit );
					} );
				}
			}
			return this;
		},
		css3Style: function( name ) {
			/// <summary>返回样式表的css3的属性，其实是默认加了个head</summary>
			/// <param name="name" type="String">样式名</param>
			/// <returns type="self" />
			return css2.style( this[ 0 ], name, css3Head );
		},

		initTransform3d: function( perspective, perspectiveOrigin ) {
			/// <summary>所有元素初始化css3d这样它的子元素才能被set3d</summary>
			/// <param name="ele" type="Element">元素</param>
			/// <param name="perspective" type="Number">井深</param>
			/// <param name="perspectiveOrigin" type="String">视角；如:"50% 50%"</param>
			/// <returns type="self" />
			return this.each( function( ele ) {
				$.initTransform3d( ele, perspective, perspectiveOrigin );
			} );
		},

		linearGradient: function( option ) {
			/// <summary>设置线性渐变
			/// <para>str option.orientation</para>
			/// <para>arr option.colorStops</para>
			/// <para>num option.colorStops[0].stop</para>
			/// <para>str option.colorStops[0].color</para>
			/// </summary>
			/// <param name="obj" type="Object">参数</param>
			/// <returns type="self" />
			return this.each( function( ele ) {
				$.linearGradient( ele, option );
			} );
		},

		radialGradient: function( option ) {
			/// <summary>设置径向渐变
			/// <para>str option.radial</para>
			/// <para>arr option.colorStops</para>
			/// <para>num option.colorStops[0].stop</para>
			/// <para>str option.colorStops[0].color</para>
			/// </summary>
			/// <param name="obj" type="Object">参数</param>
			/// <returns type="self" />
			return this.each( function( ele ) {
				$.radialGradient( ele, option );
			} );
		},
		removeTransition: function( style ) {
			/// <summary>移除transition属性
			/// <para>可以如下方式设置</para>
			/// <para>$.removeTransition(ele, "background-color")</para>
			/// <para>$.removeTransition(ele, ["background-color", "width"])</para>
			/// <para>$.removeTransition(ele, {name:"background-color"})</para>
			/// <para>$.removeTransition(ele, [{name:"width"},"height"])</para>
			/// </summary>
			/// <param name="ele" type="Element">元素</param>
			/// <param name="style" type="String/Array/undefined">值得数组或值</param>
			/// <returns type="self" />

			return this.each( function( ele ) {
				$.removeTransition( ele, style );
			} );
		},
		replaceTransition: function( name, value ) {
			/// <summary>覆盖transition属性
			/// <para>可以如下方式设置</para>
			/// <para>$.replaceTransition(ele, "background-color","background-color 2s linear")</para>
			/// </summary>
			/// <param name="ele" type="Element">元素</param>
			/// <param name="style" type="String">值得数组或值</param>
			/// <param name="style" type="String">值得数组或值</param>
			/// <returns type="self" />
			return this.each( function( ele ) {
				$.replaceTransition( ele, name, value );
			} );
		},

		setRotate3d: function( obj ) {
			/// <summary>设置所有元素的css3d旋转
			/// <para>num rx:x轴旋转 不带单位</para>
			/// <para>num ry:y轴旋转</para>
			/// <para>num rz:z轴旋转</para>
			/// <para>num rotateX:x轴旋转 带单位</para>
			/// <para>num rotateY:y轴旋转</para>
			/// <para>num rotateZ:z轴旋转</para>
			/// </summary>
			/// <param name="ele" type="Element">元素</param>
			/// <param name="obj" type="Object">参数</param>
			/// <returns type="self" />
			this.each( function( ele ) {
				$.setRotate3d( ele, obj )
			} );
		},
		setScale: function( obj ) {
			/// <summary>设置css3d scale缩放 3d和普通都一样
			/// <para>num scale:缩放（范围0到1）</para>
			/// </summary>
			/// <param name="ele" type="Element">元素</param>
			/// <param name="obj" type="Object">参数</param>
			/// <returns type="self" />
			return this.each( function( ele ) {
				$.setScale( ele, obj );
			} );
		},
		setTransformByCurrent: function( style ) {
			/// <summary>设置transform属性 transform有顺序之别
			/// <para>如果已有transform样式，将会按照原先顺序赋值 没有的将按顺序push进去</para>
			/// <para>数组形式为[["translate","30px","30px"],["skew","30px","30px"]]</para>
			/// </summary>
			/// <param name="style" type="Array">样式名数组</param>
			/// <returns type="self" />
			return this.each( function( ele ) {
				$.setTransformByCurrent( ele, style );
			} );
		},
		setTransition: function( style ) {
			/// <summary>设置transition属性
			/// <para>可以如下方式设置</para>
			/// <para>$.setTransition("background-color 1s linear")</para>
			/// <para>$.setTransition({name:"width"}) 为obj时可缺省duration,function</para>
			/// <para>$.setTransition([{name:"width",duration:"1s",function:"linear"}, {name:"height"])</para>
			/// <para>$.setTransition(["background-color 1s linear", "width 1s linear"])</para>
			/// </summary>
			/// <param name="style" type="Array/Object/String">值得数组或值</param>
			/// <returns type="self" />
			return this.each( function( ele ) {
				$.setTransition( ele, style );
			} );
		},
		setTranslate3d: function( obj ) {
			/// <summary>设置css3d的translate3d
			/// <para>num tx:x轴位移 不带单位</para>
			/// <para>num ty:y轴位移</para>
			/// <para>num tz:z轴位移</para>
			/// <para>num translateX:x轴位移 带单位</para>
			/// <para>num translateY:y轴位移</para>
			/// <para>num translateZ:z轴位移</para>
			/// </summary>
			/// <param name="ele" type="Element">元素</param>
			/// <param name="obj" type="Object">参数</param>
			/// <returns type="self" />
			return this.each( function( ele ) {
				$.setTranslate3d( ele, obj );
			} );
		},

		transform: function( style ) {
			/// <summary>设置所元素transform属性或返回transform属性 transform有顺序之别
			/// <para>如果style为string 将会返回第一个元素某个值 如"translate"</para>
			/// <para>头可以如此获得$.css3Head</para>
			/// <para>name缺省则返回所有存在的[["translate", "50px", "50px"], ["rotate", "30deg"], ["skew", "30deg", "30deg"]]</para>
			/// <para>name存在并且是属性返回[["translate", "50px", "50px"]]</para>
			/// <para>如果name不是transform的属性名 则返回[[]]</para>
			/// </summary>
			/// <param name="style" type="Array/String/undefined">样式名数组或样式名或不输入</param>
			/// <returns type="self" />
			return typed.isArr( style ) ? this.each( function( ele ) {
				$.setTransform( ele, style );
			} ) : $.getTransform( this[ 0 ], style );
		},
		transform3d: function( obj, toNumber ) {
			/// <summary>设置或返回css3d 默认是先translate ==> rotate ==> scale
			/// <para>如果要改变顺序 请使用setTransform</para>
			/// <para>设置的Object属性:</para>
			/// <para>num obj.rx:x轴旋转 不带单位</para>
			/// <para>num obj.ry:y轴旋转</para>
			/// <para>num obj.rz:z轴旋转</para>
			/// <para>num obj.tx:x轴位移</para>
			/// <para>num obj.ty:y轴位移</para>
			/// <para>num obj.tz:z轴位移</para>
			/// <para>num obj.sx:缩放（范围0到1）</para>
			/// <para>num obj.sy:缩放（范围0到1）</para>
			/// <para>设置的Object属性和返回的:</para>
			/// <para>num obj.rotateX:x轴旋转 带单位</para>
			/// <para>num obj.rotateY:y轴旋转</para>
			/// <para>num obj.rotateZ:z轴旋转</para>
			/// <para>num obj.translateX:x轴位移</para>
			/// <para>num obj.translateY:y轴位移</para>
			/// <para>num obj.translateZ:z轴位移</para>
			/// <para>num obj.scaleX:缩放（范围0到1）</para>
			/// <para>num obj.scaleY:缩放（范围0到1）</para>
			/// <para>如果是具名的name则返回具体的值</para>
			/// </summary>
			/// <param name="obj" type="Object/undefined/String">参数</param>
			/// <param name="toNumber" type="Boolean">是否直接把返回的结果转为数字</param>
			/// <returns type="self" />
			if ( hasTransform3d ) {
				switch ( typeof obj ) {
					case "boolean":
						toNumber = obj;
						return $.getTransform3d( this[ 0 ], toNumber );
					case "undefined":
						return $.getTransform3d( this[ 0 ], toNumber );
					case "string":
						return $.getTransform3dByName( this[ 0 ], obj, toNumber );
					case "object":
						return this.each( function( ele ) {
							$.setTransform3d( ele, obj );
						} );
				}
			} else {
				return this;
			}
		},
		transformOrigin: function( style ) {
			/// <summary>用来设置元素的运动的基点(参照点)或返回第一个元素的基点.默认为元素中心点.
			/// <para>transform–origin(x,y)</para>
			/// <para>style.x style.y</para>
			/// <para>x也可指定字符值参数: left,center,right.</para>
			/// <para>y也可指定字符值参数: top,center,right.</para>
			/// <para>left == 0%,center == 50%,right == 100%</para>
			/// <para>top == 0%,center == 50%,right == 100%</para>
			/// </summary>
			/// <param name="style" type="Object">参数</param>
			/// <returns type="self" />
			return style ? this.each( function( ele ) {
				$.setTransformOrigin( ele, style );
			} ) : $.getTransformOrigin( this[ 0 ] );
		},
		transition: function( style ) {
			/// <summary>获得transition样式 或 设置transition属性
			/// <para>详见 $.setTransition 或 $.getTransiton</para>
			/// </summary>
			/// <param name="style" type="String/Array/Object/undefined">为Array Object为设置;String看情况获得或设置;undefined为获得</param>
			/// <returns type="self" />
			if ( style == undefined || typed.isStr( style ) && style.indexOf( " " ) < 0 ) {
				return $.getTransition( this[ 0 ], style );
			} else if ( typed.isArr( style ) || typed.isObj( style ) || typed.isStr( style ) ) {
				return this.bindTransition( style );
			}
		}
	} );

	return css3;
} );

/*=======================================================*/

/*===================html5/animate.transform===========================*/
﻿aQuery.define( "html5/animate.transform", [ "base/typed", "base/extend", "base/support", "main/object", "animation/FX", "html5/css3", "animation/animate" ], function( $, typed, utilExtend, support, object, FX, css3, animate, undefined ) {
	"use strict";
	this.describe( "Support transform to animation" );
	var getScale = function( r ) {
		return r ? Math.max( r, 0 ) : 1;
	}, transformCss = css3.getTransformStyleNameUnCamelCase();

	//"-" + css3.css3Head + "-transform";
	if ( support.transform3d ) {
		var Transfrom3dForFX = FX.extend( function Transfrom3dForFX( ele, options, value, name, type ) {
			if ( this instanceof Transfrom3dForFX ) {
				/*Fix*/
				this.type = type;
				this._super( ele, options, value, name );
				this._originCss = transformCss;
				this.name = name.indexOf( "set" ) < 0 ? $.util.camelCase( name, "set" ) : name;

			} else {
				var ret = [];
				options.curCount = 0;
				$.each( value, function( val, key ) {
					options.curCount++;
					ret.push( new Transfrom3dForFX( ele, options, val, name, key ) );
				} );

				return ret;
			}
		}, {
			cur: function() {
				var r = css3.getTransform3dByName( this.ele, this.type, true );
				return r || 0;
			},
			update: function( transform, value ) {
				transform = transform || css3.getTransform3d( this.ele );

				value = value != undefined ? value : parseFloat( this.nowPos );
				if ( value != undefined && !typed.isNaN( value ) ) {
					transform[ this.type ] = value + this.unit;
					css3[ this.name ]( this.ele, transform );
				}

				return transform;
			},
			specialUnit: function( start, end, unit ) {
				var transform = this.update( this.name, end || 1 );
				start *= ( ( end || 1 ) / this.cur() );
				this.update( this.name, start, transform );

				return start;
			}
		} );

		utilExtend.easyExtend( FX.hooks, {
			setRotate3d: Transfrom3dForFX,
			setScale: Transfrom3dForFX,
			transform3d: Transfrom3dForFX,
			setTranslate3d: Transfrom3dForFX
		} );
	}
	if ( support.transform ) {
		var TransfromForFX = FX.extend( function TransfromForFX( ele, options, value, name, type, index ) {
			if ( this instanceof TransfromForFX ) {
				/*Fix*/
				this.type = type;
				this.index = index;
				this._originCss = transformCss;
				this._super( ele, options, value, name );
				this.name = name.indexOf( "set" ) < 0 ? $.util.camelCase( name, "set" ) : name;
			} else {
				var ret = [];
				options.curCount = 0;
				$.each( value, function( list ) {
					for ( var i = 1, len = list.length; i < len; i++ ) {
						options.curCount++;
						ret.push( new TransfromForFX( ele, options, list[ i ], name, list, i ) );
					}
				} );

				return ret;
			}
		}, {
			cur: function() {
				var r = $.getTransform( this.ele, this.type[ 0 ] )[ 0 ] || [];
				r = parseFloat( r[ this.index ] );
				if ( this.type[ 0 ] == "scale" ) r = getScale( r );
				return r || 0;
			},
			update: function( transform, value ) {
				transform = transform || $.getTransform( this.ele, this.type[ 0 ] )[ 0 ] || [];
				value = value != undefined ? value : parseFloat( this.nowPos );
				if ( value != undefined && !typed.isNaN( value ) ) {
					transform[ 0 ] = this.type[ 0 ];

					for ( var i = 1, item = transform[ i ], len = this.type.length; i < len; i++ ) {
						transform[ i ] = item || ( this.type[ 0 ] != "scale" ? 0 : 1 + this.unit );
					}

					transform[ this.index ] = value + this.unit;
					// this.index ==i?(   transform[this.index] = value + this.unit):;
					$.setTransformByCurrent( this.ele, [ transform ] );
				}

				return transform;
			},
			specialUnit: function( start, end, unit ) {
				var transform = this.update( this.name, end || 1 );
				start *= ( ( end || 1 ) / this.cur() );
				this.update( transform, start );

				return start;
			}

		} );

		utilExtend.easyExtend( FX.hooks, {
			transform: TransfromForFX
		} );
	}

} );

/*=======================================================*/

/*===================hash/cubicBezier.tween===========================*/
define( "hash/cubicBezier.tween", function() {
  this.describe( "CubicBezier parameter" );
  /**
   * @pubilc
   * @module hash/cssColors
   * @property {Array<Number>} back.easeInOut  - [ 0.680, -0.550, 0.265, 1.550 ]
   * @property {Array<Number>} circ.easeInOut  - [ 0.785, 0.135, 0.150, 0.860 ]
   * @property {Array<Number>} expo.easeInOut  - [ 1.000, 0.000, 0.000, 1.000 ]
   * @property {Array<Number>} sine.easeInOut  - [ 0.445, 0.050, 0.550, 0.950 ]
   * @property {Array<Number>} quint.easeInOut - [ 0.860, 0.000, 0.070, 1.000 ]
   * @property {Array<Number>} quart.easeInOut - [ 0.770, 0.000, 0.175, 1.000 ]
   * @property {Array<Number>} cubic.easeInOut - [ 0.645, 0.045, 0.355, 1.000 ]
   * @property {Array<Number>} quad.easeInOut  - [ 0.455, 0.030, 0.515, 0.955 ]
   *
   * @property {Array<Number>} back.easeOut    - [ 0.175, 0.885, 0.320, 1.275 ]
   * @property {Array<Number>} circ.easeOut    - [ 0.075, 0.820, 0.165, 1.000 ]
   * @property {Array<Number>} expo.easeOut    - [ 0.190, 1.000, 0.220, 1.000 ]
   * @property {Array<Number>} sine.easeOut    - [ 0.390, 0.575, 0.565, 1.000 ]
   * @property {Array<Number>} quint.easeOut   - [ 0.230, 1.000, 0.320, 1.000 ]
   * @property {Array<Number>} quart.easeOut   - [ 0.165, 0.840, 0.440, 1.000 ]
   * @property {Array<Number>} cubic.easeOut   - [ 0.215, 0.610, 0.355, 1.000 ]
   * @property {Array<Number>} quad.easeOut    - [ 0.250, 0.460, 0.450, 0.940 ]
   *
   * @property {Array<Number>} back.easeIn     - [ 0.600, -0.280, 0.735, 0.045 ]
   * @property {Array<Number>} circ.easeIn     - [ 0.600, 0.040, 0.980, 0.335 ]
   * @property {Array<Number>} expo.easeIn     - [ 0.950, 0.050, 0.795, 0.035 ]
   * @property {Array<Number>} sine.easeIn     - [ 0.470, 0.000, 0.745, 0.715 ]
   * @property {Array<Number>} quint.easeIn    - [ 0.755, 0.050, 0.855, 0.060 ]
   * @property {Array<Number>} quart.easeIn    - [ 0.895, 0.030, 0.685, 0.220 ]
   * @property {Array<Number>} cubic.easeIn    - [ 0.550, 0.055, 0.675, 0.190 ]
   * @property {Array<Number>} quad.easeIn     - [ 0.550, 0.085, 0.680, 0.530 ]
   */
	return {
		"back.easeInOut": [ 0.680, -0.550, 0.265, 1.550 ],
		"circ.easeInOut": [ 0.785, 0.135, 0.150, 0.860 ],
		"expo.easeInOut": [ 1.000, 0.000, 0.000, 1.000 ],
		"sine.easeInOut": [ 0.445, 0.050, 0.550, 0.950 ],
		"quint.easeInOut": [ 0.860, 0.000, 0.070, 1.000 ],
		"quart.easeInOut": [ 0.770, 0.000, 0.175, 1.000 ],
		"cubic.easeInOut": [ 0.645, 0.045, 0.355, 1.000 ],
		"quad.easeInOut": [ 0.455, 0.030, 0.515, 0.955 ],

		"back.easeOut": [ 0.175, 0.885, 0.320, 1.275 ],
		"circ.easeOut": [ 0.075, 0.820, 0.165, 1.000 ],
		"expo.easeOut": [ 0.190, 1.000, 0.220, 1.000 ],
		"sine.easeOut": [ 0.390, 0.575, 0.565, 1.000 ],
		"quint.easeOut": [ 0.230, 1.000, 0.320, 1.000 ],
		"quart.easeOut": [ 0.165, 0.840, 0.440, 1.000 ],
		"cubic.easeOut": [ 0.215, 0.610, 0.355, 1.000 ],
		"quad.easeOut": [ 0.250, 0.460, 0.450, 0.940 ],

		"back.easeIn": [ 0.600, -0.280, 0.735, 0.045 ],
		"circ.easeIn": [ 0.600, 0.040, 0.980, 0.335 ],
		"expo.easeIn": [ 0.950, 0.050, 0.795, 0.035 ],
		"sine.easeIn": [ 0.470, 0.000, 0.745, 0.715 ],
		"quint.easeIn": [ 0.755, 0.050, 0.855, 0.060 ],
		"quart.easeIn": [ 0.895, 0.030, 0.685, 0.220 ],
		"cubic.easeIn": [ 0.550, 0.055, 0.675, 0.190 ],
		"quad.easeIn": [ 0.550, 0.085, 0.680, 0.530 ]
	};
} );

/*=======================================================*/

/*===================html5/css3.transition.animate===========================*/
﻿aQuery.define( "html5/css3.transition.animate", [
  "base/config",
  "base/typed",
  "base/support",
  "base/extend",
  "base/client",
  "main/event",
  "main/data",
  "html5/css3",
  "animation/FX",
  "html5/animate.transform",
  "hash/cubicBezier.tween" ], function( $,
	config,
	typed,
	support,
	utilExtend,
	client,
	event,
  utilData,
	css3,
	FX,
	transform,
	cubicBezierTween,
	undefined ) {
	"use strict";
	this.describe( "Animation to HTML5 transition" );
	//do not use em

	$.extend( {
		getPositionAnimationOptionProxy: function( isTransform3d, x, y ) {
			var opt = {};
			if ( isTransform3d && support.transform3d ) {
				opt.transform3d = {

				};
				if ( x !== undefined ) {
					opt.transform3d.translateX = x + "px";
				}
				if ( y !== undefined ) {
					opt.transform3d.translateY = y + "px";
				}

			} else {
				if ( x !== undefined ) {
					opt.left = x + "px";
				}
				if ( y !== undefined ) {
					opt.top = y + "px";
				}
			}
			return opt;
		}
	} );

	if ( support.transition ) {
		var
		originComplete = $._originComplete,

			transitionEndType = ( function() {
				var type = "";
				if ( client.engine.ie ) type = "MS";
				else if ( client.engine.webkit || client.system.mobile ) type = "webkit";
				else if ( client.engine.gecko ) return "transitionend";
				else if ( client.engine.opera ) type = "o";
				return type + "TransitionEnd";
			} )(),
			animateByTransition = function( ele, property, option ) {
				/// <summary>给所有元素添加一个动画
				/// <para>obj property:{ width: "50em", top: "+=500px" }</para>
				/// <para>obj option</para>
				/// <para>num/str option.duration:持续时间 也可输入"slow","fast","normal"</para>
				/// <para>fun option.complete:结束时要执行的方法</para>
				/// <para>str/fun option.easing:tween函数的路径:"quad.easeIn"或者直接的方法</para>
				/// <para>默认只有linear</para>
				/// <para>没有complete</para>
				/// </summary>
				/// <param name="ele" type="Element">dom元素</param>
				/// <param name="property" type="Object">样式属性</param>
				/// <param name="option" type="Object">参数</param>
				/// <returns type="self" />
				var opt = {},
					p,
					defaultEasing = option.easing,
					easing, transitionList = utilData.get( ele, "_transitionList" );

				if ( !transitionList ) {
					transitionList = {};
				}

				utilExtend.easyExtend( opt, option );
				//opt._transitionList = [];
				opt._transitionEnd = function( event ) {
					var i, ele = this,
						item,
						transitionList = utilData.get( ele, "_transitionList" );

					for ( i in transitionList ) {
						css3.removeTransition( ele, i );
						item = transitionList[ i ];
						delete transitionList[ i ];
					}

					ele.removeEventListener( transitionEndType, opt._transitionEnd );

					setTimeout( function() {
						FX.invokeCompelete( opt.complete, ele, opt );
						ele = opt = null;
					}, 0 );
				};

				for ( p in property ) {
					var name = $.util.unCamelCase( p );
					if ( p !== name ) {
						property[ name ] = property[ p ];
						//把值复制给$.util.camelCase转化后的属性
						delete property[ p ];
						//删除已经无用的属性
						p = name;
					}

					if ( ( p === "height" || p === "width" ) && ele.style ) {
						opt.display = ele.style.display; //$.css(ele, "display");
						opt.overflow = ele.style.overflow;

						ele.style.display = "block"; //是否对呢？
					}
				}

				if ( opt.overflow != null ) {
					ele.style.overflow = "hidden";
				}
				var equalFlag = true;
				ele.addEventListener( transitionEndType, opt._transitionEnd, false );
				$.each( property, function( value, key ) {
					var ret, i, temp, tran = [],
						duration = opt.duration / 1000,
						delay = opt.delay / 1000,
						item, startTime;
					//para肯定要在这里用
					easing = opt.specialEasing && opt.specialEasing[ key ] ? $.getTransitionEasing( opt.specialEasing[ key ] ) : defaultEasing;
					opt.easing = opt.originEasing;
					if ( typed.isFun( FX.hooks[ key ] ) ) {
						ret = FX.hooks[ key ]( ele, opt, value, key );
						temp = ret[ 0 ]._originCss;
						//opt._transitionList.push(temp);
						tran.push( temp, duration + "s", easing );
						opt.delay && tran.push( delay + "s" );
						css3.addTransition( ele, tran.join( " " ) );
						value = ret[ 0 ].update();
						startTime = new Date();
						for ( i = 0; i < ret.length; i++ ) {
							item = ret[ i ];
							if ( item.end !== item.from ) {
								equalFlag = false;
								value = item.update( value, item.end );
								item.startTime = startTime;
							}
						}
						if ( !transitionList[ temp ] ) {
							transitionList[ temp ] = [];
						}
						transitionList[ temp ] = transitionList[ temp ].concat( ret );
					} else {
						ret = new FX( ele, opt, value, key );
						//opt._transitionList.push(key);
						//temp = $.util.camelCase(key);
						//ele.style[temp] = ret.from + ret.unit;
						if ( ele.style[ $.util.camelCase( key ) ] !== ( ret.end + ret.unit ) ) {
							equalFlag = false;
							tran.push( key, duration + "s", easing );
							opt.delay && tran.push( delay + "s" );
							css3.addTransition( ele, tran.join( " " ) );
							ele.style[ $.util.camelCase( key ) ] = ret.end + ret.unit;
							ret.startTime = new Date();
							transitionList[ key ] = ret;
						}

					}
				} );
				utilData.set( ele, "_transitionList", transitionList );
				if ( equalFlag ) {
					opt._transitionEnd.call( ele );
				}

			},
			easingList = {
				"linear": 1,
				"ease": 1,
				"ease-in": 1,
				"ease-out": 1,
				"ease-in-out": 1,
				"cubic-bezier": 1
			};

		$.extend( {
			animateByTransition: function( ele, property, option ) {
				option = $._getAnimateByTransitionOpt( option );

				if ( typed.isEmptyObj( property ) ) {
					return option.complete( ele );
				} else {
					if ( option.queue === false ) {
						animateByTransition( ele, property, option );
					} else {
						$.queue( ele, "fx", function() {
							animateByTransition( ele, property, option );
							$.dequeue( ele, [ ele ] );
							ele = property = option = null;
						} );

					}
				}
				return this;
			},
			stopAnimationByTransition: function( ele, isDequeue ) {
				var transitionList = utilData.get( ele, "_transitionList" ),
					type, fx, i, item;
				for ( type in transitionList ) {
					fx = transitionList[ type ];
					if ( typed.isArr( fx ) ) {
						for ( i = fx.length - 1; i >= 0; i-- ) {
							item = fx[ i ];
							item.isInDelay() ? item.update( null, fx.from ) : item.step();
						}
					} else {
						fx.isInDelay() ? fx.update( fx.from ) : fx.step();
					}
					delete transitionList[ type ];
				}

				css3.removeTransition( ele );
				isDequeue == false || $.dequeue( ele );
				return this;
			},
			_getAnimateByTransitionOpt: function( opt ) {
				opt = opt || {};
				var duration = FX.getDuration( opt.duration ),
					delay = FX.getDelay( opt.delay ),
					tCompelete;
				if ( typed.isArr( opt.complete ) ) {
					tCompelete = opt.complete;
					if ( tCompelete[ 0 ] !== originComplete ) {
						tCompelete.splice( 0, 0, originComplete );
					}
				} else if ( typed.isFun( opt.complete ) ) {
					tCompelete = [ opt.complete, originComplete ];
				} else {
					tCompelete = [ originComplete ];
				}
				var ret = {
					delay: delay,
					duration: duration,
					easing: $.getTransitionEasing( opt.easing ),
					originEasing: $.getAnimationEasing( opt.easing, opt.para ),
					complete: tCompelete,
					specialEasing: opt.specialEasing,
					queue: opt.queue === false ? false : true,
					para: opt.para || [] //如何使用
				};

				return ret;
			},
			getTransitionEasing: function( easing ) {
				var name = easing;
				// if (typed.isArr(easing)) {
				//     name = easing.splice(0, 1)[0];
				// }
				if ( easing && typed.isStr( easing ) ) {
					if ( name.indexOf( "cubic-bezier" ) > -1 ) {
						return name;
					}

					name = $.util.unCamelCase( name );

					name = name.replace( ".", "-" );

					if ( easing = cubicBezierTween[ easing ] ) {
						name = "cubic-bezier";
					}

					if ( name == "cubic-bezier" ) {
						return name + "(" + easing.join( "," ) + ")";
					}

					if ( easingList[ name ] ) {
						return name;
					}
				}
				return "linear";
			}
		} );

		$.fn.extend( {
			animateByTransition: function( property, option ) {
				// <summary>给所有元素添加一个动画
				/// <para>obj property:{ width: "50px", top: "+=500px" }</para>
				/// <para>obj option</para>
				/// <para>num/str option.duration:持续时间 也可输入"slow","fast","normal"</para>
				/// <para>fun option.complete:结束时要执行的方法</para>
				/// <para>str/fun option.easing:tween函数的路径:"quad.easeIn"或者直接的方法</para>
				/// <para>默认只有linear</para>
				/// <para>没有complete</para>
				/// </summary>
				/// <param name="property" type="Object">样式属性</param>
				/// <param name="option" type="Object">参数</param>
				/// <returns type="self" />
				option = $._getAnimateByTransitionOpt( option );
				if ( typed.isEmptyObj( property ) ) {
					return this.each( option.complete );
				} else {
					return this[ option.queue === false ? "each" : "queue" ]( function( ele ) {
						animateByTransition( ele, property, option );
					} );
				}
			},
			stopAnimationByTransition: function( isDequeue ) {
				return this.each( function( ele ) {
					$.stopAnimationByTransition( ele, isDequeue );
				} );
			}
		} );

		if ( config.module.transitionToAnimation ) {
			if ( support.transition ) {
				$.animate = $.animateByTransition;
				$.stopAnimation = $.stopAnimationByTransition;
				$.animationPower = "css3.transition";
				$._getAnimateOpt = $._getAnimateByTransitionOpt;
				$.fn.animate = $.fn.animateByTransition;
				$.fn.stopAnimation = $.fn.stopAnimationByTransition;
			} else {
				$.logger( "css3.transition.animate load", "browser is not support transitionEnd" );
			}
		}
	}

} );

/*=======================================================*/

/*===================animation/effect===========================*/
﻿aQuery.define( "animation/effect", [ "base/typed", "main/data", "animation/animate" ], function( $, typed, utilData, animate, undefined ) {
	"use strict";
	var slideDownComplete = function() {
		utilData.set( this, "slideOriginHeight", null );
	},
		slideUpComplete = function( opt ) {
			$._hide( this, opt.visible ).css( this, "height", utilData.get( this, "slideOriginHeight" ) );
			utilData.set( this, "slideOriginHeight", null );
		},
		fadeInComplete = function() {
			utilData.set( this, "slideOriginOpacity", null );
		},
		fadeOutComplete = function( opt ) {
			$._hide( this, opt.visible ).setOpacity( this, utilData.get( this, "slideOriginOpacity" ) );
			utilData.set( this, "slideOriginOpacity", null );
		};

	var effect = {
		_show: $.show,
		_hide: $.hide,

		fadeIn: function( ele, option ) {
			/// <summary>淡入</summary>
			/// <param name="ele" type="Element">dom元素</param>
			/// <param name="option" type="Object">动画选项</param>
			/// <returns type="self" />
			if ( $.isVisible( ele ) ) {
				return this;
			}

			var o, opt = $._getAnimateOpt( option );
			o = utilData.get( ele, "slideOriginOpacity" );
			o = o != null ? o : ( $.css( ele, "opacity" ) || 1 );

			utilData.set( ele, "slideOriginOpacity", o );
			opt.complete = fadeInComplete;
			return $.setOpacity( ele, 0 )._show( ele ).animate( ele, {
				opacity: o
			}, opt );
		},
		fadeOut: function( ele, option ) {
			/// <summary>淡出</summary>
			/// <param name="ele" type="Element">dom元素</param>
			/// <param name="option" type="Object">动画选项</param>
			/// <returns type="self" />
			if ( !$.isVisible( ele ) ) {
				return this;
			}
			option = option || {
				visible: 0
			};

			var o, opt = $._getAnimateOpt( option );
			o = utilData.get( ele, "slideOriginOpacity" );
			o = o != null ? o : $.css( ele, "opacity" );

			utilData.set( ele, "slideOriginOpacity", o );
			opt.complete = fadeOutComplete;
			return $._show( ele ).animate( ele, {
				opacity: 0
			}, opt );
		},

		hide: function( ele, type, option ) {
			/// <summary>隐藏元素
			/// <para>type:slide fade</para>
			/// </summary>
			/// <param name="ele" type="Element">element元素</param>
			/// <param name="type" type="String/undefined">动画类型</param>
			/// <param name="option" type="Object">动画选项</param>
			/// <returns type="self" />
			///  name="visible" type="Boolean/undefined">true:隐藏后任然占据文档流中
			if ( typed.isStr( type ) && $[ type ] ) {
				$[ type ]( ele, option );
			} else {
				$._hide( ele );
			}
			return this;
		},

		show: function( ele, type, option ) {
			/// <summary>显示元素
			/// <para>type:slide fade</para>
			/// </summary>
			/// <param name="ele" type="Element">element元素</param>
			/// <param name="type" type="String/undefined">动画类型</param>
			/// <param name="option" type="Object">动画选项</param>
			/// <returns type="self" />
			if ( typed.isStr( type ) && $[ type ] ) {
				$[ type ]( ele, option );
			} else {
				$._show( ele );
			}
			return this;
		},
		slideDown: function( ele, option ) {
			/// <summary>滑动淡入</summary>
			/// <param name="ele" type="Element">dom元素</param>
			/// <param name="option" type="Object">动画选项</param>
			/// <returns type="self" />
			if ( $.isVisible( ele ) ) {
				return this;
			}

			var h = utilData.get( ele, "slideOriginHeight" ) || $.css( ele, "height" ),
				opt = $._getAnimateOpt( option );
			utilData.set( ele, "slideOriginHeight", h );
			$.css( ele, "height", 0 );
			opt.complete.push( slideDownComplete );
			return $.css( ele, "height", 0 )._show( ele ).animate( ele, {
				height: h
			}, opt );
		},
		slideUp: function( ele, option ) {
			/// <summary>滑动淡出</summary>
			/// <param name="ele" type="Element">dom元素</param>
			/// <param name="option" type="Object">动画选项</param>
			/// <returns type="self" />
			if ( !$.isVisible( ele ) || utilData.get( ele, "_sliedeDown" ) ) {
				return this;
			}

			var h = utilData.get( ele, "slideOriginHeight" ) || $.css( ele, "height" ),
				opt = $._getAnimateOpt( option );
			$.css( ele, "height", h );
			utilData.set( ele, "slideOriginHeight", h );
			opt.complete.push( slideUpComplete );
			return $._show( ele ).animate( ele, {
				height: "0px"
			}, opt );
		}
	};

	$.extend( effect );

	$.fn.extend( {
		fadeIn: function( option ) {
			/// <summary>淡入</summary>
			/// <param name="option" type="Object">动画选项</param>
			/// <returns type="self" />
			return this.each( function( ele ) {
				$.fadeIn( ele, option );
			} );
		},
		fadeOut: function( option ) {
			/// <summary>淡出</summary>
			/// <param name="option" type="Object">动画选项</param>
			/// <returns type="self" />
			return this.each( function( ele ) {
				$.fadeOut( ele, option );
			} );
		},

		hide: function( type, option ) {
			/// <summary>隐藏元素
			/// <para>type:slide fade</para>
			/// </summary>
			/// <param name="type" type="String/undefined">动画类型</param>
			/// <param name="option" type="Object">动画选项</param>
			/// <returns type="self" />
			return this.each( function( ele ) {
				$.hide( ele, type, option );
			} );
		},

		show: function( type, option ) {
			/// <summary>显示元素
			/// <para>type:slide fade</para>
			/// </summary>
			/// <param name="type" type="String/undefined">动画类型</param>
			/// <param name="option" type="Object">动画选项</param>
			/// <returns type="self" />
			return this.each( function( ele ) {
				$.show( ele, type, option );
			} );
		},
		slideDown: function( option ) {
			/// <summary>滑动淡入</summary>
			/// <param name="option" type="Object">动画选项</param>
			/// <returns type="self" />
			return this.each( function( ele ) {
				$.slideDown( ele, option );
			} );
		},
		slideUp: function( option ) {
			/// <summary>滑动淡出</summary>
			/// <param name="option" type="Object">动画选项</param>
			/// <returns type="self" />
			return this.each( function( ele ) {
				$.slideUp( ele, option );
			} );
		}
	} );
	return effect;
} );

/*=======================================================*/

/*===================ui/accordion===========================*/
﻿aQuery.define( "ui/accordion", [
  "base/typed",
  "base/extend",
  "main/object",
  "module/Widget",
  "main/class",
  "main/event",
  "main/CustomEvent",
  "main/css",
  "main/position",
  "main/dom",
  "animation/animate",
  "html5/css3.transition.animate",
  "animation/effect"
 ], function( $, typed, utilExtend, object, Widget, cls, event, CustomEvent, css, position, dom ) {
	"use strict";
	Widget.fetchCSS( "ui/css/accordion" );

	var Key = CustomEvent.extend( "Key", {
		init: function( key, parent ) {
			this._super();
			this.parent = parent;
			this.originKey = $( key );
			this.customHandler = this.originKey.attr( "widget-handler" );
			this.html = this.originKey.html();
			this.title = this.originKey.attr( "widget-title" ) || this.html;
			this.widgetId = this.originKey.attr( "widget-id" ) || this.title;
			this.originKey.html( "" );

			return this.create().initHandler().addHandler();
		},
		create: function() {
			this.$a = $( $.createEle( "a" ) )
				.addClass( "unselect" )
				.css( {
					position: "relative",
					display: "block",
					height: "100%",
					width: "100%"
				} )
				.html( this.html )
				.addClass( "a" );

			this.container = this.$key = this.originKey.css( {
				position: "relative",
				display: "block",
				width: "100%"
			} )
				.addClass( "key" )
				.attr( {
					"title": this.title
				} )
				.append( this.$a )
				.appendTo( this.parent.container );

			return this;

		},
		event: function() {

		},
		initHandler: function() {
			var self = this;
			this.event = function( e ) {
				//                self.setSelectStyle();
				self.selectKey( e );
			}
			return this;
		},
		addHandler: function() {
			this.$key.click( this.event );
			return this;
		},
		removeHandler: function() {
			this.$key.off( "click", this.event );
			return this;
		},
		setUnselectStyle: function() {
			this.$a.addClass( "unselect" ).removeClass( "select" );
			return this;
		},
		setSelectStyle: function() {
			this.$a.addClass( "select" ).removeClass( "unselect" );
			return this;
		},
		selectKey: function( e ) {
			this.trigger( "key.select", this, this, e );
			this.setSelectStyle();
		},
		routing: function( widgetId ) {
			return this.widgetId == widgetId;
		}
	} );

	var KeyCollection = object.Collection( "KeyCollection", {
		init: function( keys, parent ) {
			this._super();
			this.parent = parent;
			this.container = parent.container;
			var i = 0,
				len = keys.length,
				key,
				item;

			for ( ; i < len; i++ ) { //映射表 找到shell 通过name
				item = keys[ i ];
				key = new Key( item, this );

				this.add( key );
			}
			this.initHandler().addHandler();
			return this;
		},
		event: function() {

		},
		initHandler: function() {
			var self = this;
			this.event = function( key, e ) {
				//self.setUnselectStyle();
				//key.setSelectStyle();
				self.trigger( "key.select", this, key, e );
			}

			return this;
		},
		addHandler: function() {
			this.onChild( "key.select", this.event );
			return this;
		},
		removeHandler: function() {
			this.offChild( "key.select", this.event );
			return this;
		},
		setUnselectStyle: function() {
			return this.each( function( item ) {
				item.setUnselectStyle();
			} );
		},
		setSelectStyle: function() {
			return this.each( function( item ) {
				item.setSelectStyle();
			} );
		},

		onChild: function( type, fn ) {
			var list = this.models,
				i;
			for ( i in list ) {
				list[ i ].on( type, fn );
			}
			return this;
		},
		offChild: function( type, fn ) {
			var list = this.models,
				i;
			for ( i in list ) {
				list[ i ].off( type, fn );
			}
			return this;
		}
	}, CustomEvent );

	var Shell = CustomEvent.extend( "Shell", {
		init: function( shell, parent ) {
			this._super();
			this.parent = parent;
			this.originShell = $( shell );
			this.customHandler = this.originShell.attr( "widget-handler" );
			this.html = this.originShell.attr( "widget-html" );
			this.title = this.originShell.attr( "widget-title" ) || this.html;
			this.widgetId = this.originShell.attr( "widget-id" ) || this.title;

			this.originShell.removeAttr( "title" );

			this.onfocus = false;

			return this.create().initHandler().addHandler();

		},
		create: function() {
			this.$arrow = $( $.createEle( "div" ) ).css( {
				"float": "left"
			} ).addClass( "arrowRight" );

			this.$text = $( $.createEle( "div" ) ).css( {
				"float": "left"
			} ).addClass( "text" ).html( this.html );

			this.$title = $( $.createEle( "a" ) )
				.css( {
					"clear": "left",
					position: "relative",
					display: "block",
					"text-decoration": "none"
				} )
				.addClass( "title" )
				.addClass( "title_unselect" )
				.append( this.$arrow )
				.append( this.$text );

			this.container = this.$board = this.originShell.css( {
				position: "relative",
				width: "100%",
				display: "block"
			} )
				.addClass( "board" )
				.hide();

			this.$shell = $( $.createEle( "div" ) )
				.css( {
					position: "relative",
					width: "100%"
				} )
				.addClass( "shell" )
				.attr( {
					"title": this.title
				} )
				.append( this.$title )
				.append( this.$board )
				.appendTo( this.parent.container );

			this.$text.width( this.$board.width() - this.$arrow.width() );

			this.keyCollection = new KeyCollection( this.$board.children(), this );
			return this;
		},
		event: {
			click: function() {},
			keyselect: function() {}
		},
		initHandler: function() {
			var self = this;
			this.event.click = function( e ) {
				self.toggle( e );
			}
			this.event.keyselect = function( key, e ) {
				self.trigger( "key.select", this, "key.select", key, e );
				self.open( key, e );
			}
			return this;
		},
		addHandler: function() {
			this.$title.click( this.event.click );
			this.keyCollection.on( "key.select", this.event.keyselect );
			return this;
		},
		removeHandler: function( argument ) {
			this.$title.off( "click", this.event.click );
			this.keyCollection.off( "key.select", this.event.keyselect );
			return this;
		},
		open: function( key, e ) {
			if ( this.onfocus == false ) {
				this.onfocus = true;
				this.setOpenStyle();
				this.$board.slideDown( {
					duration: 400,
					easing: "cubic.easeInOut"
				} );
			}
			return this.trigger( "shell.open", this, "shell.open", this );

		},
		close: function() {
			if ( this.onfocus == true ) {
				this.onfocus = false;
				this.setCloseStyle();
				this.$board.slideUp( {
					duration: 400,
					easing: "cubic.easeInOut"
				} );
			}
			return this.trigger( "shell.close", this, "shell.close", this );
		},
		toggle: function( e ) {
			this.trigger( "shell.select", this, "shell.select", this, e );
			this.onfocus ? this.close() : this.open();
			return this;
		},
		setOpenStyle: function() {
			this.$title.addClass( "title_select" ).removeClass( "title_unselect" );
			this.$arrow.addClass( "arrowBottom" ).removeClass( "arrowRight" );
			return this;
		},
		setCloseStyle: function() {
			this.$title.addClass( "title_unselect" ).removeClass( "title_select" );
			this.$arrow.addClass( "arrowRight" ).removeClass( "arrowBottom" );
			return this;
		},
		render: function() {
			return this.toggle();
		},
		routing: function( widgetId ) {
			return this.widgetId == widgetId;
		}
	} );

	var ShellCollection = object.Collection( "ShellCollection", {
		init: function( shells, parent ) {
			//this.parent = parent;
			//this.container = parent.container;
			this._super();
			this.parent = parent;
			this.container = parent.container;
			var i = 0,
				len = shells.length,
				shell,
				item;

			for ( ; i < len; i++ ) { //映射表 找到shell 通过name
				item = shells[ i ];
				shell = new Shell( item, this );
				//parent.append(shell);

				//result.push(shell);
				this.add( shell );
			}
			this.initHandler().addHandler();
			return this;
		},

		event: function() {

		},

		initHandler: function() {
			var self = this;
			this.event = function( type, target, e ) {
				if ( type == "shell.select" ) {
					self.closeOther( target );
				}
				if ( type == "key.select" ) {
					self.each( function( shell ) {
						shell.keyCollection.setUnselectStyle();
					} );
				}
				self.trigger( type, this, type, target, e );
			}
			return this;
		},
		addHandler: function() {
			this.onChild( "key.select", this.event )
				.onChild( "shell.open", this.event )
				.onChild( "shell.close", this.event )
				.onChild( "shell.select", this.event );
			return this;
		},
		removeHandler: function() {
			this.offChild( "key.select", this.event )
				.offChild( "shell.open", this.event )
				.offChild( "shell.close", this.event )
				.offChild( "shell.select", this.event );
			return this;
		},
		closeOther: function( except ) {
			this.parent.option.oneSelect && this.each( function( shell ) {
				except != shell && shell.onfocus && shell.close();
			}, this );
			return this;
		},

		onChild: function( type, fn ) {
			var list = this.models,
				i;
			for ( i in list ) {
				list[ i ].on( type, fn );
			}
			return this;
		},
		offChild: function( type, fn ) {
			var list = this.models,
				i;
			for ( i in list ) {
				list[ i ].off( type, fn );
			}
			return this;
		},
		getShell: function( shell ) {
			var ret = null,
				item, i, list = this.models;
			if ( typed.isStr( shell ) ) {
				for ( i in list ) {
					item = list[ i ];
					if ( item.widgetId == shell ) {
						ret = item;
						break
					}
				}
			} else if ( typed.isEle( shell ) ) {
				for ( i in list ) {
					item = list[ i ];
					if ( item.originShell == shell ) {
						ret = item;
						break
					}
				}
			} else if ( shell instanceof Shell ) {
				ret = Shell;
			}
			return ret;
		},
		selectShell: function( shell ) {
			var ret = this.getShell( shell );
			if ( ret != null ) {
				ret.toggle();
			}
			return this
		}
	}, CustomEvent );

	var Accordion = CustomEvent.extend( "Accordion", {
		init: function( target, option ) { //, keyId, isDittoShellSelect
			this._super();
			this.target = $( target );
			this.width = this.target.width();
			//this.height = this.target.height();
			//this.id = "Accordion" + "." + (id || $.now());
			this.container = null;
			this.shellCollection = null;
			this._selectShell = null;
			this.option = utilExtend.extend( {}, this.defaultSetting, option );
			this.create()._initHandler().enable();

			return this;
		},
		create: function() {
			this.container = $( $.createEle( "div" ) )
				.css( "position", "relative" )
				.addClass( "aquery-accordion" );
			var shells = this.target.children();
			this.container.append( shells ).appendTo( this.target );

			this.container.outerWidth( this.width );

			this.shellCollection = new ShellCollection( shells, this );
			return this;
		},
		_initHandler: function() {
			var self = this;
			//控制其他的
			//配置
			this.event = function( type, target, e ) {
				self.trigger( type, this, type, target, e );
			}

			return this;
		},
		enable: function() {
			this.shellCollection.on( "key.select", this.event )
				.on( "shell.open", this.event )
				.on( "shell.close", this.event )
				.on( "shell.select", this.event );
			return this;
		},
		disable: function() {
			this.shellCollection.off( "key.select", this.event )
				.off( "shell.open", this.event )
				.off( "shell.close", this.event )
				.off( "shell.select", this.event );
			return this;
		},
		render: function() {

		},
		defaultSetting: {
			oneSelect: 0
		},
		selectShell: function( shell ) {
			this.shellCollection.selectShell( shell );
			return this;
		}
	} );

	var accordion = Widget.extend( "ui.accordion", {
		container: null,
		customEventName: [ "key.select", "shell.open", "shell.close", "shell.select" ],
		event: function() {

		},
		enable: function() {
			this.disable();
			this.accordion.enable()
				.on( "key.select", this.event )
				.on( "shell.select", this.event )
				.on( "shell.open", this.event )
				.on( "shell.close", this.event );
			this.options.disabled = false;
		},
		disable: function() {
			this.accordion.disable()
				.on( "key.select", this.event )
				.on( "shell.select", this.event )
				.on( "shell.open", this.event )
				.on( "shell.close", this.event );
			this.options.disabled = true;
		},
		init: function( opt, target ) {
			this._super( opt, target );
			target.attr( "amdquery-ui", "accordion" );
			this.accordion = new Accordion( target[ 0 ], this.options );
			this.options = this.accordion.option;
			this._initHandler();
			this.able();
			return this;
		},
		options: {
			disable: 0,
			oneSelect: 0
		},
		setter: {
			disable: 0,
			oneSelect: 0
		},
		publics: {
			selectShell: Widget.AllowPublic
		},
		_initHandler: function() {
			var self = this;
			this.event = function( type, target, e ) {
				self.target.trigger( self.widgetEventPrefix + "." + type, self.target[ 0 ], target, e );
				var handler;
				switch ( type ) {
					case "key.select":
						( handler = target.customHandler ) && self.target.trigger( self.getEventName( "key." + handler ), this, target, e );
						break;
					case "shell.select":
						( handler = target.customHandler ) && self.target.trigger( self.getEventName( "shell." + handler ), this, target, e );
						break;
				}
			}
		},
		selectShell: function( shell ) {
			this.accordion.selectShell( shell );
		},
		target: null,
		toString: function() {
			return "ui.accordion";
		},
		widgetEventPrefix: "accordion"
	} );

	//提供注释
	$.fn.uiAccordion = function( a, b, c, args ) {
		/// <summary>可以参考charcode列表绑定快捷键
		/// <para>arr obj.keylist:快捷键列表</para>
		/// <para>{ type: "keyup", keyCode: "Enter" </para>
		/// <para>    , fun: function (e) { </para>
		/// <para>        todo(this, e); </para>
		/// <para>    }, combinationKey: ["alt","ctrls"] </para>
		/// <para>} </para>
		/// </summary>
		/// <param name="a" type="Object/String">初始化obj或属性名:option或方法名</param>
		/// <param name="b" type="String/null">属性option子属性名</param>
		/// <param name="c" type="any">属性option子属性名的值</param>
		/// <param name="args" type="any">在调用方法的时候，后面是方法的参数</param>
		/// <returns type="$" />
		return accordion.apply( this, arguments );
	}

	return Accordion;
} );

/*=======================================================*/

/*===================ui/button===========================*/
aQuery.define( "ui/button", [
    "base/client",
    "module/Widget",
    "main/query",
    "main/class",
    "main/event",
    "main/css",
    "main/position",
    "main/dom",
    "main/attr",
    "html5/css3"
  ],

	function( $, client, Widget, query, cls, event, css, position, dom, attr, css3 ) {
		"use strict";

		Widget.fetchCSS( "ui/css/button" );

		var button = Widget.extend( "ui.button", {
			container: null,
			_initHandler: function() {
				var self = this;
				this.buttonEvent = function( e ) {
					switch ( e.type ) {
						case "click":
							var para = {
								type: self.getEventName( "click" ),
								container: self.container,
								target: self.target[ 0 ],
								event: e
							};

							self.target.trigger( para.type, self.target[ 0 ], para );
							break;
					}
				};
				return this;
			},
			enable: function() {
				this.disable();
				this.target.on( "click", this.buttonEvent );
				this.options.disabled = false;
				return this;
			},
			disable: function() {
				this.target.off( "click", this.buttonEvent );
				this.options.disabled = true;
				return this;
			},
			render: function() {
				var opt = this.options,
					ie = client.browser.ie < 9;
				if ( ie ) {
					this.$text.remove();
				}
				this.$text.html( opt.text );
				if ( ie ) {
					this.$text.appendTo( this.container );
				}
				this.container.attr( "title", opt.title );
				return this;
			},
			init: function( opt, target ) {
				this._super( opt, target );

				target.addClass( this.options.defualtCssName );

				this.container = $( $.createEle( "a" ) ).css( {
					"display": "inline-block",
					"text-decoration": "none",
					"width": "100%",
					"height": "100%",
					"position": "relative"
				} ).addClass( "back" );

				this.$img = $( $.createEle( "div" ) ).css( {
					"display": "block",
					"text-decoration": "none",
					"position": "absolute",
					"width": "100%",
					"height": "100%"
				} ).addClass( "img" ).addClass( this.options.icon );

				this.$text = $( $.createEle( "a" ) ).css( {
					"display": "block",
					"text-decoration": "none",
					"position": "absolute",
					"float": "left",
					"width": "100%",
					"height": "100%"
				} ).addClass( "text" );

				this.container.append( this.$img ).append( this.$text );

				target.append( this.container );

				target.css( {
					"float": "left",
					"cursor": "pointer"
				} );

				this.$text.css3( "user-select", "none" );

				this._initHandler().enable().render();

				return this;
			},
			customEventName: [ "click" ],
			options: {
				defualtCssName: "aquery-button",
				text: "clickme",
				title: "",
				icon: "icon"
			},
			getter: {
				defualtCssName: 1,
				text: 1,
				title: 1,
				icon: 0
			},
			setter: {
				defualtCssName: 0,
				text: 1,
				title: 1,
				icon: 0
			},
			publics: {

			},
			target: null,
			toString: function() {
				return "ui.button";
			},
			widgetEventPrefix: "button"
		} );

		return button;
	} );

/*=======================================================*/

/*===================animation/tween.extend===========================*/
﻿aQuery.define( "animation/tween.extend", [ "base/extend", "animation/tween" ], function( $, utilExtend, tween, undefined ) {
	"use strict";
	var math = Math;
	utilExtend.easyExtend( tween, {
		quad: {
			easeIn: function( t, b, c, d ) {
				return c * ( t /= d ) * t + b;
			},
			easeOut: function( t, b, c, d ) {
				return -c * ( t /= d ) * ( t - 2 ) + b;
			},
			easeInOut: function( t, b, c, d ) {
				if ( ( t /= d / 2 ) < 1 ) return c / 2 * t * t + b;
				return -c / 2 * ( ( --t ) * ( t - 2 ) - 1 ) + b;
			}
		},
		cubic: {
			easeIn: function( t, b, c, d ) {
				return c * ( t /= d ) * t * t + b;
			},
			easeOut: function( t, b, c, d ) {
				return c * ( ( t = t / d - 1 ) * t * t + 1 ) + b;
			},
			easeInOut: function( t, b, c, d ) {
				if ( ( t /= d / 2 ) < 1 ) return c / 2 * t * t * t + b;
				return c / 2 * ( ( t -= 2 ) * t * t + 2 ) + b;
			}
		},
		quart: {
			easeIn: function( t, b, c, d ) {
				return c * ( t /= d ) * t * t * t + b;
			},
			easeOut: function( t, b, c, d ) {
				return -c * ( ( t = t / d - 1 ) * t * t * t - 1 ) + b;
			},
			easeInOut: function( t, b, c, d ) {
				if ( ( t /= d / 2 ) < 1 ) return c / 2 * t * t * t * t + b;
				return -c / 2 * ( ( t -= 2 ) * t * t * t - 2 ) + b;
			}
		},
		quint: {
			easeIn: function( t, b, c, d ) {
				return c * ( t /= d ) * t * t * t * t + b;
			},
			easeOut: function( t, b, c, d ) {
				return c * ( ( t = t / d - 1 ) * t * t * t * t + 1 ) + b;
			},
			easeInOut: function( t, b, c, d ) {
				if ( ( t /= d / 2 ) < 1 ) return c / 2 * t * t * t * t * t + b;
				return c / 2 * ( ( t -= 2 ) * t * t * t * t + 2 ) + b;
			}
		},
		sine: {
			easeIn: function( t, b, c, d ) {
				return -c * math.cos( t / d * ( math.PI / 2 ) ) + c + b;
			},
			easeOut: function( t, b, c, d ) {
				return c * math.sin( t / d * ( math.PI / 2 ) ) + b;
			},
			easeInOut: function( t, b, c, d ) {
				return -c / 2 * ( math.cos( math.PI * t / d ) - 1 ) + b;
			}
		},
		expo: {
			easeIn: function( t, b, c, d ) {
				return ( t == 0 ) ? b : c * math.pow( 2, 10 * ( t / d - 1 ) ) + b;
			},
			easeOut: function( t, b, c, d ) {
				return ( t == d ) ? b + c : c * ( -math.pow( 2, -10 * t / d ) + 1 ) + b;
			},
			easeInOut: function( t, b, c, d ) {
				if ( t == 0 ) return b;
				if ( t == d ) return b + c;
				if ( ( t /= d / 2 ) < 1 ) return c / 2 * math.pow( 2, 10 * ( t - 1 ) ) + b;
				return c / 2 * ( -math.pow( 2, -10 * --t ) + 2 ) + b;
			}
		},
		circ: {
			easeIn: function( t, b, c, d ) {
				return -c * ( math.sqrt( 1 - ( t /= d ) * t ) - 1 ) + b;
			},
			easeOut: function( t, b, c, d ) {
				return c * math.sqrt( 1 - ( t = t / d - 1 ) * t ) + b;
			},
			easeInOut: function( t, b, c, d ) {
				if ( ( t /= d / 2 ) < 1 ) return -c / 2 * ( math.sqrt( 1 - t * t ) - 1 ) + b;
				return c / 2 * ( math.sqrt( 1 - ( t -= 2 ) * t ) + 1 ) + b;
			}
		},
		elastic: {
			easeIn: function( t, b, c, d, a, p ) {
				if ( t == 0 ) return b;
				if ( ( t /= d ) == 1 ) return b + c;
				if ( !p ) p = d * .3;
				if ( !a || a < math.abs( c ) ) {
					a = c;
					var s = p / 4;
				} else {
					var s = p / ( 2 * math.PI ) * math.asin( c / a );
				}
				return -( a * math.pow( 2, 10 * ( t -= 1 ) ) * math.sin( ( t * d - s ) * ( 2 * math.PI ) / p ) ) + b;
			},
			easeOut: function( t, b, c, d, a, p ) {
				if ( t == 0 ) return b;
				if ( ( t /= d ) == 1 ) return b + c;
				if ( !p ) p = d * .3;
				if ( !a || a < math.abs( c ) ) {
					a = c;
					var s = p / 4;
				} else {
					var s = p / ( 2 * math.PI ) * math.asin( c / a );
				}
				return ( a * math.pow( 2, -10 * t ) * math.sin( ( t * d - s ) * ( 2 * math.PI ) / p ) + c + b );
			},
			easeInOut: function( t, b, c, d, a, p ) {
				if ( t == 0 ) return b;
				if ( ( t /= d / 2 ) == 2 ) return b + c;
				if ( !p ) p = d * ( .3 * 1.5 );
				if ( !a || a < math.abs( c ) ) {
					a = c;
					var s = p / 4;
				} else {
					var s = p / ( 2 * math.PI ) * math.asin( c / a );
				}
				if ( t < 1 ) return -.5 * ( a * math.pow( 2, 10 * ( t -= 1 ) ) * math.sin( ( t * d - s ) * ( 2 * math.PI ) / p ) ) + b;
				return a * math.pow( 2, -10 * ( t -= 1 ) ) * math.sin( ( t * d - s ) * ( 2 * math.PI ) / p ) * .5 + c + b;
			}
		},
		back: {
			easeIn: function( t, b, c, d, s ) {
				if ( s == undefined ) s = 1.70158;
				return c * ( t /= d ) * t * ( ( s + 1 ) * t - s ) + b;
			},
			easeOut: function( t, b, c, d, s ) {
				if ( s == undefined ) s = 1.70158;
				return c * ( ( t = t / d - 1 ) * t * ( ( s + 1 ) * t + s ) + 1 ) + b;
			},
			easeInOut: function( t, b, c, d, s ) {
				if ( s == undefined ) s = 1.70158;
				if ( ( t /= d / 2 ) < 1 ) return c / 2 * ( t * t * ( ( ( s *= ( 1.525 ) ) + 1 ) * t - s ) ) + b;
				return c / 2 * ( ( t -= 2 ) * t * ( ( ( s *= ( 1.525 ) ) + 1 ) * t + s ) + 2 ) + b;
			}
		},
		bounce: {
			easeIn: function( t, b, c, d ) {
				return c - tween.Bounce.easeOut( d - t, 0, c, d ) + b;
			},
			easeOut: function( t, b, c, d ) {
				if ( ( t /= d ) < ( 1 / 2.75 ) ) {
					return c * ( 7.5625 * t * t ) + b;
				} else if ( t < ( 2 / 2.75 ) ) {
					return c * ( 7.5625 * ( t -= ( 1.5 / 2.75 ) ) * t + .75 ) + b;
				} else if ( t < ( 2.5 / 2.75 ) ) {
					return c * ( 7.5625 * ( t -= ( 2.25 / 2.75 ) ) * t + .9375 ) + b;
				} else {
					return c * ( 7.5625 * ( t -= ( 2.625 / 2.75 ) ) * t + .984375 ) + b;
				}
			},
			easeInOut: function( t, b, c, d ) {
				if ( t < d / 2 ) return tween.Bounce.easeIn( t * 2, 0, c, d ) * .5 + b;
				else return tween.Bounce.easeOut( t * 2 - d, 0, c, d ) * .5 + c * .5 + b;
			}
		}
	} );

	return tween;

} );

/*=======================================================*/

/*===================html5/css3.position===========================*/
aQuery.define( "html5/css3.position", [ "base/support", "main/position", "html5/css3" ], function( $, support, position, css3 ) {
  "use strict";
  this.describe( "Get positionX: left + translateX" );
  var css3Position = {
    getPositionX: function( ele ) {
      var x = position.getOffsetL( ele );
      if ( support.transform3d ) {
        x += css3.getTransform3dByName( ele, "translateX", true );
      }
      return x;
    },
    setPositionX: function( ele, isTransform3d, x ) {
      if ( isTransform3d && support.transform3d ) {
        css3.setTranslate3d( ele, {
          tx: x
        } );
      } else {
        position.setOffsetL( ele, x );
      }
      return this;
    },
    getPositionY: function( ele ) {
      var y = position.getOffsetT( ele );
      if ( support.transform3d ) {
        y += css3.getTransform3dByName( ele, "translateY", true );
      }
      return y;
    },
    setPositionY: function( ele, isTransform3d, y ) {
      if ( isTransform3d && support.transform3d ) {
        css3.setTranslate3d( ele, {
          ty: y
        } );
      } else {
        position.setOffsetT( ele, y );
      }
      return this;
    },
    getPositionXY: function( ele ) {
      return {
        x: this.getPositionX( ele ),
        y: this.getPositionY( ele )
      }
    },
    setPositionXY: function( ele, isTransform3d, pos ) {
      if ( isTransform3d && support.transform3d ) {
        var opt = {};
        pos.x !== undefined && ( opt.tx = pos.x );
        pos.y !== undefined && ( opt.ty = pos.y );
        css3.setTranslate3d( ele, opt );
      } else {
        pos.x !== undefined && position.setOffsetL( ele, pos.x );
        pos.y !== undefined && position.setOffsetT( ele, pos.y );
      }
      return this;
    },
    getLeftWithTranslate3d: function( ele ) {
      var t = this.getPositionX( ele ) || 0,
        cur = ele.offsetParent;
      while ( cur != null ) {
        t += this.getPositionX( cur );
        cur = cur.offsetParent;
      }
      return t;
    },
    getTopWithTranslate3d: function( ele ) {
      var t = this.getPositionY( ele ) || 0,
        cur = ele.offsetParent;
      while ( cur != null ) {
        t += this.getPositionY( cur );
        cur = cur.offsetParent;
      }
      return t;
    }
  };

  $.extend( css3Position );

  $.fn.extend( {
    getPositionX: function( ) {
      return css3Position.getPositionX( this[ 0 ] );
    },
    setPositionX: function( isTransform3d, x ) {
      return this.each( function( ele ) {
        css3Position.setPositionX( ele, isTransform3d, x );
      } );
    },
    getPositionY: function( ) {
      return css3Position.getPositionY( this[ 0 ] );
    },
    setPositionY: function( isTransform3d, y ) {
      return this.each( function( ele ) {
        css3Position.setPositionY( ele, isTransform3d, y );
      } );
    },
    getPositionXY: function( ) {
      return {
        x: css3Position.getPositionX( this[ 0 ] ),
        y: css3Position.getPositionY( this[ 0 ] )
      }
    },
    setPositionXY: function( isTransform3d, pos ) {
      return this.each( function( ele ) {
        css3Position.setPositionXY( ele, isTransform3d, pos );
      } );
    },
    getLeftWithTranslate3d: function( ) {
      return css3Position.getLeftWithTranslate3d( this[ 0 ] );
    },
    getTopWithTranslate3d: function( ) {
      return css3Position.getTopWithTranslate3d( this[ 0 ] )
    }
  } );

} );

/*=======================================================*/

/*===================ui/draggable===========================*/
﻿aQuery.define( "ui/draggable", [
  "base/config",
  "base/support",
  "module/Widget",
  "main/event",
  "main/css",
  "main/position",
  "main/dom",
  "main/query",
  "animation/FX",
  "animation/animate",
  "animation/tween.extend",
  "html5/animate.transform",
  "html5/css3.transition.animate",
  "html5/css3",
  "html5/css3.position"
   ], function( $,
	config,
	support,
	Widget,
	event,
	css,
	position,
	dom,
	query,
	FX,
	animate,
	tween,
	animateTransform,
	css3Transition,
	css3,
	css3Position,
	undefined ) {
	"use strict";
	var isTransform3d = !! config.ui.isTransform3d && support.transform3d;

	var initPositionParent, getPositionX, getPositionY;
	if ( isTransform3d ) {
		initPositionParent = function() {
			this.container.initTransform3d();
			if ( this.options.container ) {
				this.positionParent = this.container;
			} else {
				this.positionParent = this.target.parent();
			}
			return this;
		};

	} else {
		initPositionParent = function() {
			var result;
			this.target.parents().each( function( ele ) {
				switch ( $.style( ele, "position" ) ) {
					case "absolute":
					case "relative":
						result = ele;
						return false;
				}
			} );
			if ( !result ) {
				result = document.body;
				$.css( result, "position", "relative" );
			}

			this.positionParent = $( result );

			return this;
		};
	}

	var eventFuns = event.document,
		draggable = Widget.extend( "ui.draggable", {
			container: null,
			create: function() {
				// var self = this;

				this.container.css( "overflow", "hidden" );

				this.target.css( "position", "absolute" );

				this._initHandler();

				this.initPositionParent();

				this._setOverflow();

				this.enable();

				return this;
			},
			customEventName: [ "start", "move", "stop", "pause", "revert" ],
			enable: function() {
				var fun = this.draggableEvent;
				this.disable();
				$( "body" ).on( "mouseup", fun );
				this.container.on( "mousemove mouseup", fun );
				this.target.on( "mousedown", fun );
				this.options.disabled = false;
				return this;
			},
			disable: function() {
				var fun = this.draggableEvent;
				$( "body" ).off( "mouseup", fun );
				this.container.off( "mousemove mouseup", fun );
				this.target.off( "mousedown", fun );
				this.options.disabled = true;
				return this;
			},
			init: function( opt, target ) {
				this._super( opt, target );
				this.container = $( this.options.container || document.body );
				return this.create().render();
			},
			initPositionParent: initPositionParent,
			_setOverflow: function( overflow ) {
				if ( overflow !== undefined ) {
					this.options.overflow = overflow;
				}
				if ( this.positionParent ) {
					if ( this.options.overflow === true || this.options.overflow === 1 ) {
						this.positionParent.css( {
							"overflow": "hidden"
						} );
					} else {
						this.positionParent.css( "overflow", "" );
					}
				}
			},
			_setContainer: function( container ) {
				if ( this.options.container === null ) {
					this.options.container = container;
				}
			},
			options: {
				container: null,
				x: 0,
				y: 0,
				originX: 0,
				originY: 0,
				diffx: 0,
				diffy: 0,
				vertical: true,
				horizontal: true,
				cursor: "default",
				overflow: false,
				keepinner: true,
				innerWidth: 0,
				innerHeight: 0,
				outerWidth: 0,
				outerHeight: 0,
				isEase: false,
				stopPropagation: true,
				pauseSensitivity: 500,
				revert: false,
				revertDuration: FX.normal,
				revertEasing: tween.expo.easeOut
			},
			setter: {
				x: 0,
				y: 0,
				originX: 0,
				originY: 0,
				diffx: 0,
				diffy: 0,
				cursor: 0
			},
			publics: {
				getPositionX: Widget.AllowReturn,
				getPositionY: Widget.AllowReturn,
				render: Widget.AllowPublic,
				animateTo: Widget.AllowPublic
			},
			getPositionX: function() {
				return this.target.getLeftWithTranslate3d();
			},
			getPositionY: function() {
				return this.target.getTopWithTranslate3d();
			},
			_initHandler: function() {
				var self = this,
					target = self.target,
					opt = self.options,
					timeout,
					parentLeft = null,
					parentTop = null,
					dragging = null;
				this.draggableEvent = function( e ) {
					var offsetLeft, offsetTop, x, y, para = {};
					if ( e.type !== "mousemove" || dragging ) {
						offsetLeft = self.getPositionX();
						offsetTop = self.getPositionY();
						x = e.pageX || e.clientX;
						y = e.pageY || e.clientY;
						para = {
							type: self.getEventName( "start" ),
							container: self.container,
							clientX: x,
							clientY: y,
							offsetX: e.offsetX || e.layerX || x - offsetLeft,
							offsetY: e.offsetY || e.layerY || y - offsetTop,
							originX: null,
							originY: null,
							event: e,
							target: this
						};
					}
					switch ( e.type ) {
						case "touchstart":
						case "mousedown":
							dragging = target;
							opt.diffx = x - offsetLeft;
							opt.diffy = y - offsetTop;
							parentLeft = self.positionParent.getLeftWithTranslate3d();
							parentTop = self.positionParent.getTopWithTranslate3d();
							para.originX = opt.originX = x - opt.diffx - parentLeft;
							para.originY = opt.originY = y - opt.diffy - parentTop;

							if ( opt.disabled ) {
								opt.cursor = "default";
							} else {
								if ( opt.vertical && opt.horizontal ) {
									opt.cursor = "move";
								} else if ( opt.horizontal ) {
									opt.cursor = "e-resize";
								} else if ( opt.vertical ) {
									opt.cursor = "n-resize";
								}
							}
							self.target.css( {
								cursor: opt.cursor
							} );

							eventFuns.preventDefault( e );
							if ( opt.stopPropagation ) {
								eventFuns.stopPropagation( e );
							}
							target.trigger( para.type, target[ 0 ], para );
							break;
						case "touchmove":
						case "mousemove":
							if ( dragging !== null ) {
								x -= ( opt.diffx + parentLeft );
								y -= ( opt.diffy + parentTop );

								self.render( x, y, parentLeft, parentTop );

								eventFuns.preventDefault( e );
								para.type = self.getEventName( "move" );
								para.offsetX = opt.x;
								para.offsetY = opt.y;
								para.originX = opt.originX;
								para.originY = opt.originY;
								target.trigger( para.type, target[ 0 ], para );

								clearTimeout( timeout );
								timeout = setTimeout( function() {
									para.type = self.getEventName( "pause" );
									target.trigger( para.type, target[ 0 ], para );
								}, opt.pauseSensitivity );
							}
							break;
						case "touchend":
						case "mouseup":
							clearTimeout( timeout );
							eventFuns.preventDefault( e );
							if ( opt.stopPropagation ) {
								eventFuns.stopPropagation( e );
							}
							para.type = self.getEventName( "stop" );
							para.offsetX = opt.x;
							para.offsetY = opt.y;
							para.originX = opt.originX;
							para.originY = opt.originY;
							dragging = null;

							self.target.css( {
								cursor: "pointer"
							} );
							target.trigger( para.type, target[ 0 ], para );

							if ( opt.revert ) {
								self.animateTo( opt.originX, opt.originY, opt.revertDuration, opt.revertEasing, function() {
									para.type = "revert";
									target.trigger( para.type, target[ 0 ], para );
								} );
							}
							break;
					}
				};

			},
			animateTo: function( x, y, duration, easing, complete ) {
				this.target.animate( $.getPositionAnimationOptionProxy( isTransform3d, x, y ), {
					duration: duration,
					easing: easing,
					complete: complete
				} );
			},
			_render: function( x, y ) {
				var pos = {}, opt = this.options;
				if ( opt.horizontal ) {
					pos.x = x;
				}
				if ( opt.vertical ) {
					pos.y = y;
				}
				this.target.setPositionXY( isTransform3d, pos );
			},
			render: function( x, y, parentLeft, parentTop ) {
				if ( !arguments.length ) {
					return;
				}
				var
				opt = this.options,
					con = this.container;

				parentLeft = parentLeft || this.positionParent.getLeftWithTranslate3d();
				parentTop = parentTop || this.positionParent.getTopWithTranslate3d();

				if ( opt.keepinner && con[ 0 ] ) {

					var pageLeft = con.getLeftWithTranslate3d() - parentLeft;
					var pageTop = con.getTopWithTranslate3d() - parentTop;

					var diffWidth = con.width() - this.target.width();
					var diffHeight = con.height() - this.target.height();

					var boundaryWidth = diffWidth > 0 ? opt.outerWidth : opt.innerWidth;
					var boundaryHeight = diffHeight > 0 ? opt.outerHeight : opt.innerHeight;

					x = $.among( pageLeft + boundaryWidth, diffWidth + pageLeft - boundaryWidth, x );
					y = $.among( pageTop + boundaryHeight, diffHeight + pageTop - boundaryHeight, y );

				}

				opt.x = x;
				opt.y = y;

				return this._render( x, y );
			},
			target: null,
			toString: function() {
				return "ui.draggable";
			},
			widgetEventPrefix: "drag"
		} );

	return draggable;

} );

/*=======================================================*/

/*===================ui/flex===========================*/
aQuery.define( "ui/flex", [
    "base/client",
    "base/typed",
    "base/support",
    "module/Widget",
    "main/query",
    "main/class",
    "main/event",
    "main/css",
    "main/position",
    "main/dom",
    "main/attr",
    "html5/css3"
  ],
	function( $, client, typed, support, Widget, query, cls, event, css, position, dom, attr, css3 ) {
		"use strict";

		function debounce( fun, wait, immediate ) {
			//undefinded does not work well when titanium
			var timeout = null,
				result = null;
			return function() {
				var context = this,
					args = arguments;
				var later = function() {
					timeout = null;
					if ( !immediate ) result = fun.apply( context, args );
				};
				var callNow = immediate && !timeout;
				clearTimeout( timeout );
				timeout = setTimeout( later, wait );
				if ( callNow ) result = fun.apply( context, args );
				return result;
			};
		};

		Widget.fetchCSS( "ui/css/flex" );

		var domStyle = document.documentElement.style,
			proto,
			flexName = "",
			flexDirectionName = "";

		if ( "flex" in domStyle ) {
			flexName = "flex";
			flexDirectionName = "flexDirection";

		} else if ( ( $.css3Head + "Flex" ) in domStyle ) {
			flexName = $.css3Head + "Flex";
			flexDirectionName = $.css3Head + "FlexDirection";
		}

		support.box = !! flexName;

		if ( support.box ) {
			var originFlexValue = domStyle[ flexName ],
				originFlexDirectionValue = domStyle[ flexDirectionName ];

			proto = {
				container: null,
				_initHandler: function() {
					// var self = this;
					var self = this;

					this.flexEvent = debounce( function() {
						self.resize();
					}, 50 );

					return this;
				},
				enable: function() {
					// if ( !this.findParent( ) ) {
					event.document.addHandler( window, "resize", this.flexEvent );
					// }
					this.options.disabled = false;
					return this;
				},
				disable: function() {
					// if ( !this.findParent( ) ) {
					event.document.removeHandler( window, "resize", this.flexEvent );
					// }
					this.options.disabled = true;
					return this;
				},
				render: function( width, height ) {
					if ( !typed.isNul( width ) ) {
						this.setWidth( width );
					}
					if ( !typed.isNul( height ) ) {
						this.setHeight( height );
					}
					var opt = this.options;
					if ( opt.flex !== originFlexValue ) {
						//fix css + px because this is original string
						this.target.css( flexName, opt.flex + "" );
					}
					if ( opt.flexDirection !== originFlexDirectionValue ) {
						this.target.css( flexDirectionName, opt.flexDirection + "" );
					}

					var eventName = this.getEventName( "resize" );

					this.target.trigger( eventName, this.target[ 0 ], {
						type: eventName,
						target: this.target[ 0 ],
						width: this.target.width(),
						height: this.target.height()
					} );

					return this;
				},
				resize: function( width, height ) {
					this.render( width, height );
				},
				findParent: function() {
					var parent = this.target.parent( "[ui-flex]" );
					if ( parent.length && parent[ 0 ] === this.target[ 0 ].parentNode ) {
						return parent;
					}
					return null;
				},
				noticeParent: function() {},
				setWidth: function( width ) {
					this.target.width( width );
				},
				setHeight: function( height ) {
					this.target.height( height );
				},
				_setFlex: function( flex ) {
					this.options.flex = flex;
				},
				init: function( opt, target ) {
					this._super( opt, target );
					this.target.addClass( "aquery-flex" );
					if ( !this.findParent() || ( typed.isNode( this.target[ 0 ], "iframe" ) && client.browser.ie >= 10 ) ) {
						if ( this.options.fillParentWidth ) {
							this.target.css( "width", "100%" );
						}
						if ( this.options.fillParentHeight ) {
							this.target.css( "height", "100%" );
						}
					}
					this._initHandler().enable().render();
					return this;
				},
				customEventName: [],
				options: {
					flex: originFlexValue,
					flexDirection: originFlexDirectionValue,
					fillParentWidth: true,
					fillParentHeight: true
				},
				getter: {

				},
				setter: {

				},
				publics: {
					setWidth: Widget.AllowPublic,
					setHeight: Widget.AllowPublic,
					resize: Widget.AllowPublic,
					noticeParent: Widget.AllowPublic
				},
				target: null,
				toString: function() {
					return "ui.flex";
				},
				widgetEventPrefix: "flex",
				destroy: function() {
					this.target.css( flexName, originFlexValue );
					this.target.css( flexDirectionName, originFlexDirectionValue );
					Widget.invoke( "destroy", this );
					return this;
				},
				initIndex: 1000
			};
		} else {
			proto = {
				container: null,
				_initHandler: function() {
					// var self = this;
					var self = this;

					this.flexEvent = function( e ) {
						switch ( e.type ) {
							case Widget.changeEventName:
								self.detect();
								break;
						}
					};

					this.resizeEvent = debounce( function() {
						self.fillParent();
						self.render();
					}, 50 );

					return this;
				},
				enable: function() {
					if ( !this.findParent() ) {
						event.document.addHandler( window, "resize", this.resizeEvent );
						this.target.on( Widget.detectEventName, this.flexEvent );
					}
					this.options.disabled = false;
					return this;
				},
				disable: function() {
					if ( !this.findParent() ) {
						event.document.removeHandler( window, "resize", this.resizeEvent );
						this.target.off( Widget.detectEventName, this.flexEvent );
					}
					this.options.disabled = true;
					return this;
				},
				render: function( width, height ) {
					if ( !typed.isNul( width ) ) {
						this.target.width( width );
					}
					if ( !typed.isNul( height ) ) {
						this.target.height( height );
					}

					this.width = this.target.width();
					this.height = this.target.height();

					this.toDirection( this.options.flexDirection );

					var eventName = this.getEventName( "resize" );
					this.target.trigger( eventName, this.target[ 0 ], {
						type: eventName,
						target: this.target[ 0 ],
						width: this.width,
						height: this.height
					} );

					//来自父元素的
					if ( this._lock === false ) {
						this.noticeParent();
					}

					return this;
				},
				detect: function() {
					this.toDirection( this.options.flexDirection );
				},
				resize: function( width, height ) {
					this.render( width, height );
				},
				setWidth: function( width ) {
					this.render( width, null );
				},
				setHeight: function( height ) {
					this.render( null, height );
				},
				_setFlexDirection: function( flexDirection ) {
					var opt = this.options;
					switch ( flexDirection ) {
						case "row":
							opt.flexDirection = flexDirection;
							break;
						case "column":
							opt.flexDirection = flexDirection;
							break;
					}
				},
				_setFlex: function( flex ) {
					if ( typed.isNum( flex ) && flex >= 0 ) {
						if ( this.options.flex !== flex ) {
							this.options.flex = flex;
						}
					}
				},
				filterFlex: function() {
					var children = this.target.children(),
						opt = this.options,
						$item,
						flexTarget = [],
						itemFlex,
						totalFlex = 0,
						$lastItem = null,
						isFlex,
						hasFlex,
						traceWidth = this.width,
						traceHeight = this.height;

					children.each( function( ele ) {
						$item = $( ele );
						isFlex = $item.isWidget( "ui.flex" );
						itemFlex = 0;
						$item.isFlex = isFlex;
						if ( isFlex ) {
							itemFlex = $item.uiFlex( "option", "flex" );
						}
						hasFlex = itemFlex > 0;
						$item.hasFlex = hasFlex;
						if ( isFlex && hasFlex ) {
							totalFlex += itemFlex;
							$lastItem = $item;
						} else {
							if ( opt.flexDirection === "row" ) {
								traceWidth -= $item.outerWidth();
							} else if ( opt.flexDirection === "column" ) {
								traceHeight -= $item.outerHeight();
							}
						}
						flexTarget.push( $item );
					} );

					traceWidth = Math.max( traceWidth, 0 );
					traceHeight = Math.max( traceHeight, 0 );
					if ( $lastItem ) {
						$lastItem.isLastItem = true;
					}
					return {
						flexTarget: flexTarget,
						totalFlex: totalFlex,
						traceWidth: traceWidth,
						traceHeight: traceHeight
					};
				},
				toDirection: function( direction ) {
					var ret = this.filterFlex(),
						flexTarget = ret.flexTarget,
						totalFlex = ret.totalFlex,
						traceWidth = ret.traceWidth,
						traceHeight = ret.traceHeight,
						$item, i = 0,
						len = flexTarget.length,
						sumWidth = 0,
						sumHeight = 0,
						tempWidth = null,
						tempHeight = null,
						itemFlex,
						isFillParentWidth = false,
						isFillParentHeight = false;

					for ( ; i < len; i++ ) {
						$item = flexTarget[ i ];
						$item.css( "display", "block" );
						switch ( direction ) {
							case "row":
								$item.css( "float", "left" );
								break;
							case "column":
								$item.css( "clear", "both" );
								break;
						}

						if ( $item.isFlex ) {
							tempWidth = null;
							tempHeight = null;
							isFillParentHeight = $item.uiFlex( "option", "fillParentHeight" );
							isFillParentWidth = $item.uiFlex( "option", "fillParentWidth" );
							itemFlex = $item.uiFlex( "option", "flex" );
							if ( itemFlex > 0 ) {
								if ( direction === "row" ) {
									if ( traceWidth > 0 ) {
										tempWidth = Math.round( itemFlex / totalFlex * traceWidth );
										if ( $item.isLastItem ) {
											tempWidth = traceWidth - sumWidth;
										} else {
											sumWidth += tempWidth;
										}
									}
									if ( isFillParentHeight ) {
										tempHeight = traceHeight;
									}
								} else if ( direction === "column" ) {
									if ( traceHeight > 0 ) {
										tempHeight = Math.round( itemFlex / totalFlex * traceHeight );
										if ( $item.isLastItem ) {
											tempHeight = traceHeight - sumHeight;
										} else {
											sumHeight += tempHeight;
										}
									}
									if ( isFillParentWidth ) {
										tempWidth = traceWidth;
									}
								}

							} else {
								if ( isFillParentWidth ) {
									tempWidth = traceWidth;
								}
								if ( isFillParentHeight ) {
									tempHeight = traceHeight;
								}
							}
							$item.uiFlex( "lock" );
							$item.uiFlex( "resize", tempWidth, tempHeight );
							$item.uiFlex( "unlock" );
						}
					}
					return this;
				},
				noticeParent: function() {
					var parent = this.findParent();
					if ( parent ) {
						parent.uiFlex( "resize" );
					}
				},
				_doAfterInit: function() {
					if ( !this.options.initWithParent ) {
						this.noticeParent();
					}
				},
				findParent: function() {
					var parent = this.target.parent( "*[amdquery-widget*='ui.flex']" );
					if ( parent.length && parent[ 0 ] === this.target[ 0 ].parentNode ) {
						return parent;
					}
					return null;
				},
				lock: function() {
					this._lock = true;
				},
				unlock: function() {
					this._lock = false;
				},
				fillParent: function() {
					if ( this.options.fillParentWidth ) {
						this.target.width( this.target.parent().width() );
					}
					if ( this.options.fillParentHeight ) {
						this.target.height( this.target.parent().height() );
					}
				},
				init: function( opt, target ) {
					this._super( opt, target );
					var self = this;
					this._lock = false;
					this.width = 0;
					this.height = 0;
					this.traceWidth = 0;
					this.traceHeight = 0;
					this._initHandler().enable();

					var $item;

					this.target.children().each( function( ele ) {
						$item = $( ele );
						if ( $item.isWidget( "ui.flex" ) ) {
							$item.uiFlex( {
								initWithParent: true
							} );
						}
					} );

					if ( !self.findParent() ) {
						self.fillParent();
						self.render();
					}
					// else {
					//   if ( !self.options.initWithParent ) {
					//     setTimeout( function( ) {
					//       self.noticeParent( );
					//     }, 0 );
					//   }
					// }

					return this;
				},
				customEventName: [ "resize" ],
				options: {
					flex: 0,
					flexDirection: "row",
					fillParentWidth: true,
					fillParentHeight: true,
					initWithParent: false
				},
				getter: {
					initWithParent: false
				},
				setter: {

				},
				publics: {
					setWidth: Widget.AllowPublic,
					setHeight: Widget.AllowPublic,
					resize: Widget.AllowPublic,
					lock: Widget.AllowPublic,
					unlock: Widget.AllowPublic
				},
				target: null,
				toString: function() {
					return "ui.flex";
				},
				widgetEventPrefix: "flex",
				initIndex: 1000
			};
		}

		var flex = Widget.extend( "ui.flex", proto, {
			flexName: flexName
		} );

		return flex;
	} );

/*=======================================================*/

/*===================hash/charcode===========================*/
﻿define( "hash/charcode", [ "base/client" ], function( client ) {
	/**
	 * @pubilc
	 * @requires module:base/client
   * @module hash/charcode
	 * @property {Object}  codeToStringReflect     - Code to string.
	 * @property {String}  codeToStringReflect.108 - "Enter"
	 * @property {String}  codeToStringReflect.112 - "F1"
	 * @property {String}  codeToStringReflect.113 - "F2"
	 * @property {String}  codeToStringReflect.114 - "F3"
	 * @property {String}  codeToStringReflect.115 - "F4"
	 * @property {String}  codeToStringReflect.116 - "F5"
	 * @property {String}  codeToStringReflect.117 - "F6"
	 * @property {String}  codeToStringReflect.118 - "F7"
	 * @property {String}  codeToStringReflect.119 - "F8"
	 * @property {String}  codeToStringReflect.120 - "F9"
	 * @property {String}  codeToStringReflect.121 - "F10"
	 * @property {String}  codeToStringReflect.122 - "F11"
	 * @property {String}  codeToStringReflect.123 - "F12"
	 * @property {String}  codeToStringReflect.8   - "BackSpace"
	 * @property {String}  codeToStringReflect.9   - "Tab"
	 * @property {String}  codeToStringReflect.12  - "Clear"
	 * @property {String}  codeToStringReflect.13  - "enter"
	 * @property {String}  codeToStringReflect.19  - "Pause"
	 * @property {String}  codeToStringReflect.20  - "Caps Lock"
	 * @property {String}  codeToStringReflect.27  - "Escape"
	 * @property {String}  codeToStringReflect.32  - "space"
	 * @property {String}  codeToStringReflect.33  - "PageUp"
	 * @property {String}  codeToStringReflect.34  - "PageDown"
	 * @property {String}  codeToStringReflect.35  - "End"
	 * @property {String}  codeToStringReflect.36  - "Home"
	 * @property {String}  codeToStringReflect.37  - "Left"
	 * @property {String}  codeToStringReflect.38  - "Up"
	 * @property {String}  codeToStringReflect.39  - "Right"
	 * @property {String}  codeToStringReflect.40  - "Down"
	 * @property {String}  codeToStringReflect.41  - "Select"
	 * @property {String}  codeToStringReflect.42  - "Print"
	 * @property {String}  codeToStringReflect.43  - "Execute"
	 * @property {String}  codeToStringReflect.45  - "Insert"
	 * @property {String}  codeToStringReflect.46  - "Delete"
	 * @property {String}  codeToStringReflect.91  - "LeftCommand"
	 * @property {String}  codeToStringReflect.93  - "RightCommand"
	 * @property {String}  codeToStringReflect.224 - "Command"
   *
   * @property {Object}  stringToCodeReflect              - String to code.
   * @property {Number}  stringToCodeReflect.Enter        - 108
   * @property {Number}  stringToCodeReflect.F1           - 112
   * @property {Number}  stringToCodeReflect.F2           - 113
   * @property {Number}  stringToCodeReflect.F3           - 114
   * @property {Number}  stringToCodeReflect.F4           - 115
   * @property {Number}  stringToCodeReflect.F5           - 116
   * @property {Number}  stringToCodeReflect.F6           - 117
   * @property {Number}  stringToCodeReflect.F7           - 118
   * @property {Number}  stringToCodeReflect.F8           - 119
   * @property {Number}  stringToCodeReflect.F9           - 120
   * @property {Number}  stringToCodeReflect.F10          - 121
   * @property {Number}  stringToCodeReflect.F11          - 122
   * @property {Number}  stringToCodeReflect.F12          - 123
   * @property {Number}  stringToCodeReflect.BackSpace    - 8
   * @property {Number}  stringToCodeReflect.Tab          - 9
   * @property {Number}  stringToCodeReflect.Clear        - 12
   * @property {Number}  stringToCodeReflect.enter        - 13
   * @property {Number}  stringToCodeReflect.Pause        - 19
   * @property {Number}  stringToCodeReflect.Caps Lock    - 20
   * @property {Number}  stringToCodeReflect.Escape       - 27
   * @property {Number}  stringToCodeReflect.space        - 32
   * @property {Number}  stringToCodeReflect.PageUp       - 33
   * @property {Number}  stringToCodeReflect.PageDown     - 34
   * @property {Number}  stringToCodeReflect.End          - 35
   * @property {Number}  stringToCodeReflect.Home         - 36
   * @property {Number}  stringToCodeReflect.Left         - 37
   * @property {Number}  stringToCodeReflect.Up           - 38
   * @property {Number}  stringToCodeReflect.Right        - 39
   * @property {Number}  stringToCodeReflect.Down         - 40
   * @property {Number}  stringToCodeReflect.Select       - 41
   * @property {Number}  stringToCodeReflect.Print        - 42
   * @property {Number}  stringToCodeReflect.Execute      - 43
   * @property {Number}  stringToCodeReflect.Insert       - 45
   * @property {Number}  stringToCodeReflect.Delete       - 46
   * @property {Number}  stringToCodeReflect.LeftCommand  - client.browser.firefox ? 224 : 91
   * @property {Number}  stringToCodeReflect.RightCommand - client.browser.firefox ? 224 : 93
	 */
	return {
		codeToStringReflect: {
			108: "Enter",
			112: "F1",
			113: "F2",
			114: "F3",
			115: "F4",
			116: "F5",
			117: "F6",
			118: "F7",
			119: "F8",
			120: "F9",
			121: "F10",
			122: "F11",
			123: "F12",
			8: "BackSpace",
			9: "Tab",
			12: "Clear",
			13: "enter",
			19: "Pause",
			20: "Caps Lock",
			27: "Escape",
			32: "space",
			33: "PageUp",
			34: "PageDown",
			35: "End",
			36: "Home",
			37: "Left",
			38: "Up",
			39: "Right",
			40: "Down",
			41: "Select",
			42: "Print",
			43: "Execute",
			45: "Insert",
			46: "Delete",
			91: "LeftCommand",
			93: "RightCommand",
			224: "Command"
		},
		stringToCodeReflect: {
			"Enter": 108,
			"F1": 112,
			"F2": 113,
			"F3": 114,
			"F4": 115,
			"F5": 116,
			"F6": 117,
			"F7": 118,
			"F8": 119,
			"F9": 120,
			"F10": 121,
			"F11": 122,
			"F12": 123,
			"BackSpace": 8,
			"Tab": 9,
			"Clear": 12,
			"enter": 13,
			"Pause": 19,
			"Caps Lock": 20,
			"Escape": 27,
			"space": 32,
			"PageUp": 33,
			"PageDown": 34,
			"End": 35,
			"Home": 36,
			"Left": 37,
			"Up": 38,
			"Right": 39,
			"Down": 40,
			"Select": 41,
			"Print": 42,
			"Execute": 43,
			"Insert": 45,
			"Delete": 46,
			"LeftCommand": client.browser.firefox ? 224 : 91,
			"RightCommand": client.browser.firefox ? 224 : 93
		}
	}

} );

/*=======================================================*/

/*===================module/Keyboard===========================*/
﻿aQuery.define( "module/Keyboard", [ "base/config", "base/typed", "base/extend", "base/array", "main/event", "main/CustomEvent", "main/object", "hash/charcode" ], function( $, config, typed, utilExtend, array, event, CustomEvent, object, charcode ) {
	"use strict";
	var Keyboard = CustomEvent.extend( "Keyboard", {
		constructor: Keyboard,
		init: function( container, keyList ) {
			this._super();
			this.keyList = [];
			this.container = container;
			this.commandStatus = false;
			if ( this.container.getAttribute( "tabindex" ) == undefined ) {
				this.container.setAttribute( "tabindex", Keyboard.tableindex++ );
			}
			this._initHandler().enable().addKeys( keyList );
		},
		_initHandler: function() {
			var self = this;
			this.event = function( e ) {
				self.routing( this, e );
			};
			return this;
		},
		enable: function() {
			event.on( this.container, "keydown keypress keyup", this.event );
			return this;
		},
		disable: function() {
			event.off( this.container, "keydown keypress keyup", this.event );
			return this;
		},
		_push: function( ret ) {
			if ( !( this.iterationKeyList( ret ) ) ) { //检查重复
				this.keyList.push( ret );
			}
			return this;
		},
		addKey: function( obj ) {
			var keyCode = obj.keyCode,
				ret;
			if ( typed.isArr( keyCode ) ) {
				for ( var i = 0, len = keyCode.length, nObj; i < len; i++ ) {
					nObj = {};
					utilExtend.easyExtend( nObj, obj );
					nObj.keyCode = keyCode[ i ];
					this.addKey( nObj );
				}
				return this;
			} else {
				ret = Keyboard.createOpt( obj );
				this._push( ret );
			}
			config.amdquery.debug && $.logger( "keyboard.addKey", "handlerName:", Keyboard.getHandlerName( ret ) );
			ret.todo && this.on( Keyboard.getHandlerName( ret ), ret.todo );
			return this;
		},
		addKeys: function( keyList ) {
			if ( !keyList ) {
				return this;
			}
			var i = 0,
				len;
			if ( !typed.isArr( keyList ) ) {
				keyList = [ keyList ];
			}
			for ( len = keyList.length; i < len; i++ ) {
				this.addKey( keyList[ i ] );
			}
			return this;
		},
		changeKey: function( origin, evolution ) {
			origin = Keyboard.createOpt( origin );
			var item;
			if ( item = this.iterationKeyList( origin ) ) {
				utilExtend.extend( item, evolution );
			}
			return this;
		},
		removeKey: function( obj ) {
			var item, ret, keyCode = obj.keyCode;
			if ( typed.isArr( keyCode ) ) {
				for ( var i = 0, len = keyCode.length, nObj; i < len; i++ ) {
					utilExtend.easyExtend( {}, obj );
					nObj = obj;
					nObj.keyCode = keyCode[ i ];
					this.removeKey( nObj );
				}
				return this;
			} else {
				ret = Keyboard.createOpt( obj );
				if ( item = this.iterationKeyList( ret ) ) {
					this.keyList.splice( array.inArray( this.keyList, item ), 1 );
					config.amdquery.debug && $.logger( "keyboard.removeKey", "handlerName:", Keyboard.getHandlerName( item ) );
					this.clearHandlers( Keyboard.getHandlerName( item ) );
				}
			}
			return this;
		},
		removeTodo: function( obj ) {
			var opt = Keyboard.createOpt( obj );
			this.off( Keyboard.getHandlerName( opt ), obj.todo );
		},
		iterationKeyList: function( e ) {
			for ( var i = 0, keyList = this.keyList, len = keyList.length, item, code, result = 0; i < len; i++ ) {
				code = e.keyCode || e.which;

				item = keyList[ i ];

				config.amdquery.debug && $.logger( "keyboard.iterationKeyList", "type:code", e.type + ":" + code );

				if (
					e.type == item.type &&
					code == item.keyCode &&
					Keyboard.checkCombinationKey( e, item.combinationKey )
				) {
					return item;
				}
			}
			return false;
		},
		routing: function( target, e ) {
			e = event.document.getEvent( e );
			var item;
			if ( item = this.iterationKeyList( e ) ) {
				//item.todo.call(this, e);i
				var type = Keyboard.getHandlerName( item );
				config.amdquery.debug && $.logger( "keyboard.routing", "handlerName", type );
				this.trigger( type, target, {
					type: type,
					event: e,
					keyItem: item
				} );
				event.document.preventDefault( e );
				event.document.stopPropagation( e );
			}
		}
	}, {
		codeToStringReflect: charcode.codeToStringReflect,
		stringToCodeReflect: charcode.stringToCodeReflect,
		createOpt: function( obj ) {
			var keyCode = obj.keyCode;
			//若有组合键 会把type强制转换
			if ( obj.combinationKey && obj.combinationKey.length ) {
				if ( typed.isStr( keyCode ) ) {
					keyCode = keyCode.length > 1 ? keyCode : keyCode.toUpperCase();
				}
				obj.type = array.inArray( obj.combinationKey, "cmd" ) > -1 ? "keydown" : "keyup";
			}
			if ( typed.isStr( keyCode ) ) {
				obj.keyCode = Keyboard.stringToCode( keyCode );
			}

			return obj;
		},
		codeToChar: function( code ) {
			return typed.isNum( code ) ? String.fromCharCode( code ) : code;
		},
		codeToString: function( code ) {
			return Keyboard.codeToStringReflect[ code ] || Keyboard.codeToChar( code );
		},
		charToCode: function( c ) {
			return typed.isStr( c ) ? c.charCodeAt( 0 ) : c;
		},
		stringToCode: function( s ) {
			return Keyboard.stringToCodeReflect[ s ] || Keyboard.charToCode( s );
		},
		checkCombinationKey: function( e, combinationKey ) {
			var i = 0,
				j = 0,
				defCon = [ "ctrl", "alt", "shift" ],
				len = combinationKey ? combinationKey.length : 0,
				count1 = 0;
			if ( e.combinationKey ) {
				if ( e.combinationKey.length == len ) {
					for ( ; i < len; i++ ) {
						for ( ; j < len; j++ ) {
							e.combinationKey[ i ] != combinationKey[ j ] && count1++;
						}
					}
					if ( len == count1 ) {
						return 1;
					}
				} else {
					return 0;
				}
			} else {
				for ( var count2 = combinationKey ? combinationKey.length : 0; i < len; i++ ) {
					if ( combinationKey[ i ] === "cmd" ) {
						if ( Keyboard.commandStatus == true ) {
							count1++;
						} else {
							return 0;
						}
						continue;
					}

					if ( e[ defCon[ i ] + "Key" ] == true ) count1++;

					if ( e[ combinationKey[ i ] + "Key" ] == false ) {
						return 0;
					}
				}
				if ( count1 > count2 ) {
					return 0;
				}
			}
			return 1;
		},
		getHandlerName: function( obj ) {
			obj = Keyboard.createOpt( obj );
			var combinationKey = obj.combinationKey ? obj.combinationKey.join( "+" ) + "+" : "";
			return obj.type + ":" + combinationKey + Keyboard.stringToCode( obj.keyCode );
		},
		tableindex: 9000,
		cache: [],
		getInstance: function( container, keyList ) {
			var keyboard, i = 0,
				cache = Keyboard.cache,
				len = cache.length;
			for ( ; i < len; i++ ) {
				if ( cache[ i ].container == container ) {
					keyboard = cache[ i ];
				}
			}
			if ( !keyboard ) {
				keyboard = new Keyboard( container, keyList );
				Keyboard.cache.push( keyboard );
			}
			return keyboard;
		}
	} );

	event.on( document.documentElement, "keydown keypress keyup", function( e ) {
		var code = e.keyCode || e.which;
		if ( code === charcode.stringToCodeReflect[ "LeftCommand" ] ||
			code === charcode.stringToCodeReflect[ "RightCommand" ] ||
			code === charcode.stringToCodeReflect[ "Command" ] ) {
			switch ( e.type ) {
				case "keydown":
				case "keypress":
					Keyboard.commandStatus = true;
					break;
				case "keyup":
					Keyboard.commandStatus = false;
					break;
			}
		}
	} );

	return Keyboard;
} );

/*=======================================================*/

/*===================ui/keyboard===========================*/
﻿aQuery.define( "ui/keyboard", [ "main/object", "module/Widget", "module/Keyboard" ], function( $, object, Widget, Keyboard, undefined ) {
	"use strict";
	var allowPublic = Widget.AllowPublic;
	var keyboard = Widget.extend( "ui.keyboard", {
		container: null,
		customEventName: [],
		event: function() {},
		enable: function() {
			this.disable();
			this.keyboard.enable();
			this.options.disabled = false;
			return this;
		},
		disable: function() {
			this.keyboard.disable();
			this.options.disabled = true;
			return this;
		},
		init: function( opt, target ) {
			this._super( opt, target );
			this.keyboard = new Keyboard( target[ 0 ], this.options.keyList );
			this.options.keyList = this.keyboard.keyList;
			this.enable();

			return this;
		},
		options: {
			keyList: []
		},
		_setKeyList: function( keyList ) {
			this.addKeys( keyList );
			this.options.keyList = this.keyboard.keyList;
		},
		publics: {
			addKey: allowPublic,
			addKeys: allowPublic,
			changeKey: allowPublic,
			removeKey: allowPublic,
			removeTodo: allowPublic
		},
		addKey: function( obj ) {
			this.keyboard.addKey( obj );
			this.options.keyList = this.keyboard.keyList;
			return this;
		},
		addKeys: function( keyList ) {
			this.keyboard.addKeys( keyList );
			this.options.keyList = this.keyboard.keyList;
			return this;
		},
		changeKey: function( origin, evolution ) {
			this.keyboard.changeKey( origin, evolution );
			this.options.keyList = this.keyboard.keyList;
			return this;
		},
		removeKey: function( obj ) {
			this.keyboard.removeKey( obj );
			this.options.keyList = this.keyboard.keyList;
			return this;
		},
		removeTodo: function( obj ) {
			this.keyboard.removeTodo( obj );
			this.options.keyList = this.keyboard.keyList;
			return this;
		},
		target: null,
		toString: function() {
			return "ui.keyboard";
		},
		widgetEventPrefix: "keyboard"
	} );

	$.keyboard = function( keyList ) {
		return new Keyboard( document.documentElement, keyList );
	};

	return keyboard;
} );

/*=======================================================*/

/*===================ui/navitem===========================*/
aQuery.define( "ui/navitem", [
    "base/typed",
    "base/client",
    "module/Widget",
    "main/class",
    "main/event",
    "main/css",
    "main/position",
    "main/dom",
    "main/attr",
    "animation/animate",
    "html5/css3.transition.animate",
    "animation/tween.extend",
    "animation/effect"
  ],
	function( $, typed, client, Widget, cls, event, css, position, dom, attr, src, animate ) {
		"use strict";

		var complete = function() {
			css.css( this, "height", "auto" );
		};
		var navitem = Widget.extend( "ui.navitem", {
			container: null,
			_initHandler: function() {
				var self = this;

				this.navitemEvent = function( e ) {
					switch ( e.type ) {
						case "click":
							if ( event.document.getTarget( e ) == self.$arrow[ 0 ] ) {
								self.toggle();
							} else {
								self.select();
							}
							break;
					}

				};
				return this;
			},
			enable: function() {
				var fun = this.navitemEvent;
				this.disable();
				this.$text.on( "click", fun );
				this.$arrow.on( "click", fun );
				this.options.disabled = false;
				return this;
			},
			disable: function() {
				var fun = this.navitemEvent;
				this.$text.off( "click", fun );
				this.$arrow.off( "click", fun );
				this.options.disabled = true;
				return this;
			},
			getBoard: function() {
				return this.$board;
			},
			render: function() {
				var opt = this.options;
				this.$text.html( opt.html );
				this.$img.addClass( opt.img );

				this.detectParent();

				if ( opt.isOpen ) {
					this.$arrow.addClass( "arrowBottom" ).removeClass( "arrowRight" );
				} else {
					this.$arrow.addClass( "arrowRight" ).removeClass( "arrowBottom" );
				}

				if ( opt.selected ) {
					this.$text.addClass( "text_select" ).removeClass( "text_unselect" );
				} else {
					this.$text.addClass( "text_unselect" ).removeClass( "text_select" );
				}

				if ( !this.hasChild() ) {
					this.$arrow.removeClass( "arrowRight" ).removeClass( "arrowBottom" );
				}

				return this;
			},
			toggle: function() {
				return this.options.isOpen ? this.close() : this.open();
			},
			open: function() {
				var opt = this.options;

				if ( !opt.isOpen ) {
					if ( opt.parent && !opt.parent.uiNavitem( "option", "isOpen" ) ) {
						opt.parent.uiNavitem( "open" );
					}

					opt.isOpen = true;

					this.$board.slideDown( {
						duration: 200,
						easing: "cubic.easeInOut",
						complete: complete
					} );

					var para = {
						type: this.getEventName( "open" ),
						container: this.container,
						target: this.target[ 0 ],
						html: opt.html
					};

					this.target.trigger( para.type, this.target[ 0 ], para );
				}

				this.render();

				return this;
			},
			close: function() {
				var opt = this.options;

				if ( opt.isOpen ) {
					opt.isOpen = false;
					this.$board.slideUp( {
						duration: 200,
						easing: "cubic.easeInOut"
					} );

					var para = {
						type: this.getEventName( "close" ),
						container: this.container,
						target: this.target[ 0 ],
						html: opt.html
					};

					this.target.trigger( para.type, this.target[ 0 ], para );
				}

				this.render();

				return this;
			},
			select: function() {
				var opt = this.options;
				opt.selected = true;
				this.open();

				var para = {
					type: this.getEventName( "select" ),
					container: this.container,
					target: this.target[ 0 ],
					html: opt.html
				};

				return this.target.trigger( para.type, this.target[ 0 ], para );
			},
			cancel: function() {
				var opt = this.options;
				opt.selected = false;
				this.render();

				var para = {
					type: this.getEventName( "cancel" ),
					container: this.container,
					target: this.target[ 0 ],
					html: opt.html
				};

				return this.target.trigger( para.type, this.target[ 0 ], para );
			},
			hasChild: function() {
				return !!this.target.find( "li[amdquery-widget*='ui.navitem']" ).length;
			},
			detectParent: function() {
				if ( !this.target.parent().length ) {
					return this;
				}
				var parentNavitem = this.target.parent().parent(),
					opt = this.options;
				if ( parentNavitem.isWidget( "ui.navitem" ) ) {
					opt.parent = parentNavitem;
				}
				return this;
			},
			getOptionToRoot: function( optionName ) {
				var name = optionName || "html",
					opt = this.options,
					parent = opt.parent,
					ret = [ opt[ name ] ];
				while ( !! parent ) {
					ret.push( parent.uiNavitem( "option", name ) );
					parent.uiNavitem( "detectParent" );
					parent = parent.uiNavitem( "option", "parent" );
				}
				return ret;
			},
			getAttrToRoot: function( attrName ) {
				if ( !typed.isStr( attrName ) ) {
					return [];
				}
				var opt = this.options,
					parent = opt.parent,
					ret = [ this.target.attr( attrName ) ];
				while ( !! parent ) {
					ret.push( parent.target.attr( attrName ) );
					parent.uiNavitem( "detectParent" );
					parent = parent.uiNavitem( "option", "parent" );
				}
				return ret;
			},
			init: function( opt, target ) {
				this._super( opt, target );
				opt = this.options;

				this.container = target;

				target.css( {
					"display": "block",
					"clear": "both"
				} );

				this.$board = target.children().css( {
					"display": "block",
					"clear": "both"
				} ).addClass( "board" ).hide();

				this.$item = $( $.createEle( "div" ) ).css( {
					"display": "block",
					"clear": "both"
				} ).addClass( "item" );

				this.$arrow = $( $.createEle( "li" ) ).css( {
					"float": "left"
				} ).addClass( "arrow" );

				this.$img = $( $.createEle( "li" ) ).css( {
					"float": "left"
				} ).addClass( "img" );
				//.attr("src", "data:image/gif;base64,R0lGODlhAQABAID/AMDAwAAAACH5BAEAAAAALAA" /*to fix chrome border*/ );

				this.$text = $( $.createEle( "li" ) ).css( {
					"float": "left"
				} ).addClass( "text" );

				this.$titleContainer = $( $.createEle( "ul" ) ).css( {
					"display": "block",
					"float": "left"
				} ).addClass( "title" );

				this.$title = $( $.createEle( "a" ) ).css( {
					"display": "block",
					"clear": "both",
					"text-decoration": "none"
				} ).addClass( "title" );

				this.$board.append( this.$child );

				this.$titleContainer.append( this.$arrow ).append( this.$img ).append( this.$text );

				this.$title.append( this.$titleContainer );

				this.$item.append( this.$title );

				this.target.append( this.$item );

				this.target.append( this.$board );

				this.render()._initHandler().enable();

				return this;
			},
			_setSelected: function( selected ) {
				if ( selected !== undefined ) {
					this.options.selected = selected;
					this.options.selected ? this.selected() : this.cancel();
				}
			},
			_setIsOpen: function( isOpen ) {
				if ( isOpen !== undefined ) {
					this.options.isOpen = isOpen;
					this.options.isOpen ? this.open() : this.close();
				}
			},
			customEventName: [ "open", "close", "select", "cancel" ],
			options: {
				html: "",
				img: "",
				selected: false,
				isOpen: false,
				parent: null
			},
			publics: {
				render: Widget.AllowPublic,
				getBorad: Widget.AllowPublic,
				open: Widget.AllowPublic,
				close: Widget.AllowPublic,
				select: Widget.AllowPublic,
				cancel: Widget.AllowPublic,
				detectParent: Widget.AllowPublic,
				getAttrToRoot: Widget.AllowReturn,
				getOptionToRoot: Widget.AllowReturn
			},
			getter: {
				html: 1,
				img: 1,
				selected: 1,
				isOpen: 1,
				parent: 1
			},
			setter: {
				html: 1,
				img: 1,
				selected: 1,
				isOpen: 1,
				parent: 0
			},
			target: null,
			toString: function() {
				return "ui.navitem";
			},
			widgetEventPrefix: "navitem",
			initIgnore: true
		} );

		return navitem;
	} );

/*=======================================================*/

/*===================ecma5/array===========================*/
﻿aQuery.define( "ecma5/array", [ "base/array" ], function( $, array ) {
	"use strict";
	this.describe( "ECMA Array" );

	/**
	 * @callback arrayCallback
	 * @param {*} item - Element of array.
	 * @param {Number} index - Index of element.
	 * @param {Array} array
	 * @returns {Boolean|*}
	 */

	/**
	 * @describe .
	 * @callback arrayReduceCallback
	 * @param {*} rv - Previous result.
	 * @param {*} item - Element of array.
	 * @param {Number} index - Index of element.
	 * @param {Array} array
	 * @returns {Boolean|*}
	 */

	/**
	 * Extend Array.prototype if the context not support ecma5.
	 * @pubilc
	 * @requires module:base/array
	 * @exports ecma5/array
	 * @borrows module:base/array.filterArray as filter
	 * @borrows module:base/array.inArray as indexOf
	 * @borrows module:base/array.lastInArray as lastIndexOf
	 */
	var uitl = {
		/**
		 * Iterate each item, if item do not conform to some condition then return false else return true.
		 * @param {arrayCallback} fn - Callback.
		 * @param {Object} [context] - Context of callback.
		 * @returns {Boolean}
		 */
		every: function( fn, context ) {
			var t = this,
				ret = true;

			this.forEach( function( item, index ) {
				if ( fn.call( context, item, index, this ) !== true ) {
					ret = false;
					return false;
				}
			}, t );
			return ret;
		},
		/**
		 * Iterate each item, if the return value is false then break.
		 * @param {arrayCallback} fn - Callback.
		 * @param {Object} [context] - Context of callback.
		 * @returns {this}
		 */
		forEach: function( fn, context ) {
			for ( var i = 0, len = this.length; i < len; i++ ) {
				if ( i in this && fn.call( context, this[ i ], i, this ) === false ) {
					break;
				}

			}
			return this;
		},
		filter: function( fn, context ) {
			return array.filterArray( this, fn, context );
		},

		indexOf: function( item, index ) {
			return array.inArray( this, item, index );
		},

		lastIndexOf: function( item, index ) {
			return array.lastInArray( this, item, index );
		},
		/**
		 * Iterate each item, and return new.
		 * @param {arrayCallback} fn - Callback.
		 * @param {Object} [context] - Context of callback.
		 * @returns {Array} - A new array.
		 */
		map: function( fn, context ) {
			var t = this,
				len = t.length;
			var ret = new Array( len );
			for ( var i = 0; i < len; i++ ) {
				if ( i in t ) {
					ret[ i ] = fn.call( context, t[ i ], i, t );
				}
			}
			return ret;
		},
		/**
		 * Iterate each item, and return lastest.
		 * @param {arrayReduceCallback} fn - Callback.
		 * @param {*} [initialValue] - Initial value.
		 * @returns {*} - Lastest result.
		 */
		reduce: function( fn, initialValue ) {
			var t = this,
				len = t.length,
				i = 0,
				rv;
			if ( initialValue ) {
				rv = initialValue;
			} else {
				do {
					if ( i in t ) {
						rv = t[ i++ ];
						break;
					}
					if ( ++i >= len ) throw new Error( "array contains no values, no initial value to return" );
				}
				while ( true );
			}

			for ( ; i < len; i++ ) {
				if ( i in t ) rv = fn.call( null, rv, t[ i ], i, t );
			}

			return rv;
		},
		/**
		 * Iterate each item by descending, and return lastest.
		 * @param {arrayReduceCallback} fn - Callback.
		 * @param {*} [initialValue] - Initial value.
		 * @returns {*} - Lastest result.
		 */
		reduceRight: function( fn, initialValue ) {
			var
			t = this,
				len = t.length,
				i = len - 1,
				rv;
			if ( initialValue ) {
				rv = initialValue;
			} else {
				do {
					if ( i in t ) {
						rv = t[ i-- ];
						break;
					}
					if ( --i < 0 ) throw new Error( "array contains no values, no initial value to return" );
				}
				while ( true );
			}

			while ( i >= 0 ) {
				if ( i in t ) rv = fn.call( null, rv, t[ i ], i, t );
				i--;
			}

			return rv;
		},
		/**
		 * Iterate each item, if item conform to some condition then return true else return false.
		 * @param {arrayCallback} fn - Callback.
		 * @param {Object} [context] - Context of callback.
		 * @returns {Boolean}
		 */
		some: function( fn, context ) {
			var ret = false;
			this.forEach( function( item, index ) {
				if ( fn.call( context, item, index, this ) === true ) {
					ret = true;
					return false;
				}
			}, this );
			return ret;
		}
	};

	for ( var name in uitl ) {
		if ( !Array.prototype[ name ] ) {
			Array.prototype[ name ] = uitl[ name ];
		}
	}

	return uitl;

} );

/*=======================================================*/

/*===================ui/navmenu===========================*/
aQuery.define( "ui/navmenu", [
    "base/typed",
    "base/extend",
    "ui/navitem",
    "module/Widget",
    "main/query",
    "main/class",
    "main/event",
    "main/css",
    "main/position",
    "main/dom",
    "main/attr",
    "ecma5/array"
  ],
	function( $, typed, utilExtend, NavItem, Widget, query, cls, event, css, position, dom, attr, uitlArray ) {
		"use strict";

		Widget.fetchCSS( "ui/css/navmenu" );

		var navmenu = Widget.extend( "ui.navmenu", {
			container: null,
			_initHandler: function() {
				var self = this;
				this.navmenuEvent = function( e ) {
					var para = utilExtend.extend( {}, e ),
						type,
						target;
					target = para.target = self.target[ 0 ];

					para.navitem = e.target;

					switch ( e.type ) {
						case "navitem.open":
							type = para.type = self.getEventName( "open" );
							self.target.trigger( type, target[ 0 ], para );
							break;
						case "navitem.close":
							type = para.type = self.getEventName( "close" );
							self.target.trigger( type, target[ 0 ], para );
							break;
						case "navitem.select":
							self.changeSelectedNavItem( e.target );
							break;
					}
				};
				return this;
			},
			changeHandler: function( $ele, fun, type ) {
				$ele[ type ]( "navitem.open", fun );
				$ele[ type ]( "navitem.close", fun );
				$ele[ type ]( "navitem.select", fun );
			},
			enable: function() {
				var fun = this.navmenuEvent;

				this.changeHandler( $( this.navItemList ), fun, "on" );

				this.options.disabled = false;
				return this;
			},
			disable: function() {
				var fun = this.navmenuEvent;

				this.changeHandler( $( this.navItemList ), fun, "off" );

				this.options.disabled = true;
				return this;
			},
			getNavItemsByHtml: function( str ) {
				return this.navItemList.filter( function( ele ) {
					return $( ele ).uiNavitem( "option", "html" ) === str;
				} );
			},
			getNavItemsByHtmlPath: function( strList ) {
				var ret = this.getNavItemsByHtml( strList.pop() ),
					str = "";
				ret.filter( function( ele ) {
					for ( var i = strList.length - 1, parent; i >= 0; i-- ) {
						str = strList[ i ];
						parent = $( ele ).uiNavitem( "option", "parent" );

						if ( !parent || parent.uiNavitem( "option", "html" ) !== str ) {
							return false;
						}
					}
					return true;
				} );

				return ret;
			},
			getNavItem: function( item ) {
				var ret = null,
					i = 0,
					len = this.navItemList.length,
					ele,
					checkFn;

				if ( typed.isStr( item ) ) {
					checkFn = function( ele, item ) {
						return attr.getAttr( ele, "id" ) === item;
					};
				} else if ( typed.is$( item ) ) {
					checkFn = function( ele, item ) {
						return ele === item[ 0 ];
					};
				} else if ( Widget.is( "ui.navmenu", item ) ) {
					checkFn = function( ele, item ) {
						return $( ele ).navitem( "equals", item );
					};
				} else if ( typed.isEle( item ) ) {
					checkFn = function( ele, item ) {
						return ele === item;
					};
				} else {
					return null;
				}

				for ( i = 0; i < len; i++ ) {
					ele = this.navItemList[ i ];
					if ( checkFn( ele, item ) ) {
						ret = ele;
						break;
					}
				}

				return ret;
			},
			getNavItemList: function() {
				return this.target.find( "li[ui-navitem]" ).reverse().eles;
			},
			selectNavItem: function( target ) {
				var $target = $( this.getNavItem( target ) || [] ),
					opt = this.options;
				if ( $target.isWidget( "ui.navitem" ) ) {
					if ( opt.selectedNavItem && opt.selectedNavItem !== target ) {
						$( opt.selectedNavItem ).uiNavitem( "cancel" );
					}
					$target.uiNavitem( "select" );
					opt.selectedNavItem = $target;
				}
			},
			changeSelectedNavItem: function( target ) {
				var $target = $( this.getNavItem( target ) || [] ),
					opt = this.options;
				if ( $target.isWidget( "ui.navitem" ) ) {
					if ( opt.selectedNavItem && opt.selectedNavItem !== target ) {
						$( opt.selectedNavItem ).uiNavitem( "cancel" );
					}
					opt.selectedNavItem = $target;

					var para = {
						navitem: target
					}, type;

					type = para.type = this.getEventName( "select" );
					this.target.trigger( type, this.target[ 0 ], para );
				}
			},
			init: function( opt, target ) {
				this._super( opt, target );
				target.addClass( "aquery-navmenu" );

				this.navItemList = this.getNavItemList();

				$( this.navItemList ).uiNavitem();

				this._initHandler().enable().render();

				return this;
			},
			refreshNavItem: function() {
				this.navItemList = this.getNavItemList();
				var $navItemList = $( this.navItemList );
				$navItemList.uiNavitem();
				this.able();
			},
			detect: function() {
				this.refreshNavItem();
			},
			addNavItem: function( navitems, navitemParent ) {
				var $navitems = $( navitems );
				$( navitemParent || this.target ).children( "ul" ).append( $navitems );
				this.navItemList = this.getNavItemList();
				if ( !this.options.disabled ) {
					this.changeHandler( $navitems, this.navmenuEvent, "on" );
				}
			},
			removeNavItem: function( navitems ) {
				var $navitems = $( navitems );
				this.changeHandler( $navitems, this.navmenuEvent, "off" );
				$navitems.uiNavitem( "destroy" );
				$navitems.remove();
				this.navItemList = this.getNavItemList();
			},
			options: {
				selectedNavItem: null
			},
			setter: {
				selectedNavItem: 0
			},
			publics: {
				getNavItemsByHtml: Widget.AllowReturn,
				getNavItemsByHtmlPath: Widget.AllowReturn,
				getNavItem: Widget.AllowReturn,
				selectNavItem: Widget.AllowPublic,
				refreshNavItem: Widget.AllowPublic,
				addNavItem: Widget.AllowPublic,
				removeNavItem: Widget.AllowPublic,
				changeSelectedNavItem: Widget.AllowPublic
			},
			customEventName: [ "open", "close" ],
			target: null,
			toString: function() {
				return "ui.navmenu";
			},
			destroy: function() {
				$( this.navItemList ).destroyUiNavitem();
				Widget.invoke( "destroy", this );
			},
			widgetEventPrefix: "navmenu"
		} );

		return navmenu;
	} );

/*=======================================================*/

/*===================module/math===========================*/
﻿aQuery.define( 'module/math', [ "base/extend" ], function( $, utilExtend, undefined ) {
	"use strict";
	var M = Math,
		pi = M.PI,
		martrix = function( a, b, c ) {
			this.init( a, b, c )
		},
		directionHash = {
			0: 3,
			1: 4,
			2: 5,
			3: 6,
			4: 7,
			5: 8,
			6: 9,
			7: 10,
			8: 11,
			9: 12,
			10: 1,
			11: 2
		};
	var math = {
		acceleration: function( distance, time ) {
			return ( distance + distance ) / ( time * time );
		},

		angle: function( x1, y1, x2, y2 ) {
			/// <summary>计算两点的斜率</summary>
			/// <param name="x1" type="Number">点1x坐标</param>
			/// <param name="y1" type="Number">点1y坐标</param>
			/// <param name="x2" type="Number">点2x坐标</param>
			/// <param name="y2" type="Number">点2y坐标</param>
			/// <returns type="Number" />
			return M.atan2( y2 - y1, x2 - x1 );
		},

		degreeToRadian: function( angle ) {
			/// <summary>角度转为弧度</summary>
			/// <param name="angle" type="Number">角度</param>
			/// <returns type="Number" />
			return pi * angle / 180;
		},

		direction: function( angle, range ) {
			/// <summary>确定返回的向量朝向。从x轴瞬时针起。时钟</summary>
			/// <param name="angle" type="Number">角度</param>
			/// <param name="range" type="Number">范围：0-15</param>
			/// <returns type="Number" />
			var result = 9;
			range = $.between( 0, 15, range || 15 );
			if ( 0 - range < angle && angle <= value + range ) {

			}
			for ( var i = 0, value; i <= 11; i++ ) {
				if ( i < 6 ) {
					value = i * 30;
				} else if ( i >= 6 ) {
					value = ( i % 6 * 30 ) - 180;
				}
				if ( value - range < angle && angle <= value + range ) {
					result = directionHash[ i ];
					break;
				}

			}
			return result;
		},
		distance: function( x1, y1, x2, y2 ) {
			/// <summary>计算两点之间距离</summary>
			/// <param name="x1" type="Number">点1x坐标</param>
			/// <param name="y1" type="Number">点1y坐标</param>
			/// <param name="x2" type="Number">点2x坐标</param>
			/// <param name="y2" type="Number">点2y坐标</param>
			/// <returns type="Number" />
			return M.sqrt( M.pow( x1 - x2, 2 ) + M.pow( y1 - y2, 2 ) );
		},

		martrix: martrix,

		radianToDegree: function( angle ) {
			/// <summary>弧度转为角度</summary>
			/// <param name="angle" type="Number">弧度</param>
			/// <returns type="Number" />
			return angle * 180 / pi;
		},
		speed: function( distance, time ) {
			/// <summary>计算两点之间距离。单位：像素/毫秒</summary>
			/// <param name="distance" type="Number">距离</param>
			/// <param name="time" type="Number">时间</param>
			/// <returns type="Number" />
			return distance / time;
		}

	};

	utilExtend.easyExtend( martrix, {
		addition: function( m1, m2 ) {
			var
			r1 = m1.length,
				c1 = m1[ 0 ].length,
				ret = martrix.init( m1.length, m1[ 0 ].length ),
				s = arguments[ 2 ] ? -1 : 1,
				x, y;
			if ( typeof m2 == "number" ) {
				for ( x = 0; x < r1; x++ ) {
					for ( y = 0; y < c1; y++ ) {
						ret[ x ][ y ] = m1[ x ][ y ] + m2 * s;
					}
				}
			} else {
				if ( r1 != m2.length || c1 != m2[ 0 ].length ) {
					return;
				}
				for ( x = 0; x < r1; x++ ) {
					for ( y = 0; y < c1; y++ ) {
						ret[ x ][ y ] += m2[ x ][ y ] * s;
					}
				}
			}
			return ret;
		},
		init: function( a, b, c ) {
			var ret = [];
			if ( !a || !b ) {
				ret = [
          [ 1, 0, 0, 0 ],
          [ 0, 1, 0, 0 ],
          [ 0, 0, 1, 0 ],
          [ 0, 0, 0, 1 ]
        ];
			} else {
				if ( c && a * b != c.length ) {
					return ret;
				}
				for ( var i = 0, j = 0, count = 0; i < a; i++ ) {
					ret.push( [] );
					for ( j = 0; j < b; j++ ) {
						ret[ i ][ j ] = c ? c[ count++ ] : 0;
					}
				}
			}
			return ret;
		},
		multiply: function( m1, m2 ) {
			var r1 = m1.length,
				c1 = m1[ 0 ].length,
				ret, x, y, z;
			if ( typeof m2 == "number" ) {
				ret = martrix.init( r1, c1 );
				for ( x = 0; x < r1; x++ ) {
					for ( y = 0; y < c1; y++ ) {
						ret[ x ][ y ] = m1[ x ][ y ] * m2;
					}
				}
			} else {
				var r2 = m2.length,
					c2 = m2[ 0 ].length,
					sum = 0;
				ret = math.martrix.init( r1, c2 );
				if ( c1 != r2 ) {
					return;
				}
				for ( x = 0; x < c2; x++ ) {
					for ( y = 0; y < r1; y++ ) {
						sum = 0;
						for ( z = 0; z < c1; z++ ) {
							sum += m1[ y ][ z ] * m2[ z ][ x ];
						}
						ret[ y ][ x ] = sum;
					}
				}
			}
			return ret;
		},
		subtraction: function( m1, m2 ) {
			return math.martrix.addition( m1, m2, true );
		}
	} );

	martrix.prototype = {
		addition: function( m ) {
			return new martrix( martrix.addition( this.martrix, m.martrix || m ) );
		},
		constructor: martrix,
		init: function( a, b, c ) {
			if ( a instanceof Array ) {
				this.martrix = a;
			} else {
				this.martrix = martrix.init( a, b, c );
			}
			return this;
		},
		multiply: function( m ) {
			return new martrix( martrix.multiply( this.martrix, m.martrix || m ) );
		},
		subtraction: function( m ) {
			return new martrix( martrix.subtraction( this.martrix, m.martrix || m ) );
		}
	};

	return math;

} );

/*=======================================================*/

/*===================ui/swappable===========================*/
﻿aQuery.define( "ui/swappable", [ "base/typed", "base/client", "main/event", "module/math", "module/Widget", "html5/css3.position" ], function( $, typed, client, event, math, Widget, css3Position, undefined ) {
	"use strict";
	var swappable = Widget.extend( "ui.swappable", {
		container: null,
		create: function() {

			return this;
		},
		enable: function() {
			var fun = this.swappableEvent;
			this.disable();
			this.target.on( "mousemove", fun ).on( "mousedown", fun );
			$( document ).on( "mouseup", fun );
			this.options.disabled = false;
			return this;
		},
		disable: function() {
			var fun = this.swappableEvent;
			this.target.off( "mousemove", fun ).off( "mousedown", fun );
			$( document ).off( "mouseup", fun );
			this.options.disabled = true;
			return this;
		},
		computeSwapType: function( swapTypeName ) {
			var path = this.path,
				swaptype;

			///先用简单实现
			///这里去计算path 最后返回如: "LeftToRight","Linear","Cicrle" 多元线性回归;
			return swaptype;
		},
		getPara: function( para, time, range, x1, y1, x2, y2 ) {
			var diff = ( new Date() ) - time;
			para.distance = Math.round( math.distance( x1, y1, x2, y2 ) );
			para.speed = Math.round( math.speed( para.distance, diff ) * 1000 );

			para.angle = Math.round( math.radianToDegree( math.angle( x1, y1, x2, y2 ) ) * 10 ) / 10;
			para.direction = math.direction( para.angle, range );

			para.acceleration = math.acceleration( para.distance, diff );
			para.duration = diff;

			if ( this.path.length < 5 && this.path.length > 2 ) {
				para.currentAngle = para.angle;
				para.currentDirection = para.direction;
			}

			return para;
		},
		getPath: function( index ) {
			if ( index === undefined ) {
				return this.path;
			}
			index *= 2;
			return [ this.path[ index ], this.path[ index + 1 ] ];
		},
		getPathLast: function() {
			return this.getPath( this.path.length / 2 - 1 );
		},
		isInPath: function( x, y ) {
			for ( var path = this.path, i = this.path.length - 1; i >= 0; i -= 2 )
				if ( path[ i ] === x && path[ i + 1 ] === y ) return i;
			return -1;
		},
		init: function( opt, target ) {
			this._super( opt, target );
			this.path = [];
			this.isDown = false;
			this.startY = null;
			this.startX = null;
			return this._initHandler().enable().render();
		},
		customEventName: [ "start", "move", "pause", "stop", "none", "mousemove" ],
		options: {
			cursor: "pointer",
			directionRange: 15,
			pauseSensitivity: 500
		},
		publics: {
			isInPath: Widget.AllowReturn,
			getPath: Widget.AllowReturn,
			getPathLast: Widget.AllowReturn
		},
		_initHandler: function() {
			var self = this,
				target = self.target,
				opt = self.options,
				time, timeout, lastEvent; //IE和绑定顺序有关？找不到startX值？
			this.swappableEvent = function( e ) {
				//event.document.stopPropagation(e);
				var left = target.getLeftWithTranslate3d(),
					top = target.getTopWithTranslate3d(),
					temp, x = ( e.pageX || e.clientX ) - left,
					y = ( e.pageY || e.clientY ) - top,
					para;
				if ( self.isDown || e.type == "mousedown" || e.type == "touchstart" ) {
					para = {
						type: self.getEventName( "start" ),
						offsetX: x,
						offsetY: y,
						event: e,
						speed: 0,
						target: this,
						startX: self.startX,
						startY: self.startY,
						path: self.path,
						swapType: undefined,
						angle: undefined,
						direction: undefined,
						distance: undefined,
						duration: undefined,
						currentAngle: undefined,
						currentDirection: undefined
					};
				} else {
					para = {
						offsetX: x,
						offsetY: y,
						event: e,
						target: this,
						startX: self.startX,
						startY: self.startY
					};
				}

				switch ( e.type ) {
					case "mousedown":
						if ( !client.system.mobile ) event.document.preventDefault( e );
					case "touchstart":
						//event.document.stopPropagation(e);
						if ( !self.isDown ) {
							self.isDown = true;
							para.startX = self.startX = x;
							para.startY = self.startY = y;
							time = new Date();
							self.path = [];
							self.path.push( x, y );
							lastEvent = null;
							target.trigger( para.type, target[ 0 ], para );
						}
						break;
					case "mousemove":
						//event.document.stopPropagation(e);
						if ( e.which === 0 || ( client.browser.ie678 && e.button != 1 ) || self.isDown === false ) {
							self.isDown = false;
							para.type = self.getEventName( "mousemove" );
							target.trigger( para.type, target[ 0 ], para );
							break;
						}

					case "touchmove":
						//event.document.preventDefault(e);
						if ( self.isDown ) {
							temp = self.getPathLast();
							if ( temp[ 0 ] === x && temp[ 1 ] === y ) break;
							self.path.push( x, y );
							self.getPara( para, time, opt.directionRange, self.startX, self.startY, x, y );
							para.type = self.getEventName( "move" );
							target.trigger( para.type, target[ 0 ], para );
							//if (!typed.isMobile) {
							clearTimeout( timeout );
							timeout = setTimeout( function() {
								para.type = self.getEventName( "pause" );
								para.swapType = self.computeSwapType();
								target.trigger( para.type, target[ 0 ], para );
							}, opt.pauseSensitivity );
							//}
							lastEvent = e;
						}
						break;
					case "touchend":
						if ( lastEvent && self.isDown ) {
							para.offsetX = x = ( lastEvent.pageX || lastEvent.clientX ) - target.getLeft();
							para.offsetY = y = ( lastEvent.pageY || lastEvent.clientY ) - target.getTop();
						}
					case "mouseup":
						if ( self.isDown ) {
							//event.document.preventDefault(e);
							//event.document.stopPropagation(e);
							self.isDown = false;
							if ( !lastEvent && !client.browser.ie678 ) {
								target.trigger( self.getEventName( "none" ), target[ 0 ], {
									type: self.getEventName( "none" )
								} );
								break;
							}
							clearTimeout( timeout );

							self.getPara( para, time, opt.directionRange, self.startX, self.startY, x, y );
							para.type = self.getEventName( "stop" );
							para.swapType = self.computeSwapType();
							target.trigger( para.type, target[ 0 ], para );
							self.startX = undefined;
							self.startY = undefined;
						}
						break;

				}
			};
			return this;
		},
		render: function() {
			var opt = this.options;
			this.target.css( {
				cursor: opt.cursor
			} );
			return this;
		},
		target: null,
		toString: function() {
			return "ui.swappable";
		},
		widgetEventPrefix: "swap"
	} );

	return swappable;
} );

/*=======================================================*/

/*===================ui/scrollableview===========================*/
aQuery.define( "ui/scrollableview", [
  "base/config",
  "base/client",
  "base/support",
  "base/typed",
  "main/query",
  "main/css",
  "main/event",
  "main/position",
  "main/dom",
  "main/class",
  "html5/css3",
  "html5/animate.transform",
  "html5/css3.transition.animate",
  "module/Widget",
  "animation/FX",
  "animation/animate",
  "animation/tween.extend",
  "module/Keyboard",
  "ui/swappable",
  "ui/draggable",
  "ui/keyboard" ], function( $,
	config,
	client,
	support,
	typed,
	query,
	css,
	event,
	position,
	dom,
	cls,
	css3,
	animateTransform,
	css3Transition,
	Widget,
	FX,
	animate,
	tween,
	Keyboard,
	swappable,
	draggable,
	keyboard, undefined ) {
	"use strict";
	Widget.fetchCSS( "ui/css/scrollableview" );
	var isTransform3d = !! config.ui.isTransform3d && support.transform3d;

	var V = "V",
		H = "H";

	var scrollableview = Widget.extend( "ui.scrollableview", {
		container: null,
		_keyList: [ "Up", "Down", "Left", "Right", "Home", "End", "PageUp", "PageDown" ],
		_combintionKeyList: [ "Up", "Right", "Down", "Left" ],
		create: function() {
			var opt = this.options;
			this.positionParent = $( {
				"overflow": "visible"
			}, "div" ).width( this.target.width() ).height( this.target.height() ).append( this.target.children() );

			this.container = $( {
				"position": "absolute"
			}, "div" ).append( this.positionParent ).appendTo( this.target );

			this.target.uiSwappable();

			this.target.find( "a[float=false]" ).css( {
				position: "absolute",
				zIndex: 1000
			} ).appendTo( this.target );

			this.statusBarX = $( {
				height: "10px",
				display: "none",
				position: "absolute",
				bottom: "0px"
			}, "div" ).addClass( "aquery-scrollableViewStatusBar" ).appendTo( this.target );

			this.statusBarY = $( {
				width: "10px",
				display: "none",
				position: "absolute",
				right: "0px"
			}, "div" ).addClass( "aquery-scrollableViewStatusBar" ).appendTo( this.target );

			if ( opt.enableKeyboard ) {
				this.target.uiKeyboard();
			}

			this.container.uiDraggable( {
				keepinner: 1,
				innerWidth: opt.boundary,
				innerHeight: opt.boundary,
				stopPropagation: false,
				vertical: this._isAllowedDirection( V ),
				horizontal: this._isAllowedDirection( H ),
				container: this.target,
				overflow: true
			} );

			this.detect();

			if ( isTransform3d ) this.container.initTransform3d();

			return this;
		},
		enable: function() {
			var event = this.scrollableviewEvent,
				opt = this.options;
			this.container.on( "DomNodeInserted DomNodeRemoved drag.pause drag.move drag.start", event );
			this.container.uiDraggable( "enable" );
			this.target.on( "swap.move swap.stop swap.pause widget.detect", event ).touchwheel( event );
			this.target.uiSwappable( "enable" );
			this.target.delegate( "a[href^=#]", "click", event );

			if ( opt.enableKeyboard ) {
				this.target.uiKeyboard( "addKey", {
					type: "keyup",
					keyCode: this._combintionKeyList,
					combinationKey: opt.combinationKey.split( /;|,/ ),
					todo: event
				} ).uiKeyboard( "addKey", {
					type: "keydown",
					keyCode: this._keyList,
					todo: event
				} );
				this.target.uiKeyboard( "enable" );
			}

			opt.disabled = false;
			return this;
		},
		disable: function() {
			var event = this.scrollableviewEvent,
				opt = this.options;
			this.container.off( "DomNodeInserted DomNodeRemoved drag.pause drag.move drag.start", event );
			this.container.uiDraggable( "disable" );
			this.target.off( "swap.move swap.stop swap.pause widget.detect", event ).off( "touchwheel", event );
			this.target.uiSwappable( "disable" );
			this.target.off( "click", event );

			if ( opt.enableKeyboard ) {
				this.target.uiKeyboard( "removeKey", {
					type: "keyup",
					keyCode: this._combintionKeyList,
					combinationKey: opt.combinationKey.split( /;|,/ ),
					todo: event
				} ).uiKeyboard( "removedKey", {
					type: "keydown",
					keyCode: this._keyList,
					todo: event
				} );
				this.target.uiKeyboard( "disable" );
			}

			opt.disabled = true;
			return this;
		},
		_initHandler: function() {
			var self = this,
				target = self.target,
				opt = self.options,
				check = function() {
					self.toHBoundary( self.getLeft() ).toVBoundary( self.getTop() ).hideStatusBar();
				},
				keyToMove = function( x, y ) {
					clearTimeout( self.keyTimeId );
					self.keyTimeId = setTimeout( check, 500 );
					self.render( x, y, true, 0 );
					self.showStatusBar();
				},
				keyToAnimate = function( name, value, statusBar ) {
					self.showStatusBar();
					self.container.stopAnimation( true );
					statusBar.stopAnimation( true );
					self[ name ]( value, FX.normal );
				};

			var
			combinationKeyItem = {
				type: "keyup",
				keyCode: "Up",
				combinationKey: opt.combinationKey.split( /;|,/ )
			},
				KeyItem = {
					type: "keydown",
					keyCode: "Up"
				},
				i,
				keyType = {};

			for ( i = this._combintionKeyList.length - 1; i >= 0; i-- ) {
				combinationKeyItem.keyCode = this._combintionKeyList[ i ];
				keyType[ "Combination" + combinationKeyItem.keyCode ] = Keyboard.getHandlerName( combinationKeyItem );
			}

			for ( i = this._keyList.length - 1; i >= 0; i-- ) {
				KeyItem.keyCode = this._keyList[ i ];
				keyType[ KeyItem.keyCode ] = Keyboard.getHandlerName( KeyItem );
			}

			this.scrollableviewEvent = function( e ) {
				switch ( e.type ) {
					case Widget.detectEventName:
						self.detect();
						break;
					case "drag.move":
						var x = self.checkXBoundary( e.offsetX, opt.boundary ),
							y = self.checkYBoundary( e.offsetY, opt.boundary );
						self.renderStatusBar( self.checkXStatusBar( x ), self.checkYStatusBar( y ) );
						self.showStatusBar();
						break;
					case "drag.pause":
						var left = self.getLeft(),
							top = self.getTop(),
							distance = opt.pullDistance;

						if ( left > distance ) {
							e.type = self.getEventName( "pullleft" );
							target.trigger( e.type, this, e );
						} else if ( left < -self.overflowWidth - distance ) {
							e.type = self.getEventName( "pullright" );
							target.trigger( e.type, this, e );
						}
						if ( top > distance ) {
							e.type = self.getEventName( "pulldown" );
							target.trigger( e.type, this, e );
						} else if ( top < -self.overflowHeight - distance ) {
							e.type = self.getEventName( "pullup" );
							target.trigger( e.type, this, e );
						}

						break;
					case "drag.start":
						if ( opt.enableKeyboard ) target[ 0 ].focus();
						self.stopAnimation();
						self.detect();
						break;
					case "DomNodeInserted":
					case "DomNodeRemoved":
						self.detect().toVBoundary( self.getTop() ).toHBoundary( self.getLeft() );
						break;
					case "swap.move":
						self.showStatusBar();
						break;
					case "swap.stop":
						self.animate( e );
						break;
					case "swap.pause":
						self.pause( e );
						break;
					case "mousewheel":
					case "DOMMouseScroll":
						x = null;
						y = null;
						clearTimeout( self.wheelTimeId );
						self.layout();
						// var x = null,
						// y = null;
						if ( e.direction == "x" ) {
							x = e.delta * opt.mouseWheelAccuracy;
						} else if ( e.direction == "y" ) {
							y = e.delta * opt.mouseWheelAccuracy;
						}
						self.showStatusBar();

						self.wheelTimeId = setTimeout( check, 500 );

						self.render( x, y, true, opt.boundary );
						break;
					case "click":
						event.document.preventDefault( e );
						event.document.stopPropagation( e );

						self.layout();

						var $a = $( this ),
							href = ( $a.attr( "href" ) || "" ).replace( window.location.href, "" ).replace( "#", "" );
						self.animateToElement( self.getAnimationToElementByName( href ) );
						break;

					case keyType.CombinationLeft:
						keyToAnimate( "animateX", 0, self.statusBarX );
						break;
					case keyType.CombinationUp:
						keyToAnimate( "animateY", 0, self.statusBarY );
						break;
					case keyType.CombinationRight:
						keyToAnimate( "animateX", -self.scrollWidth + self.viewportWidth, self.statusBarX );
						break;
					case keyType.CombinationDown:
						keyToAnimate( "animateY", -self.scrollHeight + self.viewportHeight, self.statusBarY );
						break;
					case keyType.Up:
						keyToMove( 0, opt.keyVerticalDistance );
						break;
					case keyType.Down:
						keyToMove( 0, -opt.keyVerticalDistance );
						break;
					case keyType.Left:
						keyToMove( opt.keyHorizontalDistance, 0 );
						break;
					case keyType.Right:
						keyToMove( -opt.keyHorizontalDistance, 0 );
						break;
					case keyType.PageUp:
						keyToAnimate( "animateY", Math.min( opt.boundary, self.getTop() + self.viewportHeight ), self.statusBarY );
						break;
					case keyType.PageDown:
						keyToAnimate( "animateY", Math.max( -self.scrollHeight + self.viewportHeight - opt.boundary, self.getTop() - self.viewportHeight ), self.statusBarY );
						break;
					case keyType.Home:
						keyToAnimate( "animateY", 0, self.statusBarY );
						break;
					case keyType.End:
						keyToAnimate( "animateY", -self.scrollHeight + self.viewportHeight, self.statusBarY );
						break;
				}
			};
			return this;
		},
		getAnimationToElementByName: function( name ) {
			return this.target.find( "[name=" + ( name || "__undefined" ) + "]" );
		},
		animateToElement: function( ele, animationCallback ) {
			var $toElement = $( ele );
			if ( $toElement.length === 1 && query.contains( this.target[ 0 ], $toElement[ 0 ] ) ) {
				var top = $toElement.getTopWithTranslate3d(),
					left = $toElement.getLeftWithTranslate3d(),
					self = this,
					callback = function( overflow ) {
						animationCallback && animationCallback.apply( this, arguments );
						var type = self.getEventName( "animateToElement" );
						self.target.trigger( type, self.target[ 0 ], {
							type: type,
							toElement: typed.is$( ele ) ? ele[ 0 ] : ele,
							overflow: overflow
						} );
					};
				if ( this._isAllowedDirection( V ) ) {
					this.animateY( Math.max( -top + this.viewportHeight > 0 ? 0 : -top, -this.scrollHeight + this.viewportHeight ), FX.normal, callback );
				}
				if ( this._isAllowedDirection( H ) ) {
					this.animateX( Math.max( -left + this.viewportHeight > 0 ? 0 : -left, -this.scrollWidth + this.viewportWidth ), FX.normal, callback );
				}
			}
		},
		destroy: function() {
			this.target.destroyUiSwappable();
			this.container.destroyUiDraggable();
			this.target.children().remove();
			this.positionParent.children().appendTo( this.target );
			Widget.invoke( "destroy", this );
		},
		init: function( opt, target ) {
			this._super( opt, target );

			this._direction = null;

			this.wheelTimeId = null;

			this.keyTimeId = null;

			this.originOverflow = this.target.css( "overflow" );

			// this.target.attr( "amdquery-ui", "scrollableview" );
			this.target.css( {
				"overflow": "hidden",
				/*fix ie*/
				"overflow-x": "hidden",
				"overflow-y": "hidden"
			} );

			var pos = this.target.css( "position" );
			if ( pos != "relative" && pos != "absolute" ) {
				this.target.css( "position", "relative" );
			}

			var self = this;

			if ( this.options.firstToElement ) {
				setTimeout( function() {
					self.animateToElement( self.options.firstToElement );
				}, 0 );
			}

			this.create()._initHandler().enable().render( 0, 0 );

			if ( this.options.focus ) {

				setTimeout( function() {
					try {
						self.layout();
						self.target[ 0 ].focus();
					} catch ( e ) {}
				}, 0 );

			}

			return this;
		},
		customEventName: [ "pulldown", "pullup", "pullleft", "pullright", "animationEnd", "animateToElement" ],
		options: {
			"overflow": "HV",
			"animateDuration": 600,
			"boundary": 150,
			"boundaryDruation": 300,
			"mouseWheelAccuracy": 0.3,
			"pullDistance": 50,
			"enableKeyboard": false,
			"combinationKey": client.system.mac ? "cmd" : "ctrl",
			"firstToElement": "",
			"keyVerticalDistance": 40,
			"keyHorizontalDistance": 40,
			"focus": false
		},
		setter: {
			"enableKeyboard": Widget.initFirst,
			"combinationKey": Widget.initFirst,
			"firstToElement": Widget.initFirst
		},
		publics: {
			"showStatusBar": Widget.AllowPublic,
			"hideStatusBar": Widget.AllowPublic,
			"render": Widget.AllowPublic,
			"getAnimationToElementByName": Widget.AllowReturn,
			"animateToElement": Widget.AllowPublic,
			"toH": Widget.AllowPublic,
			"toV": Widget.AllowPublic,
			"append": Widget.AllowPublic,
			"remove": Widget.AllowPublic,
			"replace": Widget.AllowPublic
		},
		render: function( x, y, addtion, boundary ) {
			if ( !arguments.length ) {
				return;
			}
			var position,
				originX = 0,
				originY = 0,
				statusX, statusY;

			boundary = boundary == null ? this.options.boundary : boundary;

			if ( addtion ) {
				position = this.getContainerPosition();

				originX = position.x;
				originY = position.y;
			}

			if ( x !== null && this._isAllowedDirection( H ) ) {
				x = this.checkXBoundary( originX + x, boundary );
				statusX = this.checkXStatusBar( x );
			}
			if ( y !== null && this._isAllowedDirection( V ) ) {
				y = this.checkYBoundary( originY + y, boundary );
				statusY = this.checkYStatusBar( y );
			}

			return this._render( x, statusX, y, statusY );
		},
		_render: function( x1, x2, y1, y2 ) {
			var pos = {};
			if ( x1 !== null && this._isAllowedDirection( H ) ) {
				pos.x = parseInt( x1, 0 );
				this.statusBarX.setPositionX( isTransform3d, parseInt( x2, 0 ) );
			}
			if ( y1 !== null && this._isAllowedDirection( V ) ) {
				pos.y = parseInt( y1, 0 );
				this.statusBarY.setPositionY( isTransform3d, parseInt( y2, 0 ) );
			}
			this.container.setPositionXY( isTransform3d, pos );
			return this;
		},
		renderStatusBar: function( x, y ) {
			if ( this._isAllowedDirection( H ) ) this.statusBarX.setPositionX( isTransform3d, parseInt( x, 0 ) );

			if ( this._isAllowedDirection( V ) ) this.statusBarY.setPositionY( isTransform3d, parseInt( y, 0 ) );

			return this;
		},
		getContainerPosition: function() {
			return {
				x: this.getLeft(),
				y: this.getTop()
			};
		},

		target: null,
		toString: function() {
			return "ui.scrollableview";
		},
		widgetEventPrefix: "scrollableview",

		append: function( content ) {
			this.positionParent.append( content );
			this.detect();
		},

		remove: function( content ) {
			// must ele
			if ( query.contains( this.positionParent[ 0 ], content ) ) {
				$( content ).remove();
				this.detect();
			}
		},

		detect: function() {
			this.layout().resize();
			return this;
		},

		replace: function( ele1, ele2 ) {
			// must ele
			if ( query.contains( this.positionParent[ 0 ], ele1 ) ) {
				$( ele1 ).replaceWith( ele2 );
				this.detect();
			}
		},

		refreshStatusBar: function() {
			var viewportWidth = this.viewportWidth,
				scrollWidth = this.scrollWidth,
				viewportHeight = this.viewportHeight,
				scrollHeight = this.scrollHeight,
				width = 0,
				height = 0;

			if ( scrollWidth != viewportWidth ) {
				this.statusBarXVisible = 1;
				width = viewportWidth * viewportWidth / scrollWidth;
			} else {
				width = this.statusBarXVisible = 0;
			}


			if ( scrollHeight != viewportHeight ) {
				this.statusBarYVisible = 1;
				height = viewportHeight * viewportHeight / scrollHeight;
			} else {
				height = this.statusBarYVisible = 0;
			}

			this.statusBarX.width( width );
			this.statusBarY.height( height );

			return this;
		},
		resize: function() {
			this.container.width( this.scrollWidth );
			this.container.height( this.scrollHeight );
			return this;
		},
		layout: function() {
			// add Math.max to fix ie7
			var originViewportHeight = this.viewportHeight,
				originViewportWidth = this.viewportWidth;

			this.viewportWidth = this.target.width();
			this.viewportHeight = this.target.height();

			if ( originViewportWidth !== this.originViewportWidth ) {
				this.positionParent.width( this.viewportWidth );
			}

			if ( originViewportHeight !== this.viewportHeight ) {
				this.positionParent.height( this.viewportHeight );
			}

			this.scrollWidth = client.browser.ie678 ? Math.max( this.positionParent.scrollWidth(), this.container.scrollWidth() ) : this.positionParent.scrollWidth();
			this.scrollHeight = client.browser.ie678 ? Math.max( this.positionParent.scrollHeight(), this.container.scrollHeight() ) : this.positionParent.scrollHeight();

			this.overflowWidth = this.scrollWidth - this.viewportWidth;
			this.overflowHeight = this.scrollHeight - this.viewportHeight;

			return this.refreshStatusBar();
		},
		_isAllowedDirection: function( direction ) {
			return this.options.overflow.indexOf( direction ) > -1;
		},
		getTop: function() {
			return this.container.getPositionY();
		},
		getLeft: function() {
			return this.container.getPositionX();
		},
		pause: function() {

			return this;
		},
		stopAnimation: function() {
			this.container.stopAnimation( true );
			this.statusBarX.stopAnimation( true );
			this.statusBarY.stopAnimation( true );
			this.toVBoundary( this.getTop() ).toHBoundary( this.getLeft() );
		},
		animate: function( e ) {
			var opt = this.options,
				a0 = e.acceleration,
				t0 = opt.animateDuration - e.duration,
				s0 = Math.round( a0 * t0 * t0 * 0.5 );
			this._direction = e.direction;

			if ( t0 <= 0 ) {
				this.toVBoundary( this.getTop() ).toHBoundary( this.getLeft() );
				return this.hideStatusBar();
			}

			switch ( e.direction ) {
				case 3:
					this.toH( -s0, t0 );
					break;
				case 9:
					this.toH( s0, t0 );
					break;
				case 6:
					this.toV( -s0, t0 );
					break;
				case 12:
					this.toV( s0, t0 );
					break;
				default:
					this.toHBoundary( this.getTop() ).toVBoundary( this.getLeft() );
			}

			return this;
		},

		checkXBoundary: function( s, boundary ) {
			boundary = boundary !== undefined ? boundary : this.options.boundary;
			return $.between( -( this.overflowWidth + boundary ), boundary, s );
		},
		checkYBoundary: function( s, boundary ) {
			boundary = boundary !== undefined ? boundary : this.options.boundary;
			return $.between( -( this.overflowHeight + boundary ), boundary, s );
		},

		checkXStatusBar: function( left ) {
			var result = -left / this.scrollWidth * this.viewportWidth;
			return $.between( 0, this.viewportWidth - this.statusBarX.width(), result );
		},

		checkYStatusBar: function( top ) {
			var result = -top / this.scrollHeight * this.viewportHeight;
			return $.between( 0, this.viewportHeight - this.statusBarY.height(), result );
		},

		showStatusBar: function() {
			if ( this.statusBarXVisible && this._isAllowedDirection( H ) ) this.statusBarX.show();
			if ( this.statusBarYVisible && this._isAllowedDirection( V ) ) this.statusBarY.show();
			return this;
		},
		hideStatusBar: function() {
			this.statusBarX.hide();
			this.statusBarY.hide();
			return this;
		},

		outerXBoundary: function( t ) {
			if ( t > 0 ) {
				return 0;
			} else if ( t < -this.overflowWidth ) {
				return -this.overflowWidth;
			}
			return null;
		},

		outerYBoundary: function( t ) {
			if ( t > 0 ) {
				return 0;
			} else if ( t < -this.overflowHeight ) {
				return -this.overflowHeight;
			}
			return null;
		},

		_triggerAnimate: function( scene, direction, duration, distance ) {
			var type = this.getEventName( "animationEnd" );
			this.target.trigger( type, this.container[ 0 ], {
				type: type,
				scene: scene,
				direction: direction,
				duration: duration,
				distance: distance
			} );
		},

		toHBoundary: function( left ) {
			var outer = this.outerXBoundary( left ),
				self = this;

			if ( outer !== null ) {
				this.container.animate( $.getPositionAnimationOptionProxy( isTransform3d, outer ), {
					duration: this.options.boundaryDruation,
					easing: "expo.easeOut",
					queue: false,
					complete: function() {
						self.hideStatusBar();
						self._triggerAnimate( "boundary", self._direction, self.options.boundaryDruation, outer );
					}
				} );
			} else {
				this.statusBarX.hide();
			}
			return this;
		},

		toVBoundary: function( top ) {
			var outer = this.outerYBoundary( top ),
				self = this;
			if ( outer !== null ) {
				this.container.animate( $.getPositionAnimationOptionProxy( isTransform3d, undefined, outer ), {
					duration: this.options.boundaryDruation,
					easing: "expo.easeOut",
					queue: false,
					complete: function() {
						self.hideStatusBar();
						self._triggerAnimate( "boundary", self._direction, self.options.boundaryDruation, outer );
					}
				} );
			} else {
				this.statusBarY.hide();
			}
			return this;
		},

		toH: function( s, t, d, animationCallback ) {
			return this._isAllowedDirection( H ) ? this.animateX( this.checkXBoundary( this.getLeft() - s ), t, d, animationCallback ) : this;
		},
		toV: function( s, t, d, animationCallback ) {
			return this._isAllowedDirection( V ) ? this.animateY( this.checkYBoundary( this.getTop() - s ), t, d, animationCallback ) : this;
		},
		animateY: function( y1, t, animationCallback ) {
			var opt = $.getPositionAnimationOptionProxy( isTransform3d, undefined, y1 );
			var self = this,
				y2 = this.checkYStatusBar( parseFloat( opt.top ) );

			this.container.animate( opt, {
				duration: t,
				easing: "easeOut",
				complete: function() {
					self.toHBoundary( self.getLeft() ).toVBoundary( y1 );
					self._triggerAnimate( "inner", self._direction, t, y1 );
					if ( typed.isFun( animationCallback ) ) animationCallback.call( self.target, V );
				}
			} );

			this.statusBarY.animate( $.getPositionAnimationOptionProxy( isTransform3d, undefined, y2 ), {
				duration: t,
				easing: "easeOut"
			} );
			return this;
		},
		animateX: function( x1, t, animationCallback ) {
			var opt = $.getPositionAnimationOptionProxy( isTransform3d, x1 );
			//也有可能要移动之后
			var self = this,
				x2 = this.checkXStatusBar( parseFloat( opt.left ) );

			this.container.animate( opt, {
				duration: t,
				easing: "easeOut",
				complete: function() {
					self.toHBoundary( x1 ).toVBoundary( self.getTop() );
					self._triggerAnimate( "inner", self._direction, t, x1 );
					if ( typed.isFun( animationCallback ) ) animationCallback.call( self.target, H );
				}
			} );

			this.statusBarX.animate( $.getPositionAnimationOptionProxy( isTransform3d, x2 ), {
				duration: t,
				easing: "easeOut"
			} );
			return this;
		}
	} );

	return scrollableview;
} );

/*=======================================================*/

/*===================ui/swapindicator===========================*/
aQuery.define( "ui/swapindicator", [
  "base/support",
  "main/query",
  "main/event",
  "main/css",
  "main/position",
  "main/dom",
  "main/class",
  "html5/css3",
  "module/Widget"
   ], function( $, support, query, event, css2, position, dom, cls, css3, Widget ) {
	"use strict";
	Widget.fetchCSS( "ui/css/swapindicator" );
	var HORIZONTAL = "H",
		VERTICAL = "V";
	var eventFuns = event.document;

	var swapindicator = Widget.extend( "ui.swapindicator", {
		create: function() {
			var opt = this.options;

			this.$indicators = null;
			this.target.css( {
				display: "block",
				position: "relative",
				cursor: "pointer"
			} ).addClass( "aquery-swapindicator" );

			this.detect();

			return this;
		},
		detect: function() {
			this.$indicators = this.target.children( 'li' );

			if ( this.options.orientation === HORIZONTAL ) {
				this.$indicators.css( "float", "left" );
			} else {
				this.$indicators.css( "clear", "left" );
			}

			this.resize();
		},
		layout: function() {
			var opt = this.options,
				pWidth = this.target.parent().width(),
				pHeight = this.target.parent().height();

			switch ( opt.verticalAlign ) {
				case "top":
					this.target.css( "top", opt.margin );
					break;
				case "middle":
					this.target.css( "top", ( pHeight - this.height ) / 2 );
					break;
				case "bottom":
					this.target.css( "top", pHeight - this.height - opt.margin );
					break;
			}
			switch ( opt.horizontalAlign ) {
				case "left":
					this.target.css( "left", opt.margin );
					break;
				case "center":
					this.target.css( "left", ( pWidth - this.width ) / 2 );
					break;
				case "right":
					this.target.css( "left", pWidth - this.width - opt.margin );
					break;
			}
			return this;
		},
		resize: function() {
			var width = this.target.width();
			var height = this.target.height();
			this.width = width;
			this.height = height;

			if ( this.options.orientation === HORIZONTAL ) {
				this.$indicators.width( width / this.$indicators.length );
				this.$indicators.height( height );
			} else {
				this.$indicators.width( width );
				this.$indicators.height( height / this.$indicators.length );
			}
			this.layout();
			return this;
		},
		append: function( li ) {
			this.target.append( li );
			this.detect();
		},
		remove: function( removeIndex, renderIndex ) {
			var $indicator = this.$indicators.eq( removeIndex );
			if ( !$indicator.length ) {
				return;
			}
			$indicator.remove();
			this.detect();
			this.render( renderIndex && renderIndex <= this.$indicators.length ? renderIndex : 0 );
		},
		render: function( index ) {
			var opt = this.options,
				originIndex = opt.index,
				self = this;
			if ( index === undefined || index < 0 || index > this.$indicators.length - 1 ) {
				return;
			}

			opt.index = index;

			this.$indicators.eq( originIndex ).removeClass( opt.activeCss );

			this.$indicators.eq( index ).addClass( opt.activeCss );

		},
		previous: function() {
			return this.render( Math.max( 0, this.options.index - 1 ) );
		},
		next: function() {
			return this.render( Math.min( this.options.index + 1, this.$views.length - 1 ) );
		},
		_setIndex: function( index ) {
			this.render( index );
		},
		_setHorizontalAlign: function( str ) {
			this.options.horizontalAlign = str;
			this.layout();
		},
		_setVerticalAlign: function( str ) {
			this.options.verticalAlign = str;
			this.layout();
		},
		enable: function() {
			this.target.on( "click mousedown", this.swapindicatorEvent );
			this.options.disabled = false;
			return this;
		},
		disable: function() {
			this.target.off( "click mousedown", this.swapindicatorEvent );
			this.options.disabled = true;
			return this;
		},
		_initHandler: function() {
			var self = this,
				target = self.target,
				opt = self.options;

			this.swapindicatorEvent = function( e ) {
				switch ( e.type ) {
					case "mousedown":
					case "touchstart":
						eventFuns.stopPropagation( e );
						break;
					case "click":
						var type = self.getEventName( "change" ),
							index = $( this ).index();
						self.render( index );
						target.trigger( type, self, {
							type: type,
							index: index
						} );
						break;
				}
			};
			return this;
		},
		init: function( opt, target ) {
			this._super( opt, target );
			this.width = 0;
			this.height = 0;
			return this.create()._initHandler().enable().render( this.options.index );
		},
		customEventName: [ "change" ],
		options: {
			index: 0,
			orientation: HORIZONTAL,
			horizontalAlign: "center",
			verticalAlign: "bottom",
			margin: 15,
			activeCss: "active",
			position: "auto"
		},
		publics: {
			render: Widget.AllowPublic,
			orevious: Widget.AllowPublic,
			next: Widget.AllowPublic,
			append: Widget.AllowPublic,
			remove: Widget.AllowPublic
		},
		setter: {
			orientation: Widget.initFirst
		},
		getter: {

		},
		target: null,
		toString: function() {
			return "ui.swapindicator";
		},
		widgetEventPrefix: "swapindicator",
		initIgnore: true
	} );

	return swapindicator;
} );

/*=======================================================*/

/*===================ui/swapview===========================*/
aQuery.define( "ui/swapview", [
  "base/config",
  "base/support",
  "base/typed",
  "main/query",
  "main/css",
  "main/position",
  "main/dom",
  "main/class",
  "html5/css3",
  "html5/css3.position",
  "html5/animate.transform",
  "html5/css3.transition.animate",
  "module/Widget",
  "animation/animate",
  "animation/FX",
  "animation/tween.extend",
  "ui/swappable",
  "ui/draggable",
  "ui/swapindicator"
 ], function( $,
	config,
	support,
	typed,
	query,
	css,
	position,
	dom,
	css2,
	css3,
	css3Position,
	animateTransform,
	css3Transition,
	Widget,
	animate,
	FX,
	tween,
	swappable,
	draggable,
	swapindicator,
	undefined ) {
	"use strict";
	var HORIZONTAL = "H",
		VERTICAL = "V";

	var isTransform3d = !! config.ui.isTransform3d && support.transform3d;
	var swapview = Widget.extend( "ui.swapview", {
		container: null,
		create: function() {
			var opt = this.options;

			this.target.css( "position", "relative" ).uiSwappable();

			var isHorizontal = opt.orientation === HORIZONTAL;

			this.container = this.target.children( "ol" ).eq( 0 );

			this.$views = this.getViews();
			this.$indicator = this.getIndicator();
			this.setViewOrientation();

			this.container.css( {
				dislplay: "block",
				left: "0px",
				top: "0px"
			} ).uiDraggable( {
				keepinner: 1,
				stopPropagation: false,
				vertical: !isHorizontal,
				horizontal: isHorizontal,
				container: this.target,
				overflow: true
			} );

			this.resize();

			return this;
		},
		setViewOrientation: function() {
			if ( this.options.orientation === HORIZONTAL ) {
				this.$views.css( "float", "left" );
			} else {
				this.$views.css( "clear", "left" );
			}
		},
		getViews: function() {
			return this.container.children( "li" );
		},
		getIndicator: function() {
			var indicator = this.target.children( "ol[amdquery-widget*='ui.swapindicator']" ).eq( 0 );
			return indicator.length ? indicator.uiSwapindicator() : null;
		},
		appendIndicator: function( indicator ) {
			this.target.append( indicator );
			this.$indicator = this.getIndicator();
			this.resize();
		},
		detect: function() {
			this.$views = this.getViews();
			this.setViewOrientation();
			this.resize();
		},
		append: function( view ) {
			if ( typed.isNode( view, "li" ) ) {
				this.container.append( view );
				this.$views = this.getViews();
				this.setViewOrientation();
				if ( this.$indicator ) {
					this.$indicator.uiSwapindicator( "append", $.createEle( "li" ) );
				}
				this.resize();
			}
		},
		remove: function( removeIndex, renderIndex ) {
			var $view = this.$views.eq( removeIndex );
			if ( !$view.length ) {
				return;
			}
			$view.remove();
			if ( this.$indicator ) {
				this.$indicator.uiSwapindicator( "remove", removeIndex, renderIndex || 0 );
			}
			this.resize();
			this.render( renderIndex && renderIndex <= this.$indicator.length ? renderIndex : 0 );
		},
		resize: function() {
			var width = this.target.width();
			var height = this.target.height();
			this.width = width;
			this.height = height;

			this.orientationLength = this.options.orientation === HORIZONTAL ? this.width : this.height;

			this.$views.width( width );
			this.$views.height( height );

			if ( this.options.orientation === HORIZONTAL ) {
				this.boardWidth = width * this.$views.length;
				this.boardHeight = height;


			} else {
				this.boardWidth = width;
				this.boardHeight = height * this.$views.length;
			}

			this.container.width( this.boardWidth );
			this.container.height( this.boardHeight );

			this.container.uiDraggable( {
				innerWidth: width / 4,
				innerHeight: height / 4
			} );

			if ( this.$indicator ) this.$indicator.uiSwapindicator( "resize" );
		},
		layout: function() {
			var pos = {}, opt = this.options;
			if ( opt.orientation == HORIZONTAL ) {
				pos.x = -this.target.width() * opt.index;
			} else {
				pos.y = -this.target.height() * opt.index;
			}
			this.container.setPositionXY( isTransform3d, pos );
		},
		render: function( index, animationCallback ) {
			var opt = this.options,
				originIndex = opt.index,
				self = this;
			if ( index === undefined || index < 0 || index > this.$views.length - 1 ) {
				return;
			}

			opt.index = index;

			var activeView = $( this.$views[ index ] ),
				deactiveView = $( this.$views[ originIndex ] );
			var animationOpt;

			if ( opt.orientation === HORIZONTAL ) {
				animationOpt = $.getPositionAnimationOptionProxy( isTransform3d, -this.target.width() * index );
			} else {
				animationOpt = $.getPositionAnimationOptionProxy( isTransform3d, undefined, -this.target.height() * index );
			}

			var animationEvent = {
				type: this.getEventName( "beforeAnimation" ),
				target: this.container[ 0 ],
				view: this.$views[ index ],
				index: index,
				originIndex: index
			};
			this.target.trigger( animationEvent.type, animationEvent.target, animationEvent );


			if ( originIndex !== index ) {
				deactiveView.trigger( "beforeDeactive", deactiveView[ index ], {
					type: "beforeDeactive"
				} );
				activeView.trigger( "beforeActive", activeView[ index ], {
					type: "beforeActive"
				} );
				animationEvent.type = this.getEventName( "change" );
				this.target.trigger( animationEvent.type, animationEvent.target, animationEvent );
			}

			this.container.stopAnimation().animate( animationOpt, {
				duration: opt.animationDuration,
				easing: opt.animationEasing,
				queue: false,
				complete: function() {
					if ( self.$indicator ) self.$indicator.uiSwapindicator( "option", "index", index );
					animationEvent.type = "afterAnimation";
					self.target.trigger( animationEvent.type, animationEvent.target, animationEvent );
					if ( originIndex !== index ) {
						deactiveView.trigger( "deactive", deactiveView[ 0 ], {
							type: "deactive"
						} );
						activeView.trigger( "active", activeView[ 0 ], {
							type: "active"
						} );
					}
					if ( typed.isFun( animationCallback ) ) animationCallback.call( self.target );
				}
			} );
		},
		swapPrevious: function( animationCallback ) {
			return this.render( Math.max( 0, this.options.index - 1 ), animationCallback );
		},
		swapNext: function( animationCallback ) {
			return this.render( Math.min( this.options.index + 1, this.$views.length - 1 ), animationCallback );
		},
		_setIndex: function( index ) {
			this.render( index );
		},
		enable: function() {
			var event = this.swapviewEvent;
			this.container.on( "drag.start", event );
			this.target.on( "swap.stop swap.none widget.detect", event );
			if ( this.options.detectFlexResize ) this.target.on( "flex.resize", event );
			if ( this.$indicator ) this.$indicator.on( "swapindicator.change", event );
			this.options.disabled = false;
			return this;
		},
		disable: function() {
			var event = this.swapviewEvent;
			this.container.off( "drag.start", event );
			this.target.off( "swap.stop swap.none widget.detect", event );
			if ( this.options.detectFlexResize ) this.target.on( "flex.resize", event );
			if ( this.$indicator ) this.$indicator.off( "swapindicator.change", event );
			this.options.disabled = true;
			return this;
		},
		stopAnimation: function() {
			this.container.stopAnimation( true );
			return this;
		},
		_initHandler: function() {
			var self = this,
				target = self.target,
				opt = self.options;

			this.swapviewEvent = function( e ) {
				switch ( e.type ) {
					case Widget.detectEventName:
						self.detect();
						self.$indicator && self.$indicator.uiSwapindicator( "detect" );
						break;
					case "drag.start":
						self.stopAnimation();
						// self.resize();
						break;
					case "swap.stop":
						self._acceptSwapBehavior( e );
						break;
					case "swap.none":
						// self.render( opt.index );
						break;
					case "swapindicator.change":
						self.render( e.index );
						break;
					case "flex.resize":
						self.resize();
						self.layout();
						break;
				}
			};
			return this;
		},
		_acceptSwapBehavior: function( e ) {
			var opt = this.options,
				acceleration = e.acceleration * 1000, //px/s
				//duration = opt.animateDuration - e.duration,
				direction = e.direction,
				distance = e.distance,
				status = acceleration > 2 || distance > this.orientationLength / 4;

			switch ( direction ) {
				case 3:
					if ( opt.orientation === HORIZONTAL && status ) {
						return this.swapPrevious();
					}
					break;
				case 9:
					if ( opt.orientation === HORIZONTAL && status ) {
						return this.swapNext();
					}
					break;
				case 6:
					if ( opt.orientation === VERTICAL && status ) {
						return this.swapPrevious();
					}
					break;
				case 12:
					if ( opt.orientation === VERTICAL && status ) {
						return this.swapNext();
					}
					break;
			}

			return this.render( opt.index );
		},
		destroy: function() {
			this.target.destroyUiSwappable();
			this.container.destroyUiDraggable();
			if ( this.$swapindicator ) this.$swapindicator.destroyUiSwapindicator();
			Widget.invoke( "destroy", this );
		},
		init: function( opt, target ) {
			this._super( opt, target );
			this.width = 0;
			this.height = 0;
			this.boardWidth = 0;
			this.boardHeight = 0;
			this.orientationLength = 0;
			return this.create()._initHandler().enable().render( this.options.index );
		},
		customEventName: [ "beforeAnimation", "afterAnimation", "change" ],
		options: {
			index: 0,
			orientation: HORIZONTAL,
			animationDuration: FX.normal,
			animationEasing: "expo.easeInOut",
			detectFlexResize: true
		},
		publics: {
			resize: Widget.AllowPublic,
			render: Widget.AllowPublic,
			swapPrevious: Widget.AllowPublic,
			swapNext: Widget.AllowPublic,
			append: Widget.AllowPublic,
			remove: Widget.AllowPublic
		},
		setter: {
			orientation: Widget.initFirst,
			detectFlexResize: Widget.initFirst
		},
		getter: {

		},
		target: null,
		toString: function() {
			return "ui.swapview";
		},
		widgetEventPrefix: "swapview"
	} );
} );

/*=======================================================*/

/*===================ui/tabbutton===========================*/
aQuery.define( "ui/tabbutton", [
    "module/Widget",
    "ui/button",
    "main/query",
    "main/class",
    "main/event",
    "main/css",
    "main/position",
    "main/dom",
    "html5/css3"
  ],
	function( $, Widget, Button, query, cls, event, css, position, dom, css3, src ) {
		"use strict";

		Widget.fetchCSS( "ui/css/tabbutton" );

		var tabbutton = Button.extend( "ui.tabbutton", {
			options: {
				defaultCssName: "aquery-defaultTabButton",
				selectCssName: "aquery-selectTabButton",
				select: false,
				text: "",
				title: ""
			},
			getter: {
				defaultCssName: 1,
				selectCssName: 1,
				select: 1,
				text: 1,
				title: 1
			},
			setter: {
				defaultCssName: 1,
				selectCssName: 1,
				select: 1,
				text: 1,
				title: 1
			},
			publics: {
				select: Widget.AllowPublic,
				toggle: Widget.AllowPublic
			},
			select: function() {
				this.options.select = true;
				return this.change();
			},
			toggle: function() {
				var opt = this.options;
				opt.select = !opt.select;
				return this.change();
			},
			change: function() {
				var opt = this.options;

				if ( opt.select ) {
					this.target.removeClass( opt.defaultCssName ).addClass( opt.selectCssName );
				} else {
					this.target.removeClass( opt.selectCssName ).addClass( opt.defaultCssName );
				}
				return this;
			},
			render: function() {
				Button.invoke( "render", this );
				var opt = this.options;
				if ( this.defaultCssName != opt.defaultCssName ) {
					this.defaultCssName = opt.defaultCssName;
					this.target.removeClass( this.defaultCssName );
				}
				if ( this.selectCssName != opt.selectCssName ) {
					this.selectCssName = opt.selectCssName;
					this.target.removeClass( this.selectCssName );
				}

				this.change();
				return this;
			},
			init: function( opt, target ) {
				this._super( opt, target );
				opt = this.options;

				target.addClass( "aquery-tabButton" );

				this.defaultCssName = opt.defaultCssName;
				this.selectCssName = opt.selectCssName;
				return this;
			},
			toString: function() {
				return "ui.tabbutton";
			},
			widgetEventPrefix: "tabbutton",
			initIgnore: true
		} );

		//提供注释
		$.fn.uiTabbutton = function( a, b, c, args ) {
			return tabbutton.apply( this, arguments );
		};

		return tabbutton;
	} );

/*=======================================================*/

/*===================ui/tabbar===========================*/
aQuery.define( "ui/tabbar", [
    "base/typed",
    "module/Widget",
    "ui/tabbutton",
    "main/query",
    "main/class",
    "main/event",
    "main/css",
    "main/position",
    "main/dom",
    "main/attr"
  ],
	function( $, typed, Widget, tabbutton, query, cls, event, css, position, dom, attr ) {
		"use strict";

		Widget.fetchCSS( "ui/css/tabbar" );

		var tabbar = Widget.extend( "ui.tabbar", {
			container: null,
			event: function() {},
			_initHandler: function() {
				var self = this;
				this.tabbarEvent = function( e ) {
					var $button = $( this );
					self.select( $button );
					var para = {
						type: self.getEventName( "click" ),
						container: self.container,
						target: self.target[ 0 ],
						tabButton: this,
						index: $button.index(),
						event: e
					};

					self.target.trigger( para.type, self.target[ 0 ], para );
				};
				return this;
			},
			select: function( ele ) {
				var $button = typed.isNum( ele ) ? this.$tabButtons.eq( ele ) : $( ele );
				this.options.index = $button.index();
				this.$tabButtons.uiTabbutton( "option", "select", false );
				$button.uiTabbutton( "option", "select", true );
			},
			render: function( index ) {
				this.select( index || this.options.index );
			},
			getSelectionIndex: function() {
				var SelectionIndex = 0;
				this.$tabButtons.each( function( ele, index ) {
					if ( $( ele ).uiTabbutton( "option", "select" ) ) {
						SelectionIndex = index;
						return false;
					}
				} );
				return SelectionIndex;
			},
			enable: function() {
				this.disable();
				this.$tabButtons.on( "tabbutton.click", this.tabbarEvent );
				this.options.disabled = false;
				return this;
			},
			disable: function() {
				this.$tabButtons.off( "tabbutton.click", this.tabbarEvent );
				this.options.disabled = true;
				return this;
			},
			init: function( opt, target ) {
				this._super( opt, target );

				this.target.css( {
					"border-top": "1px solid black",
					"border-bottom": "1px solid black",
					"border-right": "1px solid black"
				} );

				this._initHandler();

				this.target.addClass( "aquery-tabbar" );

				this.detect();

				return this;
			},
			destroy: function() {
				this.$tabButtons.destroyTabbutton();
				Widget.invoke( "destroy", this );
			},
			detect: function() {
				this.$tabButtons = this.target.find( "*[amdquery-widget*='ui.tabbutton']" );

				this.$tabButtons.uiTabbutton();

				this.options.index = this.getSelectionIndex();

				return this.able().render();
			},
			customEventName: [ "click" ],
			options: {
				index: 0
			},
			getter: {

			},
			setter: {

			},
			publics: {
				select: Widget.AllowPublic,
				getSelectionIndex: Widget.AllowReturn
			},
			target: null,
			toString: function() {
				return "ui.tabbar";
			},
			widgetEventPrefix: "tabbar"
		} );

		return tabbar;
	} );

/*=======================================================*/

/*===================ui/tabview===========================*/
aQuery.define( "ui/tabview", [
    "main/query",
    "main/class",
    "main/event",
    "main/css",
    "main/position",
    "main/dom",
    "main/attr",
    "module/Widget",
    "ui/tabbar",
    "ui/tabbutton"
  ],
	function( $, query, cls, event, css, position, dom, attr, Widget, tabbar, tabbutton ) {
		"use strict";

		// Widget.fetchCSS( "ui/css/tabview" );

		var tabview = Widget.extend( "ui.tabview", {
			container: null,
			event: function() {},
			_initHandler: function() {
				var self = this,
					opt = this.options;
				this.tabviewEvent = function( e ) {
					switch ( e.type ) {
						case Widget.detectEventName:
							self.detect();
							self.$tabBar.uiTabbar( "detect" );
							break;
						case "tabbar.click":
							self.selectView( e.index );
							break;
					}

				};
				return this;
			},
			enable: function() {
				this.disable();
				this.$tabBar.on( "tabbar.click", this.tabviewEvent );
				this.target.on( Widget.detectEventName, this.tabviewEvent );
				this.options.disabled = false;
				return this;
			},
			disable: function() {
				this.$tabBar.off( "tabbar.click", this.tabviewEvent );
				this.target.off( Widget.detectEventName, this.tabviewEvent );
				this.options.disabled = true;
				return this;
			},
			render: function( index ) {
				var opt = this.options;

				this.selectView( index || opt.index );

			},
			selectTabbutton: function( index ) {
				this.$tabBar.uiTabbar( "option", "index", index );
			},
			selectView: function( index ) {
				var originIndex = this.options.index;
				this.$view.hide().eq( index ).show();
				this.options.index = index;

				if ( index !== originIndex ) {
					this.selectTabbutton( index );

					var activeView = this.$view.eq( index ),
						deactiveView = this.$view.eq( originIndex );

					deactiveView.trigger( "deactive", deactiveView[ 0 ], {
						type: "deactive"
					} );

					activeView.trigger( "active", activeView[ 0 ], {
						type: "active"
					} );

					var eventName = this.getEventName( "select" );

					this.target.trigger( eventName, this.target[ 0 ], {
						type: eventName,
						index: index
					} );
				}
			},
			init: function( opt, target ) {
				this._super( opt, target );

				this._initHandler();

				this.detect();

				return this;
			},
			destroy: function() {
				this.$tabBar.destroyTabbar();
				Widget.invoke( "destroy", this );
			},
			detect: function() {
				var $tabBar = this.target.children( "div[amdquery-widget*='ui.tabbar']" );

				this.$tabBar = $tabBar;

				$tabBar.uiTabbar();

				this.$view = this.target.children().filter( function() {
					return this === $tabBar[ 0 ];
				} );

				this.options.index = $tabBar.uiTabbar( "option", "index" );

				return this.able().render();
			},
			customEventName: [ "select" ],
			options: {
				index: 0
			},
			getter: {

			},
			setter: {

			},
			publics: {
				selectView: Widget.AllowPublic
			},
			target: null,
			toString: function() {
				return "ui.tabview";
			},
			widgetEventPrefix: "tabview"
		} );

		return tabview;
	} );

/*=======================================================*/

/*===================ui/turnBook===========================*/
﻿/** @deprecated */
aQuery.define( "ui/turnBook", [ "base/support", "base/typed", "main/css", "main/position", "main/dom", "main/class", "html5/css3", "ui/swappable", "module/Widget" ], function( $, support, typed, css1, position, dom, cls, css3, swappable, Widget, undefined ) {
	"use strict";
	var turnBook = Widget.extend( "ui.turnBook", {
		appendTo: function( index ) {
			var box = this.getBox( index );
			box && box.appendTo( this.container[ 0 ] );
			return this;
		},
		backgound: null,
		bookWidth: 0,
		bookHeight: 0,

		cache: null,
		container: null,
		create: function() {
			var opt = this.options;
			// size;

			this.cache = {};
			this.bookHeight = Math.round( this.target.innerHeight() );
			this.bookWidth = Math.round( this.target.innerWidth() );
			this.pageHeight = this.bookHeight;
			if ( opt.positionType == "half" ) {
				this.pageWidth = this.bookWidth;
				opt.inductionCorner = false;
				this.backgound = $( {
					position: "absolute",
					backgroundColor: opt.pageBackgroundColor
				}, "div" ); //.initTransform3d()
				//$({ b: opt.pageBackgroundColor, w: this.pageWidth, h: this.pageHeight }, "div", this.backgound);
			} else {
				this.pageWidth = this.bookWidth / 2;
			}

			opt.contentWidth = opt.contentWidth || this.pageWidth;
			opt.contentHeight = opt.contentHeight || this.pageHeight;

			this.container = $( {
				height: this.bookHeight + "px",
				width: this.bookWidth + "px",
				overflow: "hidden",
				position: "absolute"
			}, "div" ).appendTo( this.target.swappable() );
			this.container.initTransform3d && this.container.initTransform3d();

			this.message = $( {
				position: "absolute",
				top: this.bookHeight / 4 + "px",
				left: this.bookWidth / 4 + "px",
				width: this.bookWidth / 2 + "px",
				height: this.bookHeight / 2 + "px"
			}, "div" ).replaceClass( opt.messageClass ).addHandler( "mousedown", function() {
				$( this ).hide();
			} ).hide();

			//var opt = this.options;
			this.message.css( opt.messageClass );

			this.setSwap( opt.pauseSensitivity, opt.directionRange, opt.cursor );

			this.setBook( opt.bookName, opt.bookType, opt.bookContent, opt.bookIndex ).showPages( opt.bookIndex );

			this._initHandler();
			this.able();

			return this;
		},
		createPage: function() {
			var opt = this.options,
				box = $( {
					width: this.pageWidth + "px",
					height: this.pageHeight + "px",
					position: "absolute",
					overflow: "hidden"
				}, "div" ),
				page = $( {
					width: this.pageWidth + "px",
					height: this.pageHeight + "px",
					position: "absolute",
					backgroundColor: opt.pageBackgroundColor + "px",
					overflow: "hidden"
				}, "div", box );
			//box.initTransform3d && box.initTransform3d();
			page.box = box;
			return page;
		},
		createContext: function( html ) {
			var opt = this.options,
				content;
			switch ( opt.bookType ) {
				case "Array:Image":
					content = $( {
						top: opt.contentTop + "px",
						left: opt.contentLeft + "px",
						width: ( opt.contentWidth || this.pageWidth ) + "px",
						height: ( opt.contentHeight || this.pageHeight ) + "px",
						position: "absolute",
						border: "0px",
						overflow: "hidden",
						//, color: opt.contentFontColor
						//, font: opt.contentFont
						//, backgroundColor: opt.contentBackgroundColor
						padding: "0",
						cursor: "pointer"
					}, "img" ).addHandler( "mousedown", function( e ) {
						event.document.preventDefault( e );
					} ).replaceClass( opt.contentClass );
					content[ 0 ].setAttribute( "src", html );
					break;
				default:
				case "Array:String":
					content = $( {
						top: opt.contentTop + "px",
						left: opt.contentLeft + "px",
						width: ( opt.contentWidth || this.pageWidth ) + "px",
						height: ( opt.contentHeight || this.pageHeight ) + "px",
						position: "absolute",
						resize: "none",
						border: "0px",
						overflow: "hidden",
						color: opt.contentFontColor,
						font: opt.contentFont,
						backgroundColor: opt.contentBackgroundColor,
						padding: "0",
						pointerEvents: "auto",
						cursor: "pointer"
					}, "textArea" ).addHandler( "mousedown", function( e ) {
						event.document.preventDefault( e );
					} ).replaceClass( opt.contentClass ).html( html || "" );
					content[ 0 ].setAttribute( "readonly", "readonly" );
					if ( typed.isIpad ) {
						var clip = $( {
							top: opt.contentTop + "px",
							left: opt.contentLeft + "px",
							width: ( opt.contentWidth || this.pageWidth ) + "px",
							height: ( opt.contentHeight || this.pageHeight ) + "px",
							position: "absolute"
						}, "div" );
						content = $( [ content[ 0 ], clip[ 0 ] ] );
					}
					break;

			}
			return content;
		},
		customEventName: [ "star", "move", "pause", "stop" ],
		event: function() {

		},
		disable: function() {
			//var event = this.turnBookEvent();
			this.container.swappable( {
				start: null,
				stop: null,
				move: null,
				pause: null,
				mousemove: null
			} );
			this.options.disabled = true;
			return this;
		},
		enable: function() {
			var event = this.turnBookEvent;
			this.disable();
			this.container.swappable( {
				start: event,
				stop: event,
				move: event,
				pause: event,
				mousemove: event
			} );
			this.options.disabled = false;
			return this;
		},

		getBox: function( index ) {
			var page = this.getPage( index ),
				box = page != undefined ? page.box : undefined;
			return box;
		},
		getContent: function( index ) {
			return this.options.contents[ index ];
		},
		getPage: function( index ) {
			return this.options.pages[ index ];
		},

		hideMessage: function() {
			this.message.hide();
		},

		init: function( opt, target ) {
			this._super( opt, target );
			this.create();
			return this;
		},
		inductionCorner: function( x, y ) {
			var opt = this.options,
				result = false;
			//&& opt.positionType != "half"
			//                if (y <= opt.inductionWidth)
			//                    result = true;
			//                else if (y >= this.bookHeight - opt.inductionWidth)
			//                    result = true;
			//if (result) {
			if ( x <= opt.inductionWidth ) {
				result = true;
			} else if ( x >= this.bookWidth - opt.inductionWidth ) {
				result = true;
			} else {
				result = false;
			}

			return result;

		},
		isInLeft: function( x ) {
			return x < this.bookWidth / 2;
		},
		isInRight: function( x ) {
			return x > this.bookWidth / 2;
		},

		message: null,

		option: function( obj ) {
			Widget.invoke( "option", this, obj );
			var opt = this.options;
			if ( opt.bookType != "half" && opt.bookIndex % 2 ) {
				opt.bookIndex += 1;
			}
		},

		options: {
			bookName: "default",
			bookType: "Array:String",
			bookContent: null,
			bookIndex: 0,

			contents: [],
			contentTop: 0,
			contentLeft: 0,
			contentHeight: 0,
			contentWidth: 0,
			contentFontColor: "black",
			contentBackgroundColor: "white",
			contentClass: "amdquery_turnbook_content",
			contentFont: "12px",
			cursor: "pointer",

			inductionWidth: 20,
			isShowMessage: true,
			inductionCorner: true,

			directionRange: 22.5,
			disabled: 0,

			messageHideTime: 1500,
			messageClass: "amdquery_turnbook_message",

			pages: [],
			pageBackgroundColor: "white",

			positionType: "whole",
			pauseSensitivity: 500
		},

		pageHeight: 0,
		pageWidth: 0,
		publics: {
			hideMessage: Widget.AllowPublic,
			inductionCorner: Widget.AllowReturn,
			setBook: Widget.AllowPublic,
			setSwap: Widget.AllowPublic,
			showMessage: Widget.AllowPublic,
			showPages: Widget.AllowPublic,
			isInLeft: Widget.AllowReturn,
			isInRight: Widget.AllowReturn
		},
		_initHandler: function() {
			var self = this,
				target = self.target,
				opt = self.options,
				bookWidth = self.bookWidth,
				pageWidth = self.pageWidth,
				shadow = "10px 4px 2px rgba(0,0,0,.6),-5px 4px 2px rgba(0,0,0,.6)",
				mouseshow, turnNextHalf = function( index, offsetX ) {
					self.setBoxCss( index, {
						width: $.between( 0, pageWidth, pageWidth + offsetX - bookWidth ) + "px"
					} );
					self.setCss( self.backgound, {
						width: $.between( 0, pageWidth, ( bookWidth - offsetX ) / 2 ) + "px",
						left: offsetX + "px",
						boxShadow: shadow
					}, {
						tx: offsetX
					} );
				},
				turnPreHalf = function( index, offsetX ) {
					index && self.setCss( self.backgound, {
						width: $.between( 0, pageWidth, ( bookWidth - offsetX ) / 2 ) + "px",
						left: offsetX + "px",
						boxShadow: shadow
					}, {
						tx: offsetX
					} );
				},
				turnNextWhole = function( index, offsetX ) {
					self.setBoxCss( index, {
						width: $.between( 0, pageWidth, pageWidth + offsetX - bookWidth ) + "px"
					} ).setBoxCss( index + 1, {
						width: $.between( 0, pageWidth, ( bookWidth - offsetX ) / 2 ) + "px",
						left: offsetX + "px",
						boxShadow: shadow
					}, {
						tx: offsetX
					} );
				},
				turnPreWhole = function( index, offsetX ) {
					self.setBoxCss( index - 1, {
						width: $.between( 0, pageWidth, pageWidth - offsetX ) + "px",
						left: offsetX + "px"
					}, {
						tx: offsetX
					} ).setPageCss( index - 1, {
						left: ( -offsetX ) + "px"
					} ).setBoxCss( index - 2, {
						width: Math.ceil( $.between( 0, pageWidth, offsetX / 2 ) ) + "px",
						left: ( offsetX / 2 ) + "px",
						boxShadow: shadow
					}, {
						tx: offsetX / 2
					} ).setPageCss( index - 2, {
						left: $.between( -pageWidth, 0, offsetX / 2 - pageWidth ) + "px"
					} );
				};
			this.turnBookEvent = function( e ) {
				var index = opt.bookIndex,
					offsetX = e.offsetX;
				// offsetY = e.offsetY;
				switch ( e.type ) {
					case "swap.mousemove":
						//只会在非无线端有作用
						//var x = (e.pageX || e.clientX) - self.target.getLeft(), y = (e.pageY || e.clientY) - self.target.getTop();
						var x = e.offsetX,
							y = e.offsetY;
						if ( opt.inductionCorner == true && self.inductionCorner( x, y ) ) {
							mouseshow = true;
							if ( opt.positionType != "half" ) {
								self.isInLeft( x ) ? turnPreWhole( index, x ) : turnNextWhole( index, x );
							}
						} else {
							if ( mouseshow ) {
								mouseshow = false;
								self.showPages( index );
							}
						}
						break;
					case "swap.start":
						e.type = "turnbookstart";
						target.trigger( "turnbookstart", self, e );
						break;
					case "swap.move":
						if ( opt.positionType == "half" ) {
							switch ( e.direction ) {
								case 10:
									//向后翻页
								case 9:
								case 8:
									self.isInRight( e.startX ) ? turnNextHalf( index, offsetX ) : turnPreHalf( index, offsetX );
									break;
								case 2:
									//向前翻页
								case 3:
								case 4:
									self.isInLeft( e.startX ) ? turnPreHalf( index, offsetX ) : turnNextHalf( index, offsetX );
									break;
							}
						} else {
							switch ( e.direction ) {
								case 8:
									//向后翻页
								case 9:
								case 10:
									self.isInRight( e.startX ) ? turnNextWhole( index, offsetX ) : turnPreWhole( index, offsetX );
									break;
								case 2:
									//向前翻页
								case 3:
								case 4:
									self.isInLeft( e.startX ) ? turnPreWhole( index, offsetX ) : turnNextWhole( index, offsetX );
									break;
							}
						}
						e.type = "turnbookmove";
						target.trigger( "turnbookmove", self, e );
						break;
					case "swap.pause":
						e.type = "turnbookpause";
						target.trigger( "turnbookpause", self, e );
						break;
					case "swap.stop":
						switch ( e.direction ) {
							case 10:
								//向后翻页
							case 9:
							case 8:
								self.render( "right", e.startX );
								break;
							case 2:
								//向前翻页
							case 3:
							case 4:
								self.render( "left", e.startX );
								break;
						}
						e.type = "turnbookstop";
						target.trigger( "turnbookstop", self, e );
						break;
						//                    case "mouseout":
						//                        if (opt.inductionCorner == true && mouseshow) {
						//                            self.showPages(index);
						//                        }
						//                        break;
				}
			};

		},
		render: function( direction, startX ) {
			if ( !arguments.length ) {
				return;
			}
			var opt = this.options;
			if ( direction == "right" ) {
				if ( opt.bookIndex >= opt.pages.length - 1 ) {
					this.showPages( opt.bookIndex );
					opt.positionType == "half" && this.showMessage( "已经到最后一页" );
				} else {
					if ( opt.positionType == "half" ) this.showPages( opt.bookIndex + 1 );
					else this.isInRight( startX ) ? this.showPages( opt.bookIndex + 2 ) : this.showPages( opt.bookIndex );
				}
			} else if ( direction == "left" ) {
				if ( opt.bookIndex <= 0 ) {
					this.showPages( opt.bookIndex );
					opt.positionType == "half" && this.showMessage( "已经到第一页" );
				} else {
					if ( opt.positionType == "half" ) this.showPages( opt.bookIndex - 1 );
					else this.isInLeft( startX ) ? this.showPages( opt.bookIndex - 2 ) : this.showPages( opt.bookIndex );
				}
			}
			return this;
		},

		setBook: function( bookName, bookType, bookContent, bookIndex ) {
			var opt = this.options,
				cache = this.cache[ bookName ];
			if ( cache ) {
				opt.pages = cache.pages;
				opt.contents = cache.contents;
				opt.bookType = cache.bookType;
				opt.bookIndex = cache.bookIndex;
			} else {
				if ( bookContent ) {
					switch ( bookType ) { //加载1000页的速度还是很快的，如果很慢，需要动态加载，实现不复杂，看需求
						case "Array:Image":
							var page, content, len = bookContent.length; //, i = 1, value;
							opt.pages = [];
							opt.contents = [];
							len % 2 == 1 && bookContent.push( "" );
							$.each( bookContent, function( value, index ) {
								page = this.createPage();
								opt.pages[ index ] = page;
								content = this.createContext( value ).appendTo( page );
								//opt.contents[index] = typed.isIpad ? $(content[0]) : content;
							}, this );
							break;
						default:
						case "Array:String":
							var page, content, len = bookContent.length; //, i = 1, value;
							opt.pages = [];
							opt.contents = [];
							len % 2 == 1 && bookContent.push( "" );
							$.each( bookContent, function( value, index ) {
								page = this.createPage();
								opt.pages[ index ] = page;
								content = this.createContext( value ).appendTo( page );
								opt.contents[ index ] = typed.isIpad ? $( content[ 0 ] ) : content;
							}, this );

							break;

					}
					opt.bookIndex = bookIndex || 0;
					this.cache[ opt.bookName ] = {
						pages: opt.pages,
						contents: opt.contents,
						bookType: bookType,
						bookIndex: opt.bookIndex
					};
				}
			}
			return this;
		},
		setBoxCss: function( index, css, css3d ) {
			// var opt = this.options,
			var box = this.getBox( index );
			box && this.setCss( box, css, css3d );
			return this;
		},
		setContextCss: function( index, css ) {
			var opt = this.options,
				content = this.getContent( index );
			if ( content ) {
				css = css || {};
				css.color = opt.contentFontColor;
				css.backgroundColor = opt.contentBackgroundColor;
				css.font = opt.contentFont;
				switch ( opt.bookType ) {
					case "Array:String":
						content.css( css );
						break;
				}
			}
			return this;
		},
		setPageCss: function( index, css, css3d ) {
			var opt = this.options,
				page = this.getPage( index );
			if ( page ) {
				css = css || {};
				css.b = opt.pageBackgroundColor; //必须实现的
				this.setCss( page, css, css3d );
			}
			return this;
		},
		setCss: function( item, css, css3d ) {
			if ( css3d && support.transform3d ) {
				delete css.left;
				delete css.top;
				item.transform3d( css3d );
			}
			item.css( css );
			if ( css.boxShadow != undefined ) {
				item.css3( {
					boxShadow: css.boxShadow
				} );
			}
			return this;
		},

		setSwap: function( pauseSensitivity, directionRange, cursor ) {
			var opt = this.options;
			pauseSensitivity = pauseSensitivity || opt.pauseSensitivity;
			directionRange = directionRange || opt.directionRange;
			cursor = cursor || opt.cursor;
			this.container.swappable( {
				pauseSensitivity: pauseSensitivity,
				directionRange: directionRange,
				cursor: cursor
			} );
			opt.pauseSensitivity = pauseSensitivity;
			opt.directionRange = directionRange;
			opt.cursor = cursor;
		},
		showPages: function( index ) {
			var opt = this.options,
				begin, close, len = opt.pages.length - 1,
				pageWidth = this.pageWidth,
				bookWidth = this.bookWidth;
			this.container.children().remove();
			index = typed.isNum( index ) ? parseInt( $.between( 0, len, index ) ) : opt.bookIndex;
			if ( opt.positionType == "half" ) {
				for ( var i = index + 2; i >= index; i-- ) {
					this.setContextCss( i ).setBoxCss( i, {
						left: "0px",
						width: pageWidth + "px"
					}, {
						tx: 0
					} ).setPageCss( i, {
						left: "0px"
					} ).appendTo( i );
				}
				this.setContextCss( i - 1 ).setBoxCss( i - 1, {
					left: ( -pageWidth ) + "px",
					width: pageWidth + "px"
				}, {
					tx: -pageWidth
				} ).setPageCss( i - 1, {
					left: "0px"
				} ).appendTo( i - 1 );

				this.setCss( this.backgound, {
					left: "0px",
					width: this.pageWidth + "px",
					height: this.pageHeight + "px",
					boxShadow: ""
				}, {
					tx: this.pageWidth
				} );
				this.backgound.appendTo( this.container[ 0 ] );
			} else {
				if ( index % 2 ) index += 1;

				this.setContextCss( index - 3 ).setBoxCss( index - 3, {
					left: "0px",
					width: pageWidth + "px",
					boxShadow: ""
				}, {
					tx: 0
				} ).setPageCss( index - 3, {
					left: "0px"
				} ).appendTo( index - 3 );

				this.setContextCss( index - 1 ).setBoxCss( index - 1, {
					left: "0px",
					width: pageWidth + "px",
					boxShadow: ""
				}, {
					tx: 0
				} ).setPageCss( index - 1, {
					left: "0px"
				} ).appendTo( index - 1 );

				this.setContextCss( index + 2 ).setBoxCss( index + 2, {
					left: pageWidth + "px",
					width: pageWidth + "px",
					boxShadow: ""
				}, {
					tx: pageWidth
				} ).setPageCss( index + 2, {
					left: "0px"
				} ).appendTo( index + 2 );

				this.setContextCss( index ).setBoxCss( index, {
					left: pageWidth + "px",
					width: pageWidth + "px",
					boxShadow: ""
				}, {
					tx: pageWidth
				} ).setPageCss( index, {
					left: "0px"
				} ).appendTo( index );

				this.setContextCss( index + 1 ).setBoxCss( index + 1, {
					left: bookWidth + "px",
					width: pageWidth + "px",
					boxShadow: ""
				}, {
					tx: bookWidth
				} ).setPageCss( index + 1, {
					left: "0px"
				} ).appendTo( index + 1 );
				this.setContextCss( index - 2 ).setBoxCss( index - 2, {
					left: ( -pageWidth ) + "px",
					width: pageWidth + "px",
					boxShadow: ""
				}, {
					tx: -pageWidth
				} ).setPageCss( index - 2, {
					left: "0px"
				} ).appendTo( index - 2 );
			}
			this.cache[ opt.bookName ].bookIndex = opt.bookIndex = index;
		},
		showMessage: function( msg, autoHide ) {
			if ( this.options.isShowMessage !== true ) return this.hideMessage();
			this.message.appendTo( this.container ).show();
			if ( typed.isStr( msg ) ) {
				this.message.html( msg );
			} else {
				this.message.append( msg );
			}
			if ( autoHide === false ) return;
			var self = this;
			setTimeout( function() {
				self.hideMessage();
			}, this.options.messageHideTime );

		},

		target: null,
		toString: function() {
			return "ui.turnbook";
		},

		widgetEventPrefix: "turnbook"
	} );

	//提供注释
	$.fn.uiTurnBook = function( a, b, c, args ) {
		/// <summary>翻书
		/// <para>大小位置关系初始化后不得修改</para>
		/// <para>str obj.bookName:书名 缺省"default"</para>
		/// <para>str obj.bookType:书的类型 缺省"Array:String"</para>
		/// <para>any obj.bookContent:书的内容 不可缺省</para>
		/// <para>num obj.bookIndex: 第几页 缺省0</para>
		/// <para>num obj.contentTop:内容x坐标位置 缺省0</para>
		/// <para>num obj.contentLeft:内容y坐标位置 缺省0</para>
		/// <para>num obj.contentHeight:内容的高度 缺省0</para>
		/// <para>num obj.contentWidth: 内容的宽度 缺省0</para>
		/// <para>str obj.contentFontColor:内容字体颜色 缺省"black"</para>
		/// <para>str obj.contentBackgroundColor:内容背景色 缺省"白色"</para>
		/// <para>str obj.contentClass:内容样式名 缺省"amdquery_turnbook_content"</para>
		/// <para>str obj.contentFont:内容字体大小 缺省12px</para>
		/// <para>str obj.cursor:鼠标样式 缺省"pointer"</para>
		/// <para>num obj.inductionWidth:边缘捕捉范围 缺省20</para>
		/// <para>bol obj.isShowMessage:是否显示信息 缺省true</para>
		/// <para>bol obj.inductionCorner: 是否捕捉边缘 缺省true</para>
		/// <para>num obj.directionRange:swappable的相关属性 缺省22.5</para>
		/// <para>bol obj.disabled:是否启用 缺省true</para>
		/// <para>num obj.messageHideTime:信息框隐藏时间 单位毫秒 缺省1500</para>
		/// <para>str obj.messageClass:信息框样式名 缺省amdquery_turnbook_message</para>
		/// <para>str obj.pageBackgroundColor:背景层颜色 缺省"white"</para>
		/// <para>str obj.positionType: 书的形态 半本为"half" 整本为"whole" 缺省"whole"</para>
		/// <para>fun obj.trunbookstart:滑动开始</para>
		/// <para>fun obj.trunbookmove:滑动</para>
		/// <para>fun obj.trunbookpause:滑动结束</para>
		/// <para>fun obj.trunbookstop:滑动暂停</para>
		/// </summary>
		/// <param name="a" type="Object/String">初始化obj或属性名:option或方法名</param>
		/// <param name="b" type="String/null">属性option子属性名</param>
		/// <param name="c" type="any">属性option子属性名的值</param>
		/// <param name="args" type="any">在调用方法的时候，后面是方法的参数</param>
		/// <returns type="$" />
		return turnBook.apply( this, arguments );
	};

	return turnBook;
} );

/*=======================================================*/

/*===================main/parse===========================*/
﻿aQuery.define( "main/parse", [ "main/dom" ], function( $, dom ) {
	"use strict";
	var rsingleTag = /^<(\w+)\s*\/?>(?:<\/\1>|)$/;

	function createDocument() {
		if ( typeof createDocument.activeXString != "string" ) {
			var i = 0,
				versions = [ "Microsoft.XMLDOM", "MSXML2.DOMDocument.6.0", "MSXML2.DOMDocument.5.0", "MSXML2.DOMDocument.4.0", "MSXML2.DOMDocument.3.0", "MSXML2.DOMDocument" ],
				len = versions.length,
				xmlDom;
			for ( ; i < len; i++ ) {
				try {
					xmlDom = new ActiveXObject( versions[ i ] );
					createDocument.activeXString = versions[ i ];
					return xmlDom;
				} catch ( e ) {

				}
			}
		}
		return new ActiveXObject( createDocument.activeXString );
	};

	/**
	 * @pubilc
	 * @exports main/parse
	 * @requires module:main/dom
	 */
	var parse = {
		/**
		 * @param {String}
		 * @returns {JSON}
		 */
		JSON: function( data ) {
			if ( typeof data !== "string" || !data ) {
				return null;
			}
			// Make sure the incoming data is actual JSON
			// Logic borrowed from http://json.org/json2.js
			if ( /^[\],:{}\s]*$/.test( data.replace( /\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, "@" )
				.replace( /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, "]" )
				.replace( /(?:^|:|,)(?:\s*\[)+/g, "" ) ) ) {

				// Try to use the native JSON parser first
				return window.JSON && window.JSON.parse ?
					window.JSON.parse( data ) :
					( new Function( "return " + data ) )();

			} else {
				throw new Error( "Invalid JSON: " + data, "EvalError" );
			}
			return null;
		},
		/**
		 * Data: string of html.
		 * @param {String}
		 * @param {String|Boolean} [context] - If specified, the fragment will be created in this context, defaults to document.
		 * @param {Boolean} [keepScripts] - If true, will include scripts passed in the html string.
		 * @returns {JSON}
		 */
		HTML: function( data, context, keepScripts ) {
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
		/**
		 * @example
		 * parse.QueryString("name=Jarry&age=27")
		 * //{
		 * //  name: "Jarry",
		 * //  name: "27"
		 * //}
		 * @param {String}
		 * @param {String} [split1="&"]
		 * @param {String} [split2="="]
		 * @returns {Object}
		 */
		QueryString: function( str, split1, split2 ) {
			var qs = str || ( location.search.length > 0 ? location.search.substring( 1 ) : "" ),
				args = {};
			if ( qs ) {
				$.each( qs.split( split1 || "&" ), function( item ) {
					item = item.split( split2 || "=" );
					if ( item[ 1 ] !== undefined ) {
						args[ decodeURIComponent( item[ 0 ] ) ] = decodeURIComponent( item[ 1 ] );
					}
				} );
			}
			return args;
		},
		/**
		 * @param {String}
		 * @returns {Document}
		 */
		XML: ( function( xml ) {
			var parseXML;
			if ( typeof DOMParser != "undefined" ) {
				parseXML = function( xml ) {
					var xmldom = ( new DOMParser() ).parseFromString( xml, "text/xml" ),
						errors = xmldom.getElementsByTagName( "parsererror" );
					if ( errors.length ) {
						throw new Error( "parseXML: " + errors[ 0 ].textContent + " SyntaxError" )
					}
					return xmldom;
				};
			} else if ( document.implementation.hasFeature( "LS", "3.0" ) ) {
				parseXML = function( xml ) {
					var implementation = document.implementation,
						parser = implementation.createLSParser( implementation.MODE_SYNCHRONOUS, null ),
						input = implementation.createLSInput();
					input.stringData = xml;
					return parser.parse( input );
				};
			} else if ( typeof ActiveXObject != "undefined" ) {
				parseXML = function( xml ) {
					var xmldom = createDocument();
					xml.async = "false";
					xmldom.loadXML( xml );
					if ( xmldom.parseError != 0 ) {
						throw new Error( "parseXML: " + xmldom.parseError.reason + " SyntaxError" )
					}
					return xmldom;
				};
			} else {
				throw ( "No XML parser available", "Error" );
			}
			return parseXML;
		} )()
	};

	return parse;
} );

/*=======================================================*/

/*===================module/location===========================*/
aQuery.define( "module/location", [ "base/extend", "main/parse" ], function( $, utilExtend, parse ) {
	this.describe( "Location to Hash" );

	var
	SPLIT_MARK = "!",
		EQUALS_MARK = "=",
		_location = window.location;

	function hashToString( hash, split1, split2 ) {
		var key, value, strList = [];
		for ( key in hash ) {
			value = hash[ key ];
			strList.push( key + split2 + value );
		}
		return strList.join( split1 );
	}

	/**
	 * @exports module/location
	 * @describe window.location to hash
	 * @example
	 * // http://localhost:8080/document/app/asset/source/guide/AMDQuery.html#swapIndex=1!scrollTo=#Config
	 * {
	 *   swapIndex: "1",
	 *   scrollTo:  "#Config"
	 * }
	 */
	var location = {
		/**
     * Get value form hash.
     * @param {String}
		 * @returns {String}
		 */
		getHash: function( key ) {
			this.toHash();
			return this.hash[ key ];
		},
    /**
     * Set value to hash by key.
     * @param {String}
     * @param {*}
     * @returns {this}
     */
		setHash: function( key, value ) {
			this.hash[ key ] = value + "";
			_location.hash = hashToString( this.hash, SPLIT_MARK, EQUALS_MARK );
			return this;
		},
    /**
     * Remove key from hash.
     * @param {String}
     * @returns {this}
     */
		removeHash: function( key ) {
			if ( this.hash[ key ] !== undefined ) {
				delete this.hash[ key ];
				_location.hash = hashToString( this.hash, SPLIT_MARK, EQUALS_MARK );
			}
			return this;
		},
    /**
     * Clear window.location.hash
     * @returns {this}
     */
		clearHash: function() {
			window.location.hash = "";
			this.hash = {};
			return this;
		},
    /**
     * Parse window.location.hash to object for this.hash.
     * @returns {this}
     */
		toHash: function() {
			this.hash = parse.QueryString( _location.hash.replace( "#", "" ), SPLIT_MARK, EQUALS_MARK );
			return this;
		},
    /**
     * An object of window.location.hash.
     * @type {Object}
     */
		hash: {}
	};

	location.toHash();

	return location;
} );

/*=======================================================*/
