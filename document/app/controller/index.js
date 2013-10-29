aQuery.define( "@app/controller/index", [ "app/Controller", "@app/view/index" ], function( $, SuperController, IndexView, undefined ) {
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

      this.navmenu.selectDefaultNavmenu();
    },
    onDestroy: function( ) {
      this.navmenu.clearHandlers( );
    }
  }, {

  } );

  return Controller;
} );