aQuery.define( "@app/view/navmenu", [ "base/client", "main/css", "app/View", "ui/flex", "ui/scrollableview", "ui/navmenu", "ui/navitem" ], function( $, client, css, SuperView ) {
  "use strict"; //启用严格模式
  var View = SuperView.extend( {
    init: function( contollerElement ) {
      this._super( contollerElement, "@app/xml/navmenu" );
      // if ( client.browser.ie ) {
      //   $( this.topElement ).css( "height", "100%" );
      // }
    },
    onDomReady: function( ) {
      SuperView.getStyle( "@app/css/navmenu" );
    }
  }, {

  } );

  return View;
} );