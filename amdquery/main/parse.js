aQuery.define( "main/parse", [ "main/dom" ], function( $, dom ) {
	"use strict";
	var rsingleTag = /^<(\w+)\s*\/?>(?:<\/\1>|)$/;

	var
	createDocument = function() {
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
	},
		parse = {
			JSON: function( data ) {
				/// <summary>解析JSON</summary>
				/// <param name="data" type="String">数据</param>
				/// <returns type="String" />
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
				return this;
			},
			// data: string of html
			// context (optional): If specified, the fragment will be created in this context, defaults to document
			// keepScripts (optional): If true, will include scripts passed in the html string
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
			QueryString: function( str, split1, split2 ) {
				/// <summary>解析查询字符串</summary>
				/// <param name="str" type="String/undefined">可以指定一个字符串，缺省是获得当前location</param>
				/// <returns type="String" />
				var qs = str || ( location.search.length > 0 ? location.search.substring( 1 ) : "" ),
					args = {};
				if ( qs ) {
					$.each( qs.split( split1 || "&" ), function( item ) {
						item = item.split( split2 || "=" );
						args[ decodeURIComponent( item[ 0 ] ) ] = decodeURIComponent( item[ 1 ] );
					} );
				}
				return args;
			},
			XML: ( function( xml ) {
				//quote from written by Nicholas C.Zakas
				var parseXML;
				if ( typeof DOMParser != "undefined" ) {
					parseXML = function( xml ) {
						/// <summary>解析XML</summary>
						/// <param name="xml" type="String">xml字符串</param>
						/// <returns type="Document" />
						var xmldom = ( new DOMParser() ).parseFromString( xml, "text/xml" ),
							errors = xmldom.getElementsByTagName( "parsererror" );
						if ( errors.length ) {
							throw new Error( "parseXML: " + errors[ 0 ].textContent + " SyntaxError" )
						}
						return xmldom;
					};
				} else if ( document.implementation.hasFeature( "LS", "3.0" ) ) {
					parseXML = function( xml ) {
						/// <summary>解析XML</summary>
						/// <param name="xml" type="String">xml字符串</param>
						/// <returns type="Document" />
						var implementation = document.implementation,
							parser = implementation.createLSParser( implementation.MODE_SYNCHRONOUS, null ),
							input = implementation.createLSInput();
						input.stringData = xml;
						return parser.parse( input );
					};
				} else if ( typeof ActiveXObject != "undefined" ) {
					parseXML = function( xml ) {
						/// <summary>解析XML</summary>
						/// <param name="xml" type="String">xml字符串</param>
						/// <returns type="Document" />
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