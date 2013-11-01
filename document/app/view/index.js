aQuery.define( "@app/view/index", [ "app/View", "ui/flex", "ui/tabview" ], function( $, SuperView ) {
  "use strict"; //启用严格模式
  SuperView.getStyle( "@app/css/reset" );

  var View = SuperView.extend( {
    init: function( contollerElement ) {
      this._super( contollerElement, "@app/xml/index" );

    }
  }, {

  } );

  return View;
} );