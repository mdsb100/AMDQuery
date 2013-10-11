aQuery.define( "@app/controller/router", [ "app/Controller", "@app/view/router" ], function( $, SuperController, IndexView, undefined ) {
  "use strict"; //启用严格模式
  var Controller = SuperController.extend( {
    init: function( id, contollerElement ) {
      this._super( id, new IndexView( contollerElement ) );

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
    onDestory: function( ) {
      this.navmenu.clearHandlers( );
    }
  }, {

  } );

  return Controller;
} );