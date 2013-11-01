aQuery.define( "@app/controller/router", [ "app/Controller", "@app/view/router" ], function( $, SuperController, IndexView ) {
  "use strict"; //启用严格模式
  var Controller = SuperController.extend( {
    init: function( contollerElement ) {
      this._super( new IndexView( contollerElement ), models );
      var self = this;
      this.navmenu.on( "navmenu.select", function( e ) {
        self.content.loadPath( e.path );
      } );
      this.navmenu.on( "navmenu.dblclick", function( e ) {
        self.content.openWindow( );
      } );
    },
    destroy: function( ) {
      this.navmenu.clearHandlers( );
      SuperController.invoke( "destroy" );
    }
  }, {

  } );

  return Controller;
} );