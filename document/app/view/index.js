aQuery.define( "@app/view/index", [ "app/View", "ui/flex", "ui/tabview", "ui/swapview" ], function( $, SuperView ) {
	"use strict"; //启用严格模式
	var xmlpath = "@app/xml/index";
	SuperView.getXML( xmlpath );

	var View = SuperView.extend( {
		init: function( contollerElement ) {
			this._super( contollerElement, xmlpath );

		}
	}, {

	} );

	return View;
} );