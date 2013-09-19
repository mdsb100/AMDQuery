aQuery.define( "@app/view/index", [ "app/View" ], function( $, SuperView, undefined ) {
  "use strict"; //启用严格模式
  var htmlSrc = "@app/xml/index";

  SuperView.getHtml( htmlSrc );

  SuperView.getStyle( "@app/css/reset" );

  var View = SuperView.extend( {
    init: function( contollerElement ) {
      this._super( contollerElement );

    },
    onDomReady: function( ) {
      console.log("index view ready");
    },
    htmlSrc: htmlSrc
  }, {

  } );

  return View;
} );