aQuery.define( "@app/view/tabbar", [ "base/client", "ui/tabbar", "app/View" ], function( $, client, tabbar, SuperView, undefined ) {
  "use strict"; //启用严格模式
  var View = SuperView.extend( {
    init: function( contollerElement ) {
      this._super( contollerElement, "@app/xml/tabbar" );

    }
  }, {

  } );

  return View;
} );