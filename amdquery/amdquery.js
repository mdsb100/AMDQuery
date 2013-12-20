/**
 * @overview AMDQuery JavaScript Library
 * @copyright 2012, Cao Jun
 * @version 1.0.0
 */



( function( window, undefined ) {
	"use strict"; //启用严格模式
	var
	core_slice = [].slice,
		core_splice = [].splice;

	var
	version = "AMDQuery 1.0.0",
		util = {
			argToArray: function( arg, start, end ) {
				/// <summary>把arguments变成数组</summary>
				/// <param name="arg" type="arguments]">arguments</param>
				/// <param name="start" type="Number">开始</param>
				/// <param name="end" type="Number">结束</param>
				/// <returns type="Array" />
				return core_slice.call( arg, start || 0, end || arg.length );
			},

			error: function( info, type ) {
				var s = "";
				if ( info.fn && info.msg ) {
					s = [ "call ", info.fn, "()", " error: ", info.msg ].join( "" );
				} else {
					s = info.toString();
				}
				throw new window[ type || "Error" ]( s );
			},
			extend: function( a, b ) {
				/// <summary>把对象的属性复制到对象一</summary>
				/// <param name="a" type="Object">对象</param>
				/// <param name="b" type="Object">对象</param>
				/// <returns type="a" />
				for ( var i in b )
					a[ i ] = b[ i ];
				return a;
			},

			getJScriptConfig: function( list, asc ) {
				/// <summary>获得脚本配置属性</summary>
				/// <param name="list" type="Array:[String]">参数名列表</param>
				/// <param name="asc" type="Boolean">true为正序，兼容IE，意味着JS总是插入到第一个</param>
				/// <returns type="Object" />
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
						// else {
						//   attr[ 1 ].match( /false|true|1|0/ ) && ( attr[ 0 ] = eval( attr[ 1 ] ) );
						//   result[ item ] = attr[ 0 ];
						// }
					}
				}
				return result;
			},
			getPath: function( key, suffix ) {
				/// <summary>获的路径</summary>
				/// <param name="list" type="Array:[String]">参数名列表</param>
				/// <param name="asc" type="Boolean">true为正序，兼容IE，意味着JS总是插入到第一个</param>
				/// <returns type="Object" />
				var _key = key,
					_suffix = suffix,
					_aKey, _url, ma;
				if ( !_suffix ) {
					_suffix = ".js";
				}
				if ( ma = _key.match( /\.[^\/\.]*$/g ) ) {
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

			now: function() {
				/// <summary>返回当前时间的字符串形式</summary>
				/// <returns type="String" />
				return ( new Date() ).getTime();
			},

			removeSuffix: function( src ) {
				src = src.replace( /\/$/, "" );
				if ( src.match( /\.[^\/\.]*$/g ) ) {
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
		rootPath = basePath.replace( /((.*?\/){3}).*$/, "$1" ),
		runTime;

	/**
	 * <h3>
	 * Config of amdquery. <br />
	 * </h3>
	 * @public
	 * @module base/config
	 * @property {object}  config                              - exports
	 * @property {object}  config.amdquery                     - The amdquery Configuration.
	 * @property {boolean} config.amdquery.debug               - Whether debug, it will be the output log if true.
	 * @property {boolean} config.amdquery.development         - Whether it is a development environment.
	 *
	 * @property {object}  config.amd                          - The AMD Configuration.
	 * @property {boolean} config.amd.detectCR                 - Detect circular dependencies, you should set it true when you develop.
	 * @property {boolean} config.amd.debug                    - It will add "try-catch" when module load if false, so you could not see any error infomation.
	 * @property {number}  config.amd.timeout                  - Timeout of the loading module.
	 * @property {boolean} config.amd.console                  - It will be output log "module [id] ready" if true
	 *
	 * @property {object}  config.ui                           - The UI-Widget Configuration.
	 * @property {boolean} config.ui.initWidget                - Automatic initialization UI.
	 * @property {string}  config.ui.loadingClassName          - When loading UI, the mask layer using the CSS name.
	 * @property {boolean} config.ui.autoFetchCss              - Automatic fetching CSS.
	 * @property {boolean} config.ui.isTransform3d             - Whether to use transform3d.
	 *
	 * @property {object}  config.module                       - The module Configuration.
	 *
	 * @property {object}  config.app                          - The application Configuration.
	 * @property {string}  config.app.src                      - A js file src, main of application.
	 * @property {string}  config.app.loadingImage             - A image src will be show when application is loading.
	 * @property {boolean} config.app.debug                    - Whether debug, it will be the output log if true.
	 * @property {boolean} config.app.development              - Whether it is a development environment.
	 * @property {boolean} config.app.autoFetchCss             - Automatic fetching CSS.
	 * @property {string} config.app.xmlPath                   - Path of the combination XML, build could create it and set it.
	 */

	// _config be define "base/config".
	var _config = {
		amdquery: {
			define: "$",
			debug: false,
			development: true
		},
		amd: {
			detectCR: false,
			debug: true,
			timeout: 5000,
			console: false
		},
		ui: {
			initWidget: false,
			loadingClassName: "widget-loading",
			autoFetchCss: true,
			isTransform3d: true
		},
		module: {

		},
		app: {
			src: "",
			loadingImage: "",
			debug: false,
			development: true,
			autoFetchCss: true,
			xmlPath: "xml/combination.xml"
		}
	};
	var defineConfig = {};
	if ( typeof aQueryConfig != "undefined" && typeof aQueryConfig === "object" ) {
		defineConfig = aQueryConfig;
	} else {
		defineConfig = util.getJScriptConfig( [ "amdquery", "amd", "ui", "module", "app" ] );
	}

	util.extend( _config.amdquery, defineConfig.amdquery );
	util.extend( _config.amd, defineConfig.amd );
	util.extend( _config.ui, defineConfig.ui );
	util.extend( _config.module, defineConfig.module );
	util.extend( _config.app, defineConfig.app );

	/**
	 * You can config global name. <a href="/document/app/asset/source/guide/AMDQuery.html#scrollTo=Reference_AMDQuery">AMDQuery.html</a> </br>
	 * <strong>aQuery("div")</strong> equivalent to <strong>new aQuery("div")</strong>
	 * @global
	 * @class
	 * @param {Object|String|Element|Element[]|Function}
	 * @param {String}
	 * @param {Element}
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
	var aQuery = function( a, b, c ) {
		/// <summary>创造一个新$对象
		/// <para>例:$(function(){将会在window.onload时执行})</para>
		/// <para>例:$("div")</para>
		/// <para>例:$([ele,ele,ele])</para>
		/// <para>以下依赖main/query</para>
		/// <para>例:$($("#A"))</para>
		/// <para>以下依赖main/dom</para>
		/// <para>例:$({h:100,w:100},"div")</para>
		/// <para>例:$(null,"div",document.body)</para>
		/// <para>例:$({h:100,w:100},"div",document.body)</para>
		/// <para>对于table的appendChild,removeChild可能不兼容低版本IE浏览器,table必须插入tbody</para>
		/// <para>如果要直接写html应当使用parse调用它的parse.xml()</para>
		/// </summary>
		/// <param name="a" type="Object/String/Element/fun/$">可重载</param>
		/// <param name="b" type="String">标签名 可选</param>
		/// <param name="c" type="ele $">父元素 可选</param>
		/// <returns type="$" />
		if ( $.forinstance( this ) ) {
			if ( !a && !b ) return;
			if ( ( typeof a == "object" || a == undefined || a == null ) && typeof b == "string" ) {
				//if ($.css) {
				count++;
				if ( b == undefined || b == null ) b = "div";
				var obj = document.createElement( b );
				this.init( [ obj ] );

				$.interfaces.trigger( "constructorCSS", this, a, b, c );

				$.interfaces.trigger( "constructorDom", this, a, b, c );

				obj = null;

			} else if ( a ) {
				var result;
				if ( result = $.interfaces.trigger( "constructorQuery", a, b ) ) {
					count++;
					this.init( result, a );

				}
			}
		} else if ( typeof a == "function" ) {
			$.ready( a );
		} else return new $( a, b, c );
	},
		$ = aQuery;

	util.extend( $, {
		cabinet: {},
		copyright: "2012 Cao Jun",

		interfaces: {
			achieve: function( name, fun ) {
				/// <summary>实现一个接口</summary>
				/// <param name="name" type="String">接口名</param>
				/// <param name="name" type="String">要实现的方法</param>
				/// <returns type="Self" />
				$.interfaces.handlers[ name ] = fun;
				return this;
			},
			trigger: function( name ) {
				/// <summary>对外接口调用 内部的</summary>
				/// <param name="name" type="String">接口名</param>
				/// <returns type="any" />
				var item = $.interfaces.handlers[ name ];
				return item && item.apply( this, arguments );
			},
			handlers: {
				editEventType: null,
				proxy: null,
				constructorCSS: null,
				constructorDom: null,
				constructorQuery: null
			}

		},
		module: {},
		toString: function() {
			/// <summary></summary>
			/// <returns type="String" />
			return "AMDQuery";
		},
		valueOf: function() {
			/// <summary>返回模块信息</summary>
			/// <returns type="String" />
			var info = [ version, "\n" ],
				value, key;
			for ( key in $.module ) {
				value = $.module[ key ];
				info.push( key, " : ", value, "\n" );
			}
			return info.join( "" );
		},
		version: version,
		_redundance: {
			argToArray: util.argToArray
		},

		basePath: basePath,
		between: function( min, max, num ) {
			/// <summary>如果num在min和max区间内返回num否则返回min或max</summary>
			/// <param name="min" type="Number">最小值</param>
			/// <param name="max" type="Number">最大值</param>
			/// <param name="num" type="Number">要比较的值</param>
			/// <returns type="Number" />
			return Math.max( min, Math.min( max, num ) );
		},
		among: function( num1, num2, num ) {
			/// <summary>如果num在min和max区间内返回num否则返回min或max</summary>
			/// <param name="num1" type="Number">值1</param>
			/// <param name="num2" type="Number">值1</param>
			/// <param name="num" type="Number">要比较的值</param>
			/// <returns type="Number" />
			return num2 > num1 ? $.between( num1, num2, num ) : $.between( num2, num1, num );
		},
		bind: function( fun, context ) {
			/// <summary>绑定作用域</summary>
			/// <param name="fun" type="Function">方法</param>
			/// <param name="context" type="Object">context</param>
			/// <returns type="Function" />
			return function() {
				return fun.apply( context || window, arguments );
			};
		},

		logger: ( window.console ? ( console.log.bind ? console.log.bind( console ) : console.log ) : function() {} ),
		createEle: function( tag ) {
			/// <summary>制造一个Dom元素</summary>
			/// <param name="tag" type="String">标签名</param>
			/// <returns type="Element" />
			var ele, div;
			// if ( /^(?:(<[\w\W]+>)[^>]*|#([\w-]*))$/.test( tag ) ) {
			//   div = document.createElement( "div" );
			//   div.innerHTML = tag;
			//   ele = div.childNodes[0];
			//   div = null;
			// } else {
			ele = document.createElement( tag );
			// }
			return ele;
		},

		each: function( obj, callback, context ) {
			/// <summary>对象遍历</summary>
			/// <param name="obj" type="Object">对象</param>
			/// <param name="callback" type="Function">执行方法</param>
			/// <param name="context" type="Object">作用域</param>
			/// <returns type="self" />
			//consult from jQuery-1.4.1
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

		forinstance: function( obj ) {
			/// <summary>是否为$对象</summary>
			/// <param name="a" type="any">任意对象</param>
			/// <returns type="Boolean" />
			return obj instanceof $ || ( obj && obj.toString() == "AMDQuery" );
		},

		merge: function( first, second ) {
			/// <summary>把对象2 合并到 对象1</summary>
			/// <param name="first" type="Array">对象</param>
			/// <param name="second" type="Array">对象</param>
			/// <returns type="Array" />
			//consult from jQuery-1.9.1
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

		getJScriptConfig: util.getJScriptConfig,
		getPath: util.getPath,

		now: util.now,

		core_pnum: /[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/.source,

		rootPath: rootPath,

		pagePath: pagePath,

		util: {
			argToArray: util.argToArray,

			camelCase: function( name, head ) {
				/// <summary>把"margin-left驼峰化"</summary>
				/// <param name="name" type="String">字符串</param>
				/// <param name="head" type="String">字符串头</param>
				/// <returns type="String" />
				name.indexOf( "-" ) > 0 ? name = name.toLowerCase().split( "-" ) : name = [ name ];

				head && name.splice( 0, 0, head );

				for ( var i = 1, item; i < name.length; i++ ) {
					item = name[ i ];
					name[ i ] = item.substr( 0, 1 ).toUpperCase() + item.slice( 1 );
				}
				return name.join( "" );
			},

			trim: function( str ) {
				/// <summary>去除前后的空格换行符等字符</summary>
				/// <param name="str" type="String">长度 缺省为整个长度</param>
				/// <returns type="String" />
				return str.replace( /(^\s*)|(\s*$)/g, "" );
			},

			unCamelCase: function( name, head ) {
				/// <summary>反驼峰化</summary>
				/// <para>marginLeft => margin-left</para>
				/// <param name="name" type="String">字符串</param>
				/// <param name="head" type="String">字符串头</param>
				/// <returns type="String" />
				name = name.replace( /([A-Z]|^ms)/g, "-$1" ).toLowerCase();
				head && ( name = head + "-" + name );
				return name;
			},

			removeSuffix: util.removeSuffix
		}
	} );

	$.fn = $.prototype = {
		push: function( ele ) {
			/// <summary>添加元素</summary>
			/// <param name="ele" type="Element">元素</param>
			/// <returns type="self" />
			this.eles.push( ele );
			return this.init( this.eles );
		},
		pop: function() {
			/// <summary>删除返回元素</summary>
			/// <returns type="Self" />
			var ret = this.eles.pop();
			this.init( this.eles );
			return new $( ret );
		},
		shift: function() {
			/// <summary>删除头部一个元素</summary>
			/// <returns type="Self" />
			var ret = this.eles.shift();
			this.init( this.eles );
			return new $( ret );
		},
		unshift: function( ele ) {
			/// <summary>增加头部第一个元素</summary>
			/// <param name="ele" type="Element">元素</param>
			/// <returns type="Self" />
			return new $( this.eles.splice( 0, 0, ele ) );
		},
		slice: function() {
			/// <summary>截取一段并返回新的$</summary>
			/// <returns type="$" />
			return new $( core_slice.call( this.eles, arguments ) );
		},
		splice: function() {
			/// <summary>删除插入一段并返回新的$</summary>
			/// <returns type="$" />
			var ret = core_splice.call( this.eles, arguments );
			this.init( this.eles );
			return new $( ret );
		},
		reverse: function() {
			/// <summary>反转</summary>
			/// <returns type="self" />
			this.eles.reverse();
			return this.init( this.eles );
		},
		sort: function( fn ) {
			/// <summary>排序</summary>
			/// <param name="fn" type="Function">筛选条件</param>
			/// <returns type="self" />
			this.eles.sort( fn );
			return this.init( this.eles );
		},

		constructor: $,

		each: function( callback ) {
			/// <summary>遍历所有的元素</summary>
			/// <param name="callback" type="Function">遍历中的操作</param>
			/// <returns type="self" />
			$.each( this.eles, callback, this );
			return this;
		},
		eles: null,

		first: function() {
			/// <summary>返回第一个元素</summary>
			/// <returns type="Element" />
			return $( this.eles[ 0 ] || this.eles );
		},
		getElement: function( index ) {
			/// <summary>返回序号的元素</summary>
			/// <param name="index" type="Number">序号</param>
			/// <returns type="Element" />
			if ( typeof index == "number" && index != 0 ) return this[ index ];
			else return this[ 0 ];
		},
		last: function() {
			/// <summary>返回最后个元素</summary>
			/// <returns type="Element" />
			return $( this.eles[ this.eles.length - 1 ] || this.eles );
		},

		init: function( eles, selector ) {
			/// <summary>初始化$</summary>
			/// <param name="eles" type="Array">内容为元素的数组</param>
			/// <param name="selector" type="any"></param>
			/// <returns type="self" />
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
		indexOf: function( ele ) {
			/// <summary>返回序号</summary>
			/// <param name="ele" type="Element">dom元素</param>
			/// <returns type="Number" />
			var len;

			for ( len = this.eles.length - 1; len >= 0; len-- ) {
				if ( ele === this.eles[ len ] ) {
					break;
				}
			}

			return len;
		},

		length: 0,

		selector: "",

		setElement: function( eles ) {
			/// <summary>设置元素组</summary>
			/// <param name="eles" type="Array">内容为元素的数组</param>
			/// <returns type="self" />
			this.eles = eles;
			return this.init( this.eles );
		},

		toString: function() {
			/// <summary>返回元素组的字符串形式</summary>
			/// <returns type="String" />
			return this.eles.toString();
		},

		valueOf: function() {
			/// <summary>返回生成$对象的总数</summary>
			/// <returns type="Number" />
			return count;
		},

		toArray: function() {
			return core_slice.call( this );
		},

		// Get the Nth element in the matched element set OR
		// Get the whole matched element set as a clean array
		get: function( num ) {
			return num == null ?

			// Return a 'clean' array
			this.toArray() :

			// Return just the object
			( num < 0 ? this[ this.length + num ] : this[ num ] );
		},

		version: version
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
		 * @param {Function|Function[]} fn - Do some thing
		 * @param {Object} [context] - Context of fn
		 * @param {Array} [args] - Args is arguments of fn
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
		 * @param {Object} [context=null] - Context of fn
		 * @param {Array} [args=Array] args - Args is arguments of fn
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
		"use strict"; //启用严格模式
		$.module.require = "1.0.0";

		var _define, _require;
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
			 * @memberof module:base/ClassModule
			 * @constructs module:base/ClassModule
			 * @param {String} module - Module name
			 * @param {Array} dependencies - Dependencies module
			 * @param {Function|Object|String|Number|Boolean} [factory] - Module body
			 * @param {Number} [status=0] - 0:init 1:queue 2:require 3:define 4:ready
			 * @param {String} [container] - Path of js
			 * @param {Function} [fail] - An function to the fail callback if loading moudle timeout or error
			 */
			if ( !module ) {
				return;
			}
			this.handlers = {};
			this.module = null;
			this.first = null;
			this.description = "No description";
			this.id = ClassModule.variable( module );
			this.reset( dependencies, factory, status, container, fail );
			ClassModule.setModule( this.id, this );

			//this.check();
		}

		util.extend( ClassModule, {
			anonymousID: null,
			requireQueue: requireQueue,
			cache: {},
			/**
			 * A map to path ofmodule file
			 * @type Object
			 * @memberOf module:base/ClassModule
			 */
			container: {},
			/**
			 * A map to module dependency
			 * @type Object
			 * @memberOf module:base/ClassModule
			 */
			dependenciesMap: {},
			/**
			 * Check the name is equal to anonymous name which assigned by "require"
			 * @private
			 * @method
			 * @memberOf module:base/ClassModule
			 * @param {String} - Module name
			 * @throws Will throw an error if the name is not equal anonymousID
			 * @returns {void}
			 */
			checkName: function( id ) {
				if ( this.anonymousID != null && id.indexOf( "tempDefine" ) < 0 ) {
					id !== this.anonymousID && util.error( {
						fn: "define",
						msg: "the named " + id + " is not equal require"
					} );
				}
			},
			/**
			 * ClassModule contains the module
			 * @method
			 * @memberOf module:base/ClassModule
			 * @param {String} - Module name
			 * @returns {Boolean}
			 */
			contains: function( id ) {
				id = ClassModule.variable( id );
				return !!ClassModule.modules[ id ];
			},
			/**
			 * Detect circle reference
			 * @method
			 * @memberOf module:base/ClassModule
			 * @param {String} - Module name
			 * @param {String[]} - Dependent modules
			 * @returns {Boolean} - Module name
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
			 * Wrap with a function
			 * @method
			 * @memberOf module:base/ClassModule
			 * @param {*} - body
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
			 * Get src of module file
			 * @method
			 * @memberOf module:base/ClassModule
			 * @param {String} - Module name
			 * @param {Boolean} [asc=true] - getJScriptConfig option
			 * @returns {String} - path
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
			 * modify module name to a file path
			 * @method
			 * @memberOf module:base/ClassModule
			 * @param {String} - Module name
			 * @param {String} [suffix=".js"]
			 * @returns {String} - path
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
			 * get Module with module
			 * @method
			 * @memberOf module:base/ClassModule
			 * @param {String} - Module name
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
			 * @param {String[]} - An array of module name
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
			 * @param {String} - url of js
			 * @param {String} - Module name
			 * @param {Function} - An function to the fail callback if loading moudle timeout or error
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
			 * A map be depend
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
			 * A map of path variable
			 * @type Object
			 * @memberOf module:base/ClassModule
			 */
			variableMap: {},
			/**
			 * variable prefix
			 * @type String
			 * @default "@"
			 * @memberOf module:base/ClassModule
			 */
			variablePrefix: "@",
			/**
			 * Load js file on asynchronous.
			 * @method
			 * @memberOf module:base/ClassModule
			 * @param {String} - url of js
			 * @param {String} - Module name
			 * @param {Function} - An function to the fail callback if loading moudle timeout or error
			 * @returns {this}
			 */
			setModule: function( k, v ) {
				!this.getModule( k ) && ( this.modules[ k ] = v );
				return this;
			},
			/**
			 * status map
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
			 * @param {String} - Module name
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
		 * This callback is displayed as a global member.
		 * @callback ClassModuleCallback
		 * @this module:base/ClassModule
		 * @param {...*} - An argument array of any object. Any one argument is defined in the module.
		 */

		ClassModule.prototype = /** @lends module:base/ClassModule.prototype */ {
			/**
			 * When completed, the param fn is called
			 * @method
			 * @param {ClassModuleCallback} - handler
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
			 * check status then to do something
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
			 * Get an array of dependent modules
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
			 * Module ready and trigger handler
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
			 * Get stats of module
			 * @method
			 * @param {Boolean} - if true get string else get number.
			 * @returns {Number|String}
			 */
			getStatus: function( isStr ) {
				var s = this.status;
				return isStr == true ? ClassModule.statusReflect[ s ] : s;
			},
			/**
			 * Describe module
			 * @method
			 * @param {String} - content
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
			 * Wait module get ready
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
			 * Reset property
			 * @method
			 * @protected
			 * @param {Array} dependencies - Dependencies module
			 * @param {Function|Object|String|Number|Boolean} [factory] - Module body
			 * @param {Number} [status=0] - 0:init 1:queue 2:require 3:define 4:ready
			 * @param {String} [container] - Path of js
			 * @param {Function} [fail] - An function to the fail callback if loading moudle timeout or error
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
			 * Go to load Module
			 * @method
			 * @returns {this}
			 */
			load: function() {
				var id = this.id,
					fail = this.fail,
					status = this.getStatus(),
					url;

				( url = ClassModule.getPath( id, ".js" ) ) || util.error( {
						fn: "require",
						msg: "Could not load module: " + id + ", Cannot match its URL"
					} );
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
			 * Go to load Dependent
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
			 * Module go to launch
			 * @method
			 * @param {Function} [success] - ready callback
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
			 * Trigger event
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
		 * AMD define
		 * @global
		 * @method
		 * @param {String} - Module
		 * @param {String[]|*} - If arguments[2] is a factory, it can be any object
		 * @param {*} [factory] - Usually, it is function(){} or {}
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
				container = /tempDefine/.test( id ) ? "inner" : ClassModule.getContainer( id );
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
					module = "tempDefine:" + module.join( "," );
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
		 * AMD require
		 * @method require
		 * @global
		 * @param {String} - Module
		 * @param {ClassModuleCallback}
		 * @param {Function} [fail] - An function to the fail callback if loading moudle timeout or error
		 * @returns {ClassModule}
		 * @example
		 * require( [ "main/query", "hash/locationHash", "ui/swapview", "ui/scrollableview", "module/initWidget" ], function( query, locationHash ) { } );
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
			 * Cache the module
			 * @memberof require(namespace)
			 * @param {Object.<String,Function>} - String: module name,Function: moudle factory
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
			 * @memberof require(namespace)
			 * @param {String|String[]|Object.<String,*>} - String: module name
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
			 * Reflect path
			 * @memberof require(namespace)
			 * @param {String|Object.<String,String>} - Module name | Object.<String,String>: <"module name", "js path">
			 * @param {String} [path] - js path; If "name" is Object then "path" is optional
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
			 * @memberof require(namespace)
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

		util.extend( $, {
			define: function( id, dependencies, factory ) {
				/// <summary>aQuery的define对象定义
				/// <para>遵循AMD规范重载</para>
				/// <para>只是aQuery.define默认会载入aQuery对象</para>
				/// </summary>
				/// <param name="id" type="String">对象名</param>
				/// <param name="dependencies" type="Array">依赖列表</param>
				/// <param name="factory" type="Function">对象工厂</param>
				/// <returns type="self" />
				var arg = util.argToArray( arguments, 0 ),
					len = arg.length,
					fn = arg[ len - 1 ],
					version = "no signing version";


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
			require: function( dependencies, success, fail ) {
				/// <summary>aQuery的require对象定义
				/// <para>遵循AMD规范重载</para>
				/// <para>会自动调用ready确定window和指定package准备完毕</para>
				/// </summary>
				/// <param name="dependencies" type="Array">依赖列表</param>
				/// <param name="success" type="Function">回调函数</param>
				/// <param name="fail" type="Function">失败的函数</param>
				/// <returns type="$" />
				// 将会在$ ready 后执行。这样便把sync实现起来了
				window.require && $.ready( function() {
					window.require( dependencies, success, fail )
				} );
				return this;
			}
		} );

		aQuery.define( "base/ClassModule", function( $ ) {
			/**
			 * Module Management
			 * @public
			 * @module base/ClassModule
			 */

			/**
			 * @typedef {module:base/ClassModule} ClassModule
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
		 * @typedef {module:base/queue} Queue
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
		"use strict"; //启用严格模式
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
		 * @typedef {module:base/Promise} Promise
		 */

		/**
		 * @public
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
			 * Push promise
			 * @private
			 */
			_push: function( nextPromise ) {
				this.thens.push( nextPromise );
				return this;
			},
			/**
			 * Call todo, fail or progress
			 * @param {String} - Function name
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
			 * @param {String} - Property name
			 * @returns {*}
			 */
			get: function( propertyName ) {
				return this[ propertyName ];
			},
			/**
			 * @param {Object} - Context of Promise
			 * @returns {this}
			 */
			withContext: function( context ) {
				this.context = context;
				return this;
			},
			/**
			 * Then do...
			 * @param {Function} - Todo
			 * @param {Function} - Fail next
			 * @param {Function} - Progress
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
			 * clear propery
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
			 * Destroy self
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
			 * @param {*=} - result
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
			 * The new promise is siblings
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
			 * Relative method "and"
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
			 * finished
			 * @returns {Boolean}
			 */
			finished: function() {
				return this.state === "done";
			},
			/**
			 * unfinished
			 * @returns {Boolean}
			 */
			unfinished: function() {
				return this.state === "todo";
			},
			/**
			 * get root promise
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
		 * Whether it is "Promise" instances
		 * @param {Promise}
		 * @returns {Boolean}
		 */
		Promise.forinstance = function( promise ) {
			return promise instanceof Promise || ( promise ? promise.__promiseFlag === true : false );
		}

		return Promise;
	} );

	aQuery.define( "base/ready", [ "base/Promise" ], function( $, Promise ) {
		"use strict"; //启用严格模式
		this.describe( "Life Cycle of AMDQuery" );

		/**
		 * Life Cycle of AMDQuery
		 * @public
		 * @module base/ready
		 */

		/**
		 * @typedef {module:base/ready} ready
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
				rootPromise.and( fn );
			}, 0 );
		}, rootPromise;

		rootPromise = new Promise( function() {
			// 预处理设置
			if ( _config.app.src ) {
				var src = _config.app.src;
				// _config.ui.initWidget = true;

				src = src.replace( /([\\\/])[^\\\/]*$/, "$1" );
				src = src.replace( /\/$/, "" );

				require.variable( "app", src );
			}
		} ).then( function() { //window.ready first to fix ie
			document.documentElement.style.position = "absolute";
			document.documentElement.style.left = "100000px";
			var promise = new Promise,
				ready = function( e ) {
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
			if ( _config.app.src ) {
				var promise = new Promise;
				require( _config.app.src, function( Application ) {
					new Application( promise );
				} );
				return promise;
			}
		} ).then( function() {
			if ( _config.ui.initWidget && !_config.app.src ) {
				var promise = new Promise;
				require( "module/initWidget", function( initWidget ) {
					initWidget.renderWidget( promise, document.body );
				} );
				return promise;
			}
		} ).then( function() {
			document.documentElement.style.left = "0px";
			document.documentElement.style.position = "";
		} ).root().resolve();

		return $.ready = ready;
	} );

	window.aQuery = $;

	if ( !window[ _config.amdquery.define ] ) {
		window[ _config.amdquery.define ] = $;
	} else {
		util.error( _config.amdquery.define + " is defined" );
	}

} )( window );