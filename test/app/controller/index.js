aQuery.define( "@app/controller/index", [ "app/Controller", "@app/view/index" ], function( $, SuperController, IndexView, undefined ) {
  "use strict"; //启用严格模式
  var Controller = SuperController.extend( {
    init: function( ) {
      this._super( new IndexView );

    }
  }, {

  } );

  return Controller;
} );