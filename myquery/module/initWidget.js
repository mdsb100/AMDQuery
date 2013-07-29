/// <reference path="../myquery.js" />
myQuery.define( "module/initWidget", [ "base/typed", "main/query", "main/dom", "main/attr", "module/Widget" ], function( $, typed, query, dom, attr, Widget, undefinded ) {
  "use strict"; //启用严格模式

  var body = $( "body" ),
    image = $.config.ui.image,
    $image = $( {
      position: "absolute",
      top: "50%",
      left: "50%"
    }, "img" ).attr( "src", $.getPath( "ui/images/", image ) ),
    $cover = $( {
      width: "100%",
      height: "100%",
      position: "absolute",
      top: 0,
      left: 0,
      zIndex: 10001,
      backgroundColor: "white"
    }, "div" ).append( $image ).before( body.children( ) );

  $image.css( {
    marginTop: -$image.width( ) + "px",
    marginLeft: -$image.height( ) + "px"
  } );

  function getWidgetsName( parent ) {
    var widgetNames = [ ],
    widgetMap = {},
    fnNameReflect = {};

    $( parent ).find( "*[myquery-widget]" ).each( function( ele ) {
      var value = attr.getAttr( ele, "myquery-widget" ),
      attrNames = typed.isStr( value ) && value != "" ? value.split( /;|,/ ) : [ ],
      len = attrNames.length,
      widgetName,
      widgetPath,
      temp,
      name,
      nameSpace,
      i = 0;
      for ( ; i < len; i++ ) {
        widgetName = attrNames[ i ];
        if ( widgetName ) {
          if ( widgetName.indexOf( "." ) < 0 ) {
            nameSpace = "ui";
            name = widgetName;
          } else {
            temp = widgetName.split( "." );
            nameSpace = temp[ 0 ];
            name = temp[ 1 ];
          }
          widgetPath = nameSpace + "/" + name;
          widgetName = nameSpace + "." + name;

          if ( !widgetMap[ widgetName ] ) {
            widgetNames.push( widgetPath );

            widgetMap[ widgetName ] = [ ];
            fnNameReflect[ widgetName ] = $.util.camelCase( name, nameSpace );
          }
        }
        widgetMap[ widgetName ] && widgetMap[ widgetName ].push( ele );
      }

    } );

    return {
      widgetNames: widgetNames,
      widgetMap: widgetMap,
      fnNameReflect: fnNameReflect
    }
  }

  var initWidget = {
    renderWidget: function( promise, parent ) {
      var self = this;
      var widgetInfo = getWidgetsName( parent );

      if ( widgetInfo.widgetNames.length ) {
        require( widgetInfo.widgetNames, function( ) {
          var widgetName = 0,
          eles;
          for ( widgetName in widgetInfo.widgetMap ) {
            eles = widgetInfo.widgetMap[ widgetName ];
            self._create( widgetInfo.fnNameReflect[ widgetName ], eles );
          }
          if ( promise ) {
            self.showIndex( );
            promise.resolve( );
          }

        } );
      } else {
        if ( promise ) {
          self.showIndex( );
          promise.resolve( );
        }
      }
      return this;
    },
    _create: function( widgetConstructorName, eles ) {
      $( eles )[ widgetConstructorName ]( );
      return this;
    },
    showIndex: function( ) {
      setTimeout( function( ) {
        $cover.remove( );
        $cover = null;
      }, 200 );
      return this;
    }
  };

  return initWidget;
} );