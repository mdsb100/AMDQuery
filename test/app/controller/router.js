aQuery.define( "@app/controller/router", [ "app/Controller", "@app/view/router" ], function( $, SuperController, IndexView, undefined ) {
  "use strict"; //启用严格模式
  var Controller = SuperController.extend( {
    init: function( contollerElement ) {
      this._super( new IndexView( contollerElement ) );

    },
    onReady: function( ) {
      var self = this;
      this.navmenu.on( "navmenu.select", function( e ) {
        self.content.loadPath( e.path );
      } );
      this.navmenu.on( "navmenu.dblclick", function( e ) {
        self.content.openWindow( );
      } );
    },
    onDestroy: function( ) {
      this.navmenu.clearHandlers( );
    }
  }, {

  } );

  return Controller;
} );