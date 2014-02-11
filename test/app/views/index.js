aQuery.define( "@app/views/index", [ "app/View", "ui/flex" ], function( $, SuperView ) {
	"use strict"; //启用严格模式
	var xmlpath = "@app/xml/index";

	SuperView.getStyle( "@app/styles/reset" );
	SuperView.getXML( xmlpath );

	var View = SuperView.extend( {
		init: function( contollerElement ) {
			this._super( contollerElement, xmlpath );
		}
	}, {

	} );

	return View;
} );