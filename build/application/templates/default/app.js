aQuery.define( "@app/app", [ "base/Promise", "main/event", "app/Application", "@app/controllers/index" ], function( $, Promise, event, Application ) {
	"use strict";
	var app = Application.extend( "Application", {
		init: function( amdqueryPromise ) {
			this._super();
			this.promise.then( function() {
				var promise = new Promise;
				setTimeout( function() {
					promise.resolve();
					amdqueryPromise.resolve(); // If the amdqueryPromise resolve, the view will show.
				}, 0 );
				return promise;
			} );
		},
		launch: function() {

		}
	}, {
		global: {

		}
	} );

	return app;
} );