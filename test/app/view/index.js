aQuery.define( "@app/view/index", [ "app/View" ], function( $, SuperView, undefined ) {
  "use strict"; //启用严格模式
  var htmlSrc = "@app/xml/index";

  SuperView.getHtml( htmlSrc );

  SuperView.getStyle( "@app/css/reset" );

  var View = SuperView.extend( {
    init: function( ) {
      this._super( );

    },
    htmlSrc: htmlSrc
  }, {

  } );

  return View;
} );