aQuery.define( "@app/view/navmenu", [ "app/View" ], function( $, SuperView, undefined ) {
  "use strict"; //启用严格模式
  var View = SuperView.extend( {
    init: function( contollerElement ) {
      this._super( contollerElement );

    },
    onDomReady: function( ) {
      console.log("navmenu view ready");
    }
  }, {

  } );

  return View;
} );