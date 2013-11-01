aQuery.define( "@app/controller/index", [
  "hash/locationHash",
  "app/Controller",
  "@app/view/index",
  "@app/controller/navmenu",
  "@app/controller/content",
  "@app/controller/router"
  ], function( $, locationHash, SuperController, IndexView ) {
  "use strict"; //启用严格模式
  var Controller = SuperController.extend( {
    init: function( contollerElement, models ) {
      this._super( new IndexView( contollerElement ), models );
      var self = this;
      this.navmenu.on( "navmenu.select", function( e ) {
        self.content.loadPath( e.path );
      } );
      this.navmenu.on( "navmenu.dblclick", function( e ) {
        self.content.openWindow( );
      } );
      this.navmenu.selectDefaultNavmenu( locationHash.navmenu );
    },
    destroy: function( ) {
      this.navmenu.clearHandlers( );
      SuperController.invoke( "destroy" );
    }
  }, {

  } );

  return Controller;
} );