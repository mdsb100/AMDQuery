aQuery.define( "@app/view/content", [ "base/client", "app/View", "ui/flex" ], function( $, client, SuperView ) {
  "use strict"; //启用严格模式
  var View = SuperView.extend( {
    init: function( contollerElement ) {
      this._super( contollerElement, "@app/xml/content" );
      // if ( client.browser.ie ) {
      //   $( this.topElement ).css( "height", "100%" );
      // }
    }
  }, {

  } );

  return View;
} );