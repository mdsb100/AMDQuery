aQuery.define( "@app/controller/index", [
  "app/Controller",
  "@app/view/index",
  "@app/controller/tabbar",
  "@app/controller/navmenu",
  "@app/controller/content"
  ], function( $,
  SuperController,
  IndexView ) {
  "use strict"; //启用严格模式
  var Controller = SuperController.extend( {
    init: function( contollerElement ) {
      this._super( new IndexView( contollerElement ) );
      var self = this;

      this.navmenu.on( "navmenu.select", function( e ) {
        self.content.loadPath( e.path );
      } );
      this.navmenu.on( "navmenu.dblclick", function( e ) {
        self.content.openWindow( );
      } );

      this.navmenu.selectDefaultNavmenu( );
    },
    destroy: function( ) {
      this.navmenu.clearHandlers( );
      SuperController.invoke( "destroy" );
    }
  }, {

  } );

  return Controller;
} );