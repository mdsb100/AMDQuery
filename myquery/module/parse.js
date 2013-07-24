myQuery.define( "module/parse", [ "base/is" ], function( $, is ) {
  "use strict"; //启用严格模式
  var
  createDocument = function( ) {
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
          ( new Function( "return " + data ) )( );

      } else {
        $.console.error( "Invalid JSON: " + data, "EvalError" );
      }
      return this;
    },
    QueryString: function( str ) {
      /// <summary>解析查询字符串</summary>
      /// <param name="str" type="String/undefined">可以指定一个字符串，缺省是获得当前location</param>
      /// <returns type="String" />
      var qs = str || ( location.search.length > 0 ? location.search.substring( 1 ) : "" ),
        args = {};
      if ( qs ) {
        $.each( qs.split( "&" ), function( item ) {
          item = item.split( "=" );
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
          var xmldom = ( new DOMParser( ) ).parseFromString( xml, "text/xml" ),
            errors = xmldom.getElementsByTagName( "parsererror" );
          if ( errors.length ) {
            $.console.error( {
              fn: "parseXML",
              msg: errors[ 0 ].textContent
            }, "SyntaxError" );
            //throw new Error("XML parsing error:" + errors[0].textContent);
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
            input = implementation.createLSInput( );
          input.stringData = xml;
          return parser.parse( input );
        };
      } else if ( typeof ActiveXObject != "undefined" ) {
        parseXML = function( xml ) {
          /// <summary>解析XML</summary>
          /// <param name="xml" type="String">xml字符串</param>
          /// <returns type="Document" />
          var xmldom = createDocument( );
          xml.async = "false";
          xmldom.loadXML( xml );
          if ( xmldom.parseError != 0 ) {
            $.console.error( {
              fn: "parseXML",
              info: xmldom.parseError.reason
            }, "SyntaxError" );
            //throw new Error("XML parsing error:" + xmldom.parseError.reason);
          }
          return xmldom;
        };
      } else {
        $.console.error( "No XML parser available", "Error" );
        //throw new Error("No XML parser available");
      }
      return parseXML;
    } )( )
  };

  $.parse = parse;

  return parse;
} );