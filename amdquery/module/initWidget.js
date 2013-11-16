aQuery.define( "module/initWidget", [ "base/config", "base/typed", "main/query", "main/css", "main/position", "main/dom", "main/attr", "main/class", "module/Widget" ], function( $, config, typed, query, css, position, dom, attr, cls, Widget, undefinded ) {
  "use strict"; //启用严格模式

  var body = $( "body" ),
    loadingClassName = config.ui.loadingClassName,
    $cover = $( {
      width: "100%",
      height: "100%",
      position: "absolute",
      top: 0,
      left: 0,
      zIndex: 10001,
      backgroundColor: "white"
    }, "div" ).insertBefore( body.children( ) );

  if ( loadingClassName ) {
    $cover.addClass( loadingClassName );
  }

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