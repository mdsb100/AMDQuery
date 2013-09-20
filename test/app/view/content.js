aQuery.define( "@app/view/content", [ "app/View" ], function( $, SuperView, undefined ) {
  "use strict"; //启用严格模式
  var View = SuperView.extend( {
    init: function( contollerElement ) {
      this._super( contollerElement );

    },
    onDomReady: function( ) {
      console.log("content view ready");
    }
  }, {

  } );

  return View;
} );