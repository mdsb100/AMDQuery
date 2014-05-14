aQuery.define( "@app/views/index", [ "app/View", "ui/flex" ], function( $, SuperView ) {
	"use strict";
	// You could depend anthoer path. If you does not define path, you must create a index.xml under path "@app/xml/".
	// var xmlpath = "@app/xml/index";
	var xmlpath;
	SuperView.getStyle( "@app/styles/index" );

	var View = SuperView.extend( {
		init: function( contollerElement ) {
			this._super( contollerElement, xmlpath );

		}
	}, {

	} );

	return View;
} );