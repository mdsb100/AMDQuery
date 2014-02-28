aQuery.define( "@app/views/router", [ "app/View", "ui/flex" ], function( $, SuperView ) {
	"use strict"; //启用严格模式
	var htmlSrc = "@app/xml/router";

	SuperView.getStyle( "@app/styles/reset" );

	var View = SuperView.extend( {
		init: function( contollerElement ) {
			this._super( contollerElement, htmlSrc );
		}
	}, {

	} );

	return View;
} );