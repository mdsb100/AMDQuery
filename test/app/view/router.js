aQuery.define( "@app/view/router", [ "app/View" ], function( $, SuperView, undefined ) {
  "use strict"; //启用严格模式
  var htmlSrc = "@app/xml/router";

  SuperView.getStyle( "@app/css/reset" );

  var View = SuperView.extend( {
    init: function( contollerElement ) {
      this._super( contollerElement, htmlSrc );
    },
    onDomReady: function( ) {
      console.log( "router view ready" );
    },
    initTopElement: function( ) {
      return SuperView.getHtml( htmlSrc );
    }
  }, {

  } );

  return View;
} );