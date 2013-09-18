aQuery.define( "@app/view/navmenu", [ "app/View" ], function( $, SuperView, undefined ) {
  "use strict"; //启用严格模式
  var htmlSrc = "@app/xml/navmenu";

  SuperView.getHtml( htmlSrc );

  var View = SuperView.extend( {
    init: function( contollerElement ) {
      this._super( contollerElement );

    },
    onDomReady: function( ) {
      SuperView.getStyle( "@app/css/navmenu" );
    },
    htmlSrc: htmlSrc
  }, {

  } );

  return View;
} );