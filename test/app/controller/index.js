aQuery.define( "@app/controller/index", [ "app/Controller", "@app/view/index" ], function( $, SuperController, IndexView, undefined ) {
  "use strict"; //启用严格模式
  var Controller = SuperController.extend( {
    init: function( id, contollerElement ) {
      this._super( id, contollerElement, IndexView );

    },
    onReady: function( ) {
      console.log( "index load" );
      debugger
      this.navmenu
    }
  }, {

  } );

  return Controller;
} );