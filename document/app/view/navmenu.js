aQuery.define( "@app/view/navmenu", [ "base/client", "main/css", "app/View", "ui/flex", "ui/scrollableview", "ui/navmenu", "ui/navitem" ], function( $, client, css, SuperView ) {
	"use strict"; //启用严格模式
	var xmlpath = "@app/xml/navmenu";
	SuperView.getStyle( "@app/css/navmenu" );
	SuperView.getXML( xmlpath );
	var View = SuperView.extend( {
		init: function( contollerElement ) {
			this._super( contollerElement, xmlpath );
			// if ( client.browser.ie ) {
			//   $( this.topElement ).css( "height", "100%" );
			// }
		},
		onDomReady: function() {

		}
	}, {

	} );

	return View;
} );