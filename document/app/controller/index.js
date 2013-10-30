aQuery.define( "@app/controller/index", [ "hash/locationHash", "app/Controller", "@app/view/index" ], function( $, locationHash, SuperController, IndexView, undefined ) {
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

      this.navmenu.selectDefaultNavmenu( locationHash.navmenu );
    },
    onDestroy: function( ) {
      this.navmenu.clearHandlers( );
    }
  }, {

  } );

  return Controller;
} );