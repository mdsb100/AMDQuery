aQuery.define( "main/communicate", [ "base/Promise", "base/typed", "base/extend", "main/event", "main/parse" ], function( $, Promise, typed, utilExtend, event, parse, undefined ) {
	"use strict";
	/**
	 * @inner
	 * @typedef {Object} AjaxOptions
	 * @property AjaxOptions {Object}
	 * @property [AjaxOptions.type="GET"] {String} - "GET" or "POST"
	 * @property AjaxOptions.url {String}
	 * @property [AjaxOptions.data=""] {String|Object<String,String>|Array<Object<String,String>>} - See {@link module:main/communicate.getURLParam}
	 * @property [AjaxOptions.async=true] {Boolean}
	 * @property [AjaxOptions.complete] {Function}
	 * @property [AjaxOptions.header] {Object<String,String>}
	 * @property [AjaxOptions.isRandom] {Boolean}
	 * @property [AjaxOptions.timeout=7000] {Number}
	 * @property [AjaxOptions.routing=""] {String}
	 * @property [AjaxOptions.timeoutFun] {Function} - Timeout handler.
	 * @property [AjaxOptions.dataType="text"] {String} - "json"|"xml"|"text"|"html"
	 * @property [AjaxOptions.contentType="application/x-www-form-urlencoded"] {String}
	 * @property [AjaxOptions.context=null] {Object} - Complete context.
	 */

	/**
	 * @inner
	 * @typedef {Object} JSONPOptions
	 * @property JSONPOptions.url {String}
	 * @property [JSONPOptions.charset="GBK"] {String}
	 * @property [JSONPOptions.complete] {Function}
	 * @property [JSONPOptions.isDelete=true] {Boolean} - Does delete the script.
	 * @property [JSONPOptions.context=null] {Object} - Complete context.
	 * @property [JSONPOptions.isRandom=false] {Boolean}
	 * @property [JSONPOptions.checkString=""] {String} - Then JSONP back string.
	 * @property [JSONPOptions.timeout=7000] {Number}
	 * @property [JSONPOptions.fail] {Function} - Error handler.
	 * @property [JSONPOptions.routing=""] {String}
	 * @property [JSONPOptions.JSONP] {String|Boolean} - True is aQuery. String is JSONP.
	 */

	/**
	 * Event reporting that an ajax start.
	 * @event aQuery#"ajaxStart"
	 * @param {AjaxOptions}
	 */

	/**
	 * Event reporting that an ajax stop.
	 * @event aQuery#"ajaxStop"
	 * @param {AjaxOptions}
	 */

	/**
	 * Event reporting that an JSONP start.
	 * @event aQuery#"jsonpStart"
	 * @param {JSONPOptions}
	 */

	/**
	 * Event reporting that an JSONP stop.
	 * @event aQuery#"jsonpStop"
	 * @param {JSONPOptions}
	 */


	/**
	 * Export network requests.
	 * <br /> JSONP or AJAX.
	 * @exports main/communicate
	 * @requires module:base/typed
	 * @requires module:base/extend
	 * @requires module:main/event
	 * @requires module:main/parse
	 */
	var communicate = {
		/**
		 * @param options {AjaxOptions}
		 * @returns {this}
		 */
		ajax: function( options ) {
			var _ajax, _timeId, o;
			if ( options ) {
				_ajax = communicate.getXhrObject();

				if ( _ajax ) {

					o = utilExtend.extend( {}, communicate.ajaxSetting, options );

					o.data = communicate.getURLParam( o.data );

					if ( o.isRandom == true && o.type == "get" ) {
						o.data += "&random=" + $.now();
					}
					o.url += o.routing;
					switch ( o.type ) {
						case "get":
							if ( o.data ) {
								o.url += "?" + o.data;
							}
							break;
						case "post":
							break;
					}

					if ( o.username ) {
						_ajax.open( o.type, o.url, o.async, o.username, o.password );
					} else {
						_ajax.open( o.type, o.url, o.async );
					}

					try {
						for ( var item in o.header ) {
							_ajax.setRequestHeader( item, o.header[ item ] );
						}
						_ajax.setRequestHeader( "Accept", o.dataType && o.accepts[ o.dataType ] ? o.accepts[ o.dataType ] + ", */*" : o.accepts._default );

					} catch ( e ) {}
					if ( o.data || options ) {
						_ajax.setRequestHeader( "Content-Type", o.contentType );
					}
					//_ajax.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
					//type == "post" && _ajax.setRequestHeader("Content-type", "");
					_ajax.onreadystatechange = function() {
						if ( ( _ajax.readyState == 4 || _ajax.readyState == 0 ) && ( ( _ajax.status >= 200 && _ajax.status < 300 ) || _ajax.status == 304 ) ) {
							var response;
							clearTimeout( _timeId );
							$.trigger( "ajaxStop", _ajax, o );
							switch ( o.dataType ) {
								case "json":
									response = parse.JSON( "(" + _ajax.responseText + ")" );
									break;
								case "xml":
									response = _ajax.responseXML;
									if ( !response ) {
										try {
											response = parse.XML( _ajax.responseText );
										} catch ( e ) {}
									}
									break;
								default:
								case "text":
									response = _ajax.responseText;
									break;
							}
							try {
								o.complete && o.complete.call( o.context || _ajax, response );
							} finally {
								o = null;
								_ajax = null;
							}
						}
					};
					if ( o.timeout ) {
						_timeId = setTimeout( function() {
							_ajax && _ajax.abort();
							$.trigger( "ajaxTimeout", _ajax, o );
							o.timeoutFun.call( _ajax, o );
							o = null;
							_ajax = null;
						}, o.timeout );
					}
					$.trigger( "ajaxStart", _ajax, o );
					_ajax.send( o.type == "get" ? "NULL" : ( o.data || "NULL" ) );
				}
			}
			return this;
		},
		/**
		 * @deprecated
		 */
		ajaxByFinal: function( list, complete, context ) {
			var sum = list.length,
				count = 0;
			return $.each( list, function( item ) {
				item._complete = item.complete;
				item.complete = function() {
					count++;
					item._complete && item._complete.apply( this, arguments );
					if ( count == sum ) {
						complete && complete.apply( window, context );
						count = null;
						sum = null;
					}
				};
				communicate.ajax( item );
			} );
		},

		ajaxSetting:
		/**
		 * @name ajaxSetting
		 * @memberOf module:main/communicate
		 * @property {Object}   ajaxSetting                     - AJAX default setting.
		 * @property {String}   ajaxSetting.url
		 * @property {String}   ajaxSetting.dataType            - "text".
		 * @property {String}   ajaxSetting.type                - "GET".
		 * @property {String}   ajaxSetting.contentType         - "application/x-www-form-urlencoded".
		 * @property {Object}   ajaxSetting.context             - Complete context.
		 * @property {Number}   ajaxSetting.timeout             - 7000 millisecond.
		 * @property {Function} ajaxSetting.timeoutFun          - Timeout handler.
		 * @property {String}   ajaxSetting.routing             - "".
		 * @property {null}     ajaxSetting.header
		 * @property {Boolean}  ajaxSetting.isRandom            - False.
		 * @property {Object}   ajaxSetting.accepts
		 * @property {String}   ajaxSetting.accepts.xml         - "application/xml, text/xml".
		 * @property {String}   ajaxSetting.accepts.html        - "text/html".
		 * @property {String}   ajaxSetting.accepts.json        - "application/json, text/javascript".
		 * @property {String}   ajaxSetting.accepts.text        - "text/plain".
		 */
		{
			url: location.href,
			dataType: "text",
			type: "GET",
			contentType: "application/x-www-form-urlencoded",
			context: null,
			async: true,
			timeout: 7000,
			timeoutFun: function( o ) {
				$.logger( "aQuery.ajax", o.url + "of ajax is timeout:" + ( o.timeout / 1000 ) + "second" );
			},
			routing: "",
			header: null,
			isRandom: false,
			accepts: {
				xml: "application/xml, text/xml",
				html: "text/html",
				json: "application/json, text/javascript",
				text: "text/plain",
				_default: "*/*"
			}
		},
		/**
		 * @param options {JSONPOptions}
		 * @returns {module:base/Promise}
		 */
		jsonp: function( options ) {
			var scripts = document.createElement( "script" ),
				head = document.getElementsByTagName( "HEAD" ).item( 0 ),
				o = utilExtend.extend( true, {}, communicate.jsonpSetting, options ),
				e = utilExtend.extend( e, o ),
				data = "",
				timeId, random = "",
				promise;

			if ( o.JSONP ) {
				random = ( "aQuery" + $.now() ) + parseInt( Math.random() * 10 );
				window[ random ] = function( json ) {
					o.json = json;
				};
				o.data[ o.JSONP ] = random
			}

			if ( o.isRandom == true ) {
				o.data.random = $.now();
			};

			data = communicate.getURLParam( o.data );

			o.url += o.routing + ( data == "" ? data : "?" + data );

			promise = new Promise( function( json ) {
				clearTimeout( timeId );
				typed.isNode( this.nodeName, "script" ) && o.isDelete == true && head.removeChild( this );
				this.onerror = this.onload = head = null;
				if ( window[ random ] ) {
					delete window[ random ];
					random = null;
				}
				e.type = "jsonpStop";
				$.trigger( e.type, scripts, e );
				e = null;
				var promise = new Promise();
				if ( json !== undefined ) {
					typed.isFunction( o.complete ) && o.complete.call( o.context || this, json );
					promise.resolve( json );
				} else {
					o.fail.call( o.context || null, o );
					promise.reject();
				}
				return promise;
			}, function() {
				var promise = new Promise;
				promise.reject();
				return promise;
			} );

			scripts.onload = scripts.onreadystatechange = function() {
				if ( !this.readyState || this.readyState == "loaded" || this.readyState == "complete" ) {
					promise.withContext( scripts ).resolve( o.json );
				}
			};

			scripts.onerror = function() {
				promise.withContext( scripts ).resolve();
			};

			o.timeout && ( timeId = setTimeout( scripts.onerror, o.timeout ) );

			scripts.setAttribute( "src", o.url );
			o.charset && scripts.setAttribute( "charset", o.charset );
			scripts.setAttribute( "type", "text/javascript" );
			scripts.setAttribute( "language", "javascript" );
			e.type = "jsonpStart";
			$.trigger( e.type, scripts, e );
			head.insertBefore( scripts, head.firstChild );
			return promise;
		},
		jsonpSetting:
		/**
		 * @name ajaxSetting
		 * @memberOf module:main/communicate
		 * @property {Object}         jsonpSetting                    - JSONP default setting.
		 * @property {String}         ajaxSetting.url                 - "".
		 * @property {String}         ajaxSetting.charset             - "GBK".
		 * @property {Boolean}        ajaxSetting.isDelete            - true.
		 * @property {Boolean}        ajaxSetting.isRandom            - false.
		 * @property {String}         ajaxSetting.JSONP               - "callback".
		 * @property {String}         ajaxSetting.routing             - "".
		 * @property {Number}         ajaxSetting.timeout             - 7000 millisecond.
		 * @property {Function}       ajaxSetting.fiail               - Error handler.
		 * @property {Object}         ajaxSetting.data                - Query string.
		 */
		{
			charset: "GBK",
			fail: function() {
				$.logger( "aQuery.jsonp", ( this.src || "(empty)" ) + " of javascript getting error" );
			},
			isDelete: true,
			isRandom: false,
			JSONP: "callback",
			routing: "",
			timeout: 7000,
			url: "",
			data: {}
		},
		/**
		 * @param list {Array<JSONPOptions>}
		 * @returns {module:base/Promise}
		 */
		jsonps: function( list ) {
			var retPromise = new Promise().then( function( result ) {
				return result;
			} ),
				retList = [];

			$.each( list, function( item, index ) {
				var promise = communicate.jsonp( item ).then( function( json ) {
					if ( json ) {
						retList[ index ] = json;
					}
					return retList;
				} );

				retPromise = retPromise.and( function() {
					return promise;
				} );

				promise.done();
			} );

			setTimeout( function() {
				retPromise.root().resolve( retList )
			}, 0 );

			return retPromise;
		},
		/**
		 * @example
		 * communicate.getURLParam( {
		 *   id: "00001",
		 *   name: "Jarry"
		 * } );
		 * communicate.getURLParam( [
		 *   {
		 *     name: "id",
		 *     value: "000001"
		 *   },
		 *   {
		 *     name: "name",
		 *     value: "Jarry"
		 *   }
		 * ] );
		 * // output: "id=00001&name=Jarry"
		 * @param {String|Object<String, String>|Array<Object<String,String>>}
		 * @returns {String}
		 */
		getURLParam: function( content ) {
			var list = [];
			if ( typed.isObject( content ) ) {
				$.each( content, function( value, name ) {
					value = typed.isFunction( value ) ? value() : value;
					!typed.isNul( value ) && list.push( encodeURIComponent( name ) + "=" + encodeURIComponent( value ) );
				} );
				content = list.join( "&" );
			} else if ( typed.isArray( content ) ) {
				$.each( content, function( item ) {
					!typed.isNul( item.value ) && list.push( encodeURIComponent( item.name ) + "=" + encodeURIComponent( item.value ) );
				} );
				content = list.join( "&" );
			} else if ( !typed.isString( content ) ) {
				content = "";
			}
			return content;
		},
		/**
		 * If return null means it does not support XMLHttpRequest.
		 * @returns {?XMLHttpRequest}
		 */
		getXhrObject: function() {
			var xhr = null;
			if ( window.ActiveXObject ) {
				$.each( [ "Microsoft.XMLHttp", "MSXML2.XMLHttp", "MSXML2.XMLHttp.6.0", "MSXML2.XMLHttp.5.0", "MSXML2.XMLHttp.4.0", "MSXML2.XMLHttp.3.0" ], function( value ) {
					try {
						xhr = new ActiveXObject( value );
						return xhr;
					} catch ( e ) {

					}
				}, this );
			} else {
				try {
					xhr = new XMLHttpRequest();
				} catch ( e ) {}
			}
			if ( !xhr ) {
				$.logger( "getXhrObject", "broswer no support AJAX" );
			}

			return xhr;
		}
	};

	return communicate;
} );