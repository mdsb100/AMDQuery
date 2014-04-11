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
	 * @property [AjaxOptions.fail] {Function} - Fail handler.
	 * @property [AjaxOptions.dataType="text"] {String} - "json"|"xml"|"text"
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
		 * @returns {module:base/Promise}
		 */
		ajax: function( options ) {
			var ajax, timeId, o, e, type, promise;
			if ( options ) {
				ajax = communicate.getXhrObject();

				if ( ajax ) {

					o = utilExtend.extend( {}, communicate.ajaxSetting, options );

					type = o.type.toUpperCase();

					if ( o.isRandom == true && type == "GET" ) {
						o.data.random = $.now();
					}

					e = utilExtend.extend( {}, o );

					o.data = communicate.getURLParam( o.data );

					o.url = o.url.replace( /\?$/, "" );

					switch ( type ) {
						case "GET":
							if ( o.data ) {
								o.url += "?" + o.data;
							}
							break;
						case "POST":
							break;
					}

					if ( o.username ) {
						ajax.open( type, o.url, o.async, o.username, o.password );
					} else {
						ajax.open( type, o.url, o.async );
					}

					try {
						for ( var item in o.header ) {
							ajax.setRequestHeader( item, o.header[ item ] );
						}
						ajax.setRequestHeader( "Accept", o.dataType && o.accepts[ o.dataType ] ? o.accepts[ o.dataType ] + ", */*" : o.accepts._default );

					} catch ( e ) {}
					if ( o.data || options ) {
						ajax.setRequestHeader( "Content-Type", o.contentType );
					}
					//ajax.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
					//type == "post" && ajax.setRequestHeader("Content-type", "");

					promise = new Promise( function( ajax ) {
						var response;
						clearTimeout( timeId );
						e.type = "ajaxStop";
						$.trigger( e.type, ajax, e );
						switch ( o.dataType ) {
							case "json":
								response = parse.JSON( ajax.responseText );
								break;
							case "xml":
								response = ajax.responseXML;
								if ( !response ) {
									try {
										response = parse.XML( ajax.responseText );
									} catch ( e ) {}
								}
								break;
							default:
							case "text":
								response = ajax.responseText;
								break;
						}
						o.complete && o.complete.call( o.context || ajax, response );

						o = null;
						return response;
					}, function( ajax ) {
						ajax && ajax.abort();
						e.type = "ajaxStart";
						$.trigger( e.type, ajax, e );
						o.fail.call( o.context || ajax, ajax );
						o = null;
						return new Promise().reject( ajax );
					}, function( ajax ) {
						if ( ajax.readyState == 4 ) {
							if ( ( ajax.status >= 200 && ajax.status < 300 ) || ajax.status == 304 ) {
								return new Promise().resolve( ajax );
							} else {
								return new Promise().reject( ajax );
							}
						}
					} );

					ajax.onreadystatechange = function() {
						promise.reprocess( ajax );
					};
					if ( o.timeout ) {
						timeId = setTimeout( function() {
							promise.reject( ajax );
						}, o.timeout );
					}
					e.type = "ajaxStart";
					$.trigger( e.type, ajax, e );
					ajax.send( type == "GET" ? "NULL" : ( o.data || "NULL" ) );
				}
			}

			return promise;
		},
		/**
		 * @param list {Array<AjaxOptions>}
		 * @returns {module:base/Promise}
		 */
		ajaxs: function( list ) {
			var retPromise = new Promise(),
				retList = [];

			$.each( list, function( item, index ) {
				var promise = communicate.ajax( item ).then( function( resp ) {
					if ( resp ) {
						retList[ index ] = resp;
					}
					return retList;
				} );

				retPromise.and( function() {
					return promise;
				} );

				promise.done();
			} );

			return retPromise.resolve( retList );
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
		 * @property {Function} ajaxSetting.fail                - Fail handler.
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
			fail: function() {
				$.logger( "ajax fail" );
			},
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

			o.url = o.url.replace( /\?$/, "" );

			o.url += data == "" ? data : "?" + data;

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
			timeout: 7000,
			url: "",
			data: {}
		},
		/**
		 * @param list {Array<JSONPOptions>}
		 * @returns {module:base/Promise}
		 */
		jsonps: function( list ) {
			var retPromise = new Promise(),
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

			return retPromise.resolve( retList );
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