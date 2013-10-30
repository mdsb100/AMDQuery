aQuery.define( "@app/view/content", [ "app/View", "ui/flex" ], function( $, SuperView ) {
  "use strict"; //启用严格模式
  var View = SuperView.extend( {
    init: function( contollerElement ) {
      this._super( contollerElement );

    },
    onDomReady: function( ) {

    }
  }, {

  } );

  return View;
} );