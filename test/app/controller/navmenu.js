aQuery.define( "@app/controller/navmenu", [ "app/Controller", "@app/view/navmenu" ], function( $, SuperController, NavmenuView, undefined ) {
  "use strict"; //启用严格模式
  var Controller = SuperController.extend( {
    init: function( id, contollerElement ) {
      this._super( id, contollerElement, NavmenuView );

    },
    onReady: function( ) {
      console.log( "navmenu load" );
    }
  }, {

  } );

  return Controller;
} );