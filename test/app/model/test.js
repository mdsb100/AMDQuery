aQuery.define( "@app/model/test", [ "app/Model" ], function( $, Model, undefined ) {
	"use strict"; //启用严格模式
	var Model = Model.extend( {
		init: function() {
			this._super();

		}
	}, {

	} );

	return Model;
} );