aQuery.define( "@app/controller/content", [ "app/Controller", "@app/view/content" ], function( $, SuperController, ContentView, undefined ) {
  "use strict"; //启用严格模式
  var Controller = SuperController.extend( {
    init: function( id, contollerElement ) {
      this._super( id, contollerElement, ContentView );

    },
    onReady: function( ) {
      console.log( "content load" );
    }
  }, {

  } );

  return Controller;
} );