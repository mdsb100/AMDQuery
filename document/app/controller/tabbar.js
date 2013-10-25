aQuery.define( "@app/controller/tabbar", [ "base/client", "app/Controller", "@app/view/tabbar" ], function( $, client, SuperController, TabbarView, undefined ) {
  "use strict"; //启用严格模式
  var Controller = SuperController.extend( {
    init: function( id, contollerElement ) {
      this._super( id, new TabbarView( contollerElement ) );

    },
    onReady: function( ) {


    },
    onDestroy: function( ) {

    }
  }, {

  } );

  return Controller;
} );