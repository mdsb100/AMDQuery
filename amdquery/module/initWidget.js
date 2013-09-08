aQuery.define( "module/initWidget", [ "base/typed", "main/query", "main/css", "main/position", "main/dom", "main/attr", "module/Widget" ], function( $, typed, query, css, position, dom, attr, Widget, undefinded ) {
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
    }, "div" ).append( $image ).insertBefore( body.children( ) );

  $image.css( {
    marginTop: -$image.width( ) + "px",
    marginLeft: -$image.height( ) + "px"
  } );

  var initWidget = {
    renderWidget: function( promise, parent ) {
      var self = this;
      Widget.initWidgets( document.body, function( ) {
        if ( promise ) {
          self.showIndex( );
          promise.resolve( );
        }
      } );
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