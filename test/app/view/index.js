aQuery.define( "@app/view/index", [ "app/View" ], function( $, SuperView, undefined ) {
  "use strict"; //启用严格模式
  var htmlSrc = "@app/xml/index";

  SuperView.getStyle( "@app/css/reset" );

  var View = SuperView.extend( {
    init: function( contollerElement ) {
      this._super( contollerElement, htmlSrc );
    },
    onDomReady: function( ) {
      console.log( "index view ready" );
    },
    initTopElement: function( ) {
      return SuperView.getHtml( htmlSrc );
    }
  }, {

  } );

  return View;
} );