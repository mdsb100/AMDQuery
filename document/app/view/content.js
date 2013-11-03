aQuery.define( "@app/view/content", [ "base/client", "app/View", "ui/flex" ], function( $, client, SuperView ) {
  "use strict"; //启用严格模式
  var xmlpath = "@app/xml/content";
  SuperView.getXML( xmlpath );
  var View = SuperView.extend( {
    init: function( contollerElement ) {
      this._super( contollerElement, xmlpath );
      // if ( client.browser.ie ) {
      //   $( this.topElement ).css( "height", "100%" );
      // }
    }
  }, {

  } );

  return View;
} );