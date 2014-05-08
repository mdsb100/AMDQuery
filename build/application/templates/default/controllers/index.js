aQuery.define( "@app/controllers/index", [
  "base/typed",
  "app/Controller",
  "@app/views/index",
  ], function( $,
	typed,
	SuperController,
	IndexView ) {
	"use strict"; //启用严格模式
	var Controller = SuperController.extend( {
		init: function( contollerElement, models ) {
			this._super( new IndexView( contollerElement ), models );
			typed.isNode( this.index, "div" );
		},
		destroy: function() {
			SuperController.invoke( "destroy" );
		}
	}, {

	} );

	return Controller;
} );