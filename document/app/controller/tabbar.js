aQuery.define( "@app/controller/tabbar", [ "base/client", "app/Controller", "@app/view/tabbar" ], function( $, client, SuperController, TabbarView, undefined ) {
  "use strict"; //启用严格模式
  var Controller = SuperController.extend( {
    init: function( contollerElement ) {
      this._super( new TabbarView( contollerElement ) );

    },
    onDestroy: function( ) {

    }
  }, {

  } );

  return Controller;
} );