aQuery.define( "@app/view/index", [ "app/View", "ui/flex" ], function( $, SuperView ) {
  "use strict"; //启用严格模式
  var htmlSrc = "@app/xml/index";

  SuperView.getStyle( "@app/css/reset" );

  var View = SuperView.extend( {
    init: function( contollerElement ) {
      this._super( contollerElement, htmlSrc );
    },
    onDomReady: function( ) {

    },
    initTopElement: function( ) {
      return SuperView.getHtml( htmlSrc );
    }
  }, {

  } );

  return View;
} );